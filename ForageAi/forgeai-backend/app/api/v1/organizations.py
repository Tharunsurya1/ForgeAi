from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.organization import (
    MemberInviteRequest,
    OrganizationCreateRequest,
    OrganizationMemberResponse,
    OrganizationResponse,
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
    Get organization details with membership validation.
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
    List all members in the organization. Caller must be an organization member.
    """
    return OrganizationService.list_organization_members(
        db=db, user=current_user, org_id=org_id
    )


@router.post(
    "/{org_id}/members/invite",
    response_model=OrganizationMemberResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Invite or add member to organization",
)
def invite_organization_member(
    org_id: UUID,
    data: MemberInviteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Invite or add a user to the organization. Requires owner or admin role.
    """
    return OrganizationService.invite_or_add_member(
        db=db, user=current_user, org_id=org_id, data=data
    )


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
    Create a new team under the organization. Viewers cannot create teams.
    """
    return TeamService.create_team(
        db=db, user=current_user, org_id=org_id, data=data
    )
