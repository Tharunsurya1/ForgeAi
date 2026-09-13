"""
Comprehensive test suite for ForgeAI Qdrant Vector Search and RAG Context Injection.
Tests:
- Deterministic mock and real OpenAI embedding providers
- Qdrant service lifecycle, upsert, query, filtering, deletion, and health checks
- Intelligent document chunking
- Idempotent BlueprintArtifact indexing
- Strict multi-tenant isolation (Org A vs Org B)
- RequirementsAgent and DatabaseAgent RAG context injection and graceful degradation
- RAG REST APIs (health, index, reindex, query) and RBAC tenant isolation
"""

import math
import uuid
from typing import Dict
from unittest.mock import MagicMock, patch

import httpx
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.ai.agents.database_agent import DatabaseAgent
from app.ai.agents.requirements_agent import RequirementsAgent
from app.ai.agents.types import AgentContext
from app.core.config import settings
from app.models.blueprint import Blueprint
from app.models.blueprint_artifact import BlueprintArtifact
from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
from app.models.project import Project
from app.models.user import User
from app.schemas.auth import UserLoginRequest, UserRegisterRequest
from app.schemas.project import ProjectCreate
from app.services.auth_service import AuthService
from app.services.embedding_service import (
    DeterministicMockEmbeddingProvider,
    EmbeddingAuthenticationError,
    EmbeddingConfigurationError,
    EmbeddingRateLimitError,
    EmbeddingTimeoutError,
    OpenAIEmbeddingProvider,
    get_embedding_provider,
)
from app.services.project_service import ProjectService
from app.services.qdrant_service import QdrantService
from app.services.rag_service import RAGService, chunk_text


def create_test_context(db: Session, suffix: str) -> Dict:
    """Helper to create a user, organization, and project."""
    reg_req = UserRegisterRequest(
        email=f"rag_{suffix}_{uuid.uuid4().hex[:6]}@testforgeai.com",
        password="SecurePassword123!",
        full_name=f"RAG User {suffix}",
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
        name=f"RAG Project {suffix}",
        description="RAG vector search test project",
        organization_id=org.id,
        tech_stack={"backend": "FastAPI", "database": "PostgreSQL 16"},
    )
    project = ProjectService.create_project(
        db=db,
        user=user,
        data=proj_create,
    )
    return {"user": user, "token": access_token, "org": org, "project": project}


# ===========================================================================
# 1. Embedding Provider Tests
# ===========================================================================

def test_mock_embedding_provider_deterministic_and_normalized():
    provider = DeterministicMockEmbeddingProvider(dimension=128)
    assert provider.provider_name == "mock"
    assert provider.dimension == 128

    v1 = provider.embed_text("Authentication & RBAC design")
    v2 = provider.embed_text("Authentication & RBAC design")
    v3 = provider.embed_text("Completely unrelated billing service")

    assert len(v1) == 128
    assert v1 == v2  # Must be strictly deterministic

    # Verify L2 unit norm for cosine distance
    l2_norm = math.sqrt(sum(x * x for x in v1))
    assert math.isclose(l2_norm, 1.0, rel_tol=1e-4)

    # Batch embedding
    batch = provider.embed_batch(["alpha", "beta", "gamma"])
    assert len(batch) == 3
    assert len(batch[0]) == 128


def test_openai_embedding_provider_missing_key():
    with pytest.raises(EmbeddingConfigurationError) as exc_info:
        OpenAIEmbeddingProvider(api_key="")
    assert "OPENAI_API_KEY is required" in str(exc_info.value)


def test_openai_embedding_provider_mocked_http_success():
    fake_vector = [0.1] * 1536
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "data": [{"embedding": fake_vector, "index": 0}],
        "usage": {"total_tokens": 8},
    }

    with patch("httpx.Client.post", return_value=mock_resp):
        provider = OpenAIEmbeddingProvider(api_key="sk-test-mock-key")
        res = provider.embed_text("Test vector")
        assert len(res) == 1536
        assert res[0] == 0.1


def test_openai_embedding_provider_errors_handling():
    # 401 Unauthorized
    resp_401 = MagicMock(status_code=401, text="Unauthorized key")
    with patch("httpx.Client.post", return_value=resp_401):
        provider = OpenAIEmbeddingProvider(api_key="sk-invalid")
        with pytest.raises(EmbeddingAuthenticationError):
            provider.embed_text("Test")

    # 429 Rate Limit
    resp_429 = MagicMock(status_code=429, text="Rate limit exceeded")
    with patch("httpx.Client.post", return_value=resp_429):
        provider = OpenAIEmbeddingProvider(api_key="sk-valid", max_retries=1)
        with pytest.raises(EmbeddingRateLimitError):
            provider.embed_text("Test")

    # Timeout
    with patch("httpx.Client.post", side_effect=httpx.TimeoutException("Read timed out")):
        provider = OpenAIEmbeddingProvider(api_key="sk-valid", max_retries=1)
        with pytest.raises(EmbeddingTimeoutError):
            provider.embed_text("Test")


# ===========================================================================
# 2. Qdrant Service Tests
# ===========================================================================

def test_qdrant_service_lifecycle_in_memory():
    from qdrant_client.models import FieldCondition, Filter, MatchValue, PointStruct

    svc = QdrantService(url=":memory:", default_collection="test_lifecycle")
    assert svc.ensure_collection(vector_size=64) is True

    # Upsert points
    p1 = PointStruct(
        id=str(uuid.uuid4()),
        vector=[0.1] * 64,
        payload={"organization_id": "org-1", "artifact_type": "requirements", "text": "SRS Document"},
    )
    p2 = PointStruct(
        id=str(uuid.uuid4()),
        vector=[0.8] * 64,
        payload={"organization_id": "org-2", "artifact_type": "erd", "text": "PostgreSQL Schema"},
    )
    assert svc.upsert_points([p1, p2]) is True

    # Search with organization filter
    flt_org1 = Filter(must=[FieldCondition(key="organization_id", match=MatchValue(value="org-1"))])
    results = svc.search(query_vector=[0.1] * 64, query_filter=flt_org1, limit=5)
    assert len(results) == 1
    assert results[0].payload["organization_id"] == "org-1"

    # Health check
    health = svc.health()
    assert health["status"] == "healthy"
    assert health["points_count"] == 2

    # Delete points
    assert svc.delete_points([p1.id]) is True
    post_del_results = svc.search(query_vector=[0.1] * 64, query_filter=flt_org1, limit=5)
    assert len(post_del_results) == 0


# ===========================================================================
# 3. Document Chunking Tests
# ===========================================================================

def test_rag_chunking_sections_and_boundaries():
    sample_markdown = (
        "## Executive Summary\n"
        "This is the summary of the distributed platform.\n\n"
        "## Functional Requirements\n"
        "FR-001: User registration and MFA authentication.\n"
        "FR-002: Role-based authorization policies.\n\n"
        "## Database DDL\n"
        "CREATE TABLE users (id UUID PRIMARY KEY, email VARCHAR);\n"
    )
    chunks = chunk_text(sample_markdown, chunk_size=120, chunk_overlap=20)
    assert len(chunks) >= 2
    assert any("Executive Summary" in c for c in chunks)
    assert any("CREATE TABLE" in c for c in chunks)

    # Empty text
    assert chunk_text("") == []
    assert chunk_text("   ") == []


# ===========================================================================
# 4. Blueprint Artifact Indexing & Idempotency Tests
# ===========================================================================

def test_rag_blueprint_artifact_indexing_and_idempotency(db: Session):
    ctx = create_test_context(db, "idx")
    project = ctx["project"]

    blueprint = Blueprint(
        project_id=project.id,
        current_version=1,
        title="Payment Gateway Architecture",
        summary="Architecture with microservices and PostgreSQL",
    )
    db.add(blueprint)
    db.commit()

    artifact = BlueprintArtifact(
        blueprint_id=blueprint.id,
        version=1,
        artifact_type="requirements",
        file_path="docs/REQUIREMENTS.md",
        content="# Requirements\nFR-001: Payment transaction idempotency keys.\nFR-002: Webhook signature verification.",
        language="markdown",
    )
    db.add(artifact)
    db.commit()

    # Configure in-memory Qdrant & mock embeddings for isolated test
    qdrant = QdrantService(url=":memory:", default_collection="test_idx_col")
    embeddings = DeterministicMockEmbeddingProvider(dimension=64)
    rag = RAGService(qdrant=qdrant, embeddings=embeddings)

    # 1. First indexing
    count_1 = rag.index_blueprint_artifact(db, artifact, project)
    assert count_1 > 0

    h1 = qdrant.health()
    assert h1["points_count"] == count_1

    # 2. Re-indexing the exact same artifact should be IDEMPOTENT (no duplicate points)
    count_2 = rag.index_blueprint_artifact(db, artifact, project)
    assert count_2 == count_1

    h2 = qdrant.health()
    assert h2["points_count"] == count_1, "Re-indexing must not duplicate vector points in collection"


# ===========================================================================
# 5. Strict Multi-Tenant Isolation Tests (Org A vs Org B)
# ===========================================================================

def test_rag_strict_tenant_isolation(db: Session):
    ctx_a = create_test_context(db, "tenanta")
    ctx_b = create_test_context(db, "tenantb")

    bp_a = Blueprint(project_id=ctx_a["project"].id, title="Alpha Secret Blueprint")
    bp_b = Blueprint(project_id=ctx_b["project"].id, title="Beta Secret Blueprint")
    db.add_all([bp_a, bp_b])
    db.commit()

    art_a = BlueprintArtifact(
        blueprint_id=bp_a.id,
        artifact_type="database_schema",
        file_path="db/alpha_schema.sql",
        content="CREATE TABLE alpha_proprietary_ledger (id UUID PRIMARY KEY, secret_balance NUMERIC);",
    )
    art_b = BlueprintArtifact(
        blueprint_id=bp_b.id,
        artifact_type="database_schema",
        file_path="db/beta_schema.sql",
        content="CREATE TABLE beta_proprietary_billing (id UUID PRIMARY KEY, secret_invoice VARCHAR);",
    )
    db.add_all([art_a, art_b])
    db.commit()

    # Shared vector index
    qdrant = QdrantService(url=":memory:", default_collection="test_tenant_col")
    embeddings = DeterministicMockEmbeddingProvider(dimension=64)
    rag = RAGService(qdrant=qdrant, embeddings=embeddings)

    # Index both artifacts into the same vector collection
    rag.index_blueprint_artifact(db, art_a, ctx_a["project"])
    rag.index_blueprint_artifact(db, art_b, ctx_b["project"])

    org_a_id = str(ctx_a["org"].id)
    org_b_id = str(ctx_b["org"].id)

    # 1. Org A queries with identical query for "proprietary ledger"
    res_a = rag.retrieve_context(
        query="proprietary ledger balance schema",
        organization_id=org_a_id,
        score_threshold=0.0,
        top_k=5,
    )
    assert len(res_a) >= 1
    for r in res_a:
        assert r.organization_id == org_a_id
        assert "alpha_proprietary_ledger" in r.text
        assert "beta_proprietary_billing" not in r.text

    # 2. Org B queries the EXACT SAME string "proprietary ledger balance schema"
    res_b = rag.retrieve_context(
        query="proprietary ledger balance schema",
        organization_id=org_b_id,
        score_threshold=0.0,
        top_k=5,
    )
    # Org B MUST NEVER see Org A's proprietary ledger!
    for r in res_b:
        assert r.organization_id == org_b_id
        assert "alpha_proprietary_ledger" not in r.text

    # 3. Third-party org query returns empty
    res_unknown = rag.retrieve_context(
        query="proprietary ledger",
        organization_id=str(uuid.uuid4()),
        top_k=5,
    )
    assert len(res_unknown) == 0


# ===========================================================================
# 6. RequirementsAgent and DatabaseAgent RAG Injection Tests
# ===========================================================================

def test_requirements_agent_rag_context_injection():
    agent = RequirementsAgent()
    org_id = str(uuid.uuid4())

    context = AgentContext(
        workflow_id="wf-test-rag-req",
        project_id="proj-test",
        organization_id=org_id,
        prompt="Design patient management system",
        deterministic=True,
    )

    # Mock rag_service.retrieve_context returning historical context
    mock_retrieval = [
        MagicMock(
            chunk_id="chk-1",
            text="Past requirement: Must adhere to HIPAA audit logs and PHI encryption standards.",
            score=0.88,
            artifact_id="art-past-1",
            artifact_type="requirements",
            file_path="docs/HIPAA.md",
        )
    ]

    with patch("app.services.rag_service.rag_service.retrieve_context", return_value=mock_retrieval):
        output, artifacts = agent.execute(context, {"prompt": "Design patient management system"})

        assert "rag_metadata" in output
        assert output["rag_metadata"]["rag_performed"] is True
        assert output["rag_metadata"]["results_count"] == 1
        assert "art-past-1" in output["rag_metadata"]["source_artifact_ids"]
        assert artifacts[0].metadata["rag"]["rag_performed"] is True


def test_requirements_agent_rag_failure_graceful_degradation():
    agent = RequirementsAgent()
    context = AgentContext(
        workflow_id="wf-test-rag-fail",
        project_id="proj-test",
        organization_id=str(uuid.uuid4()),
        prompt="Design telemetry pipeline",
        deterministic=True,
    )

    # When RAG retrieval throws an exception (e.g. Qdrant unreachable), agent must continue gracefully
    with patch("app.services.rag_service.rag_service.retrieve_context", side_effect=Exception("Qdrant connection refused")):
        output, artifacts = agent.execute(context, {"prompt": "Design telemetry pipeline"})

        assert output["rag_metadata"]["rag_performed"] is False
        assert "Qdrant connection refused" in str(output["rag_metadata"]["error"])
        assert len(artifacts) == 1
        assert artifacts[0].artifact_type == "requirements"


def test_database_agent_rag_context_injection():
    agent = DatabaseAgent()
    org_id = str(uuid.uuid4())

    context = AgentContext(
        workflow_id="wf-test-rag-db",
        project_id="proj-test",
        organization_id=org_id,
        prompt="Design e-commerce checkout database",
        deterministic=True,
    )

    mock_schema = [
        MagicMock(
            chunk_id="chk-db-1",
            text="CREATE TABLE orders (id UUID PRIMARY KEY, user_id UUID, total_cents BIGINT, status VARCHAR(32));",
            score=0.92,
            artifact_id="art-db-past",
            artifact_type="database_schema",
            file_path="db/orders.sql",
        )
    ]

    with patch("app.services.rag_service.rag_service.retrieve_context", return_value=mock_schema):
        output, artifacts = agent.execute(context, {"prompt": "Design e-commerce checkout database"})

        assert "rag_metadata" in output
        assert output["rag_metadata"]["rag_performed"] is True
        assert output["rag_metadata"]["results_count"] == 1
        assert artifacts[0].metadata["rag"]["rag_performed"] is True
        assert "CREATE TABLE" in output["ddl_sql"]


# ===========================================================================
# 7. RAG REST API Tests
# ===========================================================================

def test_rag_api_health(client: TestClient, db: Session):
    ctx = create_test_context(db, "raghealth")
    headers = {"Authorization": f"Bearer {ctx['token']}"}

    response = client.get("/api/v1/rag/health", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "embedding_provider" in data
    assert "embedding_dimension" in data


def test_rag_api_index_and_query_with_tenant_rbac(client: TestClient, db: Session):
    ctx_a = create_test_context(db, "apirag_a")
    ctx_b = create_test_context(db, "apirag_b")

    # Create blueprint for Org A
    bp_a = Blueprint(
        project_id=ctx_a["project"].id,
        title="Alpha Microservices",
        summary="Kubernetes and PostgreSQL architecture",
    )
    db.add(bp_a)
    db.commit()

    art_a = BlueprintArtifact(
        blueprint_id=bp_a.id,
        artifact_type="architecture_summary",
        file_path="docs/ARCHITECTURE.md",
        content="Microservices platform communicating via gRPC and Kafka event streams.",
    )
    db.add(art_a)
    db.commit()

    headers_a = {"Authorization": f"Bearer {ctx_a['token']}"}
    headers_b = {"Authorization": f"Bearer {ctx_b['token']}"}

    # 1. User from Org A indexes blueprint -> 200 Success
    index_res = client.post(f"/api/v1/rag/index/{bp_a.id}", headers=headers_a)
    assert index_res.status_code == 200
    idx_data = index_res.json()
    assert idx_data["status"] == "success"
    assert idx_data["artifacts_count"] >= 1

    # 2. User from Org B tries to index Org A's blueprint -> 403 Forbidden
    cross_index_res = client.post(f"/api/v1/rag/index/{bp_a.id}", headers=headers_b)
    assert cross_index_res.status_code == 403

    # 3. User from Org A queries their project knowledge -> 200 Success
    query_res = client.post(
        "/api/v1/rag/query",
        headers=headers_a,
        json={
            "project_id": str(ctx_a["project"].id),
            "query": "gRPC and Kafka microservices",
            "top_k": 5,
            "score_threshold": 0.0,
        },
    )
    assert query_res.status_code == 200
    query_data = query_res.json()
    assert query_data["project_id"] == str(ctx_a["project"].id)
    assert query_data["organization_id"] == str(ctx_a["org"].id)

    # 4. User from Org B tries to query Org A's project -> 403 Forbidden
    cross_query_res = client.post(
        "/api/v1/rag/query",
        headers=headers_b,
        json={
            "project_id": str(ctx_a["project"].id),
            "query": "gRPC and Kafka microservices",
            "top_k": 5,
            "score_threshold": 0.0,
        },
    )
    assert cross_query_res.status_code == 403
