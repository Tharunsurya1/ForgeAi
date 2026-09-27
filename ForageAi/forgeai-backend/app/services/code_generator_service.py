import io
import re
import uuid
import zipfile
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.blueprint import Blueprint
from app.models.blueprint_artifact import BlueprintArtifact
from app.models.user import User
from app.schemas.code_generator import CodeFileItem, CodeGenerateResponse
from app.services.project_service import ProjectService


class CodeGeneratorService:
    @staticmethod
    def generate_project_scaffold(
        db: Session,
        blueprint_id: UUID,
        user: User,
        version: Optional[int] = None,
    ) -> CodeGenerateResponse:
        """
        Synthesize a production-ready, downloadable full-stack software scaffold
        from the persisted specialist agent artifacts of an approved blueprint.
        """
        blueprint = db.query(Blueprint).filter(Blueprint.id == blueprint_id).first()
        if not blueprint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Blueprint not found",
            )

        # Validate tenant & project authorization
        project = ProjectService.get_project_by_id(db, blueprint.project_id, user)

        target_version = version if version is not None else blueprint.current_version

        # Load all persisted specialist artifacts for this blueprint & version
        artifacts = (
            db.query(BlueprintArtifact)
            .filter(
                BlueprintArtifact.blueprint_id == blueprint.id,
                BlueprintArtifact.version == target_version,
            )
            .order_by(BlueprintArtifact.created_at.asc())
            .all()
        )

        if not artifacts:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No specialist artifacts found for this blueprint version. Ensure workflow execution has completed.",
            )

        file_items: Dict[str, CodeFileItem] = {}

        # 1. Map existing specialist artifacts into project scaffold paths
        for art in artifacts:
            rel_path = art.file_path
            # Normalize path prefixes to build clean project hierarchy
            if rel_path.startswith("app/") or rel_path.startswith("backend/"):
                normalized_path = f"backend/{rel_path.replace('backend/', '')}"
            elif rel_path.startswith("src/") or rel_path.startswith("frontend/"):
                normalized_path = f"frontend/{rel_path.replace('frontend/', '')}"
            else:
                normalized_path = rel_path

            dir_name = "/".join(normalized_path.split("/")[:-1]) or "."
            file_name = normalized_path.split("/")[-1]

            file_items[normalized_path] = CodeFileItem(
                path=normalized_path,
                name=file_name,
                directory=dir_name,
                content=art.content,
                language=art.language,
                size_bytes=len(art.content.encode("utf-8")),
                source="artifact",
                artifact_type=art.artifact_type,
            )

        # 2. Add standard scaffold files to ensure project is buildable & runnable
        project_slug = project.slug or "forgeai-project"
        clean_title = blueprint.title or project.name

        # Backend scaffolding
        if not any(p.startswith("backend/") for p in file_items):
            # If backend was mapped without prefix
            pass

        # backend requirements.txt
        if "backend/requirements.txt" not in file_items:
            reqs_content = (
                "fastapi>=0.115.0\n"
                "uvicorn[standard]>=0.30.0\n"
                "pydantic>=2.9.0\n"
                "pydantic-settings>=2.5.0\n"
                "sqlalchemy>=2.0.35\n"
                "psycopg2-binary>=2.9.9\n"
                "alembic>=1.13.0\n"
                "httpx>=0.27.0\n"
                "pytest>=8.3.0\n"
            )
            file_items["backend/requirements.txt"] = CodeFileItem(
                path="backend/requirements.txt",
                name="requirements.txt",
                directory="backend",
                content=reqs_content,
                language="text",
                size_bytes=len(reqs_content.encode("utf-8")),
                source="scaffold",
            )

        # backend config.py
        if "backend/app/core/config.py" not in file_items:
            config_content = (
                '"""Application Configuration."""\n'
                "from pydantic_settings import BaseSettings\n\n"
                "class Settings(BaseSettings):\n"
                f'    PROJECT_NAME: str = "{clean_title}"\n'
                '    API_V1_STR: str = "/api/v1"\n'
                f'    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/{project_slug}"\n\n'
                "    class Config:\n"
                '        env_file = ".env"\n'
                "        case_sensitive = True\n\n"
                "settings = Settings()\n"
            )
            file_items["backend/app/core/config.py"] = CodeFileItem(
                path="backend/app/core/config.py",
                name="config.py",
                directory="backend/app/core",
                content=config_content,
                language="python",
                size_bytes=len(config_content.encode("utf-8")),
                source="scaffold",
            )

        # backend package init files
        for init_path in [
            "backend/app/__init__.py",
            "backend/app/api/__init__.py",
            "backend/app/core/__init__.py",
            "backend/app/models/__init__.py",
            "backend/app/schemas/__init__.py",
        ]:
            if init_path not in file_items:
                dir_part = "/".join(init_path.split("/")[:-1])
                init_content = f'"""Package {dir_part.replace("/", ".")}."""\n'
                file_items[init_path] = CodeFileItem(
                    path=init_path,
                    name="__init__.py",
                    directory=dir_part,
                    content=init_content,
                    language="python",
                    size_bytes=len(init_content.encode("utf-8")),
                    source="scaffold",
                )

        # Root README.md scaffold if not already present
        if "README.md" not in file_items:
            readme_content = (
                f"# {clean_title}\n\n"
                f"Generated by ForgeAI Autonomous Engineering Studio.\n\n"
                "## Project Structure\n"
                "- `backend/`: FastAPI application server and database models\n"
                "- `frontend/`: Next.js / React application\n"
                "- `db/`: Database migrations and SQL schema\n\n"
                "## Getting Started\n"
                "1. Configure environment variables in `.env`\n"
                "2. Run services with `docker-compose up -d`\n"
            )
            file_items["README.md"] = CodeFileItem(
                path="README.md",
                name="README.md",
                directory=".",
                content=readme_content,
                language="markdown",
                size_bytes=len(readme_content.encode("utf-8")),
                source="scaffold",
            )

        # frontend package.json
        if "frontend/package.json" not in file_items:
            pkg_content = (
                "{\n"
                f'  "name": "{project_slug}-frontend",\n'
                '  "version": "0.1.0",\n'
                '  "private": true,\n'
                '  "scripts": {\n'
                '    "dev": "next dev",\n'
                '    "build": "next build",\n'
                '    "start": "next start"\n'
                "  },\n"
                '  "dependencies": {\n'
                '    "react": "^19.0.0",\n'
                '    "react-dom": "^19.0.0",\n'
                '    "next": "15.0.0",\n'
                '    "lucide-react": "^0.460.0",\n'
                '    "clsx": "^2.1.1",\n'
                '    "tailwind-merge": "^2.5.4"\n'
                "  },\n"
                '  "devDependencies": {\n'
                '    "@types/node": "^22",\n'
                '    "@types/react": "^19",\n'
                '    "@types/react-dom": "^19",\n'
                '    "typescript": "^5",\n'
                '    "tailwindcss": "^3.4.1"\n'
                "  }\n"
                "}\n"
            )
            file_items["frontend/package.json"] = CodeFileItem(
                path="frontend/package.json",
                name="package.json",
                directory="frontend",
                content=pkg_content,
                language="json",
                size_bytes=len(pkg_content.encode("utf-8")),
                source="scaffold",
            )

        # Root .env.example
        if ".env.example" not in file_items:
            env_content = (
                f"# Environment configuration for {clean_title}\n"
                f"PROJECT_NAME={clean_title}\n"
                f"DATABASE_URL=postgresql://postgres:postgres@localhost:5432/{project_slug}\n"
                "SECRET_KEY=generate_a_secure_random_key_here\n"
                "ENVIRONMENT=development\n"
                "PORT=8000\n"
                "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1\n"
            )
            file_items[".env.example"] = CodeFileItem(
                path=".env.example",
                name=".env.example",
                directory=".",
                content=env_content,
                language="text",
                size_bytes=len(env_content.encode("utf-8")),
                source="scaffold",
            )

        # Sort file items alphabetically by path
        sorted_files = sorted(file_items.values(), key=lambda f: f.path)

        directories = sorted(list(set(f.directory for f in sorted_files if f.directory != ".")))
        total_bytes = sum(f.size_bytes for f in sorted_files)
        generation_id = uuid.uuid4()

        response = CodeGenerateResponse(
            generation_id=generation_id,
            blueprint_id=blueprint.id,
            project_id=project.id,
            project_name=project.name,
            version=target_version,
            total_files=len(sorted_files),
            total_bytes=total_bytes,
            directories=directories,
            files=sorted_files,
            created_at=datetime.now(timezone.utc),
        )

        return response

    @staticmethod
    def build_project_zip(
        db: Session,
        blueprint_id: UUID,
        user: User,
        version: Optional[int] = None,
    ) -> Tuple[io.BytesIO, str]:
        """
        Package the entire generated project file tree into an in-memory ZIP archive.
        """
        response = CodeGeneratorService.generate_project_scaffold(
            db=db,
            blueprint_id=blueprint_id,
            user=user,
            version=version,
        )

        # Clean project slug for archive name
        slug = re.sub(r"[^a-zA-Z0-9_-]", "_", response.project_name.lower())
        archive_name = f"{slug}_v{response.version}_scaffold.zip"

        buf = io.BytesIO()
        with zipfile.ZipFile(buf, mode="w", compression=zipfile.ZIP_DEFLATED) as zip_file:
            for file_item in response.files:
                archive_path = f"{slug}/{file_item.path}"
                zip_file.writestr(archive_path, file_item.content)

        buf.seek(0)
        return buf, archive_name
