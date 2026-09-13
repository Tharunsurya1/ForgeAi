"""
DevOps Agent (Agent 10).
Generates container configurations, multi-stage Dockerfiles, docker-compose manifests,
GitHub Actions CI/CD workflows, and environment variable templates.
Never generates real secrets.
"""

from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field

from app.ai.agents.base import BaseAgent
from app.ai.agents.types import AgentContext, AgentExecutionError, ArtifactDraft
from app.ai.agents.utils import extract_json_payload, safe_validate_yaml


class DevOpsInputSchema(BaseModel):
    prompt: str = Field(..., min_length=3)
    tech_stack: Dict[str, Any] = Field(default_factory=dict)
    shared_state: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DevOpsOutputSchema(BaseModel):
    dockerfile_backend: str = Field(..., min_length=10)
    dockerfile_frontend: str = Field(..., min_length=10)
    docker_compose_yml: str = Field(..., min_length=20)
    ci_workflow_yml: str = Field(..., min_length=20)
    env_template: str = Field(..., min_length=10)
    raw_markdown: str = Field(default="")


class DevOpsAgent(BaseAgent):
    agent_name = "DevOpsAgent"
    version = "1.0.0"
    description = "Generates Dockerfiles, docker-compose manifests, CI/CD GitHub workflows, and .env templates."
    input_schema = DevOpsInputSchema
    output_schema = DevOpsOutputSchema

    def execute(
        self,
        context: AgentContext,
        validated_input: Dict[str, Any],
    ) -> Tuple[Dict[str, Any], List[ArtifactDraft]]:
        prompt = validated_input["prompt"]

        system_prompt = (
            "You are the Principal Site Reliability Engineer and DevOps Architect. "
            "Generate production Dockerfiles, docker-compose.yml, GitHub Actions CI workflows, and env templates."
        )
        task_prompt = f"Design DevOps deployment infrastructure for: '{prompt}'."

        parsed = self.generate_structured_output(prompt=task_prompt, system_prompt=system_prompt)

        if parsed and "docker_compose_yml" in parsed and "ci_workflow_yml" in parsed:
            output_data = parsed
        else:
            # Deterministic domain synthesis fallback
            dockerfile_backend = (
                "FROM python:3.12-slim AS builder\n"
                "WORKDIR /app\n"
                "COPY requirements.txt .\n"
                "RUN pip install --no-cache-dir -r requirements.txt\n"
                "COPY . .\n"
                "EXPOSE 8000\n"
                "CMD [\"uvicorn\", \"app.main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]\n"
            )

            dockerfile_frontend = (
                "FROM node:20-alpine AS builder\n"
                "WORKDIR /app\n"
                "COPY package*.json ./\n"
                "RUN npm ci\n"
                "COPY . .\n"
                "RUN npm run build\n"
                "EXPOSE 3000\n"
                "CMD [\"npm\", \"start\"]\n"
            )

            docker_compose_yml = (
                "version: '3.8'\n"
                "services:\n"
                "  backend:\n"
                "    build: ./backend\n"
                "    ports:\n"
                "      - \"8000:8000\"\n"
                "    environment:\n"
                "      - DATABASE_URL=postgresql://postgres:postgres@db:5432/forgeai\n"
                "    depends_on:\n"
                "      - db\n"
                "  frontend:\n"
                "    build: ./frontend\n"
                "    ports:\n"
                "      - \"3000:3000\"\n"
                "    depends_on:\n"
                "      - backend\n"
                "  db:\n"
                "    image: postgres:16-alpine\n"
                "    environment:\n"
                "      - POSTGRES_DB=forgeai\n"
                "      - POSTGRES_USER=postgres\n"
                "      - POSTGRES_PASSWORD=postgres\n"
                "    ports:\n"
                "      - \"5432:5432\"\n"
            )

            ci_workflow_yml = (
                "name: CI Pipeline\n"
                "on:\n"
                "  push:\n"
                "    branches: [ main, develop ]\n"
                "  pull_request:\n"
                "    branches: [ main ]\n"
                "jobs:\n"
                "  test-backend:\n"
                "    runs-on: ubuntu-latest\n"
                "    steps:\n"
                "      - uses: actions/checkout@v4\n"
                "      - uses: actions/setup-python@v5\n"
                "        with:\n"
                "          python-version: '3.12'\n"
                "      - run: pip install -r requirements.txt\n"
                "      - run: pytest tests -v\n"
            )

            env_template = (
                "# Environment Configuration Template (Zero Real Secrets)\n"
                "DATABASE_URL=postgresql://user:password@localhost:5432/dbname\n"
                "JWT_SECRET_KEY=CHANGE_THIS_IN_PRODUCTION_32_CHAR_HEX\n"
                "ACCESS_TOKEN_EXPIRE_MINUTES=60\n"
                "FRONTEND_URL=http://localhost:3000\n"
            )

            # Static safe YAML validation
            for name, yml in [("docker-compose", docker_compose_yml), ("ci-workflow", ci_workflow_yml)]:
                is_valid, err = safe_validate_yaml(yml)
                if not is_valid:
                    raise AgentExecutionError(
                        message=f"DevOps YAML validation failed for {name}: {err}",
                        agent_name=self.agent_name,
                        error_code="INVALID_DEVOPS_YAML",
                        stage="output_validation",
                        retryable=True,
                    )

            output_data = {
                "dockerfile_backend": dockerfile_backend,
                "dockerfile_frontend": dockerfile_frontend,
                "docker_compose_yml": docker_compose_yml,
                "ci_workflow_yml": ci_workflow_yml,
                "env_template": env_template,
                "raw_markdown": f"# DevOps Deployment Guide\n\nTargeting: {prompt}",
            }

        artifacts = [
            ArtifactDraft(
                artifact_type="devops",
                file_path="deploy/docker-compose.yml",
                content=output_data["docker_compose_yml"],
                language="yaml",
                metadata={"agent": self.agent_name},
            ),
            ArtifactDraft(
                artifact_type="devops",
                file_path=".github/workflows/ci.yml",
                content=output_data["ci_workflow_yml"],
                language="yaml",
                metadata={"agent": self.agent_name},
            ),
            ArtifactDraft(
                artifact_type="devops",
                file_path=".env.example",
                content=output_data["env_template"],
                language="text",
                metadata={"agent": self.agent_name},
            ),
        ]

        return output_data, artifacts
