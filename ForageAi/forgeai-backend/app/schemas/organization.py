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
        pattern="^(free|pro|enterprise)$",
    )


class OrganizationUpdateRequest(BaseModel):
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=200,
        description="Updated organization name",
    )
    logo_url: Optional[str] = Field(
        None,
        max_length=2048,
        description="URL to organization logo icon",
    )
    plan_tier: Optional[str] = Field(
        None,
        description="Subscription plan tier",
        pattern="^(free|pro|enterprise)$",
    )
    billing_email: Optional[EmailStr] = Field(
        None,
        description="Primary billing and alert email",
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


class MemberRoleUpdateRequest(BaseModel):
    role: str = Field(
        ...,
        description="New assigned role: owner, admin, member, viewer",
        pattern="^(owner|admin|member|viewer)$",
    )


class TransferOwnershipRequest(BaseModel):
    new_owner_user_id: UUID = Field(
        ...,
        description="User ID of the organization member receiving ownership",
    )


class MemberInviteRequest(BaseModel):
    email: EmailStr = Field(
        ...,
        description="Email address of user to invite",
    )
    role: str = Field(
        "member",
        description="Assigned role: owner, admin, member, viewer",
        pattern="^(owner|admin|member|viewer)$",
    )


class OrganizationInvitationResponse(BaseModel):
    id: UUID
    organization_id: UUID
    organization_name: Optional[str] = None
    email: str
    role: str
    token: str
    status: str
    invited_by: Optional[UUID] = None
    expires_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InvitationPublicResponse(BaseModel):
    id: UUID
    organization_id: UUID
    organization_name: str
    organization_slug: str
    email: str
    role: str
    expires_at: datetime
    is_expired: bool

    model_config = ConfigDict(from_attributes=True)


class InvitationActionResponse(BaseModel):
    message: str
    organization_id: UUID
    role: str
