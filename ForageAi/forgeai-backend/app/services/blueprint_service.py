from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.ai.blueprint_generator import MultiAgentBlueprintEngine
from app.core.rbac import OrgRole, Permission, check_permission
from app.models.blueprint import Blueprint
from app.models.blueprint_artifact import BlueprintArtifact
from app.models.organization_member import OrganizationMember
from app.models.user import User
from app.schemas.blueprint import BlueprintGenerateRequest
from app.services.project_service import ProjectService


class BlueprintService:
    @staticmethod
    def generate_and_save_blueprint(
        db: Session,
        project_id: UUID,
        user: User,
        data: BlueprintGenerateRequest,
    ) -> Blueprint:
        """
        Generate software blueprint artifacts via AI Multi-Agent engine and persist to PostgreSQL.
        """
        # Delegate to WorkflowOrchestratorService with full 14-Agent LangGraph execution and PostgreSQL persistence
        from app.services.workflow_service import WorkflowOrchestratorService
        blueprint, _ = WorkflowOrchestratorService.execute_blueprint_workflow(
            db=db,
            project_id=project_id,
            user=user,
            data=data,
        )
        return blueprint


    @staticmethod
    def get_blueprint_by_id(db: Session, blueprint_id: UUID, user: User) -> Blueprint:
        """
        Retrieve blueprint and its persisted artifacts.
        """
        blueprint = db.query(Blueprint).filter(Blueprint.id == blueprint_id).first()
        if not blueprint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Blueprint not found",
            )

        # Validate project access
        ProjectService.get_project_by_id(db, blueprint.project_id, user)

        # Load artifacts
        artifacts = (
            db.query(BlueprintArtifact)
            .filter(
                BlueprintArtifact.blueprint_id == blueprint.id,
                BlueprintArtifact.version == blueprint.current_version,
            )
            .all()
        )
        blueprint.artifacts = artifacts
        return blueprint

    @staticmethod
    def get_latest_project_blueprint(db: Session, project_id: UUID, user: User) -> Optional[Blueprint]:
        """
        Retrieve the most recent blueprint for a project.
        """
        project = ProjectService.get_project_by_id(db, project_id, user)
        blueprint = (
            db.query(Blueprint)
            .filter(Blueprint.project_id == project.id)
            .order_by(Blueprint.current_version.desc())
            .first()
        )
        if not blueprint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No blueprint found for this project",
            )

        artifacts = (
            db.query(BlueprintArtifact)
            .filter(
                BlueprintArtifact.blueprint_id == blueprint.id,
                BlueprintArtifact.version == blueprint.current_version,
            )
            .all()
        )
        blueprint.artifacts = artifacts
        return blueprint
