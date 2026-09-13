"""
BaseAgent abstract class for all ForgeAI domain-specialist AI agents.
Standardizes agent lifecycle, input/output validation, execution timing,
structured error handling, artifact drafts, and future provider integration.
"""

from abc import ABC, abstractmethod
import time
import traceback
from typing import Any, Dict, List, Optional, Tuple, Type
from pydantic import BaseModel, ValidationError

from app.ai.agents.provider import LLMProvider, get_default_provider
from app.ai.agents.types import AgentContext, AgentExecutionError, AgentResult, ArtifactDraft


class BaseAgent(ABC):
    """
    Abstract Base Class for all 14 ForgeAI domain agents.
    Every agent provides strict typed schemas, lifecycle timing, and artifact creation.
    """

    agent_name: str = "BaseAgent"
    version: str = "1.0.0"
    description: str = "Abstract agent interface"

    # Optional Pydantic schemas for domain validation
    input_schema: Optional[Type[BaseModel]] = None
    output_schema: Optional[Type[BaseModel]] = None

    def __init__(self, provider: Optional[LLMProvider] = None):
        self.provider = provider or get_default_provider()

    def validate_input(self, context: AgentContext) -> Dict[str, Any]:
        """
        Validate inputs against the agent's input_schema if defined.
        Extracts relevant fields from prompt, tech_stack, and shared_state.
        """
        raw_input = {
            "prompt": context.prompt,
            "tech_stack": context.tech_stack,
            "shared_state": context.shared_state,
            "metadata": context.metadata,
        }

        if self.input_schema is None:
            return raw_input

        try:
            validated = self.input_schema.model_validate(raw_input)
            return validated.model_dump()
        except ValidationError as e:
            raise AgentExecutionError(
                message=f"Input validation failed for {self.agent_name}: {str(e)}",
                agent_name=self.agent_name,
                error_code="INVALID_AGENT_INPUT",
                stage="input_validation",
                details={"validation_errors": e.errors()},
                retryable=False,
            ) from e

    def validate_output(self, output_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate agent outputs against output_schema if defined.
        """
        if self.output_schema is None:
            return output_data

        try:
            validated = self.output_schema.model_validate(output_data)
            return validated.model_dump()
        except ValidationError as e:
            raise AgentExecutionError(
                message=f"Output validation failed for {self.agent_name}: {str(e)}",
                agent_name=self.agent_name,
                error_code="INVALID_AGENT_OUTPUT",
                stage="output_validation",
                details={"validation_errors": e.errors()},
                retryable=True,
            ) from e

    def generate_structured_output(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        schema: Optional[Type[BaseModel]] = None,
        max_retries: int = 2,
    ) -> Optional[Dict[str, Any]]:
        """
        Request structured completion validated against the agent's output_schema.
        If a real LLM provider (OpenAI, Anthropic) is configured, executes LLM generation,
        schema validation, and automated repair loops on invalid JSON.
        If provider fails, raises appropriate LLMProviderError for observable failure tracking.
        If DeterministicMockProvider is active without matching canned response, returns None
        so agent can use deterministic domain synthesis for offline testing.
        """
        target_schema = schema or self.output_schema
        if target_schema is None:
            raw = self.provider.generate(prompt=prompt, system_prompt=system_prompt)
            from app.ai.agents.utils import extract_json_payload
            return extract_json_payload(raw)

        return self.provider.generate_structured(
            prompt=prompt,
            schema=target_schema,
            system_prompt=system_prompt,
            max_retries=max_retries,
        )

    async def agenerate_structured_output(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        schema: Optional[Type[BaseModel]] = None,
        max_retries: int = 2,
    ) -> Optional[Dict[str, Any]]:
        """
        Asynchronous structured completion validated against the agent's output_schema.
        """
        target_schema = schema or self.output_schema
        if target_schema is None:
            raw = await self.provider.agenerate(prompt=prompt, system_prompt=system_prompt)
            from app.ai.agents.utils import extract_json_payload
            return extract_json_payload(raw)

        return await self.provider.agenerate_structured(
            prompt=prompt,
            schema=target_schema,
            system_prompt=system_prompt,
            max_retries=max_retries,
        )

    @abstractmethod
    def execute(
        self,
        context: AgentContext,
        validated_input: Dict[str, Any],
    ) -> Tuple[Dict[str, Any], List[ArtifactDraft]]:
        """
        Synchronous domain execution logic.
        Returns a tuple of (output_data_dict, list_of_artifact_drafts).
        """
        pass

    async def aexecute(
        self,
        context: AgentContext,
        validated_input: Dict[str, Any],
    ) -> Tuple[Dict[str, Any], List[ArtifactDraft]]:
        """
        Asynchronous domain execution logic.
        Defaults to running the synchronous execute implementation.
        """
        return self.execute(context, validated_input)

    def run(self, context: AgentContext) -> AgentResult:
        """
        Execute agent with full lifecycle instrumentation:
        Input validation -> Execution -> Output validation -> Artifact extraction -> Timing.
        Guarantees structured AgentResult even in failure scenarios.
        """
        start_time = time.perf_counter()
        try:
            # Stage 1: Input Validation
            validated_input = self.validate_input(context)

            # Stage 2: Execution
            output_data, artifacts = self.execute(context, validated_input)

            # Stage 3: Output Validation
            validated_output = self.validate_output(output_data)

            duration_ms = int((time.perf_counter() - start_time) * 1000)

            return AgentResult(
                agent_name=self.agent_name,
                version=self.version,
                success=True,
                data=validated_output,
                artifacts=artifacts,
                execution_time_ms=duration_ms,
                retry_count=context.retry_count,
                metadata={
                    "stage": "completed",
                    "deterministic": context.deterministic,
                    "artifacts_count": len(artifacts),
                },
            )

        except AgentExecutionError as ae:
            duration_ms = int((time.perf_counter() - start_time) * 1000)
            return AgentResult(
                agent_name=self.agent_name,
                version=self.version,
                success=False,
                data={},
                artifacts=[],
                execution_time_ms=duration_ms,
                error=ae.message,
                error_details=ae.to_dict(),
                retry_count=context.retry_count,
                metadata={
                    "stage": ae.stage,
                    "error_code": ae.error_code,
                    "retryable": ae.retryable,
                },
            )

        except Exception as e:
            duration_ms = int((time.perf_counter() - start_time) * 1000)
            error_details = {
                "agent_name": self.agent_name,
                "error_code": "UNHANDLED_EXCEPTION",
                "message": str(e),
                "stage": "execution",
                "traceback": traceback.format_exc(),
                "retryable": True,
            }
            return AgentResult(
                agent_name=self.agent_name,
                version=self.version,
                success=False,
                data={},
                artifacts=[],
                execution_time_ms=duration_ms,
                error=str(e),
                error_details=error_details,
                retry_count=context.retry_count,
                metadata={
                    "stage": "execution",
                    "error_code": "UNHANDLED_EXCEPTION",
                    "retryable": True,
                },
            )

    async def arun(self, context: AgentContext) -> AgentResult:
        """
        Asynchronous agent execution with full lifecycle instrumentation.
        """
        start_time = time.perf_counter()
        try:
            # Stage 1: Input Validation
            validated_input = self.validate_input(context)

            # Stage 2: Asynchronous Execution
            output_data, artifacts = await self.aexecute(context, validated_input)

            # Stage 3: Output Validation
            validated_output = self.validate_output(output_data)

            duration_ms = int((time.perf_counter() - start_time) * 1000)

            return AgentResult(
                agent_name=self.agent_name,
                version=self.version,
                success=True,
                data=validated_output,
                artifacts=artifacts,
                execution_time_ms=duration_ms,
                retry_count=context.retry_count,
                metadata={
                    "stage": "completed",
                    "deterministic": context.deterministic,
                    "artifacts_count": len(artifacts),
                },
            )

        except AgentExecutionError as ae:
            duration_ms = int((time.perf_counter() - start_time) * 1000)
            return AgentResult(
                agent_name=self.agent_name,
                version=self.version,
                success=False,
                data={},
                artifacts=[],
                execution_time_ms=duration_ms,
                error=ae.message,
                error_details=ae.to_dict(),
                retry_count=context.retry_count,
                metadata={
                    "stage": ae.stage,
                    "error_code": ae.error_code,
                    "retryable": ae.retryable,
                },
            )

        except Exception as e:
            duration_ms = int((time.perf_counter() - start_time) * 1000)
            error_details = {
                "agent_name": self.agent_name,
                "error_code": "UNHANDLED_EXCEPTION",
                "message": str(e),
                "stage": "execution",
                "traceback": traceback.format_exc(),
                "retryable": True,
            }
            return AgentResult(
                agent_name=self.agent_name,
                version=self.version,
                success=False,
                data={},
                artifacts=[],
                execution_time_ms=duration_ms,
                error=str(e),
                error_details=error_details,
                retry_count=context.retry_count,
                metadata={
                    "stage": "execution",
                    "error_code": "UNHANDLED_EXCEPTION",
                    "retryable": True,
                },
            )
