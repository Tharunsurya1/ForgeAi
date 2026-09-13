import uuid
import pytest
from fastapi.testclient import TestClient


def create_project_with_auth(client: TestClient):
    unique_suffix = uuid.uuid4().hex[:8]
    email = f"architect_{unique_suffix}@testforgeai.com"
    password = "StrongPassword123!"
    full_name = f"Enterprise Architect {unique_suffix}"

    # Register & Login
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": full_name},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create project
    proj_res = client.post(
        "/api/v1/projects",
        json={
            "name": "E-Commerce Microservices",
            "description": "Multi-tenant inventory and checkout engine",
            "tech_stack": {
                "backend": "FastAPI",
                "frontend": "Next.js",
                "database": "PostgreSQL",
            },
        },
        headers=headers,
    )
    assert proj_res.status_code == 201
    return headers, proj_res.json()


def test_generate_and_retrieve_blueprint(client: TestClient):
    headers, project = create_project_with_auth(client)
    project_id = project["id"]

    # 1. Trigger Blueprint Generation
    gen_payload = {
        "prompt": "Build an enterprise multi-tenant ecommerce store with real-time stock sync and stripe checkout.",
        "title": "E-Commerce Scale Engine",
        "tech_stack": {
            "backend": "FastAPI (Python 3.13)",
            "frontend": "Next.js 15",
            "database": "PostgreSQL 16",
            "cache": "Redis 7.2",
        },
    }

    gen_res = client.post(
        f"/api/v1/blueprints/generate/{project_id}",
        json=gen_payload,
        headers=headers,
    )
    assert gen_res.status_code == 201, gen_res.text
    bp_data = gen_res.json()

    assert bp_data["project_id"] == project_id
    assert bp_data["current_version"] == 1
    assert bp_data["status"] == "completed"
    assert bp_data["title"] == "E-Commerce Scale Engine"
    assert len(bp_data["artifacts"]) >= 7

    # Verify all core domain artifact types are present
    artifact_types = [a["artifact_type"] for a in bp_data["artifacts"]]
    assert "requirements" in artifact_types
    assert "architecture" in artifact_types
    assert "database" in artifact_types
    assert ("api" in artifact_types or "openapi" in artifact_types)
    assert "frontend" in artifact_types
    assert "security" in artifact_types
    assert "deployment" in artifact_types

    # 2. Retrieve Blueprint by ID
    bp_id = bp_data["id"]
    get_res = client.get(f"/api/v1/blueprints/{bp_id}", headers=headers)
    assert get_res.status_code == 200
    retrieved_bp = get_res.json()
    assert retrieved_bp["id"] == bp_id
    assert len(retrieved_bp["artifacts"]) >= 7


    # 3. Retrieve Latest Blueprint for Project
    proj_bp_res = client.get(f"/api/v1/blueprints/project/{project_id}", headers=headers)
    assert proj_bp_res.status_code == 200
    assert proj_bp_res.json()["id"] == bp_id
