from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200, description="Project name")
    description: Optional[str] = Field(None, max_length=2000, description="Project description")
    tech_stack: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Configured technology stack")
    repository_url: Optional[str] = Field(None, max_length=500, description="Git repository URL")
    organization_id: Optional[UUID] = Field(None, description="Target organization UUID")


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    tech_stack: Optional[Dict[str, Any]] = None
    repository_url: Optional[str] = None
    status: Optional[str] = None


class ProjectResponse(BaseModel):
    id: UUID
    organization_id: UUID
    created_by: UUID
    name: str
    slug: str
    description: Optional[str] = None
    repository_url: Optional[str] = None
    tech_stack: Dict[str, Any] = Field(default_factory=dict)
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectListResponse(BaseModel):
    projects: List[ProjectResponse]
    total: int
