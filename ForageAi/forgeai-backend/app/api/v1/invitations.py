from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.organization import (
    InvitationActionResponse,
    InvitationPublicResponse,
)
from app.services.organization_service import OrganizationService

router = APIRouter()


@router.get(
    "/{token}",
    response_model=InvitationPublicResponse,
    status_code=status.HTTP_200_OK,
    summary="Get invitation preview by token",
)
def get_invitation_preview(
    token: str,
    db: Session = Depends(get_db),
):
    """
    Public endpoint to view invitation details (organization name, email, role, expiration).
    """
    return OrganizationService.get_invitation_preview(
        db=db, token=token
    )


@router.post(
    "/{token}/accept",
    response_model=InvitationActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Accept organization invitation",
)
def accept_invitation(
    token: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Accept an organization invitation and join as an active member.
    """
    return OrganizationService.accept_invitation(
        db=db, user=current_user, token=token
    )


@router.post(
    "/{token}/reject",
    response_model=InvitationActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Reject organization invitation",
)
def reject_invitation(
    token: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Decline an organization invitation.
    """
    return OrganizationService.reject_invitation(
        db=db, user=current_user, token=token
    )
