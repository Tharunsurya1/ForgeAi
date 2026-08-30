from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import MessageResponse
from app.schemas.organization import (
    MemberInviteRequest,
    MemberRoleUpdateRequest,
    OrganizationCreateRequest,
    OrganizationInvitationResponse,
    OrganizationMemberResponse,
    OrganizationResponse,
    OrganizationUpdateRequest,
    TransferOwnershipRequest,
)
from app.schemas.team import TeamCreateRequest, TeamResponse
from app.services.organization_service import OrganizationService
from app.services.team_service import TeamService

router = APIRouter()


@router.get(
    "",
    response_model=List[OrganizationResponse],
    status_code=status.HTTP_200_OK,
    summary="List organizations for authenticated user",
)
def list_organizations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all organizations/workspaces the authenticated user belongs to.
    """
    return OrganizationService.list_user_organizations(
        db=db, user=current_user
    )


@router.post(
    "",
    response_model=OrganizationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new tenant organization",
)
def create_organization(
    data: OrganizationCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new organization workspace and assign the caller as owner.
    """
    return OrganizationService.create_organization(
        db=db, user=current_user, data=data
    )


@router.get(
    "/{org_id}",
    response_model=OrganizationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get organization details",
)
def get_organization(
    org_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get organization details with membership validation. Enforces tenant isolation.
    """
    org, role = OrganizationService.get_user_organization(
        db=db, user=current_user, org_id=org_id
    )
    return OrganizationResponse(
        id=org.id,
        name=org.name,
        slug=org.slug,
        logo_url=org.logo_url,
        plan_tier=org.plan_tier,
        billing_email=org.billing_email,
        role=role,
        created_at=org.created_at,
        updated_at=org.updated_at,
    )


@router.patch(
    "/{org_id}",
    response_model=OrganizationResponse,
    status_code=status.HTTP_200_OK,
    summary="Update organization details",
)
def update_organization(
    org_id: UUID,
    data: OrganizationUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update organization name, plan tier, logo or billing email. Requires ORG_UPDATE.
    """
    return OrganizationService.update_organization(
        db=db, user=current_user, org_id=org_id, data=data
    )


@router.delete(
    "/{org_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete organization workspace",
)
def delete_organization(
    org_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete entire organization workspace. Requires ORG_DELETE (Owner only).
    """
    OrganizationService.delete_organization(
        db=db, user=current_user, org_id=org_id
    )
    return MessageResponse(message="Organization workspace successfully deleted")


@router.post(
    "/{org_id}/transfer-ownership",
    response_model=OrganizationResponse,
    status_code=status.HTTP_200_OK,
    summary="Transfer organization ownership",
)
def transfer_organization_ownership(
    org_id: UUID,
    data: TransferOwnershipRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Transfer ownership to an active member. Requires ORG_TRANSFER_OWNERSHIP (Owner only).
    """
    return OrganizationService.transfer_ownership(
        db=db, user=current_user, org_id=org_id, data=data
    )


@router.post(
    "/{org_id}/leave",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Leave organization workspace",
)
def leave_organization(
    org_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Leave an organization workspace. Sole owners cannot leave without transferring ownership.
    """
    OrganizationService.leave_organization(
        db=db, user=current_user, org_id=org_id
    )
    return MessageResponse(message="Successfully left organization workspace")


# =========================================================================
# MEMBERS MANAGEMENT ENDPOINTS
# =========================================================================

@router.get(
    "/{org_id}/members",
    response_model=List[OrganizationMemberResponse],
    status_code=status.HTTP_200_OK,
    summary="List organization members",
)
def list_organization_members(
    org_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all members in the organization. Requires MEMBER_VIEW.
    """
    return OrganizationService.list_organization_members(
        db=db, user=current_user, org_id=org_id
    )


@router.patch(
    "/{org_id}/members/{user_id}",
    response_model=OrganizationMemberResponse,
    status_code=status.HTTP_200_OK,
    summary="Update organization member role",
)
def update_organization_member_role(
    org_id: UUID,
    user_id: UUID,
    data: MemberRoleUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update member role (Admin, Member, Viewer). Enforces role hierarchy.
    """
    return OrganizationService.update_member_role(
        db=db,
        user=current_user,
        org_id=org_id,
        target_user_id=user_id,
        data=data,
    )


@router.delete(
    "/{org_id}/members/{user_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Remove member from organization",
)
def remove_organization_member(
    org_id: UUID,
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Remove a member from the workspace and purge team memberships. Requires MEMBER_REMOVE.
    """
    OrganizationService.remove_member(
        db=db, user=current_user, org_id=org_id, target_user_id=user_id
    )
    return MessageResponse(message="Member successfully removed from organization")


# =========================================================================
# INVITATION ENDPOINTS
# =========================================================================

@router.get(
    "/{org_id}/invitations",
    response_model=List[OrganizationInvitationResponse],
    status_code=status.HTTP_200_OK,
    summary="List organization invitations",
)
def list_organization_invitations(
    org_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all pending and historical invitations for the workspace.
    """
    return OrganizationService.list_invitations(
        db=db, user=current_user, org_id=org_id
    )


@router.post(
    "/{org_id}/invitations",
    response_model=OrganizationInvitationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Invite collaborator to organization",
)
def create_organization_invitation(
    org_id: UUID,
    data: MemberInviteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate a secure tokenized invitation with 7-day expiration. Requires MEMBER_INVITE.
    """
    return OrganizationService.create_invitation(
        db=db, user=current_user, org_id=org_id, data=data
    )


@router.post(
    "/{org_id}/members/invite",
    response_model=OrganizationInvitationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Invite member to organization (compat alias)",
)
def invite_organization_member_alias(
    org_id: UUID,
    data: MemberInviteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Backward-compatible alias creating a secure invitation.
    """
    return OrganizationService.create_invitation(
        db=db, user=current_user, org_id=org_id, data=data
    )


@router.delete(
    "/{org_id}/invitations/{invitation_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Revoke organization invitation",
)
def revoke_organization_invitation(
    org_id: UUID,
    invitation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Revoke an active pending invitation.
    """
    OrganizationService.revoke_invitation(
        db=db, user=current_user, org_id=org_id, invitation_id=invitation_id
    )
    return MessageResponse(message="Invitation successfully revoked")


# =========================================================================
# TEAMS UNDER ORG ENDPOINTS
# =========================================================================

@router.get(
    "/{org_id}/teams",
    response_model=List[TeamResponse],
    status_code=status.HTTP_200_OK,
    summary="List teams under organization",
)
def list_organization_teams(
    org_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all teams under the target organization.
    """
    return TeamService.list_teams_for_org(
        db=db, user=current_user, org_id=org_id
    )


@router.post(
    "/{org_id}/teams",
    response_model=TeamResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create team under organization",
)
def create_organization_team(
    org_id: UUID,
    data: TeamCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new team under the organization. Requires TEAM_CREATE.
    """
    return TeamService.create_team(
        db=db, user=current_user, org_id=org_id, data=data
    )
