import uuid
import pytest
from fastapi.testclient import TestClient


def create_authenticated_user(client: TestClient):
    unique_suffix = uuid.uuid4().hex[:8]
    email = f"user_{unique_suffix}@testforgeai.com"
    password = "StrongPassword123!"
    full_name = f"Test Developer {unique_suffix}"

    # Register
    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": full_name},
    )
    assert reg_res.status_code == 201

    # Login
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    token_data = login_res.json()
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return headers, token_data["user"]


def test_create_and_list_projects(client: TestClient):
    headers, user = create_authenticated_user(client)

    # 1. Create a Project
    project_payload = {
        "name": "Cloud Native FinTech",
        "description": "High-throughput micro-lending API platform with vector risk scoring.",
        "tech_stack": {
            "backend": "FastAPI (Python 3.13)",
            "frontend": "Next.js 15 (TypeScript)",
            "database": "PostgreSQL 16",
        },
        "repository_url": "https://github.com/forgeai/fintech-demo",
    }

    create_res = client.post("/api/v1/projects", json=project_payload, headers=headers)
    assert create_res.status_code == 201, create_res.text
    project_data = create_res.json()
    assert project_data["name"] == "Cloud Native FinTech"
    assert project_data["slug"] == "cloud-native-fintech"
    assert project_data["status"] == "active"
    assert project_data["created_by"] == user["id"]

    # 2. List Projects
    list_res = client.get("/api/v1/projects", headers=headers)
    assert list_res.status_code == 200
    projects = list_res.json()
    assert len(projects) >= 1
    assert any(p["id"] == project_data["id"] for p in projects)

    # 3. Get Project by ID
    get_res = client.get(f"/api/v1/projects/{project_data['id']}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == project_data["id"]

    # 4. Update Project
    update_res = client.patch(
        f"/api/v1/projects/{project_data['id']}",
        json={"name": "Updated FinTech Core"},
        headers=headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Updated FinTech Core"


def test_project_unauthorized_access(client: TestClient):
    # Try to access projects without token
    res = client.get("/api/v1/projects")
    assert res.status_code == 401
