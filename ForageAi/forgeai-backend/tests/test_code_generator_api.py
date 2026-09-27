import io
import uuid
import zipfile
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.blueprint import Blueprint
from app.models.blueprint_artifact import BlueprintArtifact


def register_user_and_create_project(client: TestClient, prefix: str = "codegen"):
    uid = uuid.uuid4().hex[:8]
    email = f"{prefix}_{uid}@example.com"
    password = "StrongPassword123!"
    full_name = f"Coder {uid}"

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
            "name": f"Ecommerce App {uid}",
            "description": "Full-stack ecommerce platform",
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


def seed_blueprint_with_artifacts(db: Session, project_id: str):
    blueprint = Blueprint(
        project_id=uuid.UUID(project_id),
        current_version=1,
        title="Ecommerce Platform Blueprint",
        summary="High concurrency ecommerce platform architecture",
        status="completed",
        metadata_={"quality_score": 98, "approval_verdict": "APPROVED"},
    )
    db.add(blueprint)
    db.flush()

    artifacts = [
        BlueprintArtifact(
            blueprint_id=blueprint.id,
            version=1,
            artifact_type="requirements",
            file_path="docs/REQUIREMENTS.md",
            content="# Software Requirements\n- Browse Products\n- Cart\n- Checkout",
            language="markdown",
            file_size_bytes=60,
        ),
        BlueprintArtifact(
            blueprint_id=blueprint.id,
            version=1,
            artifact_type="database",
            file_path="db/schema.sql",
            content="CREATE TABLE products (id UUID PRIMARY KEY, name VARCHAR(255) NOT NULL, price NUMERIC(10,2));",
            language="sql",
            file_size_bytes=86,
        ),
        BlueprintArtifact(
            blueprint_id=blueprint.id,
            version=1,
            artifact_type="api",
            file_path="api/openapi.yaml",
            content="openapi: 3.1.0\ninfo:\n  title: Ecommerce API\npaths:\n  /products:\n    get:\n      responses:\n        '200':\n          description: Success\n",
            language="yaml",
            file_size_bytes=132,
        ),
        BlueprintArtifact(
            blueprint_id=blueprint.id,
            version=1,
            artifact_type="backend",
            file_path="app/main.py",
            content="from fastapi import FastAPI\napp = FastAPI(title='Ecommerce Backend')\n@app.get('/health')\ndef health(): return {'status': 'ok'}\n",
            language="python",
            file_size_bytes=125,
        ),
        BlueprintArtifact(
            blueprint_id=blueprint.id,
            version=1,
            artifact_type="frontend",
            file_path="src/App.tsx",
            content="import React from 'react';\nexport default function App() { return <div>Ecommerce Storefront</div>; }\n",
            language="typescript",
            file_size_bytes=104,
        ),
        BlueprintArtifact(
            blueprint_id=blueprint.id,
            version=1,
            artifact_type="deployment",
            file_path="docker-compose.yml",
            content="version: '3.8'\nservices:\n  backend:\n    build: ./backend\n    ports:\n      - '8000:8000'\n",
            language="yaml",
            file_size_bytes=94,
        ),
    ]
    db.add_all(artifacts)
    db.commit()

    return blueprint


def test_generate_code_from_blueprint_authorized(client: TestClient, db: Session):
    ctx = register_user_and_create_project(client, "gen_auth")
    blueprint = seed_blueprint_with_artifacts(db, ctx["project"]["id"])

    # POST /api/v1/code-generator/generate
    res = client.post(
        "/api/v1/code-generator/generate",
        json={"blueprint_id": str(blueprint.id), "version": 1},
        headers=ctx["headers"],
    )
    assert res.status_code == 200, res.text
    data = res.json()

    assert "generation_id" in data
    assert data["blueprint_id"] == str(blueprint.id)
    assert data["version"] == 1
    assert data["total_files"] >= 8
    assert data["total_bytes"] > 0
    assert len(data["directories"]) >= 3

    paths = [f["path"] for f in data["files"]]
    assert "backend/requirements.txt" in paths
    assert "backend/app/main.py" in paths
    assert "backend/app/core/config.py" in paths
    assert "frontend/package.json" in paths
    assert "frontend/src/App.tsx" in paths
    assert "db/schema.sql" in paths
    assert "api/openapi.yaml" in paths
    assert "docker-compose.yml" in paths
    assert ".env.example" in paths


def test_get_generated_code_for_blueprint(client: TestClient, db: Session):
    ctx = register_user_and_create_project(client, "gen_get")
    blueprint = seed_blueprint_with_artifacts(db, ctx["project"]["id"])

    res = client.get(
        f"/api/v1/code-generator/blueprint/{blueprint.id}",
        headers=ctx["headers"],
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["blueprint_id"] == str(blueprint.id)
    assert data["total_files"] >= 8

    # Test alias route /api/code-generator/blueprint/{id}
    alias_res = client.get(
        f"/api/code-generator/blueprint/{blueprint.id}",
        headers=ctx["headers"],
    )
    assert alias_res.status_code == 200
    assert alias_res.json()["total_files"] == data["total_files"]


def test_download_project_scaffold_zip(client: TestClient, db: Session):
    ctx = register_user_and_create_project(client, "gen_zip")
    blueprint = seed_blueprint_with_artifacts(db, ctx["project"]["id"])

    res = client.get(
        f"/api/v1/code-generator/blueprint/{blueprint.id}/download",
        headers=ctx["headers"],
    )
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/zip"
    assert "attachment;" in res.headers["content-disposition"]
    assert ".zip" in res.headers["content-disposition"]

    # Read and inspect ZIP in-memory
    zip_buf = io.BytesIO(res.content)
    with zipfile.ZipFile(zip_buf, "r") as zf:
        namelist = zf.namelist()
        assert len(namelist) >= 8

        # Check for core project files inside zip archive
        has_main_py = any("backend/app/main.py" in name for name in namelist)
        has_schema_sql = any("db/schema.sql" in name for name in namelist)
        has_frontend = any("frontend/src/App.tsx" in name for name in namelist)
        has_reqs = any("backend/requirements.txt" in name for name in namelist)
        has_env = any(".env.example" in name for name in namelist)

        assert has_main_py, f"Missing backend/app/main.py in zip: {namelist}"
        assert has_schema_sql, f"Missing db/schema.sql in zip: {namelist}"
        assert has_frontend, f"Missing frontend in zip: {namelist}"
        assert has_reqs, f"Missing requirements.txt in zip: {namelist}"
        assert has_env, f"Missing .env.example in zip: {namelist}"


def test_generate_code_cross_tenant_denied(client: TestClient, db: Session):
    ctx_a = register_user_and_create_project(client, "gen_tenant_a")
    ctx_b = register_user_and_create_project(client, "gen_tenant_b")

    blueprint_a = seed_blueprint_with_artifacts(db, ctx_a["project"]["id"])

    # Tenant B tries to generate code for Tenant A's blueprint
    gen_res = client.post(
        "/api/v1/code-generator/generate",
        json={"blueprint_id": str(blueprint_a.id)},
        headers=ctx_b["headers"],
    )
    assert gen_res.status_code in (403, 404)

    # Tenant B tries to download Tenant A's project zip
    dl_res = client.get(
        f"/api/v1/code-generator/blueprint/{blueprint_a.id}/download",
        headers=ctx_b["headers"],
    )
    assert dl_res.status_code in (403, 404)


def test_generate_code_unauthenticated(client: TestClient):
    random_id = uuid.uuid4()
    res = client.post(
        "/api/v1/code-generator/generate",
        json={"blueprint_id": str(random_id)},
    )
    assert res.status_code == 401

    dl_res = client.get(f"/api/v1/code-generator/blueprint/{random_id}/download")
    assert dl_res.status_code == 401


def test_generate_code_no_artifacts_error(client: TestClient, db: Session):
    ctx = register_user_and_create_project(client, "gen_empty")

    blueprint = Blueprint(
        project_id=uuid.UUID(ctx["project"]["id"]),
        current_version=1,
        title="Empty Blueprint",
        status="generating",
    )
    db.add(blueprint)
    db.commit()

    res = client.post(
        "/api/v1/code-generator/generate",
        json={"blueprint_id": str(blueprint.id)},
        headers=ctx["headers"],
    )
    assert res.status_code == 400
    assert "No specialist artifacts found" in res.json()["detail"]


def test_automated_agent_workflow_to_code_generator_e2e(client: TestClient, db: Session):
    """
    End-to-End Autonomous Agent Execution -> Blueprint Artifacts -> Code Generator -> ZIP Export:
    1. Register user & project.
    2. Run full 14-agent LangGraph workflow via WorkflowOrchestratorService.
    3. Verify agents successfully produce specialist artifacts (Requirements, DB, API, Backend, Frontend, DevOps).
    4. Call POST /api/v1/code-generator/generate with the agent-produced Blueprint.
    5. Verify CodeGenerator parses agent outputs and creates structured project files.
    6. Verify GET /api/v1/code-generator/blueprint/{id} returns full file tree.
    7. Verify GET /api/v1/code-generator/blueprint/{id}/download generates valid ZIP with real agent content.
    """
    from app.models.user import User
    from app.schemas.blueprint import BlueprintCreateRequest
    from app.services.workflow_service import WorkflowOrchestratorService

    ctx = register_user_and_create_project(client, "agent_run")
    headers = ctx["headers"]
    project_id = uuid.UUID(ctx["project"]["id"])
    user = db.query(User).filter(User.email == ctx["email"]).first()
    assert user is not None

    # Step 1: Create Blueprint via Agent Workflow orchestrator
    req = BlueprintCreateRequest(
        idea="Build a high-performance payment gateway and subscription billing system",
        requirements="PCI-DSS compliance, webhook delivery, retry logic, multi-currency support, customer portal",
        tech_preferences={"backend": "FastAPI", "frontend": "Next.js", "database": "PostgreSQL"},
    )

    execution, proj, version, tech_stack = WorkflowOrchestratorService.create_workflow_execution(
        db=db,
        project_id=project_id,
        user=user,
        data=req,
    )

    # Step 2: Execute full multi-agent workflow
    blueprint, completed_exec = WorkflowOrchestratorService.run_execution(
        db=db,
        workflow_execution_id=execution.id,
        project_id=project_id,
        user=user,
        prompt=execution.prompt,
        tech_stack=tech_stack,
        version=version,
        title="Payment Gateway Blueprint",
    )

    assert blueprint.status == "completed"
    assert completed_exec.status == "completed"

    # Step 3: Verify specialist artifacts persisted by agents
    persisted_artifacts = (
        db.query(BlueprintArtifact)
        .filter(BlueprintArtifact.blueprint_id == blueprint.id)
        .all()
    )
    assert len(persisted_artifacts) >= 5, f"Expected specialist artifacts, got {len(persisted_artifacts)}"

    # Step 4: Call Code Generator API
    gen_res = client.post(
        "/api/v1/code-generator/generate",
        json={"blueprint_id": str(blueprint.id), "version": version},
        headers=headers,
    )
    assert gen_res.status_code == 200, gen_res.text
    gen_data = gen_res.json()

    assert gen_data["blueprint_id"] == str(blueprint.id)
    assert gen_data["total_files"] >= 7
    assert gen_data["total_bytes"] > 0
    file_paths = {f["path"] for f in gen_data["files"]}
    assert "backend/requirements.txt" in file_paths
    assert ".env.example" in file_paths

    # Step 5: Fetch generated files via GET
    get_res = client.get(
        f"/api/v1/code-generator/blueprint/{blueprint.id}",
        headers=headers,
    )
    assert get_res.status_code == 200
    assert get_res.json()["blueprint_id"] == str(blueprint.id)

    # Step 6: Download ZIP export and inspect contents
    dl_res = client.get(
        f"/api/v1/code-generator/blueprint/{blueprint.id}/download",
        headers=headers,
    )
    assert dl_res.status_code == 200
    assert dl_res.headers["content-type"] == "application/zip"

    with zipfile.ZipFile(io.BytesIO(dl_res.content), "r") as zf:
        names = zf.namelist()
        assert len(names) >= 7
        # Ensure README or config files exist
        has_env = any(".env.example" in n for n in names)
        assert has_env, f"Expected .env.example in zip, found: {names}"

