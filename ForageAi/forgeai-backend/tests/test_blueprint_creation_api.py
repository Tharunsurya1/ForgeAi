import uuid
from typing import Dict, Any
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.blueprint import Blueprint
from app.models.blueprint_artifact import BlueprintArtifact
from app.models.workflow_execution import WorkflowExecution
from app.models.workflow_event import WorkflowEvent
from app.services.workflow_service import WorkflowOrchestratorService


def register_user_and_create_project(client: TestClient, suffix: str = None) -> Dict[str, Any]:
    uid = suffix or uuid.uuid4().hex[:8]
    email = f"architect_{uid}@testforgeai.com"
    password = "StrongPassword123!"
    full_name = f"Enterprise Architect {uid}"

    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": full_name},
    )
    assert reg_res.status_code == 201

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    proj_res = client.post(
        "/api/v1/projects",
        json={
            "name": f"CraftCommerce {uid}",
            "description": "Multi-vendor handmade crafts marketplace",
            "tech_stack": {
                "backend": "FastAPI",
                "frontend": "Next.js",
                "database": "PostgreSQL",
            },
        },
        headers=headers,
    )
    assert proj_res.status_code == 201
    project = proj_res.json()

    return {
        "headers": headers,
        "token": token,
        "project": project,
        "email": email,
    }


def test_blueprint_create_api_immediate_response_and_queued_status(client: TestClient, db: Session):
    """
    Priority 1 & 2:
    POST /api/v1/projects/{project_id}/blueprints
    - Authenticates user
    - Enforces RBAC
    - Creates Blueprint immediately in generating status
    - Creates WorkflowExecution immediately linked to Blueprint
    - Returns { workflow_id, blueprint_id, status: 'queued' } immediately
    """
    ctx = register_user_and_create_project(client, "imm_resp")
    headers = ctx["headers"]
    project_id = ctx["project"]["id"]

    req_payload = {
        "idea": "Build an e-commerce platform for handmade products",
        "requirements": "Users should browse products, add products to cart and place orders. Vendors manage inventory.",
        "tech_preferences": {
            "frontend": "Next.js",
            "backend": "FastAPI",
            "database": "PostgreSQL",
        },
    }

    res = client.post(
        f"/api/v1/projects/{project_id}/blueprints",
        json=req_payload,
        headers=headers,
    )
    assert res.status_code == 201, res.text
    data = res.json()

    assert "workflow_id" in data
    assert "blueprint_id" in data
    assert data["status"] == "queued"

    workflow_id = uuid.UUID(data["workflow_id"])
    blueprint_id = uuid.UUID(data["blueprint_id"])

    # Verify Blueprint exists in database immediately (in test client, background worker runs inline and completes)
    blueprint = db.query(Blueprint).filter(Blueprint.id == blueprint_id).first()
    assert blueprint is not None
    assert str(blueprint.project_id) == project_id
    assert blueprint.status in ("generating", "completed")
    assert "Build an e-commerce platform for handmade products" in blueprint.metadata_["idea"]

    # Verify WorkflowExecution exists and links to Blueprint immediately
    execution = db.query(WorkflowExecution).filter(WorkflowExecution.id == workflow_id).first()
    assert execution is not None
    assert execution.blueprint_id == blueprint_id
    assert execution.status in ("running", "queued", "completed")
    assert "Build an e-commerce platform for handmade products" in execution.prompt


def test_blueprint_create_api_alias_endpoint(client: TestClient, db: Session):
    """
    Verify the requested alias POST /api/projects/{project_id}/blueprints works identically.
    """
    ctx = register_user_and_create_project(client, "alias_ep")
    headers = ctx["headers"]
    project_id = ctx["project"]["id"]

    req_payload = {
        "idea": "Build a real-time collaborative whiteboard with CRDT sync",
        "requirements": "Real-time vector drawing, undo/redo, end-to-end encryption",
        "tech_preferences": {
            "frontend": "Next.js 15",
            "backend": "FastAPI",
            "database": "PostgreSQL 16",
        },
    }

    # Call alias route
    res = client.post(
        f"/api/projects/{project_id}/blueprints",
        json=req_payload,
        headers=headers,
    )
    assert res.status_code == 201, res.text
    data = res.json()

    assert data["status"] == "queued"
    assert "workflow_id" in data
    assert "blueprint_id" in data


def test_blueprint_create_api_unauthenticated(client: TestClient):
    """
    Unauthenticated requests must be rejected with 401 Unauthorized.
    """
    random_project_id = uuid.uuid4()
    res = client.post(
        f"/api/v1/projects/{random_project_id}/blueprints",
        json={
            "idea": "An unauthorized blueprint attempt",
            "requirements": "Should fail before any DB write",
        },
    )
    assert res.status_code == 401


def test_blueprint_create_api_cross_tenant_idor_forbidden(client: TestClient):
    """
    Users cannot create blueprints for projects belonging to organizations they do not belong to.
    """
    user_a = register_user_and_create_project(client, "tenant_a")
    user_b = register_user_and_create_project(client, "tenant_b")

    project_a_id = user_a["project"]["id"]

    # User B attempts to create blueprint on User A's project
    res = client.post(
        f"/api/v1/projects/{project_a_id}/blueprints",
        json={
            "idea": "Attacker injecting blueprint",
            "requirements": "Malicious payload",
        },
        headers=user_b["headers"],
    )
    assert res.status_code in (403, 404)


def test_blueprint_create_api_validation_rejects_empty_payload(client: TestClient):
    """
    Payload missing idea, requirements, and prompt must be rejected with 422 Unprocessable Content.
    """
    ctx = register_user_and_create_project(client, "val_empty")
    headers = ctx["headers"]
    project_id = ctx["project"]["id"]

    res = client.post(
        f"/api/v1/projects/{project_id}/blueprints",
        json={
            "tech_preferences": {"backend": "FastAPI"},
        },
        headers=headers,
    )
    assert res.status_code == 422


def test_blueprint_create_api_backward_compatibility(client: TestClient, db: Session):
    """
    Verify backward compatibility when clients send 'prompt' and 'tech_stack' instead of idea/requirements.
    """
    ctx = register_user_and_create_project(client, "backward_compat")
    headers = ctx["headers"]
    project_id = ctx["project"]["id"]

    legacy_payload = {
        "prompt": "Build an AI powered code review SaaS with GitHub PR webhooks and AST linting",
        "title": "PR Review Bot",
        "tech_stack": {
            "backend": "FastAPI",
            "frontend": "Next.js",
            "database": "PostgreSQL",
        },
    }

    res = client.post(
        f"/api/v1/projects/{project_id}/blueprints",
        json=legacy_payload,
        headers=headers,
    )
    assert res.status_code == 201, res.text
    data = res.json()
    assert data["status"] == "queued"

    bp = db.query(Blueprint).filter(Blueprint.id == uuid.UUID(data["blueprint_id"])).first()
    assert bp is not None
    assert bp.title == "PR Review Bot"
    assert "PR Review Bot" in bp.title


def test_blueprint_end_to_end_lifecycle_and_artifact_persistence(db: Session):
    """
    Priority 2, 3, 4:
    Executes the 14-agent LangGraph workflow end-to-end with structured inputs:
    - Structured inputs (idea, requirements, tech_preferences) mapped into initial state
    - Blueprint pre-created in 'generating' status
    - Workflow runs through all 14 agents
    - Artifacts persisted and linked to Blueprint
    - Blueprint transitions to status 'completed' with quality score and summary
    """
    # Create test user and project
    from app.models.user import User
    from app.models.project import Project
    from app.models.organization import Organization
    from app.models.organization_member import OrganizationMember
    from app.schemas.blueprint import BlueprintCreateRequest

    unique = uuid.uuid4().hex[:8]
    user = User(
        email=f"e2e_{unique}@testforgeai.com",
        full_name="E2E Architect",
        is_active=True,
    )
    org = Organization(
        name=f"E2E Org {unique}",
        slug=f"e2e-org-{unique}",
        billing_email=f"billing_{unique}@testforgeai.com",
    )
    db.add(user)
    db.add(org)
    db.flush()

    member = OrganizationMember(organization_id=org.id, user_id=user.id, role="owner")
    project = Project(
        name=f"E2E Marketplace {unique}",
        slug=f"e2e-marketplace-{unique}",
        organization_id=org.id,
        created_by=user.id,
        tech_stack={"backend": "FastAPI", "frontend": "Next.js 15", "database": "PostgreSQL 16"},
    )
    db.add(member)
    db.add(project)
    db.commit()

    req = BlueprintCreateRequest(
        idea="Build a real-time logistics and shipment tracking platform",
        requirements="Live GPS vehicle telemetry, dynamic ETA calculation, automated driver dispatching",
        tech_preferences={"backend": "FastAPI", "frontend": "Next.js 15", "database": "PostgreSQL 16"},
    )

    # 1. create_workflow_execution creates Blueprint in 'generating' status and links immediately
    execution, proj, version, tech_stack = WorkflowOrchestratorService.create_workflow_execution(
        db=db,
        project_id=project.id,
        user=user,
        data=req,
    )
    assert execution.blueprint_id is not None
    initial_bp = db.query(Blueprint).filter(Blueprint.id == execution.blueprint_id).first()
    assert initial_bp.status == "generating"

    # 2. Run workflow execution
    blueprint, completed_exec = WorkflowOrchestratorService.run_execution(
        db=db,
        workflow_execution_id=execution.id,
        project_id=project.id,
        user=user,
        prompt=execution.prompt,
        tech_stack=tech_stack,
        version=version,
        title=initial_bp.title,
    )

    # 3. Verify Blueprint updated to completed
    assert blueprint.id == initial_bp.id
    assert blueprint.status == "completed"
    assert completed_exec.status == "completed"
    assert completed_exec.progress_percentage == 100

    # 4. Verify artifacts persisted and linked to Blueprint
    artifacts = (
        db.query(BlueprintArtifact)
        .filter(BlueprintArtifact.blueprint_id == blueprint.id)
        .all()
    )
    assert len(artifacts) >= 7
    types = {a.artifact_type for a in artifacts}
    assert "requirements" in types
    assert "architecture" in types
    assert "database" in types
    assert ("api" in types or "openapi" in types)
    assert "frontend" in types
    assert "security" in types
    assert "deployment" in types


def test_failed_workflow_marks_blueprint_failed(db: Session, monkeypatch):
    """
    Priority 2:
    If an agent fails and exhausts retries, verify both WorkflowExecution
    and Blueprint are marked as 'failed', not silently marked completed.
    """
    from app.models.user import User
    from app.models.project import Project
    from app.models.organization import Organization
    from app.models.organization_member import OrganizationMember
    from app.schemas.blueprint import BlueprintCreateRequest

    unique = uuid.uuid4().hex[:8]
    user = User(
        email=f"fail_test_{unique}@testforgeai.com",
        full_name="Fail Test Architect",
        is_active=True,
    )
    org = Organization(
        name=f"Fail Org {unique}",
        slug=f"fail-org-{unique}",
        billing_email=f"billing_{unique}@testforgeai.com",
    )
    db.add(user)
    db.add(org)
    db.flush()

    member = OrganizationMember(organization_id=org.id, user_id=user.id, role="owner")
    project = Project(
        name=f"Fail Test Project {unique}",
        slug=f"fail-project-{unique}",
        organization_id=org.id,
        created_by=user.id,
    )
    db.add(member)
    db.add(project)
    db.commit()

    req = BlueprintCreateRequest(
        idea="Simulate an agent failure scenario",
        requirements="Should trigger error handling",
    )

    execution, proj, version, tech_stack = WorkflowOrchestratorService.create_workflow_execution(
        db=db,
        project_id=project.id,
        user=user,
        data=req,
    )
    bp_id = execution.blueprint_id

    # Simulate catastrophic failure during LangGraph stream
    def mock_build_failing_graph(*args, **kwargs):
        class FailingGraph:
            def stream(self, initial_state):
                # Emit error delta
                yield {
                    "supervisor": {
                        "errors": ["Catastrophic LLM quota exceeded"],
                        "current_agent": "SupervisorAgent",
                    }
                }
        return FailingGraph()

    monkeypatch.setattr("app.services.workflow_service.build_workflow_graph", mock_build_failing_graph)

    from fastapi import HTTPException
    with pytest.raises(HTTPException):
        WorkflowOrchestratorService.run_execution(
            db=db,
            workflow_execution_id=execution.id,
            project_id=project.id,
            user=user,
            prompt=execution.prompt,
            tech_stack=tech_stack,
            version=version,
        )

    # Verify Blueprint is marked failed
    failed_bp = db.query(Blueprint).filter(Blueprint.id == bp_id).first()
    assert failed_bp.status == "failed"
    assert "Workflow failed" in (failed_bp.summary or "")

    # Verify WorkflowExecution is marked failed
    failed_exec = db.query(WorkflowExecution).filter(WorkflowExecution.id == execution.id).first()
    assert failed_exec.status == "failed"
