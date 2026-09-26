"""
LangGraph Workflow State Definition for ForgeAI.
Provides a strongly typed state representation supporting sequential steps,
parallel branch accumulation via reducers, and review gate metadata.
"""

import operator
from typing import Annotated, Any, Dict, List, Optional
from typing_extensions import TypedDict

from app.ai.agents.types import ArtifactDraft


def _latest_agent_reducer(current: Optional[str], update: Optional[str]) -> Optional[str]:
    """Reducer to select latest agent when parallel branches finish concurrently."""
    return update or current


class WorkflowState(TypedDict, total=False):
    """
    Central state schema passed across nodes in the 14-Agent LangGraph StateGraph.
    Uses operator.add annotations on collection fields to allow parallel branches
    to return delta updates that merge deterministically.
    """
    # Execution Identification & Inputs
    workflow_execution_id: str
    project_id: str
    organization_id: Optional[str]
    triggered_by_user_id: Optional[str]
    prompt: str
    tech_stack: Dict[str, Any]

    # Domain Outputs from 14 Specialist Agents
    supervisor_plan: Optional[Dict[str, Any]]
    requirements: Optional[Dict[str, Any]]
    business_analysis: Optional[Dict[str, Any]]
    user_stories: Optional[Dict[str, Any]]
    database_ddl: Optional[Dict[str, Any]]
    api_spec: Optional[Dict[str, Any]]
    ui_specs: Optional[Dict[str, Any]]
    frontend_code: Optional[Dict[str, Any]]
    backend_code: Optional[Dict[str, Any]]
    security_audit: Optional[Dict[str, Any]]
    devops_configs: Optional[Dict[str, Any]]
    test_suites: Optional[Dict[str, Any]]
    documentation: Optional[Dict[str, Any]]
    code_review: Optional[Dict[str, Any]]
    optimizations: Optional[Dict[str, Any]]

    # Parallel Branch Reducers (Concatenative accumulation)
    artifacts: Annotated[List[ArtifactDraft], operator.add]
    completed_agents: Annotated[List[str], operator.add]
    errors: Annotated[List[str], operator.add]

    # Lifecycle, Routing & Review Gate Tracking
    current_agent: Annotated[Optional[str], _latest_agent_reducer]
    retry_count: int
    quality_score: Optional[int]
    approval_verdict: Optional[str]
    correction_intent: Optional[str]
    review_feedback: Optional[List[str]]


def create_initial_workflow_state(
    prompt: str,
    project_id: str = "default-project",
    workflow_execution_id: str = "default-workflow",
    triggered_by_user_id: Optional[str] = None,
    tech_stack: Optional[Dict[str, Any]] = None,
    organization_id: Optional[str] = None,
) -> WorkflowState:
    """
    Factory helper to initialize a fresh WorkflowState dictionary with safe defaults.
    """
    return {
        "workflow_execution_id": workflow_execution_id,
        "project_id": project_id,
        "organization_id": organization_id,
        "triggered_by_user_id": triggered_by_user_id,
        "prompt": prompt,
        "tech_stack": tech_stack or {
            "backend": "FastAPI",
            "frontend": "Next.js 15",
            "database": "PostgreSQL 16",
        },
        "supervisor_plan": None,
        "requirements": None,
        "business_analysis": None,
        "user_stories": None,
        "database_ddl": None,
        "api_spec": None,
        "ui_specs": None,
        "frontend_code": None,
        "backend_code": None,
        "security_audit": None,
        "devops_configs": None,
        "test_suites": None,
        "documentation": None,
        "code_review": None,
        "optimizations": None,
        "artifacts": [],
        "completed_agents": [],
        "errors": [],
        "current_agent": None,
        "retry_count": 0,
        "quality_score": None,
        "approval_verdict": None,
        "correction_intent": None,
        "review_feedback": None,
    }
