from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import (
    LogoutRequest,
    MessageResponse,
    RefreshTokenRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user account",
)
def register(
    data: UserRegisterRequest,
    db: Session = Depends(get_db),
):
    """
    Create a new user with email, password, and full name.
    """
    user = AuthService.register_user(db=db, request=data)
    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and issue JWT and Refresh tokens",
)
def login(
    data: UserLoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Authenticate user credentials, record a user session, and return tokens.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    user, access_token, refresh_token, expires_in = AuthService.authenticate_user(
        db=db,
        request=data,
        client_ip=client_ip,
        user_agent=user_agent,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=expires_in,
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Rotate refresh token and issue new access token",
)
def refresh_token(
    data: RefreshTokenRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Verify existing refresh token, perform rotation (revoke old session and issue new session),
    and return refreshed token pair.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    user, access_token, new_refresh_token, expires_in = AuthService.refresh_tokens(
        db=db,
        raw_refresh_token=data.refresh_token,
        client_ip=client_ip,
        user_agent=user_agent,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=expires_in,
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/logout",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Revoke session and log out user",
)
def logout(
    data: LogoutRequest = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Revoke the specified refresh token session or all active sessions for the current user.
    """
    raw_refresh_token = data.refresh_token if data else None
    AuthService.logout_user(
        db=db,
        current_user=current_user,
        raw_refresh_token=raw_refresh_token,
    )
    return MessageResponse(message="Successfully logged out and session revoked")


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current authenticated user profile",
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    """
    Return profile information of the currently authenticated user.
    """
    return current_user
