from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class TeamCreateRequest(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=150,
        description="Team squad or guild name",
    )
    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Optional team description or mission",
    )


class TeamResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    description: Optional[str] = None
    member_count: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TeamMemberResponse(BaseModel):
    id: UUID
    team_id: UUID
    user_id: UUID
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TeamAddMemberRequest(BaseModel):
    user_id: UUID = Field(
        ...,
        description="UUID of organization user to add to this team",
    )
