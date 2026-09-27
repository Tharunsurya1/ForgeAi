from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.code_generator import (
    CodeGenerateRequest,
    CodeGenerateResponse,
    CodeValidationResponse,
)
from app.services.code_generator_service import CodeGeneratorService
from app.services.code_validation_service import CodeValidationService

router = APIRouter()


@router.post(
    "/generate",
    response_model=CodeGenerateResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate complete software project scaffold from blueprint artifacts",
)
def generate_code_from_blueprint(
    data: CodeGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Synthesize complete project code files, directory tree, models, APIs, and configurations
    from approved blueprint artifacts with multi-tenant verification.
    """
    return CodeGeneratorService.generate_project_scaffold(
        db=db,
        blueprint_id=data.blueprint_id,
        user=current_user,
        version=data.version,
    )


@router.get(
    "/blueprint/{blueprint_id}",
    response_model=CodeGenerateResponse,
    status_code=status.HTTP_200_OK,
    summary="Get generated project file tree for a blueprint",
)
def get_generated_code_for_blueprint(
    blueprint_id: UUID,
    version: Optional[int] = Query(None, description="Optional blueprint version number"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve project file tree, source code, and directories synthesized from blueprint artifacts.
    """
    return CodeGeneratorService.generate_project_scaffold(
        db=db,
        blueprint_id=blueprint_id,
        user=current_user,
        version=version,
    )


@router.post(
    "/blueprint/{blueprint_id}/validate",
    response_model=CodeValidationResponse,
    status_code=status.HTTP_200_OK,
    summary="Validate generated project code structure, security, and syntax",
)
def validate_generated_code(
    blueprint_id: UUID,
    version: Optional[int] = Query(None, description="Optional blueprint version number"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Validate synthesized project scaffold files for structural completeness,
    path traversal safety, and syntax correctness.
    """
    return CodeValidationService.validate_blueprint_code(
        db=db,
        blueprint_id=blueprint_id,
        user=current_user,
        version=version,
    )


@router.get(
    "/blueprint/{blueprint_id}/download",
    status_code=status.HTTP_200_OK,
    summary="Download complete generated project scaffold as a ZIP archive",
)
def download_project_scaffold_zip(
    blueprint_id: UUID,
    version: Optional[int] = Query(None, description="Optional blueprint version number"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Stream in-memory ZIP package containing complete project file tree,
    backend/frontend scaffolding, SQL DDL, and container manifests.
    """
    buf, archive_name = CodeGeneratorService.build_project_zip(
        db=db,
        blueprint_id=blueprint_id,
        user=current_user,
        version=version,
    )

    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{archive_name}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )

