from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegisterRequest(BaseModel):
    email: EmailStr = Field(..., description="Valid user email address")
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Password with at least 8 characters",
    )
    full_name: str = Field(
        ...,
        min_length=1,
        max_length=150,
        description="User full name",
    )


class UserLoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., description="Plaintext password")


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    is_active: bool
    is_superuser: bool
    email_verified: bool
    mfa_enabled: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Active refresh token string")


class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = Field(
        None,
        description="Optional refresh token to revoke specifically upon logout",
    )
    all_other: Optional[bool] = Field(
        False,
        description="If true, revokes all sessions except the current one identified by refresh_token",
    )


class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None


class UserProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=150,
        description="Updated full name of the user",
    )
    avatar_url: Optional[str] = Field(
        None,
        max_length=1000,
        description="Updated avatar image URL",
    )


class UserSessionResponse(BaseModel):
    id: UUID
    device_info: Optional[str] = None
    ip_address: Optional[str] = None
    is_current: bool = False
    is_revoked: bool = False
    created_at: datetime
    expires_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_session_orm(cls, session, is_current: bool = False):
        return cls(
            id=session.id,
            device_info=session.device_info,
            ip_address=str(session.ip_address) if session.ip_address is not None else None,
            is_current=is_current,
            is_revoked=session.is_revoked,
            created_at=session.created_at,
            expires_at=session.expires_at,
        )

