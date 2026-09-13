"""
Pydantic schemas for RAG (Retrieval-Augmented Generation) endpoints.
"""

from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class RAGHealthResponse(BaseModel):
    status: str
    url: str
    collections_total: int = 0
    target_collection: str
    collection_exists: bool
    points_count: int = 0
    embedding_provider: str
    embedding_dimension: int


class RAGIndexResponse(BaseModel):
    status: str
    blueprint_id: Optional[str] = None
    project_id: str
    organization_id: str
    artifacts_count: int
    indexed_chunks: int


class RAGQueryRequest(BaseModel):
    project_id: UUID
    query: str = Field(..., min_length=1, max_length=1000)
    artifact_types: Optional[List[str]] = None
    top_k: Optional[int] = Field(default=5, ge=1, le=20)
    score_threshold: Optional[float] = Field(default=None, ge=0.0, le=1.0)


class RAGQueryResultItem(BaseModel):
    chunk_id: str
    artifact_id: str
    artifact_type: str
    file_path: str
    score: float
    text: str


class RAGQueryResponse(BaseModel):
    project_id: str
    organization_id: str
    query: str
    results_count: int
    results: List[RAGQueryResultItem]
