from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.blueprint import BlueprintCreateRequest, BlueprintCreateResponse
from app.schemas.project import (
    ProjectCreate,
    ProjectListResponse,
    ProjectResponse,
    ProjectUpdate,
)
from app.services.project_service import ProjectService
from app.services.workflow_service import WorkflowOrchestratorService

router = APIRouter()


@router.get(
    "",
    response_model=List[ProjectResponse],
    status_code=status.HTTP_200_OK,
    summary="List all accessible projects",
)
def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve all projects belonging to organizations where the authenticated user is a member.
    """
    projects = ProjectService.list_projects(db=db, user=current_user)
    return projects


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new software project",
)
def create_project(
    data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new project workspace under the user's primary or selected organization.
    """
    project = ProjectService.create_project(db=db, user=current_user, data=data)
    return project


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
    status_code=status.HTTP_200_OK,
    summary="Get project details by UUID",
)
def get_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Fetch details of a specific software project by ID.
    """
    project = ProjectService.get_project_by_id(db=db, project_id=project_id, user=current_user)
    return project


@router.patch(
    "/{project_id}",
    response_model=ProjectResponse,
    status_code=status.HTTP_200_OK,
    summary="Update project details",
)
def update_project(
    project_id: UUID,
    data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update details of an existing software project.
    """
    project = ProjectService.update_project(
        db=db,
        project_id=project_id,
        user=current_user,
        data=data,
    )
    return project


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a software project",
)
def delete_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Remove a software project from the workspace.
    """
    ProjectService.delete_project(db=db, project_id=project_id, user=current_user)
    return {"message": "Project successfully deleted"}


@router.post(
    "/{project_id}/blueprints",
    response_model=BlueprintCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new blueprint and trigger asynchronous 14-agent workflow generation",
)
def create_project_blueprint(
    project_id: UUID,
    data: BlueprintCreateRequest,
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Standardized blueprint creation endpoint:
    1. Authenticates user and checks organization RBAC permissions.
    2. Immediately creates a Blueprint record in generating status.
    3. Immediately creates a WorkflowExecution record and links workflow_execution.blueprint_id.
    4. Dispatches the 14-agent LangGraph workflow in the background.
    5. Returns immediately with workflow_id, blueprint_id, and status='queued'.
    """
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
            WorkflowOrchestratorService.background_worker_task,
            execution_id=execution.id,
            project_id=project.id,
            user_id=current_user.id,
            prompt=execution.prompt,
            tech_stack=tech_stack,
            version=version,
            title=data.title,
        )
    else:
        import asyncio
        asyncio.create_task(
            asyncio.to_thread(
                WorkflowOrchestratorService.background_worker_task,
                execution.id,
                project.id,
                current_user.id,
                execution.prompt,
                tech_stack,
                version,
                data.title,
            )
        )

    return BlueprintCreateResponse(
        workflow_id=execution.id,
        blueprint_id=execution.blueprint_id,
        status="queued",
    )
