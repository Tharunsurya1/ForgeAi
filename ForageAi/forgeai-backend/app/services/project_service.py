import re
import uuid
from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:
    @staticmethod
    def get_or_create_user_org(db: Session, user: User) -> Organization:
        """
        Retrieve user's primary organization or create a default one if none exists.
        """
        membership = (
            db.query(OrganizationMember)
            .filter(OrganizationMember.user_id == user.id)
            .first()
        )
        if membership:
            org = db.query(Organization).filter(Organization.id == membership.organization_id).first()
            if org:
                return org

        # Fallback creation
        cleaned_slug = re.sub(r"[^a-z0-9]+", "-", user.full_name.lower()).strip("-") or "workspace"
        unique_org_slug = f"{cleaned_slug}-{str(user.id)[:8]}"
        org = Organization(
            name=f"{user.full_name}'s Workspace",
            slug=unique_org_slug,
            plan_tier="free",
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
        return org

    @staticmethod
    def create_project(db: Session, user: User, data: ProjectCreate) -> Project:
        """
        Create a new software project under the target or default organization.
        """
        if data.organization_id:
            # Check user membership in the specified organization
            membership = (
                db.query(OrganizationMember)
                .filter(
                    OrganizationMember.organization_id == data.organization_id,
                    OrganizationMember.user_id == user.id,
                )
                .first()
            )
            if not membership and not user.is_superuser:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User does not have access to this organization",
                )
            target_org_id = data.organization_id
        else:
            org = ProjectService.get_or_create_user_org(db, user)
            target_org_id = org.id

        # Generate unique slug within the organization
        base_slug = re.sub(r"[^a-z0-9]+", "-", data.name.lower()).strip("-") or "project"
        slug = base_slug
        counter = 1
        while db.query(Project).filter(Project.organization_id == target_org_id, Project.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1

        new_project = Project(
            organization_id=target_org_id,
            created_by=user.id,
            name=data.name.strip(),
            slug=slug,
            description=data.description.strip() if data.description else None,
            repository_url=data.repository_url.strip() if data.repository_url else None,
            tech_stack=data.tech_stack or {},
            status="active",
        )
        db.add(new_project)
        db.flush()

        # Add project member
        member = ProjectMember(
            project_id=new_project.id,
            user_id=user.id,
            role="admin",
        )
        db.add(member)
        db.commit()
        db.refresh(new_project)
        return new_project

    @staticmethod
    def list_projects(db: Session, user: User) -> List[Project]:
        """
        Retrieve all projects accessible to the user across member organizations.
        """
        # User's organization IDs
        org_ids = [
            m.organization_id
            for m in db.query(OrganizationMember.organization_id)
            .filter(OrganizationMember.user_id == user.id)
            .all()
        ]

        if not org_ids:
            return []

        projects = (
            db.query(Project)
            .filter(Project.organization_id.in_(org_ids))
            .order_by(Project.created_at.desc())
            .all()
        )
        return projects

    @staticmethod
    def get_project_by_id(db: Session, project_id: UUID, user: User) -> Project:
        """
        Retrieve a single project by ID with tenant security check.
        """
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found",
            )

        # Check tenant access
        membership = (
            db.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == project.organization_id,
                OrganizationMember.user_id == user.id,
            )
            .first()
        )
        if not membership and not user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this project",
            )

        return project

    @staticmethod
    def update_project(db: Session, project_id: UUID, user: User, data: ProjectUpdate) -> Project:
        """
        Update project details.
        """
        project = ProjectService.get_project_by_id(db, project_id, user)
        if data.name is not None:
            project.name = data.name.strip()
        if data.description is not None:
            project.description = data.description.strip()
        if data.tech_stack is not None:
            project.tech_stack = data.tech_stack
        if data.repository_url is not None:
            project.repository_url = data.repository_url.strip()
        if data.status is not None:
            project.status = data.status.strip()

        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def delete_project(db: Session, project_id: UUID, user: User) -> bool:
        """
        Delete a project.
        """
        project = ProjectService.get_project_by_id(db, project_id, user)
        db.delete(project)
        db.commit()
        return True
