import uuid
from typing import Dict
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.agent_run import AgentRun
from app.models.blueprint import Blueprint
from app.models.blueprint_artifact import BlueprintArtifact
from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
from app.models.project import Project
from app.models.user import User
from app.models.workflow_event import WorkflowEvent
from app.models.workflow_execution import WorkflowExecution
from app.schemas.auth import UserLoginRequest, UserRegisterRequest
from app.schemas.blueprint import BlueprintGenerateRequest
from app.schemas.organization import MemberInviteRequest
from app.schemas.project import ProjectCreate
from app.services.auth_service import AuthService
from app.services.blueprint_service import BlueprintService
from app.services.organization_service import OrganizationService
from app.services.project_service import ProjectService
from app.services.workflow_service import WorkflowOrchestratorService


def create_test_context(db: Session, suffix: str) -> Dict:
    reg_req = UserRegisterRequest(
        email=f"workflow_{suffix}_{uuid.uuid4().hex[:6]}@testforgeai.com",
        password="SecurePassword123!",
        full_name=f"Workflow User {suffix}",
    )
    user = AuthService.register_user(db, reg_req)
    login_req = UserLoginRequest(email=user.email, password="SecurePassword123!")
    _, access_token, _, _ = AuthService.authenticate_user(db, login_req)

    # User's default workspace org is auto-created by register_user
    org_member = (
        db.query(OrganizationMember)
        .filter(OrganizationMember.user_id == user.id)
        .first()
    )
    org = db.query(Organization).filter(Organization.id == org_member.organization_id).first()

    proj_create = ProjectCreate(
        name=f"Telemetry Platform {suffix}",
        description="High throughput real-time asset telemetry system",
        organization_id=org.id,
        tech_stack={"backend": "FastAPI", "frontend": "Next.js 15", "database": "PostgreSQL 16"},
    )
    project = ProjectService.create_project(
        db=db,
        user=user,
        data=proj_create,
    )
    return {"user": user, "token": access_token, "org": org, "project": project}



def test_execute_blueprint_workflow_e2e_persistence(db: Session):
    """
    Verify end-to-end execution of 14-Agent LangGraph workflow and verify
    persistence of WorkflowExecution, AgentRuns, WorkflowEvents, and BlueprintArtifacts.
    """
    ctx = create_test_context(db, "e2e_run")
    user = ctx["user"]
    project = ctx["project"]

    request_data = BlueprintGenerateRequest(
        prompt="Design a real-time hospital ICU telemetry monitoring platform with alert triage and HL7 FHIR compliance.",
        title="ICU Telemetry Suite",
        tech_stack={"backend": "FastAPI", "frontend": "Next.js 15", "database": "PostgreSQL 16"},
    )

    blueprint, execution = WorkflowOrchestratorService.execute_blueprint_workflow(
        db=db,
        project_id=project.id,
        user=user,
        data=request_data,
    )

    # 1. Verify Blueprint
    assert blueprint is not None
    assert blueprint.project_id == project.id
    assert blueprint.current_version == 1
    assert blueprint.title == "ICU Telemetry Suite"
    assert blueprint.status == "completed"
    assert blueprint.metadata_["workflow_execution_id"] == str(execution.id)
    assert len(blueprint.artifacts) >= 15

    # 2. Verify WorkflowExecution Entity
    assert execution is not None
    assert execution.id is not None
    assert execution.project_id == project.id
    assert execution.triggered_by_user_id == user.id
    assert execution.blueprint_id == blueprint.id
    assert execution.status == "completed"
    assert execution.progress_percentage == 100
    assert execution.current_agent == "OptimizationAgent"
    assert execution.started_at is not None
    assert execution.completed_at is not None
    assert execution.completed_at >= execution.started_at
    assert len(execution.metadata_["completed_agents"]) >= 14

    # 3. Verify AgentRuns
    agent_runs = (
        db.query(AgentRun)
        .filter(AgentRun.workflow_execution_id == execution.id)
        .all()
    )
    assert len(agent_runs) >= 14
    recorded_agent_names = {r.agent_name for r in agent_runs}
    expected_agents = {
        "SupervisorAgent",
        "RequirementsAgent",
        "BusinessAnalystAgent",
        "DatabaseAgent",
        "APIAgent",
        "UIUXAgent",
        "FrontendAgent",
        "BackendAgent",
        "SecurityAgent",
        "DevOpsAgent",
        "TestingAgent",
        "DocumentationAgent",
        "CodeReviewAgent",
        "OptimizationAgent",
    }
    for agent in expected_agents:
        assert agent in recorded_agent_names, f"Agent {agent} missing from AgentRun records"
    for r in agent_runs:
        assert r.status == "completed"
        assert r.input_payload is not None
        assert r.output_payload is not None

    # 4. Verify WorkflowEvents Timeline
    events = (
        db.query(WorkflowEvent)
        .filter(WorkflowEvent.workflow_execution_id == execution.id)
        .order_by(WorkflowEvent.sequence_number.asc())
        .all()
    )
    assert len(events) >= 16
    event_types = [e.event_type for e in events]
    assert event_types[0] == "workflow_started"
    assert "agent_started" in event_types
    assert "agent_completed" in event_types
    assert "code_review_verdict" in event_types
    assert event_types[-1] == "workflow_completed"

    # Verify sequence numbers are strictly ordered
    seqs = [e.sequence_number for e in events]
    assert seqs == list(range(1, len(events) + 1))

    # Verify each agent has agent_started strictly before agent_completed
    agent_starts = {e.agent_name: e.sequence_number for e in events if e.event_type == "agent_started"}
    agent_comps = {e.agent_name: e.sequence_number for e in events if e.event_type == "agent_completed"}
    for agent_name in expected_agents:
        assert agent_name in agent_starts, f"Missing agent_started event for {agent_name}"
        assert agent_name in agent_comps, f"Missing agent_completed event for {agent_name}"
        assert agent_starts[agent_name] < agent_comps[agent_name], (
            f"agent_started ({agent_starts[agent_name]}) must precede agent_completed ({agent_comps[agent_name]}) for {agent_name}"
        )

    # 5. Verify Artifact Types
    artifact_types = {a.artifact_type for a in blueprint.artifacts}
    assert "requirements" in artifact_types
    assert "database" in artifact_types
    assert "api" in artifact_types
    assert "frontend" in artifact_types
    assert "backend" in artifact_types
    assert "security" in artifact_types
    assert ("devops" in artifact_types or "deployment" in artifact_types)
    assert "testing" in artifact_types


def test_blueprint_service_triggers_real_workflow(db: Session):
    """
    Verify that BlueprintService.generate_and_save_blueprint delegates
    to the 14-Agent WorkflowOrchestratorService and creates all execution records.
    """
    ctx = create_test_context(db, "bp_service_run")
    user = ctx["user"]
    project = ctx["project"]

    request_data = BlueprintGenerateRequest(
        prompt="Design a micro-lending FinTech API with automated credit risk assessment.",
        title="FinTech Micro-Lending Platform",
    )

    blueprint = BlueprintService.generate_and_save_blueprint(
        db=db,
        project_id=project.id,
        user=user,
        data=request_data,
    )

    assert blueprint.id is not None
    assert blueprint.status == "completed"
    assert len(blueprint.artifacts) >= 15

    # Check underlying workflow execution
    wf_id = blueprint.metadata_["workflow_execution_id"]
    execution = db.query(WorkflowExecution).filter(WorkflowExecution.id == uuid.UUID(wf_id)).first()
    assert execution is not None
    assert execution.status == "completed"
    assert execution.blueprint_id == blueprint.id


def test_workflows_api_endpoints(client: TestClient, db: Session):
    """
    Verify REST API endpoints under /api/v1/workflows:
    POST /execute/{project_id}
    GET /project/{project_id}
    GET /{execution_id}
    GET /blueprint/{blueprint_id}
    """
    ctx = create_test_context(db, "api_test")
    token = ctx["token"]
    project = ctx["project"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Trigger execution via POST /execute/{project_id}
    payload = {
        "prompt": "Build an intelligent IoT edge device monitoring and anomaly detection engine.",
        "title": "IoT Edge Intelligence Suite",
        "tech_stack": {"backend": "FastAPI", "frontend": "Next.js 15", "database": "PostgreSQL 16"},
    }
    create_res = client.post(
        f"/api/v1/workflows/execute/{project.id}",
        json=payload,
        headers=headers,
    )
    assert create_res.status_code == 201
    created_data = create_res.json()
    execution_id = created_data["id"]
    assert created_data["status"] == "completed"
    assert created_data["progress_percentage"] == 100
    assert len(created_data["agent_runs"]) >= 14
    assert len(created_data["events"]) >= 16

    # 2. List project workflows via GET /project/{project_id}
    list_res = client.get(
        f"/api/v1/workflows/project/{project.id}",
        headers=headers,
    )
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert len(list_data) >= 1
    assert list_data[0]["id"] == execution_id

    # 3. Get workflow detail via GET /{execution_id}
    detail_res = client.get(
        f"/api/v1/workflows/{execution_id}",
        headers=headers,
    )
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["id"] == execution_id
    assert len(detail_data["agent_runs"]) >= 14
    assert len(detail_data["events"]) >= 16

    # 4. Get by blueprint via GET /blueprint/{blueprint_id}
    blueprint_id = created_data["blueprint_id"]
    bp_res = client.get(
        f"/api/v1/workflows/blueprint/{blueprint_id}",
        headers=headers,
    )
    assert bp_res.status_code == 200
    bp_data = bp_res.json()
    assert bp_data["id"] == execution_id


def test_workflows_api_tenant_isolation(client: TestClient, db: Session):
    """
    Verify that users in Organization B cannot view or trigger workflows in Organization A.
    """
    ctx_a = create_test_context(db, "tenant_a")
    ctx_b = create_test_context(db, "tenant_b")

    headers_b = {"Authorization": f"Bearer {ctx_b['token']}"}

    # User B attempts to trigger workflow in Project A
    post_res = client.post(
        f"/api/v1/workflows/execute/{ctx_a['project'].id}",
        json={"prompt": "Malicious cross-tenant attempt"},
        headers=headers_b,
    )
    assert post_res.status_code in (403, 404)

    # User B attempts to list Project A's workflows
    list_res = client.get(
        f"/api/v1/workflows/project/{ctx_a['project'].id}",
        headers=headers_b,
    )
    assert list_res.status_code in (403, 404)


def test_workflows_api_viewer_cannot_execute(client: TestClient, db: Session):
    """
    Verify RBAC enforcement: viewers cannot trigger workflow execution.
    """
    ctx = create_test_context(db, "viewer_rbac")
    org = ctx["org"]
    project = ctx["project"]

    # Register viewer user and add to organization as viewer
    viewer_reg = UserRegisterRequest(
        email=f"viewer_{uuid.uuid4().hex[:6]}@testforgeai.com",
        password="SecurePassword123!",
        full_name="Viewer User",
    )
    viewer = AuthService.register_user(db, viewer_reg)

    # Add viewer to organization
    db.add(OrganizationMember(
        organization_id=org.id,
        user_id=viewer.id,
        role="viewer",
    ))
    db.commit()

    viewer_login = UserLoginRequest(email=viewer.email, password="SecurePassword123!")
    _, viewer_token, _, _ = AuthService.authenticate_user(db, viewer_login)
    viewer_headers = {"Authorization": f"Bearer {viewer_token}"}


    # Viewer attempts to execute workflow
    exec_res = client.post(
        f"/api/v1/workflows/execute/{project.id}",
        json={"prompt": "Viewer attempt to generate blueprint"},
        headers=viewer_headers,
    )
    assert exec_res.status_code == 403
    assert "Viewers cannot generate blueprints" in exec_res.json()["detail"]
