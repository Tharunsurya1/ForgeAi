from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class BlueprintGenerateRequest(BaseModel):
    prompt: str = Field(
        ...,
        min_length=5,
        max_length=10000,
        description="High-level concept, architecture goals, or software prompt to blueprint",
    )
    title: Optional[str] = Field(None, max_length=250, description="Optional custom title for blueprint")
    tech_stack: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Optional preferred frameworks, database, and cloud stack",
    )


class BlueprintArtifactResponse(BaseModel):
    id: UUID
    blueprint_id: UUID
    version: int
    artifact_type: str
    file_path: str
    content: str
    language: str
    file_size_bytes: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BlueprintResponse(BaseModel):
    id: UUID
    project_id: UUID
    current_version: int
    title: str
    summary: Optional[str] = None
    status: str
    metadata: Dict[str, Any] = Field(default_factory=dict, alias="metadata_")
    artifacts: List[BlueprintArtifactResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
