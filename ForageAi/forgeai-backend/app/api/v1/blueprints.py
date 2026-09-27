from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.blueprint import (
    BlueprintArtifactsListResponse,
    BlueprintGenerateRequest,
    BlueprintResponse,
)
from app.services.blueprint_service import BlueprintService

router = APIRouter()


@router.post(
    "/generate/{project_id}",
    response_model=BlueprintResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Trigger Multi-Agent AI blueprint generation for a project",
)
def generate_blueprint(
    project_id: UUID,
    data: BlueprintGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Synthesize complete multi-agent project blueprints (Requirements, Architecture, DB DDL, API, Frontend, Security, Docker)
    and persist artifacts to PostgreSQL database.
    """
    blueprint = BlueprintService.generate_and_save_blueprint(
        db=db,
        project_id=project_id,
        user=current_user,
        data=data,
    )
    return blueprint


@router.get(
    "/{blueprint_id}/artifacts",
    response_model=BlueprintArtifactsListResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve all generated specialist artifacts for a blueprint",
)
def get_blueprint_artifacts(
    blueprint_id: UUID,
    version: Optional[int] = Query(None, description="Optional version number to fetch historical artifacts"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Fetch all specialist deliverables (Requirements, Architecture, SQL DDL, OpenAPI, Docker, Security, etc.)
    associated with a blueprint, with multi-tenant RBAC validation and optional version filtering.
    """
    return BlueprintService.get_blueprint_artifacts(
        db=db,
        blueprint_id=blueprint_id,
        user=current_user,
        version=version,
    )


@router.get(
    "/{blueprint_id}",
    response_model=BlueprintResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve generated blueprint and artifacts by ID",
)
def get_blueprint(
    blueprint_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Fetch blueprint metadata and associated code/document artifacts.
    """
    blueprint = BlueprintService.get_blueprint_by_id(
        db=db,
        blueprint_id=blueprint_id,
        user=current_user,
    )
    return blueprint



@router.get(
    "/project/{project_id}",
    response_model=BlueprintResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve latest blueprint for a project",
)
def get_latest_project_blueprint(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Fetch the most recently generated blueprint and artifacts for a project.
    """
    blueprint = BlueprintService.get_latest_project_blueprint(
        db=db,
        project_id=project_id,
        user=current_user,
    )
    return blueprint
