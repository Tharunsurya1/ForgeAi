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
    def derive_agent_type(artifact_type: str, file_path: str) -> str:
        """Derive standard specialist agent identifier from artifact type and file path."""
        fp = (file_path or "").lower()
        at = (artifact_type or "").lower()
        if at == "supervisor_plan" or "supervisor" in fp:
            return "supervisor"
        if at in ("requirements", "requirements_specification") or "requirements" in fp:
            return "requirements"
        if at in ("business_analysis", "business_analyst") or "business" in fp:
            return "business_analyst"
        if at in ("database", "schema", "erd") or fp.endswith(".sql") or "db/" in fp or "database" in fp:
            return "database"
        if at in ("api", "specification", "openapi") or "openapi" in fp:
            return "api"
        if at == "backend" or "app/main.py" in fp or "backend" in fp:
            return "backend"
        if at == "frontend" or "app.tsx" in fp or "frontend" in fp:
            return "frontend"
        if at in ("ui_ux", "design") or "ui_specs" in fp or "design" in fp:
            return "ui_ux"
        if at in ("security", "security_audit") or "security" in fp:
            return "security"
        if at in ("deployment", "devops") or "docker" in fp or "k8s" in fp or "compose" in fp:
            return "devops"
        if at in ("testing", "tests") or fp.startswith("tests/") or "test" in fp:
            return "testing"
        if at in ("documentation", "docs") or "readme" in fp or "architecture" in fp:
            return "documentation"
        if at in ("code_review", "review") or "review" in fp:
            return "code_review"
        if at in ("optimization", "audit") or "optimization" in fp:
            return "optimization"
        return at or "unknown"

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

        # Validate project access (enforces tenant and project authorization)
        ProjectService.get_project_by_id(db, blueprint.project_id, user)

        # Load artifacts
        artifacts = (
            db.query(BlueprintArtifact)
            .filter(
                BlueprintArtifact.blueprint_id == blueprint.id,
                BlueprintArtifact.version == blueprint.current_version,
            )
            .order_by(BlueprintArtifact.created_at.asc())
            .all()
        )
        for a in artifacts:
            a.agent_type = BlueprintService.derive_agent_type(a.artifact_type, a.file_path)

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
            .order_by(BlueprintArtifact.created_at.asc())
            .all()
        )
        for a in artifacts:
            a.agent_type = BlueprintService.derive_agent_type(a.artifact_type, a.file_path)

        blueprint.artifacts = artifacts
        return blueprint

    @staticmethod
    def get_blueprint_artifacts(
        db: Session,
        blueprint_id: UUID,
        user: User,
        version: Optional[int] = None,
    ) -> dict:
        """
        Fetch all specialist deliverables for a blueprint with multi-tenant project verification.
        """
        blueprint = db.query(Blueprint).filter(Blueprint.id == blueprint_id).first()
        if not blueprint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Blueprint not found",
            )

        # Validate tenant & project authorization
        ProjectService.get_project_by_id(db, blueprint.project_id, user)

        target_version = version if version is not None else blueprint.current_version

        artifacts = (
            db.query(BlueprintArtifact)
            .filter(
                BlueprintArtifact.blueprint_id == blueprint.id,
                BlueprintArtifact.version == target_version,
            )
            .order_by(BlueprintArtifact.created_at.asc())
            .all()
        )

        items = []
        for a in artifacts:
            agent_type = BlueprintService.derive_agent_type(a.artifact_type, a.file_path)
            items.append({
                "id": a.id,
                "blueprint_id": a.blueprint_id,
                "agent_type": agent_type,
                "artifact_type": a.artifact_type,
                "file_path": a.file_path,
                "version": a.version,
                "status": "completed" if blueprint.status == "completed" else blueprint.status,
                "content": a.content,
                "language": a.language,
                "file_size_bytes": a.file_size_bytes,
                "created_at": a.created_at,
                "updated_at": a.created_at,
            })

        return {
            "blueprint_id": blueprint.id,
            "current_version": blueprint.current_version,
            "selected_version": target_version,
            "total_artifacts": len(items),
            "artifacts": items,
        }

