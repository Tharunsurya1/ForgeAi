import asyncio
import json
import uuid
from typing import Dict
from unittest.mock import MagicMock, patch

import httpx
import pytest
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from starlette.websockets import WebSocketDisconnect

from app.ai.agents.provider import (
    AnthropicProvider,
    DeterministicMockProvider,
    LLMAuthenticationError,
    LLMConfigurationError,
    LLMProviderError,
    LLMRateLimitError,
    LLMSchemaValidationError,
    LLMTimeoutError,
    OpenAIProvider,
    create_llm_provider,
)
from app.models.agent_run import AgentRun
from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
from app.models.project import Project
from app.models.user import User
from app.models.workflow_event import WorkflowEvent
from app.models.workflow_execution import WorkflowExecution
from app.schemas.auth import UserLoginRequest, UserRegisterRequest
from app.schemas.blueprint import BlueprintGenerateRequest
from app.schemas.project import ProjectCreate
from app.services.auth_service import AuthService
from app.services.project_service import ProjectService
from app.services.workflow_service import (
    WorkflowOrchestratorService,
    sanitize_event_payload,
    workflow_event_broadcaster,
)


def create_test_context(db: Session, suffix: str) -> Dict:
    reg_req = UserRegisterRequest(
        email=f"p1_{suffix}_{uuid.uuid4().hex[:6]}@testforgeai.com",
        password="SecurePassword123!",
        full_name=f"P1 User {suffix}",
    )
    user = AuthService.register_user(db, reg_req)
    login_req = UserLoginRequest(email=user.email, password="SecurePassword123!")
    _, access_token, _, _ = AuthService.authenticate_user(db, login_req)

    org_member = (
        db.query(OrganizationMember)
        .filter(OrganizationMember.user_id == user.id)
        .first()
    )
    org = db.query(Organization).filter(Organization.id == org_member.organization_id).first()

    proj_create = ProjectCreate(
        name=f"P1 Project {suffix}",
        description="P1 test project for LLM, WebSocket and background execution",
        organization_id=org.id,
        tech_stack={"backend": "FastAPI", "frontend": "Next.js 15", "database": "PostgreSQL 16"},
    )
    project = ProjectService.create_project(
        db=db,
        user=user,
        data=proj_create,
    )
    return {"user": user, "token": access_token, "org": org, "project": project}


# ===========================================================================
# 1. LLM Provider Unit & Integration Tests
# ===========================================================================

class SampleSchema(BaseModel):
    title: str = Field(..., min_length=2)
    count: int = Field(..., ge=0)


def test_provider_missing_credentials():
    """Verify that OpenAI and Anthropic providers raise LLMConfigurationError if key is missing."""
    with patch("app.core.config.settings.OPENAI_API_KEY", ""):
        with patch.dict("os.environ", {"OPENAI_API_KEY": ""}):
            with pytest.raises(LLMConfigurationError) as exc:
                OpenAIProvider(api_key="")
            assert "OpenAI API key is missing" in str(exc.value)

    with patch("app.core.config.settings.ANTHROPIC_API_KEY", ""):
        with patch.dict("os.environ", {"ANTHROPIC_API_KEY": ""}):
            with pytest.raises(LLMConfigurationError) as exc:
                AnthropicProvider(api_key="")
            assert "Anthropic API key is missing" in str(exc.value)


def test_provider_factory_selection():
    """Verify create_llm_provider selects the requested or default provider."""
    mock_p = create_llm_provider("mock")
    assert isinstance(mock_p, DeterministicMockProvider)

    with patch("app.core.config.settings.OPENAI_API_KEY", "sk-test-mock-key"):
        openai_p = create_llm_provider("openai", api_key="sk-test-key")
        assert isinstance(openai_p, OpenAIProvider)

    with patch("app.core.config.settings.ANTHROPIC_API_KEY", "sk-ant-test-key"):
        anthropic_p = create_llm_provider("anthropic", api_key="sk-ant-test-key")
        assert isinstance(anthropic_p, AnthropicProvider)


def test_openai_provider_mocked_http_success():
    """Verify OpenAIProvider parses completion response correctly."""
    provider = OpenAIProvider(api_key="sk-mock-key")

    mock_resp = {
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": json.dumps({"title": "Order Service", "count": 5}),
                }
            }
        ]
    }

    with patch("httpx.Client.post") as mock_post:
        mock_post.return_value = httpx.Response(200, json=mock_resp, request=httpx.Request("POST", "http://test"))
        result = provider.generate("Generate an order service")
        assert "Order Service" in result

        structured = provider.generate_structured("Generate order", schema=SampleSchema)
        assert structured["title"] == "Order Service"
        assert structured["count"] == 5


def test_openai_provider_auth_error_handling():
    """Verify 401 Unauthorized raises LLMAuthenticationError."""
    provider = OpenAIProvider(api_key="sk-invalid-key")

    with patch("httpx.Client.post") as mock_post:
        mock_post.return_value = httpx.Response(
            401,
            json={"error": {"message": "Incorrect API key provided"}},
            request=httpx.Request("POST", "http://test"),
        )
        with pytest.raises(LLMAuthenticationError):
            provider.generate("Test prompt")


def test_openai_provider_rate_limit_and_timeout():
    """Verify 429 Too Many Requests and timeouts raise respective errors."""
    provider = OpenAIProvider(api_key="sk-test-key", max_retries=1)

    with patch("httpx.Client.post") as mock_post:
        mock_post.return_value = httpx.Response(
            429,
            json={"error": {"message": "Rate limit reached"}},
            request=httpx.Request("POST", "http://test"),
        )
        with pytest.raises(LLMRateLimitError):
            provider.generate("Test prompt")

    with patch("httpx.Client.post", side_effect=httpx.TimeoutException("Read timed out")):
        with pytest.raises(LLMTimeoutError):
            provider.generate("Test prompt")


def test_structured_output_schema_validation_and_repair_failure():
    """Verify LLMSchemaValidationError is raised after failed repair retries."""
    provider = OpenAIProvider(api_key="sk-test-key", max_retries=1)

    # Return invalid schema format (missing 'title', negative 'count')
    invalid_resp = {
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": json.dumps({"broken": True, "count": -10}),
                }
            }
        ]
    }

    with patch("httpx.Client.post") as mock_post:
        mock_post.return_value = httpx.Response(200, json=invalid_resp, request=httpx.Request("POST", "http://test"))
        with pytest.raises(LLMSchemaValidationError) as exc:
            provider.generate_structured("Generate invalid", schema=SampleSchema)
        assert "SampleSchema" in str(exc.value)


def test_anthropic_provider_mocked_http_success():
    """Verify AnthropicProvider parses Messages API response correctly."""
    provider = AnthropicProvider(api_key="sk-ant-test-key")

    mock_resp = {
        "content": [
            {
                "type": "text",
                "text": json.dumps({"title": "Inventory System", "count": 12}),
            }
        ]
    }

    with patch("httpx.Client.post") as mock_post:
        mock_post.return_value = httpx.Response(200, json=mock_resp, request=httpx.Request("POST", "http://test"))
        result = provider.generate("Generate inventory system")
        assert "Inventory System" in result

        structured = provider.generate_structured("Generate inventory", schema=SampleSchema)
        assert structured["title"] == "Inventory System"
        assert structured["count"] == 12


def test_sensitive_payload_sanitization():
    """Verify sanitize_event_payload redacts secrets, keys, and tokens."""
    payload = {
        "api_key": "sk-secret-12345",
        "nested": {
            "password": "SuperSecretPassword",
            "token": "bearer-xyz",
            "public_name": "ForgeAI",
        },
        "items": [{"auth_token": "secret_abc"}, "normal_string"],
    }

    sanitized = sanitize_event_payload(payload)
    assert sanitized["api_key"] == "[REDACTED]"
    assert sanitized["nested"]["password"] == "[REDACTED]"
    assert sanitized["nested"]["token"] == "[REDACTED]"
    assert sanitized["nested"]["public_name"] == "ForgeAI"
    assert sanitized["items"][0]["auth_token"] == "[REDACTED]"
    assert sanitized["items"][1] == "normal_string"


# ===========================================================================
# 2. WebSocket Streaming & Tenant Authorization Tests
# ===========================================================================

def test_websocket_stream_unauthorized_missing_token(client: TestClient, db: Session):
    """Verify connecting to WebSocket without a token is rejected with WS_1008."""
    ctx = create_test_context(db, "ws_no_token")
    project = ctx["project"]

    # Trigger a workflow to get an execution ID
    req = BlueprintGenerateRequest(prompt="Test ws auth", title="WS Auth Test")
    _, execution = WorkflowOrchestratorService.execute_blueprint_workflow(
        db=db, project_id=project.id, user=ctx["user"], data=req
    )

    with pytest.raises(WebSocketDisconnect) as exc:
        with client.websocket_connect(f"/api/v1/workflows/{execution.id}/stream") as ws:
            pass
    assert exc.value.code == 1008


def test_websocket_stream_unauthorized_invalid_token(client: TestClient, db: Session):
    """Verify connecting with invalid token is rejected with WS_1008."""
    ctx = create_test_context(db, "ws_bad_token")
    project = ctx["project"]

    req = BlueprintGenerateRequest(prompt="Test ws bad token", title="WS Bad Token")
    _, execution = WorkflowOrchestratorService.execute_blueprint_workflow(
        db=db, project_id=project.id, user=ctx["user"], data=req
    )

    with pytest.raises(WebSocketDisconnect) as exc:
        with client.websocket_connect(f"/api/v1/workflows/{execution.id}/stream?token=invalid_jwt_token") as ws:
            pass
    assert exc.value.code == 1008


def test_websocket_stream_cross_tenant_rejection(client: TestClient, db: Session):
    """Verify that User from Tenant B cannot connect to Tenant A's workflow stream."""
    ctx_a = create_test_context(db, "ws_tenant_a")
    ctx_b = create_test_context(db, "ws_tenant_b")

    req = BlueprintGenerateRequest(prompt="Tenant A exclusive app", title="Tenant A App")
    _, execution_a = WorkflowOrchestratorService.execute_blueprint_workflow(
        db=db, project_id=ctx_a["project"].id, user=ctx_a["user"], data=req
    )

    # User B attempts to connect to Execution A
    with pytest.raises(WebSocketDisconnect) as exc:
        with client.websocket_connect(
            f"/api/v1/workflows/{execution_a.id}/stream?token={ctx_b['token']}"
        ) as ws:
            pass
    assert exc.value.code == 1008


def test_websocket_stream_authorized_replay_and_closure(client: TestClient, db: Session):
    """
    Verify that an authorized user receives historical persisted events in sequence,
    and the connection closes cleanly once complete.
    """
    ctx = create_test_context(db, "ws_auth_ok")
    project = ctx["project"]
    token = ctx["token"]

    req = BlueprintGenerateRequest(prompt="Design an ERP inventory system", title="ERP Inventory")
    _, execution = WorkflowOrchestratorService.execute_blueprint_workflow(
        db=db, project_id=project.id, user=ctx["user"], data=req
    )

    events_received = []
    with client.websocket_connect(f"/api/v1/workflows/{execution.id}/stream?token={token}") as ws:
        while True:
            try:
                data = ws.receive_json()
                events_received.append(data)
            except WebSocketDisconnect:
                break

    assert len(events_received) >= 15
    event_types = [e["event_type"] for e in events_received]
    assert "workflow_started" in event_types
    assert "agent_completed" in event_types
    assert "code_review_verdict" in event_types
    assert "workflow_completed" in event_types
    # Verify sequence monotonicity
    seqs = [e["sequence_number"] for e in events_received]
    assert seqs == sorted(seqs)


# ===========================================================================
# 3. Background Execution Tests
# ===========================================================================

def test_background_workflow_execution_returns_immediately(client: TestClient, db: Session):
    """
    Verify POST /execute/{project_id}?background=true returns HTTP 201 immediately
    with status='running', progress=0, and execution_id, and executes asynchronously.
    """
    ctx = create_test_context(db, "bg_run")
    project = ctx["project"]
    headers = {"Authorization": f"Bearer {ctx['token']}"}

    payload = {
        "prompt": "Build a scalable real-time IoT fleet monitoring service with MQTT and PostgreSQL.",
        "title": "IoT Fleet Monitor",
        "tech_stack": {"backend": "FastAPI", "frontend": "Next.js 15", "database": "PostgreSQL 16"},
    }

    res = client.post(
        f"/api/v1/workflows/execute/{project.id}?background=true",
        json=payload,
        headers=headers,
    )
    assert res.status_code == 201
    data = res.json()

    assert data["id"] is not None
    # Verify it returned immediately in running status
    assert data["status"] == "running"
    assert data["current_agent"] == "SupervisorAgent"
    assert data["progress_percentage"] == 0

    execution_id = uuid.UUID(data["id"])

    # Verify execution record exists in DB
    db_exec = db.query(WorkflowExecution).filter(WorkflowExecution.id == execution_id).first()
    assert db_exec is not None
    assert db_exec.project_id == project.id

    # Verify initial workflow_started event exists
    db_event = (
        db.query(WorkflowEvent)
        .filter(WorkflowEvent.workflow_execution_id == execution_id)
        .first()
    )
    assert db_event is not None
    assert db_event.event_type == "workflow_started"


def test_observable_agent_and_workflow_failure(db: Session):
    """
    Verify that an unhandled agent error creates an observable failure:
    - AgentRun marked as failed
    - WorkflowEvent(event_type="agent_failed") persisted
    - WorkflowExecution marked as failed with error message
    - WorkflowEvent(event_type="workflow_failed") persisted
    """
    from fastapi import HTTPException

    ctx = create_test_context(db, "failure_tracking")
    project = ctx["project"]

    req = BlueprintGenerateRequest(prompt="Provoke failure in workflow", title="Fail Test")

    with patch(
        "app.ai.agents.requirements_agent.RequirementsAgent.execute",
        side_effect=RuntimeError("Simulated LLM service interruption"),
    ):
        with pytest.raises(HTTPException) as exc:
            WorkflowOrchestratorService.execute_blueprint_workflow(
                db=db, project_id=project.id, user=ctx["user"], data=req
            )
        assert exc.value.status_code == 500

    failed_exec = (
        db.query(WorkflowExecution)
        .filter(WorkflowExecution.project_id == project.id)
        .order_by(WorkflowExecution.created_at.desc())
        .first()
    )
    assert failed_exec is not None
    assert failed_exec.status == "failed"
    assert "Simulated LLM service interruption" in failed_exec.error_message

    fail_event = (
        db.query(WorkflowEvent)
        .filter(
            WorkflowEvent.workflow_execution_id == failed_exec.id,
            WorkflowEvent.event_type == "agent_failed",
        )
        .first()
    )
    assert fail_event is not None
    assert fail_event.agent_name == "RequirementsAgent"

    wf_fail_event = (
        db.query(WorkflowEvent)
        .filter(
            WorkflowEvent.workflow_execution_id == failed_exec.id,
            WorkflowEvent.event_type == "workflow_failed",
        )
        .first()
    )
    assert wf_fail_event is not None

