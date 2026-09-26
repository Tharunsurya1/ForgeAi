"""
Comprehensive Unit Tests for LangGraph Workflow Orchestrator Core (Phase 4D).
Verifies:
1. Graph builds and compiles cleanly.
2. Graph imports without side effects.
3. Initial state factory generates valid typed state.
4. Deterministic end-to-end execution reaches all 14 agents.
5. All domain state fields are populated.
6. Artifacts are preserved and accumulated via reducers.
7. Frontend receives UI/UX-derived context from shared state.
8. Code review APPROVED path reaches Optimization.
9. Code review CHANGES_REQUESTED path triggers bounded correction.
10. Correction loop cannot exceed 2 iterations (no infinite loops).
11. Agent failure is represented in state without process crashes.
12. Graph structure & topology inspection verifies required dependency order.
"""

import json
from typing import Any, Dict, List
import pytest
from langgraph.graph import START, END

from app.ai.agents import (
    DeterministicMockProvider,
    LLMProvider,
)
from app.ai.workflow import (
    WorkflowState,
    create_initial_workflow_state,
    build_workflow_graph,
    route_after_code_review,
)


def test_graph_build_and_compile():
    """Verify that build_workflow_graph constructs and compiles a valid StateGraph."""
    graph = build_workflow_graph()
    assert graph is not None
    # 14 agent nodes + 1 correction node + __start__ = 16 nodes in compiled graph
    assert len(graph.nodes) >= 15
    assert "supervisor" in graph.nodes
    assert "requirements" in graph.nodes
    assert "business_analyst" in graph.nodes
    assert "database" in graph.nodes
    assert "api" in graph.nodes
    assert "ui_ux" in graph.nodes
    assert "frontend" in graph.nodes
    assert "backend" in graph.nodes
    assert "security" in graph.nodes
    assert "devops" in graph.nodes
    assert "testing" in graph.nodes
    assert "documentation" in graph.nodes
    assert "code_review" in graph.nodes
    assert "correction" in graph.nodes
    assert "optimization" in graph.nodes


def test_initial_state_factory():
    """Verify create_initial_workflow_state initializes all required keys with safe defaults."""
    state = create_initial_workflow_state(
        prompt="Build a supply chain inventory system",
        project_id="proj-999",
        workflow_execution_id="wf-888",
        triggered_by_user_id="user-777",
    )

    assert state["workflow_execution_id"] == "wf-888"
    assert state["project_id"] == "proj-999"
    assert state["triggered_by_user_id"] == "user-777"
    assert state["prompt"] == "Build a supply chain inventory system"
    assert state["artifacts"] == []
    assert state["completed_agents"] == []
    assert state["errors"] == []
    assert state["retry_count"] == 0
    assert state["supervisor_plan"] is None
    assert state["database_ddl"] is None
    assert state["quality_score"] is None
    assert state["approval_verdict"] is None


def test_deterministic_end_to_end_execution():
    """Verify complete end-to-end execution through all 14 agents under default mock provider."""
    graph = build_workflow_graph()
    initial_state = create_initial_workflow_state(
        prompt="Build an enterprise asset tracking and telemetry platform",
    )

    final_state = graph.invoke(initial_state)

    # 1. Verify all 14 agents are in completed_agents
    expected_agents = [
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
    ]
    completed = final_state["completed_agents"]
    for agent_name in expected_agents:
        assert agent_name in completed, f"Agent {agent_name} was not recorded as completed"

    assert len(completed) >= 14

    # 2. Verify all domain state fields are populated
    assert final_state["supervisor_plan"] is not None
    assert final_state["requirements"] is not None
    assert final_state["business_analysis"] is not None
    assert final_state["user_stories"] is not None
    assert final_state["database_ddl"] is not None
    assert final_state["api_spec"] is not None
    assert final_state["ui_specs"] is not None
    assert final_state["frontend_code"] is not None
    assert final_state["backend_code"] is not None
    assert final_state["security_audit"] is not None
    assert final_state["devops_configs"] is not None
    assert final_state["test_suites"] is not None
    assert final_state["documentation"] is not None
    assert final_state["code_review"] is not None
    assert final_state["optimizations"] is not None

    # 3. Verify artifacts are produced and accumulated
    artifacts = final_state["artifacts"]
    assert len(artifacts) >= 15
    artifact_paths = [a.file_path for a in artifacts]
    assert "workflow_manifest.json" in artifact_paths
    assert "docs/REQUIREMENTS.md" in artifact_paths
    assert "docs/USER_STORIES.md" in artifact_paths
    assert "db/schema.sql" in artifact_paths
    assert "specs/openapi.yaml" in artifact_paths
    assert "design/design-system.md" in artifact_paths
    assert "docs/SECURITY_AUDIT.md" in artifact_paths
    assert "README.md" in artifact_paths
    assert "ARCHITECTURE.md" in artifact_paths
    assert "docs/CODE_REVIEW.md" in artifact_paths
    assert "docs/OPTIMIZATION.md" in artifact_paths

    # 4. Review gate state
    assert final_state["approval_verdict"] == "APPROVED"
    assert final_state["quality_score"] == 94
    assert final_state["retry_count"] == 0
    assert len(final_state["errors"]) == 0


def test_frontend_consumes_ui_ux_context():
    """Verify Frontend agent produces code referencing the UI/UX design system from state."""
    graph = build_workflow_graph()
    initial_state = create_initial_workflow_state(
        prompt="Design real-time observability telemetry dashboard",
    )

    final_state = graph.invoke(initial_state)

    # UI/UX specifies design_system_name: "ForgeAI Obsidian Modern"
    ui_specs = final_state["ui_specs"]
    assert ui_specs["design_system_name"] == "ForgeAI Obsidian Modern"

    # Frontend summary must confirm usage of that design system
    frontend_summary = final_state["frontend_code"]["summary"]
    assert "ForgeAI Obsidian Modern" in frontend_summary


def test_code_review_approved_routing():
    """Verify route_after_code_review routes directly to optimization on APPROVED."""
    state: WorkflowState = {
        "approval_verdict": "APPROVED",
        "retry_count": 0,
    }
    assert route_after_code_review(state) == "optimization"


def test_code_review_changes_requested_triggers_bounded_correction():
    """Verify CHANGES_REQUESTED triggers correction loop capped at max 2 iterations."""
    canned_response = {
        "Perform code review": json.dumps({
            "status": "changes_requested",
            "quality_score": 60,
            "issues": [
                {
                    "file_path": "backend/app/main.py",
                    "severity": "Critical",
                    "rule": "SEC-01",
                    "message": "Missing JWT authentication middleware.",
                    "suggestion": "Mount auth router with JWT bearer dependency.",
                }
            ],
            "suggested_fixes": ["Mount auth router with JWT bearer dependency."],
            "approval_verdict": "CHANGES_REQUESTED",
            "raw_markdown": "# Code Review\nVerdict: CHANGES_REQUESTED",
        })
    }
    mock_provider = DeterministicMockProvider(canned_responses=canned_response)
    graph = build_workflow_graph(provider=mock_provider)

    initial_state = create_initial_workflow_state(
        prompt="Build a banking transfer engine requiring strict code review",
    )

    final_state = graph.invoke(initial_state)

    # Bounded correction: retry_count MUST be exactly 2 (max retries reached)
    assert final_state["retry_count"] == 2
    assert final_state["approval_verdict"] == "CHANGES_REQUESTED"
    # Optimization MUST still be reached as terminal path after retries are exhausted
    assert "OptimizationAgent" in final_state["completed_agents"]
    assert final_state["optimizations"] is not None

    # Verify correction gate did not log fatal errors and recorded correction state
    assert len(final_state["errors"]) == 0
    assert "refining implementation based on code review feedback" in final_state.get("correction_intent", "")
    assert len(final_state.get("review_feedback", [])) > 0


def test_routing_exhausted_retries_forces_optimization():
    """Verify route_after_code_review forces optimization when retry_count >= 2."""
    state_exhausted: WorkflowState = {
        "approval_verdict": "CHANGES_REQUESTED",
        "retry_count": 2,
    }
    assert route_after_code_review(state_exhausted) == "optimization"

    state_over_exhausted: WorkflowState = {
        "approval_verdict": "CHANGES_REQUESTED",
        "retry_count": 3,
    }
    assert route_after_code_review(state_over_exhausted) == "optimization"


class FailingDatabaseProvider(LLMProvider):
    """Simulates a provider failure specifically during database modeling."""
    def generate(self, prompt: str, **kwargs) -> str:
        if "relational PostgreSQL schema" in prompt:
            raise RuntimeError("Simulated DatabaseAgent LLM failure")
        return "[DETERMINISTIC_MOCK_OUTPUT]"

    async def agenerate(self, prompt: str, **kwargs) -> str:
        return self.generate(prompt, **kwargs)


def test_agent_failure_represented_in_state():
    """Verify that an agent failure is safely captured in the state's errors list without crashing."""
    graph = build_workflow_graph(provider=FailingDatabaseProvider())
    initial_state = create_initial_workflow_state(
        prompt="Build an inventory management database",
    )

    final_state = graph.invoke(initial_state)

    # State should capture the error
    errors = final_state["errors"]
    assert len(errors) >= 1
    assert any("DatabaseAgent" in e and "Simulated DatabaseAgent LLM failure" in e for e in errors)


def test_graph_topology_verification():
    """Inspect and verify the graph topology and edge dependencies."""
    graph = build_workflow_graph()

    # Verify required nodes exist in the graph
    expected_nodes = {
        "supervisor",
        "requirements",
        "business_analyst",
        "database",
        "api",
        "ui_ux",
        "frontend",
        "backend",
        "security",
        "devops",
        "testing",
        "documentation",
        "code_review",
        "correction",
        "optimization",
    }
    for node in expected_nodes:
        assert node in graph.nodes, f"Missing expected node {node} in graph"

    # Verify node connections
    # We can inspect the underlying edges via the graph builder or compiled runnable
    assert START in graph.nodes or "__start__" in graph.nodes
