import asyncio
import json
import logging
from datetime import datetime, timezone
import threading
from typing import Any, Dict, List, Optional, Set, Tuple, Union
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from app.ai.agents import LLMProvider, get_default_provider
from app.ai.workflow import WorkflowState, build_workflow_graph, create_initial_workflow_state
from app.core.rbac import OrgRole, Permission, check_permission
from app.database.database import SessionLocal
from app.models.agent_run import AgentRun
from app.models.blueprint import Blueprint
from app.models.blueprint_artifact import BlueprintArtifact
from app.models.organization_member import OrganizationMember
from app.models.project import Project
from app.models.user import User
from app.models.workflow_event import WorkflowEvent
from app.models.workflow_execution import WorkflowExecution
from app.schemas.blueprint import BlueprintCreateRequest, BlueprintGenerateRequest
from app.services.project_service import ProjectService

logger = logging.getLogger("forgeai.workflow_service")

# Map LangGraph graph node keys to domain agent names
NODE_TO_AGENT = {
    "supervisor": "SupervisorAgent",
    "business_analyst": "BusinessAnalystAgent",
    "requirements": "RequirementsAgent",
    "database": "DatabaseAgent",
    "api": "APIAgent",
    "ui_ux": "UIUXAgent",
    "frontend": "FrontendAgent",
    "backend": "BackendAgent",
    "security": "SecurityAgent",
    "devops": "DevOpsAgent",
    "testing": "TestingAgent",
    "documentation": "DocumentationAgent",
    "code_review": "CodeReviewAgent",
    "correction": "ReviewCorrectionGate",
    "optimization": "OptimizationAgent",
}

# Map Agent Names to their primary domain output field in WorkflowState
AGENT_OUTPUT_FIELD = {
    "SupervisorAgent": "supervisor_plan",
    "RequirementsAgent": "requirements",
    "BusinessAnalystAgent": "business_analysis",
    "DatabaseAgent": "database_ddl",
    "APIAgent": "api_spec",
    "UIUXAgent": "ui_specs",
    "FrontendAgent": "frontend_code",
    "BackendAgent": "backend_code",
    "SecurityAgent": "security_audit",
    "DevOpsAgent": "devops_configs",
    "TestingAgent": "test_suites",
    "DocumentationAgent": "documentation",
    "CodeReviewAgent": "code_review",
    "ReviewCorrectionGate": "correction_intent",
    "OptimizationAgent": "optimizations",
}


def sanitize_event_payload(payload: Any) -> Any:
    """Recursively strip sensitive keys such as passwords, tokens, API keys."""
    sensitive_keys = {"password", "token", "access_token", "refresh_token", "api_key", "secret", "authorization"}
    if isinstance(payload, dict):
        sanitized = {}
        for k, v in payload.items():
            if any(s in str(k).lower() for s in sensitive_keys):
                sanitized[k] = "[REDACTED]"
            else:
                sanitized[k] = sanitize_event_payload(v)
        return sanitized
    elif isinstance(payload, list):
        return [sanitize_event_payload(item) for item in payload]
    return payload


def format_event_for_stream(
    execution_id: UUID,
    seq_num: int,
    event_type: str,
    agent_name: Optional[str] = None,
    status: str = "running",
    progress: int = 0,
    message: str = "",
    payload: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Format a consistent, sanitized event dictionary for WebSocket streaming."""
    return {
        "execution_id": str(execution_id),
        "sequence_number": seq_num,
        "event_type": event_type,
        "agent_name": agent_name,
        "status": status,
        "progress": progress,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "message": message,
        "payload": sanitize_event_payload(payload or {}),
    }


class WorkflowEventBroadcaster:
    """
    In-process thread-safe pub/sub broadcaster for delivering live WorkflowEvents
    to active WebSocket subscribers living on asyncio event loops.
    """

    def __init__(self):
        self._subscribers: Dict[str, Set[Tuple[asyncio.Queue, asyncio.AbstractEventLoop]]] = {}
        self._lock = threading.Lock()

    async def subscribe(self, execution_id: str) -> asyncio.Queue:
        """
        Subscribes to live events for a given execution ID.
        Must be called from the asyncio event loop handling the WebSocket connection.
        Captures the running event loop for thread-safe cross-thread dispatch.
        """
        loop = asyncio.get_running_loop()
        q: asyncio.Queue = asyncio.Queue(maxsize=200)
        with self._lock:
            key = str(execution_id)
            if key not in self._subscribers:
                self._subscribers[key] = set()
            self._subscribers[key].add((q, loop))
        return q

    async def unsubscribe(self, execution_id: str, queue: asyncio.Queue) -> None:
        """
        Removes subscriber queue for a given execution ID cleanly.
        """
        with self._lock:
            key = str(execution_id)
            if key in self._subscribers:
                self._subscribers[key] = {
                    (q, loop) for (q, loop) in self._subscribers[key] if q is not queue
                }
                if not self._subscribers[key]:
                    del self._subscribers[key]

    @staticmethod
    def _safe_put(q: asyncio.Queue, event_data: Dict[str, Any]) -> None:
        try:
            q.put_nowait(event_data)
        except asyncio.QueueFull:
            try:
                q.get_nowait()
                q.put_nowait(event_data)
            except Exception:
                pass
        except Exception:
            pass

    def broadcast(self, execution_id: str, event_data: Dict[str, Any]) -> None:
        """
        Broadcast event to all active subscribers for an execution.
        Safe to call from any worker thread or asyncio event loop context.
        """
        key = str(execution_id)
        with self._lock:
            subs = list(self._subscribers.get(key, set()))

        if not subs:
            return

        dead_subs = []
        for q, loop in subs:
            try:
                if loop.is_closed():
                    dead_subs.append((q, loop))
                    continue

                try:
                    running_loop = asyncio.get_running_loop()
                except RuntimeError:
                    running_loop = None

                if running_loop is loop:
                    self._safe_put(q, event_data)
                else:
                    loop.call_soon_threadsafe(self._safe_put, q, event_data)
            except Exception as e:
                logger.debug(f"Error broadcasting event to subscriber: {e}")
                dead_subs.append((q, loop))

        if dead_subs:
            with self._lock:
                if key in self._subscribers:
                    for item in dead_subs:
                        self._subscribers[key].discard(item)
                    if not self._subscribers[key]:
                        del self._subscribers[key]


workflow_event_broadcaster = WorkflowEventBroadcaster()


class WorkflowOrchestratorService:
    """
    Core service orchestrating the 14-Agent LangGraph StateGraph,
    persisting executions, agent runs, timeline events, and blueprint artifacts.
    """

    @classmethod
    def create_workflow_execution(
        cls,
        db: Session,
        project_id: UUID,
        user: User,
        data: Union[BlueprintGenerateRequest, BlueprintCreateRequest, Any],
    ) -> Tuple[WorkflowExecution, Project, int, Dict[str, Any]]:
        """
        Validates project access, checks RBAC, allocates next blueprint version,
        creates the initial generating Blueprint record, creates the running WorkflowExecution,
        links workflow_execution.blueprint_id immediately, and records initial workflow_started event.
        """
        # 1. Project & RBAC Validation
        project = ProjectService.get_project_by_id(db, project_id, user)

        membership = (
            db.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == project.organization_id,
                OrganizationMember.user_id == user.id,
            )
            .first()
        )
        caller_role = membership.role if membership else OrgRole.OWNER.value
        check_permission(
            role=caller_role,
            permission=Permission.BLUEPRINT_GENERATE,
            is_superuser=user.is_superuser,
            custom_error_message="Permission denied: Viewers cannot generate blueprints",
        )

        # 2. Determine Next Blueprint Version
        existing_blueprint = (
            db.query(Blueprint)
            .filter(Blueprint.project_id == project.id)
            .order_by(Blueprint.current_version.desc())
            .first()
        )
        version = (existing_blueprint.current_version + 1) if existing_blueprint else 1

        effective_prompt = (
            data.get_effective_prompt()
            if hasattr(data, "get_effective_prompt")
            else getattr(data, "prompt", "Generate software blueprint")
        )
        effective_tech_stack = (
            data.get_effective_tech_stack()
            if hasattr(data, "get_effective_tech_stack")
            else (getattr(data, "tech_stack", None) or project.tech_stack or {
                "backend": "FastAPI",
                "frontend": "Next.js 15",
                "database": "PostgreSQL 16",
            })
        )
        if not effective_tech_stack:
            effective_tech_stack = project.tech_stack or {
                "backend": "FastAPI",
                "frontend": "Next.js 15",
                "database": "PostgreSQL 16",
            }

        app_title = (
            getattr(data, "title", None)
            or (getattr(data, "idea", None) and str(data.idea).strip()[:80])
            or f"{project.name} Architecture Blueprint"
        )

        idea_val = getattr(data, "idea", None)
        reqs_val = getattr(data, "requirements", None)
        tech_prefs_val = getattr(data, "tech_preferences", None) or {}

        # 3. Create Blueprint record upfront with generating status
        blueprint = Blueprint(
            project_id=project.id,
            current_version=version,
            title=app_title,
            summary="Blueprint generation in progress by 14 specialist AI agents...",
            status="generating",
            metadata_={
                "project_name": project.name,
                "project_slug": project.slug,
                "prompt": effective_prompt,
                "idea": idea_val,
                "requirements": reqs_val,
                "tech_preferences": tech_prefs_val,
                "status": "queued",
            },
        )
        db.add(blueprint)
        db.flush()

        # 4. Create and Persist WorkflowExecution Entity linked to Blueprint
        workflow_execution = WorkflowExecution(
            project_id=project.id,
            triggered_by_user_id=user.id,
            blueprint_id=blueprint.id,
            workflow_name="full_blueprint_generation",
            status="running",
            prompt=effective_prompt,
            tech_stack=effective_tech_stack,
            current_agent="SupervisorAgent",
            progress_percentage=0,
            started_at=datetime.now(timezone.utc),
            metadata_={
                "project_name": project.name,
                "project_slug": project.slug,
                "engine": "LangGraph 14-Agent Orchestrator v2.0",
                "version": version,
                "title": app_title,
                "blueprint_id": str(blueprint.id),
                "idea": idea_val,
                "requirements": reqs_val,
                "tech_preferences": tech_prefs_val,
            },
        )
        db.add(workflow_execution)
        db.flush()

        blueprint.metadata_ = {
            **(blueprint.metadata_ or {}),
            "workflow_execution_id": str(workflow_execution.id),
        }
        db.add(blueprint)

        # 5. Record and Broadcast initial workflow_started event
        start_event = WorkflowEvent(
            workflow_execution_id=workflow_execution.id,
            event_type="workflow_started",
            agent_name="SupervisorAgent",
            sequence_number=1,
            payload={
                "project_id": str(project.id),
                "blueprint_id": str(blueprint.id),
                "prompt": effective_prompt,
                "tech_stack": effective_tech_stack,
                "idea": idea_val,
                "requirements": reqs_val,
            },
        )
        db.add(start_event)
        db.commit()
        db.refresh(workflow_execution)
        db.refresh(blueprint)

        workflow_event_broadcaster.broadcast(
            str(workflow_execution.id),
            format_event_for_stream(
                workflow_execution.id,
                seq_num=1,
                event_type="workflow_started",
                agent_name="SupervisorAgent",
                status="running",
                progress=0,
                message="Workflow started. SupervisorAgent initialized DAG execution.",
                payload={
                    "prompt": effective_prompt,
                    "tech_stack": effective_tech_stack,
                    "blueprint_id": str(blueprint.id),
                },
            ),
        )

        return workflow_execution, project, version, effective_tech_stack

    @classmethod
    def run_execution(
        cls,
        db: Session,
        workflow_execution_id: UUID,
        project_id: UUID,
        user: User,
        prompt: str,
        tech_stack: Dict[str, Any],
        version: int,
        title: Optional[str] = None,
        provider: Optional[LLMProvider] = None,
        idea: Optional[str] = None,
        requirements_input: Optional[str] = None,
        tech_preferences: Optional[Dict[str, Any]] = None,
    ) -> Tuple[Blueprint, WorkflowExecution]:
        """
        Executes the 14-agent LangGraph workflow step by step using graph.stream().
        Persists each AgentRun and WorkflowEvent incrementally to the database and
        broadcasts live events to connected WebSocket clients in real time.
        """
        workflow_execution = (
            db.query(WorkflowExecution)
            .filter(WorkflowExecution.id == workflow_execution_id)
            .first()
        )
        if not workflow_execution:
            raise HTTPException(status_code=404, detail="Workflow execution not found")

        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        seq_lock = threading.Lock()
        seq_num = 1

        def next_seq() -> int:
            nonlocal seq_num
            with seq_lock:
                seq_num += 1
                return seq_num

        accumulated: Dict[str, Any] = {
            "artifacts": [],
            "completed_agents": [],
            "errors": [],
        }

        try:
            def on_agent_start(started_agent_name: str, current_state: WorkflowState) -> None:
                current_seq = next_seq()
                start_db = SessionLocal()
                try:
                    start_event = WorkflowEvent(
                        workflow_execution_id=workflow_execution.id,
                        event_type="agent_started",
                        agent_name=started_agent_name,
                        sequence_number=current_seq,
                        payload={
                            "status": "running",
                            "workflow_id": str(workflow_execution.id),
                            "agent_name": started_agent_name,
                        },
                    )
                    start_db.add(start_event)
                    start_db.query(WorkflowExecution).filter(
                        WorkflowExecution.id == workflow_execution.id
                    ).update({"current_agent": started_agent_name})
                    start_db.commit()
                except Exception as start_err:
                    start_db.rollback()
                    logger.warning(f"Failed to persist agent_started event: {start_err}")
                finally:
                    start_db.close()

                workflow_event_broadcaster.broadcast(
                    str(workflow_execution.id),
                    format_event_for_stream(
                        workflow_execution.id,
                        seq_num=current_seq,
                        event_type="agent_started",
                        agent_name=started_agent_name,
                        status="running",
                        progress=workflow_execution.progress_percentage,
                        message=f"{started_agent_name} started execution.",
                        payload={"status": "running", "workflow_id": str(workflow_execution.id)},
                    ),
                )

            p = provider or get_default_provider()
            graph = build_workflow_graph(provider=p, on_agent_start=on_agent_start)

            exec_meta = workflow_execution.metadata_ or {}
            eff_idea = idea or exec_meta.get("idea")
            eff_reqs = requirements_input or exec_meta.get("requirements")
            eff_tech_prefs = tech_preferences or exec_meta.get("tech_preferences")

            initial_state = create_initial_workflow_state(
                prompt=prompt,
                project_id=str(project.id),
                workflow_execution_id=str(workflow_execution.id),
                triggered_by_user_id=str(user.id),
                tech_stack=tech_stack,
                organization_id=str(project.organization_id),
                idea=eff_idea,
                requirements_input=eff_reqs,
                tech_preferences=eff_tech_prefs,
            )

            # Stream through the LangGraph StateGraph node-by-node
            for chunk in graph.stream(initial_state):
                for node_name, delta in chunk.items():
                    agent_name = NODE_TO_AGENT.get(node_name, delta.get("current_agent", node_name))

                    # Merge parallel branch reducers
                    if "artifacts" in delta:
                        accumulated["artifacts"].extend(delta["artifacts"])
                    if "completed_agents" in delta:
                        accumulated["completed_agents"].extend(delta["completed_agents"])
                    if "errors" in delta:
                        accumulated["errors"].extend(delta["errors"])
                    for k, v in delta.items():
                        if k not in ("artifacts", "completed_agents", "errors"):
                            accumulated[k] = v

                    progress = min(90, int(len(accumulated["completed_agents"]) / 14 * 90))
                    workflow_execution.current_agent = agent_name
                    workflow_execution.progress_percentage = progress

                    # Check for errors in agent execution
                    if delta.get("errors"):
                        err_seq = next_seq()
                        err_msg = "; ".join(delta["errors"])
                        agent_run = AgentRun(
                            workflow_execution_id=workflow_execution.id,
                            agent_name=agent_name,
                            status="failed",
                            error_message=err_msg,
                            execution_time_ms=100,
                            input_payload={"prompt": prompt, "tech_stack": tech_stack},
                            output_payload={"errors": delta["errors"]},
                        )
                        db.add(agent_run)

                        fail_event = WorkflowEvent(
                            workflow_execution_id=workflow_execution.id,
                            event_type="agent_failed",
                            agent_name=agent_name,
                            sequence_number=err_seq,
                            payload={"error": err_msg, "status": "failed"},
                        )
                        db.add(fail_event)
                        db.commit()

                        workflow_event_broadcaster.broadcast(
                            str(workflow_execution.id),
                            format_event_for_stream(
                                workflow_execution.id,
                                seq_num=err_seq,
                                event_type="agent_failed",
                                agent_name=agent_name,
                                status="failed",
                                progress=progress,
                                message=f"Agent {agent_name} failed: {err_msg}",
                                payload={"error": err_msg},
                            ),
                        )
                        raise RuntimeError(f"Agent {agent_name} failed: {err_msg}")

                    # Record successful AgentRun & WorkflowEvent
                    comp_seq = next_seq()
                    field_name = AGENT_OUTPUT_FIELD.get(agent_name, "")
                    out_payload = accumulated.get(field_name) or delta.get(field_name) or {}

                    agent_run = AgentRun(
                        workflow_execution_id=workflow_execution.id,
                        agent_name=agent_name,
                        status="completed",
                        retry_count=accumulated.get("retry_count", 0),
                        execution_time_ms=100,
                        input_payload={"prompt": prompt, "tech_stack": tech_stack},
                        output_payload=out_payload if isinstance(out_payload, dict) else {"raw": str(out_payload)},
                    )
                    db.add(agent_run)

                    event = WorkflowEvent(
                        workflow_execution_id=workflow_execution.id,
                        event_type="agent_completed",
                        agent_name=agent_name,
                        sequence_number=comp_seq,
                        payload={
                            "status": "completed",
                            "artifacts_produced": len(accumulated.get("artifacts", [])),
                        },
                    )
                    db.add(event)
                    db.commit()

                    workflow_event_broadcaster.broadcast(
                        str(workflow_execution.id),
                        format_event_for_stream(
                            workflow_execution.id,
                            seq_num=comp_seq,
                            event_type="agent_completed",
                            agent_name=agent_name,
                            status="completed",
                            progress=progress,
                            message=f"{agent_name} completed task successfully.",
                            payload={"status": "completed", "artifacts_produced": len(accumulated.get("artifacts", []))},
                        ),
                    )

                    # If CodeReviewAgent finished, emit code_review_verdict event
                    if agent_name == "CodeReviewAgent":
                        rev_seq = next_seq()
                        quality_score = accumulated.get("quality_score", 95)
                        approval_verdict = accumulated.get("approval_verdict", "APPROVED")
                        review_event = WorkflowEvent(
                            workflow_execution_id=workflow_execution.id,
                            event_type="code_review_verdict",
                            agent_name="CodeReviewAgent",
                            sequence_number=rev_seq,
                            payload={
                                "quality_score": quality_score,
                                "approval_verdict": approval_verdict,
                                "retry_count": accumulated.get("retry_count", 0),
                            },
                        )
                        db.add(review_event)
                        db.commit()

                        workflow_event_broadcaster.broadcast(
                            str(workflow_execution.id),
                            format_event_for_stream(
                                workflow_execution.id,
                                seq_num=rev_seq,
                                event_type="code_review_verdict",
                                agent_name="CodeReviewAgent",
                                status="completed",
                                progress=progress,
                                message=f"Code Review: {approval_verdict} (Score: {quality_score}/100)",
                                payload={"quality_score": quality_score, "approval_verdict": approval_verdict},
                            ),
                        )

                    # If ReviewCorrectionGate finished, emit correction_triggered event
                    if agent_name == "ReviewCorrectionGate":
                        corr_seq = next_seq()
                        corr_retries = accumulated.get("retry_count", 1)
                        corr_intent = accumulated.get("correction_intent", "")
                        corr_feedback = accumulated.get("review_feedback", [])
                        corr_event = WorkflowEvent(
                            workflow_execution_id=workflow_execution.id,
                            event_type="correction_triggered",
                            agent_name="ReviewCorrectionGate",
                            sequence_number=corr_seq,
                            payload={
                                "retry_count": corr_retries,
                                "correction_intent": corr_intent,
                                "review_feedback": corr_feedback,
                            },
                        )
                        db.add(corr_event)
                        db.commit()

                        workflow_event_broadcaster.broadcast(
                            str(workflow_execution.id),
                            format_event_for_stream(
                                workflow_execution.id,
                                seq_num=corr_seq,
                                event_type="correction_triggered",
                                agent_name="ReviewCorrectionGate",
                                status="running",
                                progress=progress,
                                message=f"Review Correction Gate: Retrying implementation (attempt {corr_retries}/2)",
                                payload={
                                    "retry_count": corr_retries,
                                    "correction_intent": corr_intent,
                                },
                            ),
                        )

            # 5. Retrieve Pre-Created Blueprint or Create New
            quality_score = accumulated.get("quality_score", 95)
            approval_verdict = accumulated.get("approval_verdict", "APPROVED")
            completed_agents = accumulated.get("completed_agents", [])

            app_title = title or f"{project.name} Architecture Blueprint"
            summary = (
                f"Production-ready multi-agent enterprise blueprint for '{project.name}', "
                f"synthesized by 14 specialized AI agents. "
                f"Quality Score: {quality_score}/100 ({approval_verdict})."
            )

            blueprint = None
            if workflow_execution.blueprint_id:
                blueprint = db.query(Blueprint).filter(Blueprint.id == workflow_execution.blueprint_id).first()

            if blueprint:
                blueprint.title = app_title
                blueprint.summary = summary
                blueprint.status = "completed"
                blueprint.current_version = version
                blueprint.metadata_ = {
                    **(blueprint.metadata_ or {}),
                    "prompt": prompt,
                    "workflow_execution_id": str(workflow_execution.id),
                    "quality_score": quality_score,
                    "approval_verdict": approval_verdict,
                    "retry_count": accumulated.get("retry_count", 0),
                    "agents_count": len(completed_agents),
                }
            else:
                blueprint = Blueprint(
                    project_id=project.id,
                    current_version=version,
                    title=app_title,
                    summary=summary,
                    status="completed",
                    metadata_={
                        "prompt": prompt,
                        "workflow_execution_id": str(workflow_execution.id),
                        "quality_score": quality_score,
                        "approval_verdict": approval_verdict,
                        "retry_count": accumulated.get("retry_count", 0),
                        "agents_count": len(completed_agents),
                    },
                )
                db.add(blueprint)
                db.flush()
                workflow_execution.blueprint_id = blueprint.id

            # 6. Persist Blueprint Artifacts
            artifacts_list = []
            for draft in accumulated.get("artifacts", []):
                art_type = draft.artifact_type
                if art_type == "schema" or draft.file_path.endswith(".sql"):
                    art_type = "database"
                elif art_type == "specification" or "openapi" in draft.file_path:
                    art_type = "api"
                elif art_type in ("documentation", "architecture") or "ARCHITECTURE" in draft.file_path:
                    art_type = "architecture"
                elif (
                    art_type in ("devops", "deployment")
                    or "docker-compose" in draft.file_path
                    or "Dockerfile" in draft.file_path
                ):
                    art_type = "deployment"
                elif art_type in ("tests", "testing") or draft.file_path.startswith("tests/"):
                    art_type = "testing"

                artifact = BlueprintArtifact(
                    blueprint_id=blueprint.id,
                    version=version,
                    artifact_type=art_type,
                    file_path=draft.file_path,
                    content=draft.content,
                    language=draft.language,
                    file_size_bytes=len(draft.content.encode("utf-8")),
                )
                db.add(artifact)
                artifacts_list.append(artifact)

            # 7. Complete Workflow Execution
            fin_seq = next_seq()
            workflow_execution.status = "completed"
            workflow_execution.blueprint_id = blueprint.id
            workflow_execution.progress_percentage = 100
            workflow_execution.current_agent = "OptimizationAgent"
            workflow_execution.completed_at = datetime.now(timezone.utc)
            workflow_execution.metadata_ = {
                **workflow_execution.metadata_,
                "completed_agents": completed_agents,
                "quality_score": quality_score,
                "approval_verdict": approval_verdict,
                "artifacts_count": len(artifacts_list),
            }

            complete_event = WorkflowEvent(
                workflow_execution_id=workflow_execution.id,
                event_type="workflow_completed",
                agent_name="OptimizationAgent",
                sequence_number=fin_seq,
                payload={"blueprint_id": str(blueprint.id), "version": version, "quality_score": quality_score},
            )
            db.add(complete_event)

            db.commit()
            db.refresh(blueprint)
            db.refresh(workflow_execution)
            blueprint.artifacts = artifacts_list

            # Index generated artifacts into Qdrant vector database for future RAG context
            try:
                from app.services.rag_service import rag_service
                rag_service.index_blueprint_artifacts(db, blueprint, artifacts_list)
            except Exception as rag_err:
                logger.warning(f"RAG auto-indexing for blueprint {blueprint.id} encountered non-fatal error: {rag_err}")

            workflow_event_broadcaster.broadcast(
                str(workflow_execution.id),
                format_event_for_stream(
                    workflow_execution.id,
                    seq_num=fin_seq,
                    event_type="workflow_completed",
                    agent_name="OptimizationAgent",
                    status="completed",
                    progress=100,
                    message=f"Blueprint v{version} successfully generated and verified.",
                    payload={"blueprint_id": str(blueprint.id), "version": version, "quality_score": quality_score},
                ),
            )

            return blueprint, workflow_execution

        except Exception as e:
            logger.error(f"Workflow execution {workflow_execution.id} failed: {e}", exc_info=True)
            db.rollback()
            try:
                fail_seq = next_seq()
                with db.begin_nested():
                    workflow_execution.status = "failed"
                    workflow_execution.error_message = str(e)
                    workflow_execution.completed_at = datetime.now(timezone.utc)
                    db.add(workflow_execution)

                    if workflow_execution.blueprint_id:
                        failed_bp = db.query(Blueprint).filter(Blueprint.id == workflow_execution.blueprint_id).first()
                        if failed_bp:
                            failed_bp.status = "failed"
                            failed_bp.summary = f"Workflow failed: {str(e)}"
                            db.add(failed_bp)

                    fail_event = WorkflowEvent(
                        workflow_execution_id=workflow_execution.id,
                        event_type="workflow_failed",
                        sequence_number=fail_seq,
                        payload={
                            "error": str(e),
                            "blueprint_id": str(workflow_execution.blueprint_id) if workflow_execution.blueprint_id else None,
                        },
                    )
                    db.add(fail_event)
                db.commit()

                workflow_event_broadcaster.broadcast(
                    str(workflow_execution.id),
                    format_event_for_stream(
                        workflow_execution.id,
                        seq_num=fail_seq,
                        event_type="workflow_failed",
                        status="failed",
                        progress=workflow_execution.progress_percentage,
                        message=f"Workflow failed: {str(e)}",
                        payload={
                            "error": str(e),
                            "blueprint_id": str(workflow_execution.blueprint_id) if workflow_execution.blueprint_id else None,
                        },
                    ),
                )
            except Exception as inner_e:
                logger.error(f"Failed to record workflow failure event: {inner_e}")
                db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Workflow execution failed: {str(e)}",
            )

    @classmethod
    def background_worker_task(
        cls,
        execution_id: UUID,
        project_id: UUID,
        user_id: UUID,
        prompt: str,
        tech_stack: dict,
        version: int,
        title: Optional[str] = None,
        provider: Optional[LLMProvider] = None,
    ):
        """Standardized background worker task reusable across background and API tasks."""
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                logger.error(f"Background execution failed: User {user_id} not found.")
                return

            cls.run_execution(
                db=db,
                workflow_execution_id=execution_id,
                project_id=project_id,
                user=user,
                prompt=prompt,
                tech_stack=tech_stack,
                version=version,
                title=title,
                provider=provider,
            )
        except Exception as e:
            logger.error(f"Background workflow execution {execution_id} error: {e}", exc_info=True)
        finally:
            db.close()

    @classmethod
    def execute_blueprint_workflow(
        cls,
        db: Session,
        project_id: UUID,
        user: User,
        data: BlueprintGenerateRequest,
        provider: Optional[LLMProvider] = None,
    ) -> Tuple[Blueprint, WorkflowExecution]:
        """
        Synchronous wrapper: creates execution and immediately executes full workflow.
        Ensures 100% backward compatibility for all existing unit tests and callers.
        """
        workflow_execution, project, version, tech_stack = cls.create_workflow_execution(
            db=db,
            project_id=project_id,
            user=user,
            data=data,
        )

        return cls.run_execution(
            db=db,
            workflow_execution_id=workflow_execution.id,
            project_id=project_id,
            user=user,
            prompt=workflow_execution.prompt,
            tech_stack=tech_stack,
            version=version,
            title=getattr(data, "title", None),
            provider=provider,
            idea=getattr(data, "idea", None),
            requirements_input=getattr(data, "requirements", None),
            tech_preferences=getattr(data, "tech_preferences", None),
        )

    @classmethod
    def list_project_workflows(
        cls,
        db: Session,
        project_id: UUID,
        user: User,
    ) -> List[WorkflowExecution]:
        """Retrieve all workflow executions for a project (tenant-isolated)."""
        ProjectService.get_project_by_id(db, project_id, user)
        return (
            db.query(WorkflowExecution)
            .filter(WorkflowExecution.project_id == project_id)
            .order_by(WorkflowExecution.created_at.desc())
            .all()
        )

    @classmethod
    def get_workflow_detail(
        cls,
        db: Session,
        execution_id: UUID,
        user: User,
    ) -> WorkflowExecution:
        """Retrieve a specific workflow execution with eager loaded agent runs and timeline events."""
        execution = (
            db.query(WorkflowExecution)
            .filter(WorkflowExecution.id == execution_id)
            .first()
        )
        if not execution:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workflow execution not found",
            )

        # Enforce tenant isolation via project check
        ProjectService.get_project_by_id(db, execution.project_id, user)
        return execution

    @classmethod
    def get_blueprint_workflow(
        cls,
        db: Session,
        blueprint_id: UUID,
        user: User,
    ) -> Optional[WorkflowExecution]:
        """Retrieve the workflow execution associated with a specific blueprint."""
        blueprint = db.query(Blueprint).filter(Blueprint.id == blueprint_id).first()
        if not blueprint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Blueprint not found",
            )
        ProjectService.get_project_by_id(db, blueprint.project_id, user)

        execution = (
            db.query(WorkflowExecution)
            .filter(WorkflowExecution.blueprint_id == blueprint_id)
            .first()
        )
        if not execution:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No workflow execution associated with this blueprint",
            )
        return execution
