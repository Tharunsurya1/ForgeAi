from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.rbac import (
    OrgRole,
    Permission,
    check_permission,
)
from app.models.organization_member import OrganizationMember
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.user import User
from app.schemas.team import (
    TeamAddMemberRequest,
    TeamCreateRequest,
    TeamMemberResponse,
    TeamResponse,
    TeamUpdateRequest,
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
        List all teams under a target organization. Enforces tenant isolation and TEAM_VIEW permission.
        """
        org, caller_role = OrganizationService.get_user_organization(
            db=db, user=user, org_id=org_id
        )
        check_permission(
            role=caller_role,
            permission=Permission.TEAM_VIEW,
            is_superuser=user.is_superuser,
        )

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
                    updated_at=t.updated_at,
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
        Enforces RBAC (TEAM_CREATE) and name uniqueness per organization.
        """
        org, caller_role = OrganizationService.get_user_organization(
            db=db, user=user, org_id=org_id
        )
        check_permission(
            role=caller_role,
            permission=Permission.TEAM_CREATE,
            is_superuser=user.is_superuser,
            custom_error_message="Permission denied: Viewers cannot create teams",
        )

        team_name = data.name.strip()

        # Check unique team name within this organization
        existing_team = (
            db.query(Team)
            .filter(
                Team.organization_id == org_id,
                Team.name.ilike(team_name),
            )
            .first()
        )
        if existing_team:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Team with name '{team_name}' already exists in this organization",
            )

        team = Team(
            organization_id=org_id,
            name=team_name,
            description=data.description.strip() if data.description else None,
        )
        db.add(team)
        db.flush()

        # Add creator as initial team member
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
            updated_at=team.updated_at,
        )

    @staticmethod
    def get_team_with_access_check(
        db: Session,
        user: User,
        team_id: UUID,
    ) -> Team:
        """
        Retrieve team verifying user has access to its organization.
        Enforces strict tenant isolation.
        """
        team = db.query(Team).filter(Team.id == team_id).first()
        if not team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team not found",
            )

        # Validates that user belongs to the parent organization
        OrganizationService.get_user_organization(
            db=db, user=user, org_id=team.organization_id
        )

        return team

    @staticmethod
    def update_team(
        db: Session,
        user: User,
        team_id: UUID,
        data: TeamUpdateRequest,
    ) -> TeamResponse:
        """
        Update team details (name, description).
        Requires TEAM_UPDATE permission.
        """
        team = TeamService.get_team_with_access_check(
            db=db, user=user, team_id=team_id
        )
        _, caller_role = OrganizationService.get_user_organization(
            db=db, user=user, org_id=team.organization_id
        )
        check_permission(
            role=caller_role,
            permission=Permission.TEAM_UPDATE,
            is_superuser=user.is_superuser,
        )

        if data.name is not None:
            new_name = data.name.strip()
            # Check unique name conflict with another team
            existing_team = (
                db.query(Team)
                .filter(
                    Team.organization_id == team.organization_id,
                    Team.id != team.id,
                    Team.name.ilike(new_name),
                )
                .first()
            )
            if existing_team:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Another team named '{new_name}' already exists in this organization",
                )
            team.name = new_name

        if data.description is not None:
            team.description = data.description.strip() or None

        db.commit()
        db.refresh(team)

        member_count = (
            db.query(TeamMember)
            .filter(TeamMember.team_id == team.id)
            .count()
        )

        return TeamResponse(
            id=team.id,
            organization_id=team.organization_id,
            name=team.name,
            description=team.description,
            member_count=member_count,
            created_at=team.created_at,
            updated_at=team.updated_at,
        )

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
        Enforces: Target user MUST be an active member of the parent organization.
        """
        team = TeamService.get_team_with_access_check(
            db=db, user=user, team_id=team_id
        )

        _, caller_role = OrganizationService.get_user_organization(
            db=db, user=user, org_id=team.organization_id
        )

        check_permission(
            role=caller_role,
            permission=Permission.TEAM_MANAGE_MEMBERS,
            is_superuser=user.is_superuser,
            custom_error_message="Permission denied: You do not have permission to manage team members",
        )

        # Target user must be an active organization member
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
            email=target_user.email if target_user else "",
            full_name=target_user.full_name if target_user else "",
            avatar_url=target_user.avatar_url if target_user else None,
            created_at=new_tm.created_at,
        )

    @staticmethod
    def remove_team_member(
        db: Session,
        user: User,
        team_id: UUID,
        target_user_id: UUID,
    ) -> None:
        """
        Remove a user from a team.
        Admins and owners can remove anyone; members can remove themselves.
        """
        team = TeamService.get_team_with_access_check(
            db=db, user=user, team_id=team_id
        )

        _, caller_role = OrganizationService.get_user_organization(
            db=db, user=user, org_id=team.organization_id
        )

        is_self_removal = user.id == target_user_id

        if not is_self_removal:
            check_permission(
                role=caller_role,
                permission=Permission.TEAM_MANAGE_MEMBERS,
                is_superuser=user.is_superuser,
                custom_error_message="Permission denied: You do not have permission to remove team members",
            )

        tm = (
            db.query(TeamMember)
            .filter(
                TeamMember.team_id == team_id,
                TeamMember.user_id == target_user_id,
            )
            .first()
        )
        if not tm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team member not found",
            )

        db.delete(tm)
        db.commit()

    @staticmethod
    def delete_team(
        db: Session,
        user: User,
        team_id: UUID,
    ) -> None:
        """
        Delete a team. Enforces RBAC: Requires TEAM_DELETE permission.
        """
        team = TeamService.get_team_with_access_check(
            db=db, user=user, team_id=team_id
        )

        _, caller_role = OrganizationService.get_user_organization(
            db=db, user=user, org_id=team.organization_id
        )

        check_permission(
            role=caller_role,
            permission=Permission.TEAM_DELETE,
            is_superuser=user.is_superuser,
            custom_error_message="Permission denied: Only organization owners and admins can delete teams",
        )

        db.delete(team)
        db.commit()
