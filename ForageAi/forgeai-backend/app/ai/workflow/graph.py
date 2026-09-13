"""
LangGraph Workflow Orchestrator Core for ForgeAI (Phase 4D).
Defines the 14-Agent StateGraph with parallel execution branches,
review gate conditional edges, and bounded correction cycles.
"""

from typing import Any, Callable, Dict, List, Optional, Tuple
from langgraph.graph import StateGraph, START, END

from app.ai.agents import (
    BaseAgent,
    AgentContext,
    AgentResult,
    LLMProvider,
    get_default_provider,
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
from app.ai.workflow.state import WorkflowState


def _execute_agent_node(
    agent: BaseAgent,
    state: WorkflowState,
    owned_field: str,
    extra_fields_extractor: Optional[Callable[[Dict[str, Any]], Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Thin adapter executing an agent via BaseAgent.run() and returning delta state updates.
    Guarantees that the BaseAgent lifecycle remains the single source of truth.
    """
    # Compile shared context from accumulated state
    shared_state: Dict[str, Any] = {}
    for key in [
        "supervisor_plan",
        "requirements",
        "business_analysis",
        "user_stories",
        "database_ddl",
        "api_spec",
        "ui_specs",
        "frontend_code",
        "backend_code",
        "security_audit",
        "devops_configs",
        "test_suites",
        "documentation",
        "code_review",
        "optimizations",
    ]:
        val = state.get(key)
        if val is not None:
            shared_state[key] = val

    context = AgentContext(
        workflow_id=state.get("workflow_execution_id", "wf-default"),
        project_id=state.get("project_id", "proj-default"),
        organization_id=state.get("organization_id"),
        user_id=state.get("triggered_by_user_id"),
        prompt=state.get("prompt", ""),
        tech_stack=state.get("tech_stack", {}),
        shared_state=shared_state,
        retry_count=state.get("retry_count", 0),
        deterministic=True,
    )

    result: AgentResult = agent.run(context)

    if not result.success:
        error_msg = result.error or "Unknown agent execution error"
        return {
            "current_agent": agent.agent_name,
            "errors": [f"[{agent.agent_name}] {error_msg}"],
        }

    update: Dict[str, Any] = {
        owned_field: result.data,
        "artifacts": result.artifacts,
        "completed_agents": [agent.agent_name],
        "current_agent": agent.agent_name,
    }

    if extra_fields_extractor:
        extra = extra_fields_extractor(result.data)
        update.update(extra)

    return update


# ---------------------------------------------------------------------------
# Node Adapters for all 14 Agents
# ---------------------------------------------------------------------------

def create_node_supervisor(agent: SupervisorAgent):
    def node(state: WorkflowState) -> Dict[str, Any]:
        return _execute_agent_node(agent, state, "supervisor_plan")
    return node


def create_node_requirements(agent: RequirementsAgent):
    def node(state: WorkflowState) -> Dict[str, Any]:
        return _execute_agent_node(agent, state, "requirements")
    return node


def create_node_business_analyst(agent: BusinessAnalystAgent):
    def node(state: WorkflowState) -> Dict[str, Any]:
        def extract_stories(data: Dict[str, Any]) -> Dict[str, Any]:
            return {
                "business_analysis": data,
                "user_stories": data.get("user_stories", []),
            }
        return _execute_agent_node(agent, state, "business_analysis", extract_stories)
    return node


def create_node_database(agent: DatabaseAgent):
    def node(state: WorkflowState) -> Dict[str, Any]:
        return _execute_agent_node(agent, state, "database_ddl")
    return node


def create_node_api(agent: APIAgent):
    def node(state: WorkflowState) -> Dict[str, Any]:
        return _execute_agent_node(agent, state, "api_spec")
    return node


def create_node_ui_ux(agent: UIUXAgent):
    def node(state: WorkflowState) -> Dict[str, Any]:
        return _execute_agent_node(agent, state, "ui_specs")
    return node


def create_node_frontend(agent: FrontendAgent):
    def node(state: WorkflowState) -> Dict[str, Any]:
        return _execute_agent_node(agent, state, "frontend_code")
    return node


def create_node_backend(agent: BackendAgent):
    def node(state: WorkflowState) -> Dict[str, Any]:
        return _execute_agent_node(agent, state, "backend_code")
    return node


def create_node_security(agent: SecurityAgent):
    def node(state: WorkflowState) -> Dict[str, Any]:
        return _execute_agent_node(agent, state, "security_audit")
    return node


def create_node_devops(agent: DevOpsAgent):
    def node(state: WorkflowState) -> Dict[str, Any]:
        return _execute_agent_node(agent, state, "devops_configs")
    return node


def create_node_testing(agent: TestingAgent):
    def node(state: WorkflowState) -> Dict[str, Any]:
        return _execute_agent_node(agent, state, "test_suites")
    return node


def create_node_documentation(agent: DocumentationAgent):
    def node(state: WorkflowState) -> Dict[str, Any]:
        return _execute_agent_node(agent, state, "documentation")
    return node


def create_node_code_review(agent: CodeReviewAgent):
    def node(state: WorkflowState) -> Dict[str, Any]:
        def extract_review_meta(data: Dict[str, Any]) -> Dict[str, Any]:
            return {
                "quality_score": data.get("quality_score"),
                "approval_verdict": data.get("approval_verdict", "APPROVED"),
            }
        return _execute_agent_node(agent, state, "code_review", extract_review_meta)
    return node


def create_node_correction():
    """
    Bounded review correction node.
    Increments retry_count and logs correction intent before looping back to backend.
    """
    def node(state: WorkflowState) -> Dict[str, Any]:
        new_retries = state.get("retry_count", 0) + 1
        return {
            "retry_count": new_retries,
            "current_agent": "ReviewCorrectionGate",
            "errors": [f"[ReviewCorrectionGate] Triggering correction loop {new_retries}/2."],
        }
    return node


def create_node_optimization(agent: OptimizationAgent):
    def node(state: WorkflowState) -> Dict[str, Any]:
        return _execute_agent_node(agent, state, "optimizations")
    return node


# ---------------------------------------------------------------------------
# Routing Function for Review Gate
# ---------------------------------------------------------------------------

def route_after_code_review(state: WorkflowState) -> str:
    """
    Conditional routing edge evaluating CodeReviewAgent output:
    - 'APPROVED' (or score >= 75) -> 'optimization'
    - 'CHANGES_REQUESTED' and retries < 2 -> 'correction'
    - retries >= 2 -> forces 'optimization' to prevent infinite loop.
    """
    verdict = state.get("approval_verdict", "APPROVED")
    retries = state.get("retry_count", 0)

    if verdict == "CHANGES_REQUESTED" and retries < 2:
        return "correction"
    return "optimization"


# ---------------------------------------------------------------------------
# Graph Builder / Factory
# ---------------------------------------------------------------------------

def build_workflow_graph(provider: Optional[LLMProvider] = None):
    """
    Constructs and compiles the 14-Agent LangGraph StateGraph.
    Graph topology:
      START
        ↓
      supervisor
        ↓
      requirements + business_analyst (Parallel Fork)
        ↓
      database (Join)
        ↓
      api
        ↓
      ui_ux
        ↓
      frontend
        ↓
      backend <────────────────────────────────────┐
        ↓                                          │ (Correction Loop)
      security                                     │ (Max 2 retries)
        ↓                                          │
      devops + testing (Parallel Fork)             │
        ↓                                          │
      documentation (Join)                         │
        ↓                                          │
      code_review                                  │
        ↓                                          │
      [Review Gate] ───(CHANGES_REQUESTED)──► correction
        ↓ (APPROVED or max retries reached)
      optimization
        ↓
      END
    """
    p = provider or get_default_provider()

    # Instantiate the 14 specialist agents with the specified provider
    supervisor_agent = SupervisorAgent(provider=p)
    requirements_agent = RequirementsAgent(provider=p)
    ba_agent = BusinessAnalystAgent(provider=p)
    db_agent = DatabaseAgent(provider=p)
    api_agent = APIAgent(provider=p)
    ui_ux_agent = UIUXAgent(provider=p)
    frontend_agent = FrontendAgent(provider=p)
    backend_agent = BackendAgent(provider=p)
    security_agent = SecurityAgent(provider=p)
    devops_agent = DevOpsAgent(provider=p)
    testing_agent = TestingAgent(provider=p)
    doc_agent = DocumentationAgent(provider=p)
    review_agent = CodeReviewAgent(provider=p)
    opt_agent = OptimizationAgent(provider=p)

    workflow = StateGraph(WorkflowState)

    # 1. Register all 14 nodes + 1 bounded correction gate
    workflow.add_node("supervisor", create_node_supervisor(supervisor_agent))
    workflow.add_node("requirements", create_node_requirements(requirements_agent))
    workflow.add_node("business_analyst", create_node_business_analyst(ba_agent))
    workflow.add_node("database", create_node_database(db_agent))
    workflow.add_node("api", create_node_api(api_agent))
    workflow.add_node("ui_ux", create_node_ui_ux(ui_ux_agent))
    workflow.add_node("frontend", create_node_frontend(frontend_agent))
    workflow.add_node("backend", create_node_backend(backend_agent))
    workflow.add_node("security", create_node_security(security_agent))
    workflow.add_node("devops", create_node_devops(devops_agent))
    workflow.add_node("testing", create_node_testing(testing_agent))
    workflow.add_node("documentation", create_node_documentation(doc_agent))
    workflow.add_node("code_review", create_node_code_review(review_agent))
    workflow.add_node("correction", create_node_correction())
    workflow.add_node("optimization", create_node_optimization(opt_agent))

    # 2. Wire edges matching required logical flow
    # START -> supervisor
    workflow.add_edge(START, "supervisor")

    # Parallel Branch A: Supervisor forks into Requirements and Business Analyst
    workflow.add_edge("supervisor", "requirements")
    workflow.add_edge("supervisor", "business_analyst")

    # Database joins both analysis outputs
    workflow.add_edge("requirements", "database")
    workflow.add_edge("business_analyst", "database")

    # Database -> API -> UI/UX -> Frontend -> Backend -> Security
    workflow.add_edge("database", "api")
    workflow.add_edge("api", "ui_ux")
    workflow.add_edge("ui_ux", "frontend")
    workflow.add_edge("frontend", "backend")
    workflow.add_edge("backend", "security")

    # Parallel Branch B: Security forks into DevOps and Testing
    workflow.add_edge("security", "devops")
    workflow.add_edge("security", "testing")

    # Documentation joins DevOps and Testing outputs
    workflow.add_edge("devops", "documentation")
    workflow.add_edge("testing", "documentation")

    # Documentation -> Code Review
    workflow.add_edge("documentation", "code_review")

    # Code Review -> Conditional Review Gate
    workflow.add_conditional_edges(
        "code_review",
        route_after_code_review,
        {
            "optimization": "optimization",
            "correction": "correction",
        },
    )

    # Correction gate loops back to backend for refinement (bounded by retry_count < 2)
    workflow.add_edge("correction", "backend")

    # Optimization -> END
    workflow.add_edge("optimization", END)

    return workflow.compile()
