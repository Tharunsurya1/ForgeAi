import re
import uuid
from typing import List, Optional, Tuple
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
from app.models.user import User
from app.schemas.organization import (
    MemberInviteRequest,
    OrganizationCreateRequest,
    OrganizationMemberResponse,
    OrganizationResponse,
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
        unique_slug = f"{cleaned_slug}-{uuid.uuid4().hex[:8]}"

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
            role="owner",
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
            role="owner",
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
        Enforces tenant isolation.
        """
        org = db.query(Organization).filter(Organization.id == org_id).first()
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found",
            )

        if user.is_superuser:
            return org, "owner"

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
    def list_organization_members(
        db: Session,
        user: User,
        org_id: UUID,
    ) -> List[OrganizationMemberResponse]:
        """
        List all members in the organization. Requires caller to be an organization member.
        """
        # Tenant isolation check
        OrganizationService.get_user_organization(db=db, user=user, org_id=org_id)

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
    def invite_or_add_member(
        db: Session,
        user: User,
        org_id: UUID,
        data: MemberInviteRequest,
    ) -> OrganizationMemberResponse:
        """
        Invite or add a user to the organization with assigned role.
        Enforces RBAC: Only organization owner or admin can invite members.
        """
        org, caller_role = OrganizationService.get_user_organization(
            db=db, user=user, org_id=org_id
        )

        if caller_role not in ["owner", "admin"] and not user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied: Only organization owners and admins can invite members",
            )

        target_email = data.email.strip().lower()

        # Find or create user
        target_user = (
            db.query(User)
            .filter(User.email == target_email)
            .first()
        )

        if not target_user:
            target_user = User(
                email=target_email,
                full_name=target_email.split("@")[0].capitalize(),
                is_active=True,
                is_superuser=False,
                email_verified=False,
                mfa_enabled=False,
            )
            db.add(target_user)
            db.flush()

        # Check existing membership
        existing = (
            db.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == org_id,
                OrganizationMember.user_id == target_user.id,
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member of this organization",
            )

        new_membership = OrganizationMember(
            organization_id=org_id,
            user_id=target_user.id,
            role=data.role,
        )
        db.add(new_membership)
        db.commit()
        db.refresh(new_membership)

        return OrganizationMemberResponse(
            id=new_membership.id,
            organization_id=new_membership.organization_id,
            user_id=new_membership.user_id,
            role=new_membership.role,
            email=target_user.email,
            full_name=target_user.full_name,
            avatar_url=target_user.avatar_url,
            created_at=new_membership.created_at,
        )
