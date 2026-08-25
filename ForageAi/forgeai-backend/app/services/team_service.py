from typing import List
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.organization_member import OrganizationMember
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.user import User
from app.schemas.team import (
    TeamCreateRequest,
    TeamMemberResponse,
    TeamResponse,
)
from app.services.organization_service import OrganizationService


class TeamService:
    @staticmethod
    def list_teams_for_org(
        db: Session,
        user: User,
        org_id: UUID,
    ) -> List[TeamResponse]:
        """
        List all teams under a target organization. Enforces tenant isolation.
        """
        OrganizationService.get_user_organization(db=db, user=user, org_id=org_id)

        teams = (
            db.query(Team)
            .filter(Team.organization_id == org_id)
            .order_by(Team.created_at.asc())
            .all()
        )

        results: List[TeamResponse] = []
        for t in teams:
            member_count = (
                db.query(TeamMember)
                .filter(TeamMember.team_id == t.id)
                .count()
            )
            results.append(
                TeamResponse(
                    id=t.id,
                    organization_id=t.organization_id,
                    name=t.name,
                    description=t.description,
                    member_count=member_count,
                    created_at=t.created_at,
                )
            )

        return results

    @staticmethod
    def create_team(
        db: Session,
        user: User,
        org_id: UUID,
        data: TeamCreateRequest,
    ) -> TeamResponse:
        """
        Create a new team under the organization and add creator as initial member.
        Enforces RBAC: Viewers cannot create teams.
        """
        org, role = OrganizationService.get_user_organization(
            db=db, user=user, org_id=org_id
        )

        if role == "viewer" and not user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied: Viewers cannot create teams",
            )

        team = Team(
            organization_id=org_id,
            name=data.name.strip(),
            description=data.description.strip() if data.description else None,
        )
        db.add(team)
        db.flush()

        # Add creator to team members
        initial_member = TeamMember(
            team_id=team.id,
            user_id=user.id,
        )
        db.add(initial_member)
        db.commit()
        db.refresh(team)

        return TeamResponse(
            id=team.id,
            organization_id=team.organization_id,
            name=team.name,
            description=team.description,
            member_count=1,
            created_at=team.created_at,
        )

    @staticmethod
    def get_team_with_access_check(
        db: Session,
        user: User,
        team_id: UUID,
    ) -> Team:
        """
        Retrieve team verifying user has access to its organization.
        """
        team = db.query(Team).filter(Team.id == team_id).first()
        if not team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team not found",
            )

        OrganizationService.get_user_organization(
            db=db, user=user, org_id=team.organization_id
        )

        return team

    @staticmethod
    def list_team_members(
        db: Session,
        user: User,
        team_id: UUID,
    ) -> List[TeamMemberResponse]:
        """
        List all members in a team.
        """
        team = TeamService.get_team_with_access_check(
            db=db, user=user, team_id=team_id
        )

        records = (
            db.query(TeamMember, User)
            .join(User, TeamMember.user_id == User.id)
            .filter(TeamMember.team_id == team.id)
            .order_by(TeamMember.created_at.asc())
            .all()
        )

        results: List[TeamMemberResponse] = []
        for tm, u in records:
            results.append(
                TeamMemberResponse(
                    id=tm.id,
                    team_id=tm.team_id,
                    user_id=tm.user_id,
                    email=u.email,
                    full_name=u.full_name,
                    avatar_url=u.avatar_url,
                    created_at=tm.created_at,
                )
            )

        return results

    @staticmethod
    def add_team_member(
        db: Session,
        user: User,
        team_id: UUID,
        target_user_id: UUID,
    ) -> TeamMemberResponse:
        """
        Add an organization member to a team.
        """
        team = TeamService.get_team_with_access_check(
            db=db, user=user, team_id=team_id
        )

        _, caller_role = OrganizationService.get_user_organization(
            db=db, user=user, org_id=team.organization_id
        )

        if caller_role == "viewer" and not user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied: Viewers cannot manage team members",
            )

        # Target user must be an organization member
        target_org_member = (
            db.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == team.organization_id,
                OrganizationMember.user_id == target_user_id,
            )
            .first()
        )
        if not target_org_member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Target user is not a member of this organization",
            )

        # Check existing team membership
        existing_tm = (
            db.query(TeamMember)
            .filter(
                TeamMember.team_id == team_id,
                TeamMember.user_id == target_user_id,
            )
            .first()
        )
        if existing_tm:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member of this team",
            )

        new_tm = TeamMember(
            team_id=team_id,
            user_id=target_user_id,
        )
        db.add(new_tm)
        db.commit()
        db.refresh(new_tm)

        target_user = db.query(User).filter(User.id == target_user_id).first()

        return TeamMemberResponse(
            id=new_tm.id,
            team_id=new_tm.team_id,
            user_id=new_tm.user_id,
            email=target_user.email,
            full_name=target_user.full_name,
            avatar_url=target_user.avatar_url,
            created_at=new_tm.created_at,
        )

    @staticmethod
    def delete_team(
        db: Session,
        user: User,
        team_id: UUID,
    ) -> None:
        """
        Delete a team. Enforces RBAC: Only organization owners and admins can delete teams.
        """
        team = TeamService.get_team_with_access_check(
            db=db, user=user, team_id=team_id
        )

        _, caller_role = OrganizationService.get_user_organization(
            db=db, user=user, org_id=team.organization_id
        )

        if caller_role not in ["owner", "admin"] and not user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied: Only organization owners and admins can delete teams",
            )

        db.delete(team)
        db.commit()
