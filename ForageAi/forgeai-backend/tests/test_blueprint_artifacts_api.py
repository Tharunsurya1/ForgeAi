import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.blueprint import Blueprint
from app.models.blueprint_artifact import BlueprintArtifact


def register_user_and_create_project(client: TestClient, prefix: str = "art"):
    uid = uuid.uuid4().hex[:8]
    email = f"{prefix}_{uid}@example.com"
    password = "StrongPassword123!"
    full_name = f"Test User {uid}"

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
            "name": f"Project {uid}",
            "description": "Artifact rendering test project",
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


def test_get_blueprint_artifacts_authorized(client: TestClient, db: Session):
    ctx = register_user_and_create_project(client, "auth_user")
    headers = ctx["headers"]
    project_id = ctx["project"]["id"]

    # 1. Create Blueprint with Specialist Artifacts
    blueprint = Blueprint(
        project_id=project_id,
        current_version=1,
        title="Test Architecture Blueprint",
        summary="Test multi-agent synthesis",
        status="completed",
        metadata_={"quality_score": 98, "approval_verdict": "APPROVED"},
    )
    db.add(blueprint)
    db.flush()

    art1 = BlueprintArtifact(
        blueprint_id=blueprint.id,
        version=1,
        artifact_type="requirements",
        file_path="docs/REQUIREMENTS.md",
        content="# Software Requirements\n- Feature 1: Auth\n- Feature 2: Checkout",
        language="markdown",
        file_size_bytes=64,
    )
    art2 = BlueprintArtifact(
        blueprint_id=blueprint.id,
        version=1,
        artifact_type="database",
        file_path="db/schema.sql",
        content="CREATE TABLE users (id UUID PRIMARY KEY, email VARCHAR NOT NULL);",
        language="sql",
        file_size_bytes=66,
    )
    art3 = BlueprintArtifact(
        blueprint_id=blueprint.id,
        version=1,
        artifact_type="deployment",
        file_path="docker-compose.yml",
        content="version: '3.8'\nservices:\n  api:\n    image: app:latest",
        language="yaml",
        file_size_bytes=56,
    )
    db.add_all([art1, art2, art3])
    db.commit()

    # 2. Call GET /api/v1/blueprints/{blueprint_id}/artifacts
    res = client.get(f"/api/v1/blueprints/{blueprint.id}/artifacts", headers=headers)
    assert res.status_code == 200, res.text
    data = res.json()

    assert data["blueprint_id"] == str(blueprint.id)
    assert data["current_version"] == 1
    assert data["selected_version"] == 1
    assert data["total_artifacts"] == 3
    assert len(data["artifacts"]) == 3

    # Verify fields on each artifact
    for item in data["artifacts"]:
        assert "id" in item
        assert item["blueprint_id"] == str(blueprint.id)
        assert item["version"] == 1
        assert item["status"] == "completed"
        assert "content" in item
        assert "language" in item
        assert "file_size_bytes" in item
        assert "created_at" in item
        assert item["agent_type"] in ("requirements", "database", "devops")

    # 3. Call alias route /api/blueprints/{blueprint_id}/artifacts
    alias_res = client.get(f"/api/blueprints/{blueprint.id}/artifacts", headers=headers)
    assert alias_res.status_code == 200
    assert alias_res.json()["total_artifacts"] == 3


def test_get_blueprint_artifacts_cross_tenant_denied(client: TestClient, db: Session):
    ctx_a = register_user_and_create_project(client, "tenant_a")
    ctx_b = register_user_and_create_project(client, "tenant_b")

    # Tenant A creates blueprint
    blueprint_a = Blueprint(
        project_id=ctx_a["project"]["id"],
        current_version=1,
        title="Confidential Blueprint A",
        status="completed",
    )
    db.add(blueprint_a)
    db.flush()

    art_a = BlueprintArtifact(
        blueprint_id=blueprint_a.id,
        version=1,
        artifact_type="security",
        file_path="security/AUDIT.md",
        content="Confidential proprietary threat model",
        language="markdown",
        file_size_bytes=38,
    )
    db.add(art_a)
    db.commit()

    # Tenant B tries to retrieve Tenant A's blueprint artifacts
    res = client.get(f"/api/v1/blueprints/{blueprint_a.id}/artifacts", headers=ctx_b["headers"])
    # Must be 404 or 403 (unauthorized cross-tenant IDOR protection)
    assert res.status_code in (403, 404), f"Expected 403/404, got {res.status_code}"


def test_get_blueprint_artifacts_empty_collection(client: TestClient, db: Session):
    ctx = register_user_and_create_project(client, "empty_arts")
    headers = ctx["headers"]
    project_id = ctx["project"]["id"]

    blueprint = Blueprint(
        project_id=project_id,
        current_version=1,
        title="Draft Blueprint Without Artifacts",
        status="generating",
    )
    db.add(blueprint)
    db.commit()

    res = client.get(f"/api/v1/blueprints/{blueprint.id}/artifacts", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_artifacts"] == 0
    assert data["artifacts"] == []


def test_get_blueprint_artifacts_metadata_and_agent_type_derivation(client: TestClient, db: Session):
    ctx = register_user_and_create_project(client, "meta_arts")
    headers = ctx["headers"]
    project_id = ctx["project"]["id"]

    blueprint = Blueprint(
        project_id=project_id,
        current_version=1,
        title="Metadata Verification Blueprint",
        status="completed",
    )
    db.add(blueprint)
    db.flush()

    # Artifacts from various specialist agents
    artifacts = [
        BlueprintArtifact(
            blueprint_id=blueprint.id,
            version=1,
            artifact_type="specification",
            file_path="api/openapi.yaml",
            content="openapi: 3.1.0\ninfo:\n  title: API",
            language="yaml",
            file_size_bytes=35,
        ),
        BlueprintArtifact(
            blueprint_id=blueprint.id,
            version=1,
            artifact_type="business_analysis",
            file_path="docs/BUSINESS_ANALYSIS.md",
            content="# Market Analysis\nTAM: $10B",
            language="markdown",
            file_size_bytes=30,
        ),
        BlueprintArtifact(
            blueprint_id=blueprint.id,
            version=1,
            artifact_type="testing",
            file_path="tests/test_api.py",
            content="def test_health(): pass",
            language="python",
            file_size_bytes=24,
        ),
    ]
    db.add_all(artifacts)
    db.commit()

    res = client.get(f"/api/v1/blueprints/{blueprint.id}/artifacts", headers=headers)
    assert res.status_code == 200
    items = {item["file_path"]: item for item in res.json()["artifacts"]}

    assert items["api/openapi.yaml"]["agent_type"] == "api"
    assert items["api/openapi.yaml"]["language"] == "yaml"
    assert items["docs/BUSINESS_ANALYSIS.md"]["agent_type"] == "business_analyst"
    assert items["tests/test_api.py"]["agent_type"] == "testing"


def test_get_blueprint_artifacts_version_filtering(client: TestClient, db: Session):
    ctx = register_user_and_create_project(client, "versioned_arts")
    headers = ctx["headers"]
    project_id = ctx["project"]["id"]

    blueprint = Blueprint(
        project_id=project_id,
        current_version=2,
        title="Versioned Architecture Blueprint",
        status="completed",
    )
    db.add(blueprint)
    db.flush()

    # Version 1 artifact
    v1_art = BlueprintArtifact(
        blueprint_id=blueprint.id,
        version=1,
        artifact_type="database",
        file_path="db/schema_v1.sql",
        content="CREATE TABLE v1 (id INT);",
        language="sql",
        file_size_bytes=26,
    )
    # Version 2 artifacts
    v2_art1 = BlueprintArtifact(
        blueprint_id=blueprint.id,
        version=2,
        artifact_type="database",
        file_path="db/schema_v2.sql",
        content="CREATE TABLE v2 (id UUID PRIMARY KEY);",
        language="sql",
        file_size_bytes=39,
    )
    v2_art2 = BlueprintArtifact(
        blueprint_id=blueprint.id,
        version=2,
        artifact_type="deployment",
        file_path="docker-compose.yml",
        content="version: '3.8'",
        language="yaml",
        file_size_bytes=14,
    )
    db.add_all([v1_art, v2_art1, v2_art2])
    db.commit()

    # Default request without query param -> fetches current_version (v2)
    default_res = client.get(f"/api/v1/blueprints/{blueprint.id}/artifacts", headers=headers)
    assert default_res.status_code == 200
    assert default_res.json()["selected_version"] == 2
    assert default_res.json()["total_artifacts"] == 2
    paths_v2 = [a["file_path"] for a in default_res.json()["artifacts"]]
    assert "db/schema_v2.sql" in paths_v2
    assert "docker-compose.yml" in paths_v2

    # Explicit version query param ?version=1 -> fetches v1
    v1_res = client.get(f"/api/v1/blueprints/{blueprint.id}/artifacts?version=1", headers=headers)
    assert v1_res.status_code == 200
    assert v1_res.json()["selected_version"] == 1
    assert v1_res.json()["total_artifacts"] == 1
    assert v1_res.json()["artifacts"][0]["file_path"] == "db/schema_v1.sql"


def test_get_blueprint_artifacts_unauthenticated(client: TestClient):
    fake_id = uuid.uuid4()
    res = client.get(f"/api/v1/blueprints/{fake_id}/artifacts")
    assert res.status_code == 401


def test_get_blueprint_artifacts_nonexistent_blueprint(client: TestClient, db: Session):
    ctx = register_user_and_create_project(client, "notfound_arts")
    fake_id = uuid.uuid4()
    res = client.get(f"/api/v1/blueprints/{fake_id}/artifacts", headers=ctx["headers"])
    assert res.status_code == 404
