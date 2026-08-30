from datetime import datetime, timezone, timedelta
import re
import secrets
from typing import List, Optional, Tuple
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.rbac import (
    OrgRole,
    Permission,
    can_manage_target_role,
    check_permission,
)
from app.models.organization import Organization
from app.models.organization_invitation import OrganizationInvitation
from app.models.organization_member import OrganizationMember
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.user import User
from app.schemas.organization import (
    InvitationActionResponse,
    InvitationPublicResponse,
    MemberInviteRequest,
    MemberRoleUpdateRequest,
    OrganizationCreateRequest,
    OrganizationInvitationResponse,
    OrganizationMemberResponse,
    OrganizationResponse,
    OrganizationUpdateRequest,
    TransferOwnershipRequest,
)


class OrganizationService:
    @staticmethod
    def list_user_organizations(
        db: Session,
        user: User,
    ) -> List[OrganizationResponse]:
        """
        List all tenant organizations that the current user belongs to, including their role.
        """
        memberships = (
            db.query(OrganizationMember)
            .filter(OrganizationMember.user_id == user.id)
            .all()
        )

        if not memberships:
            return []

        org_ids = [m.organization_id for m in memberships]
        orgs = (
            db.query(Organization)
            .filter(Organization.id.in_(org_ids))
            .all()
        )
        org_map = {o.id: o for o in orgs}

        results: List[OrganizationResponse] = []
        for m in memberships:
            org = org_map.get(m.organization_id)
            if org:
                resp = OrganizationResponse(
                    id=org.id,
                    name=org.name,
                    slug=org.slug,
                    logo_url=org.logo_url,
                    plan_tier=org.plan_tier,
                    billing_email=org.billing_email,
                    role=m.role,
                    created_at=org.created_at,
                    updated_at=org.updated_at,
                )
                results.append(resp)

        return results

    @staticmethod
    def create_organization(
        db: Session,
        user: User,
        data: OrganizationCreateRequest,
    ) -> OrganizationResponse:
        """
        Create a new tenant organization workspace and assign the creator as owner.
        """
        cleaned_slug = re.sub(r"[^a-z0-9]+", "-", data.name.lower()).strip("-") or "workspace"
        unique_slug = f"{cleaned_slug}-{secrets.token_hex(4)}"

        org = Organization(
            name=data.name.strip(),
            slug=unique_slug,
            plan_tier=data.plan_tier or "free",
            billing_email=user.email,
        )
        db.add(org)
        db.flush()

        member = OrganizationMember(
            organization_id=org.id,
            user_id=user.id,
            role=OrgRole.OWNER.value,
        )
        db.add(member)
        db.commit()
        db.refresh(org)

        return OrganizationResponse(
            id=org.id,
            name=org.name,
            slug=org.slug,
            logo_url=org.logo_url,
            plan_tier=org.plan_tier,
            billing_email=org.billing_email,
            role=OrgRole.OWNER.value,
            created_at=org.created_at,
            updated_at=org.updated_at,
        )

    @staticmethod
    def get_user_organization(
        db: Session,
        user: User,
        org_id: UUID,
    ) -> Tuple[Organization, str]:
        """
        Retrieve an organization verifying that the user is an active member.
        Enforces strict tenant isolation (zero cross-tenant access).
        """
        org = db.query(Organization).filter(Organization.id == org_id).first()
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found",
            )

        if user.is_superuser:
            return org, OrgRole.OWNER.value

        membership = (
            db.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == org_id,
                OrganizationMember.user_id == user.id,
            )
            .first()
        )

        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You are not a member of this organization",
            )

        return org, membership.role

    @staticmethod
    def update_organization(
        db: Session,
        user: User,
        org_id: UUID,
        data: OrganizationUpdateRequest,
    ) -> OrganizationResponse:
        """
        Update organization settings (name, logo, plan tier, billing email).
        Requires ORG_UPDATE permission.
        """
        org, caller_role = OrganizationService.get_user_organization(
            db=db, user=user, org_id=org_id
        )
        check_permission(
            role=caller_role,
            permission=Permission.ORG_UPDATE,
            is_superuser=user.is_superuser,
        )

        if data.name is not None:
            org.name = data.name.strip()
        if data.logo_url is not None:
            org.logo_url = data.logo_url.strip() or None
        if data.plan_tier is not None:
            org.plan_tier = data.plan_tier
        if data.billing_email is not None:
            org.billing_email = data.billing_email

        db.commit()
        db.refresh(org)

        return OrganizationResponse(
            id=org.id,
            name=org.name,
            slug=org.slug,
            logo_url=org.logo_url,
            plan_tier=org.plan_tier,
            billing_email=org.billing_email,
            role=caller_role,
            created_at=org.created_at,
            updated_at=org.updated_at,
        )

    @staticmethod
    def delete_organization(
        db: Session,
        user: User,
        org_id: UUID,
    ) -> None:
        """
        Delete an entire organization workspace. Requires ORG_DELETE (Owner only).
        """
        org, caller_role = OrganizationService.get_user_organization(
            db=db, user=user, org_id=org_id
        )
        check_permission(
            role=caller_role,
            permission=Permission.ORG_DELETE,
            is_superuser=user.is_superuser,
            custom_error_message="Permission denied: Only organization owners can delete the organization",
        )

        db.delete(org)
        db.commit()

    @staticmethod
    def transfer_ownership(
        db: Session,
        user: User,
        org_id: UUID,
        data: TransferOwnershipRequest,
    ) -> OrganizationResponse:
        """
        Transfer ownership of the organization to another active member.
        The current owner is converted to an Admin.
        """
        org, caller_role = OrganizationService.get_user_organization(
            db=db, user=user, org_id=org_id
        )
        check_permission(
            role=caller_role,
            permission=Permission.ORG_TRANSFER_OWNERSHIP,
            is_superuser=user.is_superuser,
            custom_error_message="Permission denied: Only organization owners can transfer ownership",
        )

        if user.id == data.new_owner_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already the owner of this organization",
            )

        # Verify new owner is an active member
        target_membership = (
            db.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == org_id,
                OrganizationMember.user_id == data.new_owner_user_id,
            )
            .first()
        )
        if not target_membership:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target user is not a member of this organization",
            )

        # Get caller's membership
        caller_membership = (
            db.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == org_id,
                OrganizationMember.user_id == user.id,
            )
            .first()
        )

        if caller_membership:
            caller_membership.role = OrgRole.ADMIN.value
        target_membership.role = OrgRole.OWNER.value

        db.commit()
        db.refresh(org)

        return OrganizationResponse(
            id=org.id,
            name=org.name,
            slug=org.slug,
            logo_url=org.logo_url,
            plan_tier=org.plan_tier,
            billing_email=org.billing_email,
            role=OrgRole.ADMIN.value if caller_membership else OrgRole.OWNER.value,
            created_at=org.created_at,
            updated_at=org.updated_at,
        )

    @staticmethod
    def list_organization_members(
        db: Session,
        user: User,
        org_id: UUID,
    ) -> List[OrganizationMemberResponse]:
        """
        List all members in the organization. Requires MEMBER_VIEW permission.
        """
        org, caller_role = OrganizationService.get_user_organization(
            db=db, user=user, org_id=org_id
        )
        check_permission(
            role=caller_role,
            permission=Permission.MEMBER_VIEW,
            is_superuser=user.is_superuser,
        )

        records = (
            db.query(OrganizationMember, User)
            .join(User, OrganizationMember.user_id == User.id)
            .filter(OrganizationMember.organization_id == org_id)
            .order_by(OrganizationMember.created_at.asc())
            .all()
        )

        results: List[OrganizationMemberResponse] = []
        for member, u in records:
            results.append(
                OrganizationMemberResponse(
                    id=member.id,
                    organization_id=member.organization_id,
                    user_id=member.user_id,
                    role=member.role,
                    email=u.email,
                    full_name=u.full_name,
                    avatar_url=u.avatar_url,
                    created_at=member.created_at,
                )
            )

        return results

    @staticmethod
    def update_member_role(
        db: Session,
        user: User,
        org_id: UUID,
        target_user_id: UUID,
        data: MemberRoleUpdateRequest,
    ) -> OrganizationMemberResponse:
        """
        Update the role of an organization member.
        Enforces RBAC hierarchy and protects owner/last admin.
        """
        org, caller_role = OrganizationService.get_user_organization(
            db=db, user=user, org_id=org_id
        )
        check_permission(
            role=caller_role,
            permission=Permission.MEMBER_CHANGE_ROLE,
            is_superuser=user.is_superuser,
        )

        target_member = (
            db.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == org_id,
                OrganizationMember.user_id == target_user_id,
            )
            .first()
        )
        if not target_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Member not found in this organization",
            )

        # Cannot modify owner's role through update_member_role
        if target_member.role == OrgRole.OWNER.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot change the role of the organization owner. Use transfer ownership instead.",
            )

        # Only owners/superusers can promote someone to owner or modify admin roles
        if data.role == OrgRole.OWNER.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot assign owner role directly. Use transfer ownership endpoint.",
            )

        if target_member.role == OrgRole.ADMIN.value and caller_role != OrgRole.OWNER.value and not user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied: Only organization owners can modify administrator roles",
            )

        # Hierarchy check: caller must have strictly higher role than target
        if not can_manage_target_role(caller_role, target_member.role, is_superuser=user.is_superuser):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied: You cannot modify members with equal or higher roles",
            )

        target_member.role = data.role
        db.commit()
        db.refresh(target_member)

        target_user = db.query(User).filter(User.id == target_user_id).first()

        return OrganizationMemberResponse(
            id=target_member.id,
            organization_id=target_member.organization_id,
            user_id=target_member.user_id,
            role=target_member.role,
            email=target_user.email if target_user else "",
            full_name=target_user.full_name if target_user else "",
            avatar_url=target_user.avatar_url if target_user else None,
            created_at=target_member.created_at,
        )

    @staticmethod
    def remove_member(
        db: Session,
        user: User,
        org_id: UUID,
        target_user_id: UUID,
    ) -> None:
        """
        Remove a member from the organization and clean up all team memberships in that org.
        Enforces RBAC: Owner cannot be removed. Admins can only remove Members and Viewers.
        """
        org, caller_role = OrganizationService.get_user_organization(
            db=db, user=user, org_id=org_id
        )
        check_permission(
            role=caller_role,
            permission=Permission.MEMBER_REMOVE,
            is_superuser=user.is_superuser,
        )

        target_member = (
            db.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == org_id,
                OrganizationMember.user_id == target_user_id,
            )
            .first()
        )
        if not target_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Member not found in this organization",
            )

        if target_member.role == OrgRole.OWNER.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove the organization owner. Transfer ownership or delete the organization.",
            )

        # Hierarchy check
        if not can_manage_target_role(caller_role, target_member.role, is_superuser=user.is_superuser):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied: You cannot remove members with equal or higher roles",
            )

        # Clean up all team memberships for this user within this organization
        org_teams = db.query(Team.id).filter(Team.organization_id == org_id).all()
        org_team_ids = [t[0] for t in org_teams]
        if org_team_ids:
            db.query(TeamMember).filter(
                TeamMember.team_id.in_(org_team_ids),
                TeamMember.user_id == target_user_id,
            ).delete(synchronize_session=False)

        db.delete(target_member)
        db.commit()

    @staticmethod
    def leave_organization(
        db: Session,
        user: User,
        org_id: UUID,
    ) -> None:
        """
        Leave an organization workspace. Sole owners cannot leave without transferring ownership.
        """
        org, caller_role = OrganizationService.get_user_organization(
            db=db, user=user, org_id=org_id
        )

        if caller_role == OrgRole.OWNER.value and not user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organization owner cannot leave the workspace. Transfer ownership or delete the workspace.",
            )

        member = (
            db.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == org_id,
                OrganizationMember.user_id == user.id,
            )
            .first()
        )
        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Membership record not found",
            )

        # Clean up team memberships
        org_teams = db.query(Team.id).filter(Team.organization_id == org_id).all()
        org_team_ids = [t[0] for t in org_teams]
        if org_team_ids:
            db.query(TeamMember).filter(
                TeamMember.team_id.in_(org_team_ids),
                TeamMember.user_id == user.id,
            ).delete(synchronize_session=False)

        db.delete(member)
        db.commit()

    # =========================================================================
    # INVITATION LIFECYCLE MANAGEMENT
    # =========================================================================

    @staticmethod
    def create_invitation(
        db: Session,
        user: User,
        org_id: UUID,
        data: MemberInviteRequest,
    ) -> OrganizationInvitationResponse:
        """
        Create a secure tokenized invitation with 7-day expiration.
        Requires MEMBER_INVITE permission.
        """
        org, caller_role = OrganizationService.get_user_organization(
            db=db, user=user, org_id=org_id
        )
        check_permission(
            role=caller_role,
            permission=Permission.MEMBER_INVITE,
            is_superuser=user.is_superuser,
            custom_error_message="Permission denied: Only organization owners and admins can invite members",
        )

        target_email = data.email.strip().lower()

        # Check if already an active member of this organization
        existing_user = db.query(User).filter(func.lower(User.email) == target_email).first()
        if existing_user:
            existing_member = (
                db.query(OrganizationMember)
                .filter(
                    OrganizationMember.organization_id == org_id,
                    OrganizationMember.user_id == existing_user.id,
                )
                .first()
            )
            if existing_member:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User is already an active member of this organization",
                )

        now = datetime.now(timezone.utc)

        # Check for active pending non-expired invitation
        active_invite = (
            db.query(OrganizationInvitation)
            .filter(
                OrganizationInvitation.organization_id == org_id,
                func.lower(OrganizationInvitation.email) == target_email,
                OrganizationInvitation.status == "pending",
                OrganizationInvitation.expires_at > now,
            )
            .first()
        )
        if active_invite:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An active pending invitation has already been sent to this email address",
            )

        token = secrets.token_urlsafe(32)
        expires_at = now + timedelta(days=7)

        invitation = OrganizationInvitation(
            organization_id=org_id,
            email=target_email,
            role=data.role,
            token=token,
            status="pending",
            invited_by=user.id,
            expires_at=expires_at,
        )
        db.add(invitation)
        db.commit()
        db.refresh(invitation)

        return OrganizationInvitationResponse(
            id=invitation.id,
            organization_id=invitation.organization_id,
            organization_name=org.name,
            email=invitation.email,
            role=invitation.role,
            token=invitation.token,
            status=invitation.status,
            invited_by=invitation.invited_by,
            expires_at=invitation.expires_at,
            created_at=invitation.created_at,
        )

    @staticmethod
    def list_invitations(
        db: Session,
        user: User,
        org_id: UUID,
    ) -> List[OrganizationInvitationResponse]:
        """
        List all invitations for an organization.
        Requires MEMBER_VIEW permission.
        """
        org, caller_role = OrganizationService.get_user_organization(
            db=db, user=user, org_id=org_id
        )
        check_permission(
            role=caller_role,
            permission=Permission.MEMBER_VIEW,
            is_superuser=user.is_superuser,
        )

        now = datetime.now(timezone.utc)

        # Mark expired invitations
        expired_invites = (
            db.query(OrganizationInvitation)
            .filter(
                OrganizationInvitation.organization_id == org_id,
                OrganizationInvitation.status == "pending",
                OrganizationInvitation.expires_at <= now,
            )
            .all()
        )
        if expired_invites:
            for inv in expired_invites:
                inv.status = "expired"
            db.commit()

        invites = (
            db.query(OrganizationInvitation)
            .filter(OrganizationInvitation.organization_id == org_id)
            .order_by(OrganizationInvitation.created_at.desc())
            .all()
        )

        return [
            OrganizationInvitationResponse(
                id=inv.id,
                organization_id=inv.organization_id,
                organization_name=org.name,
                email=inv.email,
                role=inv.role,
                token=inv.token,
                status=inv.status,
                invited_by=inv.invited_by,
                expires_at=inv.expires_at,
                created_at=inv.created_at,
            )
            for inv in invites
        ]

    @staticmethod
    def revoke_invitation(
        db: Session,
        user: User,
        org_id: UUID,
        invitation_id: UUID,
    ) -> None:
        """
        Revoke an active invitation. Requires MEMBER_INVITE permission.
        """
        org, caller_role = OrganizationService.get_user_organization(
            db=db, user=user, org_id=org_id
        )
        check_permission(
            role=caller_role,
            permission=Permission.MEMBER_INVITE,
            is_superuser=user.is_superuser,
        )

        invitation = (
            db.query(OrganizationInvitation)
            .filter(
                OrganizationInvitation.id == invitation_id,
                OrganizationInvitation.organization_id == org_id,
            )
            .first()
        )
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found",
            )

        if invitation.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot revoke invitation with status '{invitation.status}'",
            )

        invitation.status = "revoked"
        db.commit()

    @staticmethod
    def get_invitation_preview(
        db: Session,
        token: str,
    ) -> InvitationPublicResponse:
        """
        Get invitation preview by token.
        """
        invitation = (
            db.query(OrganizationInvitation)
            .filter(OrganizationInvitation.token == token)
            .first()
        )
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid or expired invitation token",
            )

        now = datetime.now(timezone.utc)
        is_expired = invitation.expires_at <= now or invitation.status in ["expired", "revoked", "accepted", "rejected"]

        if invitation.status == "pending" and invitation.expires_at <= now:
            invitation.status = "expired"
            db.commit()

        org = db.query(Organization).filter(Organization.id == invitation.organization_id).first()

        return InvitationPublicResponse(
            id=invitation.id,
            organization_id=invitation.organization_id,
            organization_name=org.name if org else "Workspace",
            organization_slug=org.slug if org else "",
            email=invitation.email,
            role=invitation.role,
            expires_at=invitation.expires_at,
            is_expired=is_expired,
        )

    @staticmethod
    def accept_invitation(
        db: Session,
        user: User,
        token: str,
    ) -> InvitationActionResponse:
        """
        Accept an invitation and add the authenticated user as an organization member.
        """
        invitation = (
            db.query(OrganizationInvitation)
            .filter(OrganizationInvitation.token == token)
            .first()
        )
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid invitation token",
            )

        now = datetime.now(timezone.utc)
        if invitation.status != "pending" or invitation.expires_at <= now:
            if invitation.status == "pending":
                invitation.status = "expired"
                db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invitation is invalid, expired, or has already been used",
            )

        # Check existing membership
        existing_member = (
            db.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == invitation.organization_id,
                OrganizationMember.user_id == user.id,
            )
            .first()
        )

        if not existing_member:
            new_member = OrganizationMember(
                organization_id=invitation.organization_id,
                user_id=user.id,
                role=invitation.role,
            )
            db.add(new_member)

        invitation.status = "accepted"
        db.commit()

        return InvitationActionResponse(
            message="Invitation successfully accepted. Welcome to the organization!",
            organization_id=invitation.organization_id,
            role=invitation.role,
        )

    @staticmethod
    def reject_invitation(
        db: Session,
        user: User,
        token: str,
    ) -> InvitationActionResponse:
        """
        Reject an invitation.
        """
        invitation = (
            db.query(OrganizationInvitation)
            .filter(OrganizationInvitation.token == token)
            .first()
        )
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid invitation token",
            )

        if invitation.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invitation has already been processed or expired",
            )

        invitation.status = "rejected"
        db.commit()

        return InvitationActionResponse(
            message="Invitation successfully declined",
            organization_id=invitation.organization_id,
            role=invitation.role,
        )
