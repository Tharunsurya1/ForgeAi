"""
Deterministic AI Blueprint Multi-Agent Generation Engine
Matches ForgeAI AI_ARCHITECTURE.md specification (Supervised Star-DAG Topology).
Generates production-grade Software Architecture, Database DDL, OpenAPI specs,
Frontend hierarchy, Security policies, and Deployment manifests.
"""

from typing import Any, Dict, List, Tuple


class MultiAgentBlueprintEngine:
    """
    Coordinates domain agents to produce full-stack software blueprints.
    Domain Agents:
    1. RequirementsAgent
    2. ArchitectureAgent
    3. DatabaseAgent
    4. BackendApiAgent
    5. FrontendAgent
    6. SecurityAgent
    7. DeploymentAgent
    """

    @classmethod
    def generate(
        cls,
        prompt: str,
        tech_stack: Dict[str, Any] = None,
        title: str = None,
    ) -> Tuple[str, str, List[Dict[str, Any]]]:
        """
        Execute multi-agent generation pipeline and return (title, summary, artifacts).
        """
        tech_stack = tech_stack or {}
        backend_framework = tech_stack.get("backend", "FastAPI (Python 3.13)")
        frontend_framework = tech_stack.get("frontend", "Next.js 15 (React 19 + TypeScript)")
        database_engine = tech_stack.get("database", "PostgreSQL 16 (pgcrypto + JSONB)")
        cache_engine = tech_stack.get("cache", "Redis 7.2")

        app_title = title or cls._extract_title(prompt)
        summary = (
            f"Production-ready enterprise blueprint for '{app_title}', "
            f"featuring {backend_framework} backend, {frontend_framework} frontend, "
            f"and {database_engine} data persistence layer."
        )

        artifacts = [
            cls._requirements_agent(app_title, prompt),
            cls._architecture_agent(app_title, prompt, backend_framework, frontend_framework, database_engine, cache_engine),
            cls._database_agent(app_title, prompt, database_engine),
            cls._api_agent(app_title, prompt, backend_framework),
            cls._frontend_agent(app_title, prompt, frontend_framework),
            cls._security_agent(app_title, prompt),
            cls._deployment_agent(app_title, backend_framework, frontend_framework, database_engine),
        ]

        return app_title, summary, artifacts

    @staticmethod
    def _extract_title(prompt: str) -> str:
        words = prompt.strip().split()
        if len(words) <= 5:
            return prompt.strip().title()
        return " ".join(words[:4]).title() + " System"

    @staticmethod
    def _requirements_agent(title: str, prompt: str) -> Dict[str, Any]:
        content = f"""# Software Requirements Specification (SRS) - {title}

## 1. Executive Summary
{title} is designed to solve:
> {prompt}

## 2. Target User Personas
- **Enterprise Administrators**: Manages users, permissions, billing quotas, and system settings.
- **End Users / Developers**: Interacts with the core studio workflows, projects, and generative capabilities.
- **Auditors & SecOps**: Reviews compliance, audit logs, and access control matrices.

## 3. Functional Requirements (FR)
- **FR-1 [Identity & Access]**: Multi-tenant authentication with dual-token JWTs, role-based access control (RBAC), and session revocation.
- **FR-2 [Core Workflow Orchestration]**: Real-time project lifecycle management with deterministic validation states.
- **FR-3 [Data Persistence & Auditing]**: Immutable state transition logging with audit trail history.
- **FR-4 [Export & Integrations]**: Downloadable full-stack artifacts, OpenAPI contracts, and CI/CD pipelines.

## 4. Non-Functional Requirements (NFR)
- **Performance**: API p95 response latency < 120ms; streaming token delivery < 20ms chunks.
- **Scalability**: Horizontal auto-scaling with stateless application containers.
- **Security**: OWASP ASVS Level 2 compliance, TLS 1.3 in-transit, and AES-256 at-rest encryption.
- **Reliability**: 99.95% uptime SLA with automated multi-region backup failovers.
"""
        return {
            "artifact_type": "requirements",
            "file_path": "docs/REQUIREMENTS.md",
            "language": "markdown",
            "content": content,
            "file_size_bytes": len(content.encode("utf-8")),
        }

    @staticmethod
    def _architecture_agent(
        title: str,
        prompt: str,
        backend: str,
        frontend: str,
        database: str,
        cache: str,
    ) -> Dict[str, Any]:
        content = f"""# System Architecture & Technical Specifications - {title}

## 1. Technology Matrix
| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | {frontend} | SSR/RSC performance, atomic design, TypeScript type safety |
| **Backend API** | {backend} | High async I/O concurrency, Pydantic v2 data validation |
| **Primary Database** | {database} | ACID transactions, JSONB document indexing, UUIDv4 PKs |
| **Cache & Queue** | {cache} | Sub-millisecond session caching and background worker broker |

## 2. C4 Component & System Topology
```mermaid
graph TD
    Client[Browser / Client SPA] -->|HTTPS / WSS| Gateway[Nginx / API Gateway]
    Gateway -->|REST / JWT| AppServer[{backend}]
    AppServer -->|Asyncpg / SQLAlchemy| DB[({database})]
    AppServer -->|Redis Protocol| CacheStore[({cache})]
    AppServer -->|Background Tasks| Worker[Async Worker Pool]
```

## 3. Architecture Decision Records (ADRs)
- **ADR-001 [Monolith vs Microservices]**: Modular async monolith selected for high velocity, single-transaction boundary integrity, and minimal operational overhead.
- **ADR-002 [Primary Key Standard]**: UUIDv4 synthetic primary keys chosen to prevent enumeration attacks and simplify distributed multi-region data replication.
"""
        return {
            "artifact_type": "architecture",
            "file_path": "docs/ARCHITECTURE.md",
            "language": "markdown",
            "content": content,
            "file_size_bytes": len(content.encode("utf-8")),
        }

    @staticmethod
    def _database_agent(title: str, prompt: str, database: str) -> Dict[str, Any]:
        content = f"""-- =============================================================================
-- Database DDL Specification for {title}
-- Engine: {database}
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{{}}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE core_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(250) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{{}}'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_core_entities_workspace ON core_entities(workspace_id);
CREATE INDEX idx_core_entities_payload_gin ON core_entities USING GIN (payload);
"""
        return {
            "artifact_type": "database",
            "file_path": "database/schema.sql",
            "language": "sql",
            "content": content,
            "file_size_bytes": len(content.encode("utf-8")),
        }

    @staticmethod
    def _api_agent(title: str, prompt: str, backend: str) -> Dict[str, Any]:
        content = f"""# REST API Specification (OpenAPI 3.1) - {title}

```yaml
openapi: 3.1.0
info:
  title: {title} API
  version: 1.0.0
  description: RESTful API contracts for {title} built on {backend}.

paths:
  /api/v1/auth/login:
    post:
      summary: User Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        '200':
          description: Authenticated token pair returned

  /api/v1/workspaces:
    get:
      summary: List Workspaces
      security:
        - OAuth2Bearer: []
      responses:
        '200':
          description: List of accessible workspaces
    post:
      summary: Create Workspace
      security:
        - OAuth2Bearer: []
      responses:
        '201':
          description: Workspace created successfully
```
"""
        return {
            "artifact_type": "openapi",
            "file_path": "api/openapi.yaml",
            "language": "yaml",
            "content": content,
            "file_size_bytes": len(content.encode("utf-8")),
        }

    @staticmethod
    def _frontend_agent(title: str, prompt: str, frontend: str) -> Dict[str, Any]:
        content = f"""# Frontend Architecture & Component Hierarchy - {title}

Framework: **{frontend}**

## Component Directory Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── studio/page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   └── visualizer/
│       └── ArchitectureCanvas.tsx
├── lib/
│   ├── api.ts
│   └── auth.ts
└── store/
    └── useWorkspaceStore.ts
```

## State Management Standard
- **Server Cache State**: TanStack Query v5 with automatic background invalidation.
- **Client Global State**: Zustand lightweight store for UI modals and current active canvas view.
"""
        return {
            "artifact_type": "frontend",
            "file_path": "frontend/STRUCTURE.md",
            "language": "markdown",
            "content": content,
            "file_size_bytes": len(content.encode("utf-8")),
        }

    @staticmethod
    def _security_agent(title: str, prompt: str) -> Dict[str, Any]:
        content = f"""# Enterprise Security & Compliance Policy - {title}

## 1. Authentication & Session Strategy
- **Access Tokens**: Short-lived Dual-Token JWT (15-minute expiry) signed via HMAC-SHA256.
- **Refresh Tokens**: Long-lived (7-day) cryptographically hashed tokens stored in PostgreSQL with strict rotation upon usage.
- **Password Hardening**: Argon2id / Bcrypt password hashing with high work factor.

## 2. Threat Modeling (OWASP Top 10 Mitigation)
- **Injection Protection**: Parameterized ORM queries via SQLAlchemy 2.0; GIN indexed JSONB schema validation.
- **Broken Access Control**: Tenant Isolation via mandatory Organization / Workspace foreign keys on all business records.
- **Rate Limiting**: Sliding-window token bucket (Redis) restricting authentication endpoints to 10 req/min.
"""
        return {
            "artifact_type": "security",
            "file_path": "security/SECURITY_POLICY.md",
            "language": "markdown",
            "content": content,
            "file_size_bytes": len(content.encode("utf-8")),
        }

    @staticmethod
    def _deployment_agent(title: str, backend: str, frontend: str, database: str) -> Dict[str, Any]:
        content = f"""# Docker & Infrastructure Specification - {title}

## Dockerfile
```dockerfile
# Multi-stage production container build
FROM python:3.13-slim AS base
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://forgeai_user:forgeai_pass@postgres:5432/forgeai_db
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: forgeai_db
      POSTGRES_USER: forgeai_user
      POSTGRES_PASSWORD: forgeai_pass
    ports:
      - "5432:5432"

  redis:
    image: redis:7.2-alpine
    ports:
      - "6379:6379"
```
"""
        return {
            "artifact_type": "deployment",
            "file_path": "docker/docker-compose.yml",
            "language": "yaml",
            "content": content,
            "file_size_bytes": len(content.encode("utf-8")),
        }
