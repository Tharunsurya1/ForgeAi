from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class OrganizationCreateRequest(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Organization or workspace name",
    )
    plan_tier: Optional[str] = Field(
        "free",
        description="Subscription plan tier (free, pro, enterprise)",
    )


class OrganizationResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    logo_url: Optional[str] = None
    plan_tier: str
    billing_email: str
    role: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrganizationMemberResponse(BaseModel):
    id: UUID
    organization_id: UUID
    user_id: UUID
    role: str
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MemberInviteRequest(BaseModel):
    email: EmailStr = Field(
        ...,
        description="Email address of user to invite or add",
    )
    role: str = Field(
        "member",
        description="Assigned role: owner, admin, member, viewer",
        pattern="^(owner|admin|member|viewer)$",
    )
