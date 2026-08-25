from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.project import (
    ProjectCreate,
    ProjectListResponse,
    ProjectResponse,
    ProjectUpdate,
)
from app.services.project_service import ProjectService

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
