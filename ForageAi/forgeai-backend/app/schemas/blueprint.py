from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class BlueprintCreateRequest(BaseModel):
    idea: Optional[str] = Field(None, description="Software concept or business idea")
    requirements: Optional[str] = Field(None, description="Detailed functional/non-functional requirements")
    tech_preferences: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Frontend, backend, database preferences")

    # Backward-compatible fields
    prompt: Optional[str] = Field(None, description="Raw prompt if provided instead of idea/requirements")
    title: Optional[str] = Field(None, max_length=250, description="Optional custom title for blueprint")
    tech_stack: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Preferred frameworks and databases")

    @model_validator(mode="after")
    def validate_content(self):
        has_idea = bool(self.idea and self.idea.strip())
        has_reqs = bool(self.requirements and self.requirements.strip())
        has_prompt = bool(self.prompt and self.prompt.strip())
        if not (has_idea or has_reqs or has_prompt):
            raise ValueError("Either 'idea', 'requirements', or 'prompt' must be provided.")
        return self

    def get_effective_prompt(self) -> str:
        parts = []
        if self.idea and self.idea.strip():
            parts.append(f"Software Idea:\n{self.idea.strip()}")
        if self.requirements and self.requirements.strip():
            parts.append(f"Requirements:\n{self.requirements.strip()}")
        if self.prompt and self.prompt.strip():
            if not self.idea or self.prompt.strip() != self.idea.strip():
                parts.append(f"Prompt Details:\n{self.prompt.strip()}")
        return "\n\n".join(parts) or "Generate software architecture blueprint"

    def get_effective_tech_stack(self) -> Dict[str, Any]:
        merged = {}
        if self.tech_stack:
            merged.update(self.tech_stack)
        if self.tech_preferences:
            merged.update(self.tech_preferences)
        return merged


class BlueprintCreateResponse(BaseModel):
    workflow_id: UUID
    blueprint_id: UUID
    status: str = "queued"

    model_config = ConfigDict(from_attributes=True)


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
    idea: Optional[str] = Field(None, description="Optional software idea")
    requirements: Optional[str] = Field(None, description="Optional requirements")
    tech_preferences: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Optional tech preferences")

    def get_effective_prompt(self) -> str:
        parts = []
        if self.idea and self.idea.strip():
            parts.append(f"Software Idea:\n{self.idea.strip()}")
        if self.requirements and self.requirements.strip():
            parts.append(f"Requirements:\n{self.requirements.strip()}")
        if self.prompt and self.prompt.strip():
            if not self.idea or self.prompt.strip() != self.idea.strip():
                parts.append(f"Prompt Details:\n{self.prompt.strip()}")
        return "\n\n".join(parts) if parts else self.prompt

    def get_effective_tech_stack(self) -> Dict[str, Any]:
        merged = {}
        if self.tech_stack:
            merged.update(self.tech_stack)
        if self.tech_preferences:
            merged.update(self.tech_preferences)
        return merged


class BlueprintArtifactResponse(BaseModel):
    id: UUID
    blueprint_id: UUID
    version: int
    artifact_type: str
    file_path: str
    content: str
    language: str
    file_size_bytes: int
    agent_type: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BlueprintArtifactItemResponse(BaseModel):
    id: UUID
    blueprint_id: UUID
    agent_type: str
    artifact_type: str
    file_path: str
    version: int
    status: str = "completed"
    content: str
    language: str
    file_size_bytes: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class BlueprintArtifactsListResponse(BaseModel):
    blueprint_id: UUID
    current_version: int
    selected_version: int
    total_artifacts: int
    artifacts: List[BlueprintArtifactItemResponse]

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

