from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.ai.blueprint_generator import MultiAgentBlueprintEngine
from app.models.blueprint import Blueprint
from app.models.blueprint_artifact import BlueprintArtifact
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
        project = ProjectService.get_project_by_id(db, project_id, user)

        # Determine version
        existing_blueprint = (
            db.query(Blueprint)
            .filter(Blueprint.project_id == project.id)
            .order_by(Blueprint.current_version.desc())
            .first()
        )
        version = (existing_blueprint.current_version + 1) if existing_blueprint else 1

        # Execute Multi-Agent Generation
        tech_stack = data.tech_stack or project.tech_stack or {}
        title, summary, artifact_specs = MultiAgentBlueprintEngine.generate(
            prompt=data.prompt,
            tech_stack=tech_stack,
            title=data.title or f"{project.name} Architecture Blueprint",
        )

        # Create Blueprint entity
        blueprint = Blueprint(
            project_id=project.id,
            current_version=version,
            title=title,
            summary=summary,
            status="completed",
            metadata_={
                "prompt": data.prompt,
                "engine": "MultiAgentBlueprintEngine v2.0",
                "agents_count": len(artifact_specs),
            },
        )
        db.add(blueprint)
        db.flush()

        # Create Blueprint Artifacts
        artifacts = []
        for spec in artifact_specs:
            artifact = BlueprintArtifact(
                blueprint_id=blueprint.id,
                version=version,
                artifact_type=spec["artifact_type"],
                file_path=spec["file_path"],
                content=spec["content"],
                language=spec["language"],
                file_size_bytes=spec["file_size_bytes"],
            )
            db.add(artifact)
            artifacts.append(artifact)

        db.commit()
        db.refresh(blueprint)
        blueprint.artifacts = artifacts
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
