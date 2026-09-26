"""
API Agent (Agent 5).
Produces comprehensive OpenAPI 3.1 REST specifications, endpoint signatures,
request/response schemas, status codes, and error models.
"""

from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field
import yaml

from app.ai.agents.base import BaseAgent
from app.ai.agents.types import AgentContext, AgentExecutionError, ArtifactDraft
from app.ai.agents.utils import extract_json_payload, format_upstream_context_section, safe_validate_yaml


class EndpointSpec(BaseModel):
    path: str = Field(..., pattern=r"^/", description="URL path starting with /")
    method: str = Field(..., description="GET, POST, PUT, PATCH, DELETE")
    summary: str = Field(..., min_length=3)
    request_body_schema: Optional[str] = None
    response_schema: str = Field(..., min_length=2)
    status_code: int = Field(default=200, ge=100, le=599)
    auth_required: bool = True


class APIInputSchema(BaseModel):
    prompt: str = Field(..., min_length=3)
    tech_stack: Dict[str, Any] = Field(default_factory=dict)
    shared_state: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class APISpecOutputSchema(BaseModel):
    openapi_version: str = Field(default="3.1.0")
    title: str = Field(..., min_length=2)
    version: str = Field(default="1.0.0")
    endpoints: List[EndpointSpec] = Field(default_factory=list)
    raw_yaml: str = Field(..., min_length=20)
    error_models: List[str] = Field(default_factory=list)


class APIAgent(BaseAgent):
    agent_name = "APIAgent"
    version = "1.0.0"
    description = "Synthesizes OpenAPI 3.1 YAML specifications with request/response schemas and auth contracts."
    input_schema = APIInputSchema
    output_schema = APISpecOutputSchema

    def execute(
        self,
        context: AgentContext,
        validated_input: Dict[str, Any],
    ) -> Tuple[Dict[str, Any], List[ArtifactDraft]]:
        prompt = validated_input["prompt"]

        system_prompt = (
            "You are the Principal API Architect. "
            "Generate OpenAPI 3.1 REST contracts with paths, request/response bodies, HTTP methods, "
            "status codes, and error models."
        )
        task_prompt = f"Design OpenAPI 3.1 contract for: '{prompt}'."
        db_context = (context.shared_state or {}).get("database_ddl")
        req_context = (context.shared_state or {}).get("requirements")
        if db_context:
            task_prompt += format_upstream_context_section("UPSTREAM DATABASE SCHEMA & DDL", db_context)
        if req_context:
            task_prompt += format_upstream_context_section("UPSTREAM REQUIREMENTS SPECIFICATION", req_context)

        parsed = self.generate_structured_output(prompt=task_prompt, system_prompt=system_prompt)

        if parsed and "endpoints" in parsed and "raw_yaml" in parsed:
            output_data = parsed
        else:
            # Deterministic domain synthesis fallback
            endpoints = [
                EndpointSpec(
                    path="/api/v1/auth/login",
                    method="POST",
                    summary="Authenticate user and return JWT tokens",
                    request_body_schema="LoginRequest",
                    response_schema="TokenResponse",
                    status_code=200,
                    auth_required=False,
                ),
                EndpointSpec(
                    path="/api/v1/projects",
                    method="GET",
                    summary="List projects in caller's organization",
                    response_schema="List[ProjectResponse]",
                    status_code=200,
                    auth_required=True,
                ),
                EndpointSpec(
                    path="/api/v1/projects",
                    method="POST",
                    summary="Create a new project workspace",
                    request_body_schema="ProjectCreateRequest",
                    response_schema="ProjectResponse",
                    status_code=201,
                    auth_required=True,
                ),
                EndpointSpec(
                    path="/api/v1/items",
                    method="GET",
                    summary="Query operational items with pagination",
                    response_schema="List[ItemResponse]",
                    status_code=200,
                    auth_required=True,
                ),
            ]

            raw_yaml = self._render_openapi_yaml(endpoints, prompt)

            # Static safe YAML validation
            is_valid, err = safe_validate_yaml(raw_yaml)
            if not is_valid:
                raise AgentExecutionError(
                    message=f"OpenAPI YAML syntax validation failed: {err}",
                    agent_name=self.agent_name,
                    error_code="INVALID_OPENAPI_YAML",
                    stage="output_validation",
                    retryable=True,
                )

            output_data = {
                "openapi_version": "3.1.0",
                "title": f"{prompt[:40].title()} API",
                "version": "1.0.0",
                "endpoints": [e.model_dump() for e in endpoints],
                "raw_yaml": raw_yaml,
                "error_models": ["HTTPValidationError", "HTTPErrorResponse"],
            }

        artifact = ArtifactDraft(
            artifact_type="openapi",
            file_path="specs/openapi.yaml",
            content=output_data["raw_yaml"],
            language="yaml",
            metadata={"agent": self.agent_name, "endpoints_count": len(output_data["endpoints"])},
        )

        return output_data, [artifact]

    def _render_openapi_yaml(self, endpoints: List[EndpointSpec], prompt: str) -> str:
        spec = {
            "openapi": "3.1.0",
            "info": {
                "title": f"{prompt[:40].title()} API",
                "version": "1.0.0",
                "description": f"REST API Specification for {prompt}",
            },
            "paths": {},
            "components": {
                "securitySchemes": {
                    "BearerAuth": {
                        "type": "http",
                        "scheme": "bearer",
                        "bearerFormat": "JWT",
                    }
                }
            },
        }

        for ep in endpoints:
            if ep.path not in spec["paths"]:
                spec["paths"][ep.path] = {}
            operation: Dict[str, Any] = {
                "summary": ep.summary,
                "responses": {
                    str(ep.status_code): {
                        "description": f"Successful response ({ep.response_schema})",
                    },
                    "400": {"description": "Bad Request"},
                    "401": {"description": "Unauthorized"},
                },
            }
            if ep.auth_required:
                operation["security"] = [{"BearerAuth": []}]
            if ep.request_body_schema:
                operation["requestBody"] = {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {"$ref": f"#/components/schemas/{ep.request_body_schema}"}
                        }
                    },
                }
            spec["paths"][ep.path][ep.method.lower()] = operation

        return yaml.dump(spec, sort_keys=False)
