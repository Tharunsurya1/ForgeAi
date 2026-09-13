"""
Core type definitions and schemas for the ForgeAI Agent Foundation.
Provides structured models for context, results, drafts, and execution errors.
"""

from datetime import datetime, timezone
import time
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ArtifactDraft(BaseModel):
    """
    In-memory representation of an artifact produced by an agent before database persistence.
    """
    artifact_type: str = Field(..., description="Type of artifact (e.g. requirements, erd, openapi, backend, frontend, security, devops)")
    file_path: str = Field(..., description="Target file path in the generated project tree")
    content: str = Field(..., description="Complete text or code content of the artifact")
    language: str = Field(default="text", description="Syntax highlighting language (e.g. markdown, sql, yaml, python, typescript)")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Custom metadata for the artifact")

    @property
    def file_size_bytes(self) -> int:
        """Calculate size in bytes encoded as UTF-8."""
        return len(self.content.encode("utf-8"))


class AgentExecutionError(Exception):
    """
    Structured error raised when an agent encounters an unrecoverable failure during its lifecycle.
    """
    def __init__(
        self,
        message: str,
        agent_name: str,
        error_code: str = "AGENT_EXECUTION_FAILED",
        stage: str = "execution",
        details: Optional[Dict[str, Any]] = None,
        retryable: bool = True,
    ):
        super().__init__(f"[{agent_name}:{stage}] {error_code}: {message}")
        self.message = message
        self.agent_name = agent_name
        self.error_code = error_code
        self.stage = stage  # e.g. "input_validation", "execution", "output_validation"
        self.details = details or {}
        self.retryable = retryable

    def to_dict(self) -> Dict[str, Any]:
        return {
            "agent_name": self.agent_name,
            "error_code": self.error_code,
            "message": self.message,
            "stage": self.stage,
            "details": self.details,
            "retryable": self.retryable,
        }


class AgentContext(BaseModel):
    """
    Execution context supplied to each agent. Contains immutable inputs, shared state, and execution flags.
    """
    workflow_id: str = Field(..., description="Unique ID of the parent workflow execution")
    project_id: str = Field(..., description="Target project ID")
    organization_id: Optional[str] = Field(default=None, description="Tenant organization ID for multi-tenant isolation")
    user_id: Optional[str] = Field(default=None, description="Triggering user ID if present")
    prompt: str = Field(..., description="Initial raw intent or user prompt")
    tech_stack: Dict[str, Any] = Field(default_factory=dict, description="Selected technology stack options")
    shared_state: Dict[str, Any] = Field(default_factory=dict, description="Outputs from upstream agents in the DAG")
    retry_count: int = Field(default=0, ge=0, description="Current attempt index for this agent")
    max_retries: int = Field(default=2, ge=0, description="Maximum allowed retries")
    deterministic: bool = Field(default=False, description="Flag for offline deterministic synthesis / tests")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Arbitrary workflow context metadata")


class AgentResult(BaseModel):
    """
    Normalized result container returned by all ForgeAI agents.
    """
    agent_name: str
    version: str = "1.0.0"
    success: bool
    data: Dict[str, Any] = Field(default_factory=dict, description="Structured output dictionary from the agent")
    artifacts: List[ArtifactDraft] = Field(default_factory=list, description="Artifacts generated during the step")
    execution_time_ms: int = Field(default=0, ge=0, description="Elapsed execution time in milliseconds")
    error: Optional[str] = Field(default=None, description="Error message if execution failed")
    error_details: Optional[Dict[str, Any]] = Field(default=None, description="Structured error payload")
    retry_count: int = Field(default=0, ge=0, description="Retry count at time of result")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Operational telemetry and execution notes")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
