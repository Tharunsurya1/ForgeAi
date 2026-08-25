from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import MessageResponse
from app.schemas.team import (
    TeamAddMemberRequest,
    TeamMemberResponse,
    TeamResponse,
)
from app.services.team_service import TeamService

router = APIRouter()


@router.get(
    "/{team_id}",
    response_model=TeamResponse,
    status_code=status.HTTP_200_OK,
    summary="Get team details",
)
def get_team(
    team_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get team details. User must belong to the team's organization.
    """
    team = TeamService.get_team_with_access_check(
        db=db, user=current_user, team_id=team_id
    )
    members = TeamService.list_team_members(
        db=db, user=current_user, team_id=team_id
    )
    return TeamResponse(
        id=team.id,
        organization_id=team.organization_id,
        name=team.name,
        description=team.description,
        member_count=len(members),
        created_at=team.created_at,
    )


@router.get(
    "/{team_id}/members",
    response_model=List[TeamMemberResponse],
    status_code=status.HTTP_200_OK,
    summary="List team members",
)
def list_team_members(
    team_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all members in the target team.
    """
    return TeamService.list_team_members(
        db=db, user=current_user, team_id=team_id
    )


@router.post(
    "/{team_id}/members",
    response_model=TeamMemberResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add member to team",
)
def add_team_member(
    team_id: UUID,
    data: TeamAddMemberRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Add an organization member to the team.
    """
    return TeamService.add_team_member(
        db=db,
        user=current_user,
        team_id=team_id,
        target_user_id=data.user_id,
    )


@router.delete(
    "/{team_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete team",
)
def delete_team(
    team_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete a team. Requires owner or admin role in the organization.
    """
    TeamService.delete_team(
        db=db, user=current_user, team_id=team_id
    )
    return MessageResponse(message="Team successfully deleted")
