import uuid
from typing import Dict, Any
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.blueprint import Blueprint
from app.models.blueprint_artifact import BlueprintArtifact
from app.schemas.code_generator import CodeFileItem
from app.services.code_validation_service import CodeValidationService


def register_user_and_create_project(client: TestClient, prefix: str = "valid") -> Dict[str, Any]:
    uid = uuid.uuid4().hex[:8]
    email = f"{prefix}_{uid}@example.com"
    password = "StrongPassword123!"
    full_name = f"Validator {uid}"

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
            "name": f"Valid App {uid}",
            "description": "Validation test project",
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


def seed_blueprint_with_artifacts(db: Session, project_id: str) -> Blueprint:
    blueprint = Blueprint(
        project_id=uuid.UUID(project_id),
        current_version=1,
        title="Validated Platform Blueprint",
        summary="High-reliability validated architecture",
        status="completed",
        metadata_={"quality_score": 99, "approval_verdict": "APPROVED"},
    )
    db.add(blueprint)
    db.flush()

    artifacts = [
        BlueprintArtifact(
            blueprint_id=blueprint.id,
            version=1,
            artifact_type="requirements",
            file_path="docs/REQUIREMENTS.md",
            content="# Validated Requirements\n- Authentication\n- Billing\n- Analytics",
            language="markdown",
            file_size_bytes=65,
        ),
        BlueprintArtifact(
            blueprint_id=blueprint.id,
            version=1,
            artifact_type="database",
            file_path="db/schema.sql",
            content="CREATE TABLE accounts (id UUID PRIMARY KEY, balance NUMERIC(12,2) NOT NULL DEFAULT 0.0);",
            language="sql",
            file_size_bytes=90,
        ),
        BlueprintArtifact(
            blueprint_id=blueprint.id,
            version=1,
            artifact_type="api",
            file_path="api/openapi.yaml",
            content="openapi: 3.1.0\ninfo:\n  title: Core API\n  version: 1.0.0\npaths:\n  /health:\n    get:\n      responses:\n        '200':\n          description: Healthy\n",
            language="yaml",
            file_size_bytes=145,
        ),
        BlueprintArtifact(
            blueprint_id=blueprint.id,
            version=1,
            artifact_type="backend",
            file_path="app/main.py",
            content="from fastapi import FastAPI\napp = FastAPI(title='Core Backend')\n\n@app.get('/health')\ndef health():\n    return {'status': 'healthy'}\n",
            language="python",
            file_size_bytes=130,
        ),
        BlueprintArtifact(
            blueprint_id=blueprint.id,
            version=1,
            artifact_type="frontend",
            file_path="src/App.tsx",
            content="import React from 'react';\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Validated Dashboard</h1>\n    </main>\n  );\n}\n",
            language="typescript",
            file_size_bytes=140,
        ),
    ]
    db.add_all(artifacts)
    db.commit()

    return blueprint


def test_validation_service_valid_project():
    """1. Test that valid generated project files pass validation with 0 errors."""
    valid_files = [
        CodeFileItem(
            path="backend/app/main.py",
            name="main.py",
            directory="backend/app",
            content="from fastapi import FastAPI\napp = FastAPI()\n",
            language="python",
            size_bytes=38,
            source="scaffold",
        ),
        CodeFileItem(
            path="frontend/src/App.tsx",
            name="App.tsx",
            directory="frontend/src",
            content="export default function App() { return <div>OK</div>; }",
            language="typescript",
            size_bytes=55,
            source="scaffold",
        ),
        CodeFileItem(
            path="db/schema.sql",
            name="schema.sql",
            directory="db",
            content="CREATE TABLE users (id INT PRIMARY KEY);",
            language="sql",
            size_bytes=40,
            source="scaffold",
        ),
        CodeFileItem(
            path="config.json",
            name="config.json",
            directory=".",
            content='{"env": "production", "port": 8000}',
            language="json",
            size_bytes=35,
            source="scaffold",
        ),
        CodeFileItem(
            path="README.md",
            name="README.md",
            directory=".",
            content="# Project Documentation\n\nAll components initialized.\n",
            language="markdown",
            size_bytes=55,
            source="scaffold",
        ),
    ]

    res = CodeValidationService.validate_files(valid_files)
    assert res.valid is True
    assert len(res.errors) == 0
    assert res.checked_files == 5


def test_validation_empty_file_detection():
    """2. Test detection of empty files."""
    files = [
        CodeFileItem(
            path="backend/empty.py",
            name="empty.py",
            directory="backend",
            content="   \n  \t  ",
            language="python",
            size_bytes=0,
            source="generated",
        )
    ]
    res = CodeValidationService.validate_files(files)
    assert res.valid is False
    assert any(e.type == "empty_file" and "backend/empty.py" in (e.path or "") for e in res.errors)


def test_validation_duplicate_path_detection():
    """3. Test detection of duplicate file paths."""
    files = [
        CodeFileItem(
            path="backend/app/main.py",
            name="main.py",
            directory="backend/app",
            content="import sys\n",
            language="python",
            size_bytes=11,
            source="scaffold",
        ),
        CodeFileItem(
            path="backend/app/main.py",
            name="main.py",
            directory="backend/app",
            content="import os\n",
            language="python",
            size_bytes=10,
            source="scaffold",
        ),
    ]
    res = CodeValidationService.validate_files(files)
    assert res.valid is False
    assert any(e.type == "duplicate_path" for e in res.errors)


def test_validation_unsafe_path_detection():
    """4. Test rejection of unsafe paths (directory traversal, absolute paths, drive letters)."""
    unsafe_paths = [
        ("../../secret.env", "parent traversal"),
        ("../../../etc/passwd", "deep traversal"),
        ("/etc/shadow", "unix absolute path"),
        ("C:\\Windows\\System32\\cmd.exe", "windows drive path"),
        ("app/../../../escape.py", "mid-path traversal"),
    ]

    for bad_path, desc in unsafe_paths:
        files = [
            CodeFileItem(
                path=bad_path,
                name="file.txt",
                directory=".",
                content="sensitive content",
                language="text",
                size_bytes=17,
                source="generated",
            )
        ]
        res = CodeValidationService.validate_files(files)
        assert res.valid is False, f"Failed to reject {desc}: {bad_path}"
        assert any(e.type == "unsafe_path" for e in res.errors), f"Expected unsafe_path error for {bad_path}"


def test_validation_invalid_json_detection():
    """5. Test detection of invalid JSON syntax."""
    files = [
        CodeFileItem(
            path="package.json",
            name="package.json",
            directory=".",
            content='{\n  "name": "broken-pkg",\n  "version": 1.0.0\n}',  # Unquoted string value
            language="json",
            size_bytes=48,
            source="scaffold",
        )
    ]
    res = CodeValidationService.validate_files(files)
    assert res.valid is False
    syntax_errors = [e for e in res.errors if e.type == "syntax_error"]
    assert len(syntax_errors) > 0
    assert "JSON syntax error" in syntax_errors[0].message


def test_validation_python_syntax_ast_parsing():
    """6. Test detection of Python syntax errors via AST parsing."""
    broken_python = (
        "def broken_function(\n"
        "    print('Missing closing parenthesis'\n"
    )
    files = [
        CodeFileItem(
            path="backend/app/routes.py",
            name="routes.py",
            directory="backend/app",
            content=broken_python,
            language="python",
            size_bytes=len(broken_python),
            source="scaffold",
        )
    ]
    res = CodeValidationService.validate_files(files)
    assert res.valid is False
    syntax_errors = [e for e in res.errors if e.type == "syntax_error"]
    assert len(syntax_errors) > 0
    assert "Python syntax error" in syntax_errors[0].message


def test_validation_api_authorized_and_response_schema(client: TestClient, db: Session):
    """9. Test POST /api/v1/code-generator/blueprint/{blueprint_id}/validate returns schema compliant result."""
    ctx = register_user_and_create_project(client, "val_api")
    blueprint = seed_blueprint_with_artifacts(db, ctx["project"]["id"])

    res = client.post(
        f"/api/v1/code-generator/blueprint/{blueprint.id}/validate",
        headers=ctx["headers"],
    )
    assert res.status_code == 200, res.text
    data = res.json()

    # Validate Schema properties
    assert "valid" in data
    assert isinstance(data["valid"], bool)
    assert "errors" in data
    assert isinstance(data["errors"], list)
    assert "warnings" in data
    assert isinstance(data["warnings"], list)
    assert "checked_files" in data
    assert data["checked_files"] >= 7
    assert data["valid"] is True


def test_validation_api_cross_tenant_denied(client: TestClient, db: Session):
    """7. Test cross-tenant access denial (Tenant B cannot validate Tenant A's blueprint)."""
    ctx_a = register_user_and_create_project(client, "val_t_a")
    ctx_b = register_user_and_create_project(client, "val_t_b")

    blueprint_a = seed_blueprint_with_artifacts(db, ctx_a["project"]["id"])

    res = client.post(
        f"/api/v1/code-generator/blueprint/{blueprint_a.id}/validate",
        headers=ctx_b["headers"],
    )
    assert res.status_code in (403, 404)


def test_validation_api_unauthenticated(client: TestClient):
    """8. Test unauthenticated request is rejected with 401."""
    random_id = uuid.uuid4()
    res = client.post(f"/api/v1/code-generator/blueprint/{random_id}/validate")
    assert res.status_code == 401
