import asyncio
import logging
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    HTTPException,
    Query,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.security import decode_access_token
from app.database.database import SessionLocal
from app.models.user import User
from app.models.workflow_event import WorkflowEvent
from app.models.workflow_execution import WorkflowExecution
from app.schemas.blueprint import BlueprintGenerateRequest
from app.schemas.workflow import (
    WorkflowExecutionDetailResponse,
    WorkflowExecutionResponse,
)
from app.services.project_service import ProjectService
from app.services.workflow_service import (
    WorkflowOrchestratorService,
    sanitize_event_payload,
    workflow_event_broadcaster,
)

logger = logging.getLogger("forgeai.workflows_api")

router = APIRouter()


def _background_workflow_worker(
    execution_id: UUID,
    project_id: UUID,
    user_id: UUID,
    prompt: str,
    tech_stack: dict,
    version: int,
    title: Optional[str] = None,
):
    """Background worker task executed by FastAPI BackgroundTasks."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.error(f"Background execution failed: User {user_id} not found.")
            return

        WorkflowOrchestratorService.run_execution(
            db=db,
            workflow_execution_id=execution_id,
            project_id=project_id,
            user=user,
            prompt=prompt,
            tech_stack=tech_stack,
            version=version,
            title=title,
        )
    except Exception as e:
        logger.error(f"Background workflow execution {execution_id} error: {e}", exc_info=True)
    finally:
        db.close()


@router.post(
    "/execute/{project_id}",
    response_model=WorkflowExecutionDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Trigger 14-Agent LangGraph workflow execution (synchronous or background)",
)
def execute_workflow(
    project_id: UUID,
    data: BlueprintGenerateRequest,
    background: bool = Query(False, description="Run workflow asynchronously in background"),
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Triggers the 14-Agent LangGraph StateGraph workflow, orchestrating all specialist agents,
    saving timeline events, agent runs, and final blueprint artifacts.
    If background=True: creates execution immediately with status 'running' and dispatches background task.
    If background=False: executes synchronously and returns fully completed execution.
    """
    if background:
        execution, project, version, tech_stack = (
            WorkflowOrchestratorService.create_workflow_execution(
                db=db,
                project_id=project_id,
                user=current_user,
                data=data,
            )
        )
        if background_tasks is not None:
            background_tasks.add_task(
                _background_workflow_worker,
                execution_id=execution.id,
                project_id=project.id,
                user_id=current_user.id,
                prompt=data.prompt,
                tech_stack=tech_stack,
                version=version,
                title=data.title,
            )
        else:
            asyncio.create_task(
                asyncio.to_thread(
                    _background_workflow_worker,
                    execution.id,
                    project.id,
                    current_user.id,
                    data.prompt,
                    tech_stack,
                    version,
                    data.title,
                )
            )
        return execution

    _, execution = WorkflowOrchestratorService.execute_blueprint_workflow(
        db=db,
        project_id=project_id,
        user=current_user,
        data=data,
    )
    return execution


@router.websocket("/{execution_id}/stream")
async def stream_workflow_events(
    websocket: WebSocket,
    execution_id: UUID,
    token: Optional[str] = Query(None),
):
    """
    WebSocket endpoint for real-time workflow event streaming.
    - Validates JWT authentication from query param ?token= or headers
    - Enforces tenant isolation (cross-tenant rejected with WS_1008_POLICY_VIOLATION)
    - Replays chronological persisted WorkflowEvents
    - Streams live WorkflowEvents broadcasted by running agents
    - Terminates cleanly when workflow completes or fails
    """
    auth_token = token
    if not auth_token:
        auth_header = websocket.headers.get("authorization") or websocket.headers.get("sec-websocket-protocol")
        if auth_header:
            auth_token = auth_header.replace("Bearer ", "").strip()

    if not auth_token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Authentication token missing")
        return

    db = SessionLocal()
    try:
        try:
            payload = decode_access_token(auth_token)
            user_id_str = payload.get("sub")
            if not user_id_str:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token claims")
                return
            user_id = UUID(user_id_str)
        except Exception:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid authentication token")
            return

        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Inactive or non-existent user")
            return

        execution = (
            db.query(WorkflowExecution)
            .filter(WorkflowExecution.id == execution_id)
            .first()
        )
        if not execution:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Workflow execution not found")
            return

        try:
            ProjectService.get_project_by_id(db, execution.project_id, user)
        except Exception:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Cross-tenant access forbidden")
            return

        await websocket.accept()

        queue = await workflow_event_broadcaster.subscribe(str(execution_id))

        historical_events = (
            db.query(WorkflowEvent)
            .filter(WorkflowEvent.workflow_execution_id == execution_id)
            .order_by(WorkflowEvent.sequence_number.asc())
            .all()
        )

        last_seq = 0
        for ev in historical_events:
            last_seq = max(last_seq, ev.sequence_number)
            event_payload = {
                "execution_id": str(ev.workflow_execution_id),
                "sequence_number": ev.sequence_number,
                "event_type": ev.event_type,
                "agent_name": ev.agent_name,
                "status": ev.payload.get("status", "running") if ev.payload else "running",
                "progress": ev.payload.get("progress", 0) if ev.payload else 0,
                "timestamp": ev.created_at.isoformat() if ev.created_at else datetime.now(timezone.utc).isoformat(),
                "message": ev.payload.get("message", "") if ev.payload else "",
                "payload": sanitize_event_payload(ev.payload),
            }
            await websocket.send_json(event_payload)

        if execution.status in ("completed", "failed"):
            await asyncio.sleep(0.1)
            await websocket.close(code=status.WS_1000_NORMAL_CLOSURE)
            return

        try:
            while True:
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=25.0)
                    if event.get("sequence_number", 999999) > last_seq:
                        last_seq = event.get("sequence_number", last_seq)
                        await websocket.send_json(event)

                    if event.get("event_type") in ("workflow_completed", "workflow_failed"):
                        await asyncio.sleep(0.3)
                        await websocket.close(code=status.WS_1000_NORMAL_CLOSURE)
                        break

                except asyncio.TimeoutError:
                    try:
                        await websocket.send_json({"event_type": "heartbeat", "execution_id": str(execution_id)})
                    except Exception:
                        break

        except WebSocketDisconnect:
            logger.info(f"WebSocket client disconnected from workflow {execution_id}")
        except Exception as e:
            logger.warning(f"WebSocket error for workflow {execution_id}: {e}")
        finally:
            await workflow_event_broadcaster.unsubscribe(str(execution_id), queue)

    finally:
        db.close()


@router.get(
    "/project/{project_id}",
    response_model=List[WorkflowExecutionResponse],
    status_code=status.HTTP_200_OK,
    summary="List all workflow executions for a project",
)
def list_project_workflows(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve history of all multi-agent workflow executions for a specific project.
    """
    executions = WorkflowOrchestratorService.list_project_workflows(
        db=db,
        project_id=project_id,
        user=current_user,
    )
    return executions


@router.get(
    "/{execution_id}",
    response_model=WorkflowExecutionDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get detailed workflow execution by ID with agent runs and timeline events",
)
def get_workflow_detail(
    execution_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Fetch comprehensive workflow execution metadata including individual agent runs,
    timings, payloads, and chronological sequence of lifecycle events.
    """
    execution = WorkflowOrchestratorService.get_workflow_detail(
        db=db,
        execution_id=execution_id,
        user=current_user,
    )
    return execution


@router.get(
    "/blueprint/{blueprint_id}",
    response_model=WorkflowExecutionDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get workflow execution associated with a blueprint",
)
def get_blueprint_workflow(
    blueprint_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Fetch the workflow execution run that generated a specific blueprint.
    """
    execution = WorkflowOrchestratorService.get_blueprint_workflow(
        db=db,
        blueprint_id=blueprint_id,
        user=current_user,
    )
    return execution
