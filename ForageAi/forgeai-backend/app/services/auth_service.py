import ipaddress
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    hash_token,
    verify_password,
)
import re
import uuid
from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
from app.models.user import User
from app.models.user_session import UserSession
from app.schemas.auth import (
    UserLoginRequest,
    UserProfileUpdateRequest,
    UserRegisterRequest,
    UserSessionResponse,
)


def _sanitize_ip(ip_str: Optional[str]) -> Optional[str]:
    """Validate that the string is a valid IPv4 or IPv6 address for PostgreSQL INET column."""
    if not ip_str:
        return None
    try:
        ipaddress.ip_address(ip_str)
        return ip_str
    except ValueError:
        return None


class AuthService:
    @staticmethod
    def register_user(db: Session, request: UserRegisterRequest) -> User:
        """
        Validate, normalize and register a new user account with default organization.
        """
        normalized_email = request.email.strip().lower()

        # Check for duplicate email address
        existing_user = (
            db.query(User)
            .filter(func.lower(User.email) == normalized_email)
            .first()
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered",
            )

        # Hash the password securely
        password_hash = get_password_hash(request.password)

        new_user = User(
            email=normalized_email,
            password_hash=password_hash,
            full_name=request.full_name.strip(),
            is_active=True,
            is_superuser=False,
            email_verified=False,
            mfa_enabled=False,
        )
        db.add(new_user)
        db.flush()

        # Provision default tenant workspace organization for the user
        cleaned_slug = re.sub(r"[^a-z0-9]+", "-", new_user.full_name.lower()).strip("-") or "workspace"
        unique_org_slug = f"{cleaned_slug}-{str(new_user.id)[:8]}"
        default_org = Organization(
            name=f"{new_user.full_name}'s Workspace",
            slug=unique_org_slug,
            plan_tier="free",
            billing_email=new_user.email,
        )
        db.add(default_org)
        db.flush()

        org_member = OrganizationMember(
            organization_id=default_org.id,
            user_id=new_user.id,
            role="owner",
        )
        db.add(org_member)
        db.commit()
        db.refresh(new_user)
        return new_user

    @staticmethod
    def authenticate_user(
        db: Session,
        request: UserLoginRequest,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Tuple[User, str, str, int]:
        """
        Authenticate user credentials and issue an access token and refresh token session.
        Returns: (user, access_token, raw_refresh_token, expires_in_seconds)
        """
        normalized_email = request.email.strip().lower()
        user = (
            db.query(User)
            .filter(func.lower(User.email) == normalized_email)
            .first()
        )

        if not user or not user.password_hash or not verify_password(request.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user account",
            )

        # Generate tokens
        access_token = create_access_token(subject=str(user.id))
        raw_refresh_token = create_refresh_token()
        token_hash = hash_token(raw_refresh_token)

        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        # Store session record with hashed refresh token
        session = UserSession(
            user_id=user.id,
            refresh_token_hash=token_hash,
            device_info=user_agent[:255] if user_agent else None,
            ip_address=_sanitize_ip(client_ip),
            is_revoked=False,
            expires_at=expires_at,
        )
        db.add(session)
        db.commit()

        expires_in = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        return user, access_token, raw_refresh_token, expires_in

    @staticmethod
    def refresh_tokens(
        db: Session,
        raw_refresh_token: str,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Tuple[User, str, str, int]:
        """
        Validate refresh token, perform rotation (revoke old, issue new), and return new tokens.
        Returns: (user, new_access_token, new_raw_refresh_token, expires_in_seconds)
        """
        token_hash = hash_token(raw_refresh_token)
        session = (
            db.query(UserSession)
            .filter(UserSession.refresh_token_hash == token_hash)
            .first()
        )

        if not session or session.is_revoked:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or revoked refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        now = datetime.now(timezone.utc)
        session_expires = session.expires_at
        if session_expires.tzinfo is None:
            session_expires = session_expires.replace(tzinfo=timezone.utc)

        if session_expires < now:
            session.is_revoked = True
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = db.query(User).filter(User.id == session.user_id).first()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user account",
            )

        # Token Rotation: Revoke current session
        session.is_revoked = True

        # Generate new credentials
        new_access_token = create_access_token(subject=str(user.id))
        new_raw_refresh_token = create_refresh_token()
        new_token_hash = hash_token(new_raw_refresh_token)
        new_expires_at = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        new_session = UserSession(
            user_id=user.id,
            refresh_token_hash=new_token_hash,
            device_info=user_agent[:255] if user_agent else None,
            ip_address=_sanitize_ip(client_ip),
            is_revoked=False,
            expires_at=new_expires_at,
        )
        db.add(new_session)
        db.commit()

        expires_in = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        return user, new_access_token, new_raw_refresh_token, expires_in

    @staticmethod
    def logout_user(
        db: Session,
        current_user: User,
        raw_refresh_token: Optional[str] = None,
        all_other: bool = False,
    ) -> None:
        """
        Revoke active session(s) for the current user.
        If all_other is True and raw_refresh_token is provided, revokes all other sessions.
        """
        if all_other and raw_refresh_token:
            token_hash = hash_token(raw_refresh_token)
            db.query(UserSession).filter(
                UserSession.user_id == current_user.id,
                UserSession.refresh_token_hash != token_hash,
                UserSession.is_revoked == False,  # noqa: E712
            ).update({"is_revoked": True})
            db.commit()
            return

        if raw_refresh_token:
            token_hash = hash_token(raw_refresh_token)
            session = (
                db.query(UserSession)
                .filter(
                    UserSession.refresh_token_hash == token_hash,
                    UserSession.user_id == current_user.id,
                )
                .first()
            )
            if session:
                session.is_revoked = True
                db.commit()
                return

        # Otherwise revoke all active sessions for the user
        db.query(UserSession).filter(
            UserSession.user_id == current_user.id,
            UserSession.is_revoked == False,  # noqa: E712
        ).update({"is_revoked": True})
        db.commit()

    @staticmethod
    def list_user_sessions(
        db: Session,
        current_user: User,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> list[UserSessionResponse]:
        """
        Retrieve all active and non-expired sessions for the user, indicating current session.
        """
        now = datetime.now(timezone.utc)
        sessions = (
            db.query(UserSession)
            .filter(
                UserSession.user_id == current_user.id,
                UserSession.is_revoked == False,  # noqa: E712
                UserSession.expires_at > now,
            )
            .order_by(UserSession.created_at.desc())
            .all()
        )

        sanitized_ip = _sanitize_ip(client_ip)
        sanitized_ua = user_agent[:255] if user_agent else None

        # Find the best match for current device
        current_idx = None
        for idx, s in enumerate(sessions):
            if sanitized_ip and str(s.ip_address) == sanitized_ip and sanitized_ua and s.device_info == sanitized_ua:
                current_idx = idx
                break

        if current_idx is None and sanitized_ip:
            for idx, s in enumerate(sessions):
                if str(s.ip_address) == sanitized_ip:
                    current_idx = idx
                    break

        if current_idx is None and sessions:
            current_idx = 0

        result = []
        for idx, s in enumerate(sessions):
            is_cur = idx == current_idx
            result.append(UserSessionResponse.from_session_orm(s, is_current=is_cur))

        return result

    @staticmethod
    def revoke_session_by_id(
        db: Session,
        current_user: User,
        session_id: uuid.UUID,
    ) -> bool:
        """
        Revoke a specific session belonging to the current user.
        """
        session = (
            db.query(UserSession)
            .filter(
                UserSession.id == session_id,
                UserSession.user_id == current_user.id,
            )
            .first()
        )
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )

        session.is_revoked = True
        db.commit()
        return True

    @staticmethod
    def update_user_profile(
        db: Session,
        current_user: User,
        request: UserProfileUpdateRequest,
    ) -> User:
        """
        Update permitted user profile fields (full_name, avatar_url) and persist to DB.
        """
        if request.full_name is not None:
            cleaned_name = request.full_name.strip()
            if not cleaned_name:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Full name cannot be empty",
                )
            current_user.full_name = cleaned_name

        if request.avatar_url is not None:
            current_user.avatar_url = request.avatar_url.strip() if request.avatar_url else None

        db.commit()
        db.refresh(current_user)
        return current_user
