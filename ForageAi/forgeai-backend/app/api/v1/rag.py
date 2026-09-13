"""
RAG (Retrieval-Augmented Generation) API endpoints for ForgeAI.
Provides vector indexing, health diagnostics, and tenant-isolated context queries.
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.blueprint import Blueprint
from app.models.organization_member import OrganizationMember
from app.models.project import Project
from app.models.user import User
from app.schemas.rag import (
    RAGHealthResponse,
    RAGIndexResponse,
    RAGQueryRequest,
    RAGQueryResponse,
    RAGQueryResultItem,
)
from app.services.embedding_service import get_embedding_provider
from app.services.qdrant_service import qdrant_service
from app.services.rag_service import rag_service

router = APIRouter()


def _verify_project_access(db: Session, project_id: UUID, user: User, allowed_roles: Optional[List[str]] = None) -> Project:
    """Validate project existence and user's tenant organization membership."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if user.is_superuser:
        return project

    member = (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.organization_id == project.organization_id,
            OrganizationMember.user_id == user.id,
        )
        .first()
    )
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You are not a member of this project's organization",
        )

    roles = allowed_roles or ["owner", "admin", "member", "viewer"]
    if member.role not in roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Operation requires one of roles: {', '.join(roles)}",
        )

    return project


@router.get(
    "/health",
    response_model=RAGHealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Qdrant vector database and embedding service health status",
)
def get_rag_health(
    current_user: User = Depends(get_current_user),
):
    """
    Returns connectivity and collection statistics for the active Qdrant vector store
    and embedding model configuration.
    """
    q_health = qdrant_service.health()
    emb = get_embedding_provider()

    return RAGHealthResponse(
        status=q_health.get("status", "unknown"),
        url=q_health.get("url", ""),
        collections_total=q_health.get("collections_total", 0),
        target_collection=q_health.get("target_collection", ""),
        collection_exists=q_health.get("collection_exists", False),
        points_count=q_health.get("points_count", 0),
        embedding_provider=emb.provider_name,
        embedding_dimension=emb.dimension,
    )


@router.post(
    "/index/{blueprint_id}",
    response_model=RAGIndexResponse,
    status_code=status.HTTP_200_OK,
    summary="Index all artifacts of a blueprint into Qdrant vector store",
)
def index_blueprint(
    blueprint_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Extracts text from all artifacts of the specified blueprint, chunks them,
    computes embeddings, and upserts them into Qdrant with tenant isolation metadata.
    """
    blueprint = db.query(Blueprint).filter(Blueprint.id == blueprint_id).first()
    if not blueprint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blueprint not found")

    project = _verify_project_access(
        db=db,
        project_id=blueprint.project_id,
        user=current_user,
        allowed_roles=["owner", "admin", "member"],
    )

    result = rag_service.index_blueprint_artifacts(db=db, blueprint=blueprint)
    if result.get("status") == "error":
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result.get("error"))

    return RAGIndexResponse(
        status="success",
        blueprint_id=str(blueprint.id),
        project_id=str(project.id),
        organization_id=str(project.organization_id),
        artifacts_count=result.get("artifacts_count", 0),
        indexed_chunks=result.get("indexed_chunks", 0),
    )


@router.post(
    "/reindex/{project_id}",
    response_model=RAGIndexResponse,
    status_code=status.HTTP_200_OK,
    summary="Re-index all blueprints and artifacts for a project",
)
def reindex_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Idempotently re-indexes all architectural documents, schemas, and code artifacts
    for all blueprints within the project.
    """
    project = _verify_project_access(
        db=db,
        project_id=project_id,
        user=current_user,
        allowed_roles=["owner", "admin", "member"],
    )

    result = rag_service.reindex_project_artifacts(db=db, project_id=project.id)
    if result.get("status") == "error":
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result.get("error"))

    return RAGIndexResponse(
        status="success",
        project_id=str(project.id),
        organization_id=str(project.organization_id),
        artifacts_count=result.get("artifacts_count", 0),
        indexed_chunks=result.get("indexed_chunks", 0),
    )


@router.post(
    "/query",
    response_model=RAGQueryResponse,
    status_code=status.HTTP_200_OK,
    summary="Query relevant organizational knowledge for a project with strict tenant isolation",
)
def query_context(
    body: RAGQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Searches the vector store using semantic similarity, strictly isolated to
    the organization owning the specified project.
    """
    project = _verify_project_access(
        db=db,
        project_id=body.project_id,
        user=current_user,
        allowed_roles=["owner", "admin", "member", "viewer"],
    )

    results = rag_service.retrieve_context(
        query=body.query,
        organization_id=str(project.organization_id),
        project_id=str(project.id),
        artifact_types=body.artifact_types,
        top_k=body.top_k,
        score_threshold=body.score_threshold,
    )

    items = [
        RAGQueryResultItem(
            chunk_id=r.chunk_id,
            artifact_id=r.artifact_id,
            artifact_type=r.artifact_type,
            file_path=r.file_path,
            score=round(r.score, 4),
            text=r.text,
        )
        for r in results
    ]

    return RAGQueryResponse(
        project_id=str(project.id),
        organization_id=str(project.organization_id),
        query=body.query,
        results_count=len(items),
        results=items,
    )
