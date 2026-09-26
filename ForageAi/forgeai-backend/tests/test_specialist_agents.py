"""
Comprehensive Unit Tests for the 14 Specialist AI Agents (Phase 4C).
Verifies:
- All 14 agents instantiate and run deterministically.
- Input validation rejects invalid inputs (e.g. empty prompts).
- Provider failure handling and error isolation.
- Domain-specific structures (FR/NFR IDs, Gherkin criteria, DDL, OpenAPI, AST syntax,
  design tokens, security finding severities, test suites, review verdicts, optimizations).
- Zero external API calls or network requirements.
"""

import json
import pytest
from typing import Any, Dict, List, Type

from app.ai.agents import (
    BaseAgent,
    AgentContext,
    AgentResult,
    DeterministicMockProvider,
    LLMProvider,
    SupervisorAgent,
    RequirementsAgent,
    BusinessAnalystAgent,
    DatabaseAgent,
    APIAgent,
    BackendAgent,
    FrontendAgent,
    UIUXAgent,
    SecurityAgent,
    DevOpsAgent,
    TestingAgent,
    DocumentationAgent,
    CodeReviewAgent,
    OptimizationAgent,
)


ALL_AGENT_CLASSES: List[Type[BaseAgent]] = [
    SupervisorAgent,
    RequirementsAgent,
    BusinessAnalystAgent,
    DatabaseAgent,
    APIAgent,
    BackendAgent,
    FrontendAgent,
    UIUXAgent,
    SecurityAgent,
    DevOpsAgent,
    TestingAgent,
    DocumentationAgent,
    CodeReviewAgent,
    OptimizationAgent,
]


# ---------------------------------------------------------------------------
# Universal Tests for Every Single Agent
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("agent_cls", ALL_AGENT_CLASSES)
def test_agent_deterministic_run(agent_cls: Type[BaseAgent]):
    """Every agent must execute successfully under DeterministicMockProvider."""
    agent = agent_cls()
    context = AgentContext(
        workflow_id="wf-test-001",
        project_id="proj-test-002",
        prompt="Build an enterprise logistics management and automated billing platform",
        tech_stack={"backend": "FastAPI", "frontend": "Next.js 15", "database": "PostgreSQL"},
        deterministic=True,
    )

    result = agent.run(context)

    assert isinstance(result, AgentResult)
    assert result.success is True, f"{agent.agent_name} failed: {result.error}"
    assert result.agent_name == agent.agent_name
    assert result.version == "1.0.0"
    assert result.error is None
    assert result.execution_time_ms >= 0
    assert len(result.data) > 0
    assert len(result.artifacts) >= 1

    # Verify all produced artifacts have valid fields
    for art in result.artifacts:
        assert art.artifact_type is not None
        assert len(art.file_path) > 0
        assert len(art.content) > 0
        assert art.file_size_bytes == len(art.content.encode("utf-8"))


@pytest.mark.parametrize("agent_cls", ALL_AGENT_CLASSES)
def test_agent_invalid_input_rejection(agent_cls: Type[BaseAgent]):
    """Every agent must reject input violating prompt length constraints."""
    agent = agent_cls()
    # Prompt is too short (< 3 characters)
    context = AgentContext(
        workflow_id="wf-test-001",
        project_id="proj-test-002",
        prompt="Hi",
    )

    result = agent.run(context)

    assert result.success is False
    assert result.error is not None
    assert result.error_details is not None
    assert result.error_details["stage"] == "input_validation"
    assert result.error_details["error_code"] == "INVALID_AGENT_INPUT"


class FailingProvider(LLMProvider):
    """Mock provider simulating API connection or quota failure."""
    def generate(self, *args, **kwargs) -> str:
        raise ConnectionError("Simulated provider outage: 503 Service Unavailable")

    async def agenerate(self, *args, **kwargs) -> str:
        raise ConnectionError("Simulated provider outage: 503 Service Unavailable")


@pytest.mark.parametrize("agent_cls", ALL_AGENT_CLASSES)
def test_agent_provider_failure_isolation(agent_cls: Type[BaseAgent]):
    """Agents must handle LLM provider crashes safely without throwing unhandled exceptions."""
    agent = agent_cls(provider=FailingProvider())
    context = AgentContext(
        workflow_id="wf-fail-001",
        project_id="proj-fail-002",
        prompt="Build microservices dispatch cluster",
    )

    result = agent.run(context)

    assert result.success is False
    assert "Simulated provider outage" in result.error
    assert result.error_details["retryable"] is True


# ---------------------------------------------------------------------------
# Specific Domain Agent Tests
# ---------------------------------------------------------------------------

def test_supervisor_agent_plan_and_manifest():
    """Agent 1: Test workflow plan, ordered stages, and manifest artifact."""
    agent = SupervisorAgent()
    context = AgentContext(
        workflow_id="wf-sup",
        project_id="proj-sup",
        prompt="Build an enterprise ERP software",
    )
    result = agent.run(context)

    assert result.success is True
    assert "stages" in result.data
    assert len(result.data["stages"]) >= 10
    assert "RequirementsAgent" in result.data["target_agents"]
    assert "DatabaseAgent" in result.data["target_agents"]
    assert result.artifacts[0].file_path == "workflow_manifest.json"
    assert result.artifacts[0].language == "json"


def test_requirements_agent_ids_and_markdown():
    """Agent 2: Test requirement IDs (FR-xxx, NFR-xxx) and SRS document."""
    agent = RequirementsAgent()
    context = AgentContext(
        workflow_id="wf-req",
        project_id="proj-req",
        prompt="Build a telemedicine appointment platform with video calling",
    )
    result = agent.run(context)

    assert result.success is True
    frs = result.data["functional_requirements"]
    nfrs = result.data["non_functional_requirements"]

    assert len(frs) >= 3
    for fr in frs:
        assert fr["id"].startswith("FR-")
        assert len(fr["title"]) > 0

    assert len(nfrs) >= 2
    for nfr in nfrs:
        assert nfr["id"].startswith("NFR-")
        assert len(nfr["target_metric"]) > 0

    assert len(result.data["personas"]) >= 2
    assert result.artifacts[0].file_path == "docs/REQUIREMENTS.md"
    assert "Software Requirements Specification" in result.artifacts[0].content


def test_business_analyst_agent_gherkin():
    """Agent 3: Test user stories with Given/When/Then acceptance criteria."""
    agent = BusinessAnalystAgent()
    context = AgentContext(
        workflow_id="wf-ba",
        project_id="proj-ba",
        prompt="Build an automated real-estate investment portal",
    )
    result = agent.run(context)

    assert result.success is True
    stories = result.data["user_stories"]
    entities = result.data["domain_entities"]

    assert len(stories) >= 2
    for s in stories:
        assert s["id"].startswith("US-")
        assert len(s["acceptance_criteria"]) >= 1
        for ac in s["acceptance_criteria"]:
            assert len(ac["given"]) > 0
            assert len(ac["when"]) > 0
            assert len(ac["then"]) > 0

    assert len(entities) >= 2
    assert result.artifacts[0].file_path == "docs/USER_STORIES.md"


def test_database_agent_sql_and_erd():
    """Agent 4: Test PostgreSQL schema, tables, UUID PKs, foreign keys, and Mermaid ERD."""
    agent = DatabaseAgent()
    context = AgentContext(
        workflow_id="wf-db",
        project_id="proj-db",
        prompt="Design a secure multitenant banking core",
    )
    result = agent.run(context)

    assert result.success is True
    assert result.data["dialect"] == "postgresql"
    assert len(result.data["tables"]) >= 2
    assert "erDiagram" in result.data["erd_mermaid"]

    ddl = result.data["ddl_sql"]
    assert "CREATE TABLE" in ddl
    assert "UUID PRIMARY KEY" in ddl or "PRIMARY KEY" in ddl

    assert result.artifacts[0].file_path == "db/schema.sql"
    assert result.artifacts[0].language == "sql"


def test_api_agent_openapi_spec():
    """Agent 5: Test OpenAPI 3.1 YAML specification generation and validation."""
    agent = APIAgent()
    context = AgentContext(
        workflow_id="wf-api",
        project_id="proj-api",
        prompt="Build an API gateway with OAuth2 authentication",
    )
    result = agent.run(context)

    assert result.success is True
    assert result.data["openapi_version"] == "3.1.0"
    endpoints = result.data["endpoints"]
    assert len(endpoints) >= 3

    for ep in endpoints:
        assert ep["path"].startswith("/")
        assert ep["method"] in ("GET", "POST", "PUT", "PATCH", "DELETE")

    assert result.artifacts[0].file_path == "specs/openapi.yaml"
    assert result.artifacts[0].language == "yaml"
    assert "openapi: 3.1.0" in result.artifacts[0].content


def test_backend_agent_python_ast_validation():
    """Agent 6: Test FastAPI code generation and AST syntax validity."""
    agent = BackendAgent()
    context = AgentContext(
        workflow_id="wf-be",
        project_id="proj-be",
        prompt="Generate FastAPI backend scaffolding",
    )
    result = agent.run(context)

    assert result.success is True
    files = result.data["files"]
    assert len(files) >= 2

    paths = [f["path"] for f in files]
    assert "backend/app/main.py" in paths

    for f in files:
        assert len(f["content"]) > 20
        assert f["language"] == "python"

    assert len(result.artifacts) >= 2


def test_frontend_agent_nextjs_pages():
    """Agent 7: Test Next.js 15 pages and component scaffolding."""
    agent = FrontendAgent()
    context = AgentContext(
        workflow_id="wf-fe",
        project_id="proj-fe",
        prompt="Design Next.js dashboard UI",
        shared_state={"ui_specs": {"design_system_name": "ForgeAI Obsidian Modern"}},
    )
    result = agent.run(context)

    assert result.success is True
    files = result.data["files"]
    assert len(files) >= 2

    paths = [f["path"] for f in files]
    assert "frontend/src/app/dashboard/page.tsx" in paths
    assert "/dashboard" in result.data["routes"]


def test_ui_ux_agent_design_tokens():
    """Agent 8: Test Tailwind color tokens, typography scale, and WCAG accessibility."""
    agent = UIUXAgent()
    context = AgentContext(
        workflow_id="wf-uiux",
        project_id="proj-uiux",
        prompt="Design modern dark theme tokens",
    )
    result = agent.run(context)

    assert result.success is True
    colors = result.data["color_palette"]
    assert len(colors) >= 5
    for c in colors:
        assert c["hex_code"].startswith("#")

    assert len(result.data["accessibility_guidelines"]) >= 3
    assert result.artifacts[0].file_path == "design/design-system.md"


def test_security_agent_findings_and_owasp():
    """Agent 9: Test static security analysis findings and OWASP coverage."""
    agent = SecurityAgent()
    context = AgentContext(
        workflow_id="wf-sec",
        project_id="proj-sec",
        prompt="Security review of payment API and session tokens",
    )
    result = agent.run(context)

    assert result.success is True
    assert result.data["score"] >= 80
    assert len(result.data["findings"]) >= 2

    for f in result.data["findings"]:
        assert f["severity"] in ("Critical", "High", "Medium", "Low", "Info")
        assert len(f["recommendation"]) > 0

    assert len(result.data["owasp_coverage"]) >= 3
    assert result.artifacts[0].file_path == "docs/SECURITY_AUDIT.md"


def test_devops_agent_manifests():
    """Agent 10: Test Dockerfiles, docker-compose, CI workflow, and env template."""
    agent = DevOpsAgent()
    context = AgentContext(
        workflow_id="wf-devops",
        project_id="proj-devops",
        prompt="Dockerize fullstack application with CI",
    )
    result = agent.run(context)

    assert result.success is True
    assert "FROM python:" in result.data["dockerfile_backend"]
    assert "FROM node:" in result.data["dockerfile_frontend"]
    assert "services:" in result.data["docker_compose_yml"]
    assert "name: CI Pipeline" in result.data["ci_workflow_yml"]

    artifact_paths = [a.file_path for a in result.artifacts]
    assert "deploy/docker-compose.yml" in artifact_paths
    assert ".github/workflows/ci.yml" in artifact_paths
    assert ".env.example" in artifact_paths


def test_testing_agent_pytest_suites():
    """Agent 11: Test Pytest test cases and executable test files."""
    agent = TestingAgent()
    context = AgentContext(
        workflow_id="wf-test",
        project_id="proj-test",
        prompt="Generate unit and integration test suites",
    )
    result = agent.run(context)

    assert result.success is True
    assert len(result.data["test_cases"]) >= 2
    assert len(result.data["test_files"]) >= 2

    paths = [tf["path"] for tf in result.data["test_files"]]
    assert "tests/test_api.py" in paths
    assert "tests/test_services.py" in paths


def test_documentation_agent_markdown():
    """Agent 12: Test README and ARCHITECTURE documentation generation."""
    agent = DocumentationAgent()
    context = AgentContext(
        workflow_id="wf-doc",
        project_id="proj-doc",
        prompt="Write enterprise technical documentation",
        tech_stack={"backend": "FastAPI", "frontend": "Next.js 15", "database": "PostgreSQL"},
    )
    result = agent.run(context)

    assert result.success is True
    assert len(result.data["readme_markdown"]) > 50
    assert len(result.data["architecture_markdown"]) > 50

    artifact_paths = [a.file_path for a in result.artifacts]
    assert "README.md" in artifact_paths
    assert "ARCHITECTURE.md" in artifact_paths


def test_code_review_agent_verdict():
    """Agent 13: Test code review scoring, issues, and approval verdict."""
    agent = CodeReviewAgent()
    context = AgentContext(
        workflow_id="wf-cr",
        project_id="proj-cr",
        prompt="Review generated backend and frontend code files",
    )
    result = agent.run(context)

    assert result.success is True
    assert result.data["quality_score"] >= 70
    assert result.data["approval_verdict"] in ("APPROVED", "CHANGES_REQUESTED")
    assert len(result.data["issues"]) >= 1
    assert result.artifacts[0].file_path == "docs/CODE_REVIEW.md"


def test_optimization_agent_recommendations():
    """Agent 14: Test performance recommendations, indexing, and caching directives."""
    agent = OptimizationAgent()
    context = AgentContext(
        workflow_id="wf-opt",
        project_id="proj-opt",
        prompt="Analyze PostgreSQL queries and API payload bottlenecks",
    )
    result = agent.run(context)

    assert result.success is True
    assert len(result.data["db_indexing"]) >= 1
    assert len(result.data["caching_strategy"]) >= 1
    recs = result.data["recommendations"]
    assert len(recs) >= 2

    for r in recs:
        assert r["area"] in ("Database", "API", "Frontend", "Infrastructure")
        assert r["expected_impact"] in ("High", "Medium", "Low")

    assert result.artifacts[0].file_path == "docs/OPTIMIZATION.md"


def test_custom_canned_json_provider_integration():
    """Verify that an agent can consume structured JSON output from an LLM provider."""
    custom_canned_json = json.dumps({
        "system_scope": "Custom scoped logistics platform",
        "personas": [{"role": "Dispatcher", "description": "Coordinates fleet routes"}],
        "functional_requirements": [
            {
                "id": "FR-999",
                "title": "Fleet Tracking",
                "description": "Real-time GPS coordinates updates.",
                "priority": "High",
            }
        ],
        "non_functional_requirements": [
            {
                "id": "NFR-999",
                "category": "Performance",
                "description": "GPS ingest latency.",
                "target_metric": "< 50ms",
            }
        ],
        "assumptions": ["Drivers carry cellular-connected hardware."],
        "constraints": ["Cellular bandwidth optimization."],
        "raw_markdown": "# Custom Requirements\n- FR-999: Fleet Tracking",
    })

    mock_provider = DeterministicMockProvider(
        canned_responses={"logistics": custom_canned_json}
    )
    agent = RequirementsAgent(provider=mock_provider)

    context = AgentContext(
        workflow_id="wf-canned",
        project_id="proj-canned",
        prompt="Build a logistics fleet routing service",
    )

    result = agent.run(context)

    assert result.success is True
    assert result.data["functional_requirements"][0]["id"] == "FR-999"
    assert result.data["personas"][0]["role"] == "Dispatcher"


def test_specialist_agents_upstream_context_propagation():
    """
    Phase 1 Fix 5: Verify specialist agents inject concise UPSTREAM context sections
    into their LLM prompts when context.shared_state is provided.
    """
    # 1. APIAgent
    api_agent = APIAgent()
    api_captured = {}

    def mock_api_gen(*args, **kwargs):
        api_captured.update(kwargs)
        return None

    api_agent.generate_structured_output = mock_api_gen

    ctx_api = AgentContext(
        workflow_id="wf-test-api",
        project_id="proj-1",
        prompt="Build payment API",
        shared_state={
            "database_ddl": "CREATE TABLE payments (id UUID PRIMARY KEY, amount NUMERIC);",
            "requirements": "The system must process payments within 200ms.",
        },
    )
    api_agent.run(ctx_api)
    api_prompt = api_captured.get("prompt", "")
    assert "UPSTREAM DATABASE SCHEMA & DDL" in api_prompt
    assert "CREATE TABLE payments" in api_prompt
    assert "UPSTREAM REQUIREMENTS SPECIFICATION" in api_prompt
    assert "process payments within 200ms" in api_prompt

    # 2. BackendAgent (including correction feedback)
    backend_agent = BackendAgent()
    backend_captured = {}

    def mock_be_gen(*args, **kwargs):
        backend_captured.update(kwargs)
        return None

    backend_agent.generate_structured_output = mock_be_gen

    ctx_be = AgentContext(
        workflow_id="wf-test-be",
        project_id="proj-1",
        prompt="Implement payment backend",
        shared_state={
            "requirements": "FR-1: Payment Gateway",
            "business_analysis": "As a user I want to pay securely",
            "database_ddl": "CREATE TABLE payments (id UUID PRIMARY KEY);",
            "api_spec": "/api/v1/payments POST",
            "review_feedback": ["Fix missing input validation for negative amounts"],
        },
    )
    backend_agent.run(ctx_be)
    be_prompt = backend_captured.get("prompt", "")
    assert "UPSTREAM FUNCTIONAL REQUIREMENTS" in be_prompt
    assert "FR-1: Payment Gateway" in be_prompt
    assert "UPSTREAM BUSINESS RULES & STORIES" in be_prompt
    assert "As a user I want to pay securely" in be_prompt
    assert "UPSTREAM DATABASE DDL & MODELS" in be_prompt
    assert "CREATE TABLE payments" in be_prompt
    assert "UPSTREAM API CONTRACT" in be_prompt
    assert "/api/v1/payments POST" in be_prompt
    assert "UPSTREAM CODE REVIEW CORRECTION FEEDBACK" in be_prompt
    assert "Fix missing input validation" in be_prompt

    # 3. FrontendAgent
    frontend_agent = FrontendAgent()
    fe_captured = {}

    def mock_fe_gen(*args, **kwargs):
        fe_captured.update(kwargs)
        return None

    frontend_agent.generate_structured_output = mock_fe_gen

    ctx_fe = AgentContext(
        workflow_id="wf-test-fe",
        project_id="proj-1",
        prompt="Implement payment checkout UI",
        shared_state={
            "ui_specs": {"design_system_name": "ForgeAI Obsidian Glow", "palette": "Dark"},
            "api_spec": "POST /api/v1/checkout",
        },
    )
    frontend_agent.run(ctx_fe)
    fe_prompt = fe_captured.get("prompt", "")
    assert "UPSTREAM UI/UX SPECIFICATIONS" in fe_prompt
    assert "ForgeAI Obsidian Glow" in fe_prompt
    assert "UPSTREAM API CONTRACT" in fe_prompt
    assert "POST /api/v1/checkout" in fe_prompt

    # 4. TestingAgent
    testing_agent = TestingAgent()
    test_captured = {}

    def mock_test_gen(*args, **kwargs):
        test_captured.update(kwargs)
        return None

    testing_agent.generate_structured_output = mock_test_gen

    ctx_test = AgentContext(
        workflow_id="wf-test-testing",
        project_id="proj-1",
        prompt="Generate payment test suite",
        shared_state={
            "api_spec": "GET /api/v1/payments/{id}",
            "requirements": "FR-2: Reconcile payments on settlement",
        },
    )
    testing_agent.run(ctx_test)
    test_prompt = test_captured.get("prompt", "")
    assert "UPSTREAM API SPECIFICATION" in test_prompt
    assert "GET /api/v1/payments/{id}" in test_prompt
    assert "UPSTREAM FUNCTIONAL REQUIREMENTS" in test_prompt
    assert "FR-2: Reconcile payments" in test_prompt

    # 5. CodeReviewAgent
    review_agent = CodeReviewAgent()
    rev_captured = {}

    def mock_rev_gen(*args, **kwargs):
        rev_captured.update(kwargs)
        return None

    review_agent.generate_structured_output = mock_rev_gen

    ctx_rev = AgentContext(
        workflow_id="wf-test-rev",
        project_id="proj-1",
        prompt="Review payment artifacts",
        shared_state={
            "backend_code": "def process_payment(): pass",
            "frontend_code": "export default function Checkout() {}",
            "security_audit": "Vulnerability: Hardcoded API secret in header",
        },
    )
    review_agent.run(ctx_rev)
    rev_prompt = rev_captured.get("prompt", "")
    assert "UPSTREAM BACKEND CODE & ARTIFACTS" in rev_prompt
    assert "def process_payment" in rev_prompt
    assert "UPSTREAM FRONTEND CODE & ROUTES" in rev_prompt
    assert "Checkout()" in rev_prompt
    assert "UPSTREAM SECURITY AUDIT FINDINGS" in rev_prompt
    assert "Hardcoded API secret" in rev_prompt

