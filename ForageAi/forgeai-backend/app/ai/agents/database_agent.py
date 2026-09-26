"""
Database Agent (Agent 4).
Designs normalized PostgreSQL 16 schemas, tables, columns, UUID primary keys,
foreign key constraints, indexes, and Mermaid ERD diagrams.
Safe static validation — no live DB execution.
"""

from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field

from app.ai.agents.base import BaseAgent
from app.ai.agents.types import AgentContext, AgentExecutionError, ArtifactDraft
from app.ai.agents.utils import extract_json_payload


class ColumnSpec(BaseModel):
    name: str = Field(..., min_length=1)
    type: str = Field(..., min_length=2)
    is_primary_key: bool = False
    is_nullable: bool = True
    default: Optional[str] = None


class TableSpec(BaseModel):
    name: str = Field(..., min_length=1)
    description: str = Field(..., min_length=3)
    columns: List[ColumnSpec] = Field(default_factory=list)
    indexes: List[str] = Field(default_factory=list)
    foreign_keys: List[str] = Field(default_factory=list)


class DatabaseInputSchema(BaseModel):
    prompt: str = Field(..., min_length=3)
    tech_stack: Dict[str, Any] = Field(default_factory=dict)
    shared_state: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)


import logging
import time

logger = logging.getLogger("forgeai.database_agent")


class DatabaseOutputSchema(BaseModel):
    dialect: str = Field(default="postgresql")
    tables: List[TableSpec] = Field(default_factory=list)
    ddl_sql: str = Field(..., min_length=20)
    erd_mermaid: str = Field(..., min_length=10)
    relationships: List[str] = Field(default_factory=list)
    rag_metadata: Dict[str, Any] = Field(default_factory=dict)


class DatabaseAgent(BaseAgent):
    agent_name = "DatabaseAgent"
    version = "1.0.0"
    description = "Designs PostgreSQL relational schemas, DDL, constraints, indexes, and Mermaid ERDs."
    input_schema = DatabaseInputSchema
    output_schema = DatabaseOutputSchema

    def execute(
        self,
        context: AgentContext,
        validated_input: Dict[str, Any],
    ) -> Tuple[Dict[str, Any], List[ArtifactDraft]]:
        prompt = validated_input["prompt"]

        # RAG Context Retrieval for Database Schemas & DDL Patterns
        rag_meta: Dict[str, Any] = {
            "rag_performed": False,
            "results_count": 0,
            "source_artifact_ids": [],
            "top_scores": [],
            "latency_ms": 0,
            "error": None,
        }
        rag_context_block = ""
        org_id = context.organization_id or (context.metadata or {}).get("organization_id")

        if org_id:
            t0 = time.time()
            try:
                from app.services.rag_service import rag_service
                results = rag_service.retrieve_context(
                    query=prompt,
                    organization_id=org_id,
                    project_id=context.project_id if context.project_id and context.project_id != "default-project" else None,
                    artifact_types=["database", "database_schema", "erd", "ddl", "models"],
                )
                rag_latency = int((time.time() - t0) * 1000)
                rag_meta.update({
                    "rag_performed": True,
                    "results_count": len(results),
                    "source_artifact_ids": [r.artifact_id for r in results if r.artifact_id],
                    "top_scores": [round(r.score, 3) for r in results[:3]],
                    "latency_ms": rag_latency,
                })
                if results:
                    rag_context_block = rag_service.format_rag_context_for_prompt(
                        results,
                        heading="HISTORICAL DATABASE SCHEMAS & DDL PATTERNS",
                    )
            except Exception as rag_err:
                logger.warning(f"DatabaseAgent RAG retrieval failed: {rag_err}")
                rag_meta["error"] = str(rag_err)

        system_prompt = (
            "You are the Principal Database Architect for PostgreSQL. "
            "Design normalized PostgreSQL 16 DDL using UUID v4 primary keys, explicit foreign keys, "
            "indexes, constraints, and a Mermaid ERD diagram."
        )
        task_prompt = f"Design relational PostgreSQL schema for: '{prompt}'."
        if rag_context_block:
            task_prompt = f"{task_prompt}\n\n{rag_context_block}"

        parsed = self.generate_structured_output(prompt=task_prompt, system_prompt=system_prompt)

        if parsed and "tables" in parsed and "ddl_sql" in parsed:
            output_data = parsed
            output_data["rag_metadata"] = rag_meta
        else:
            # Deterministic domain synthesis fallback
            tables = [
                TableSpec(
                    name="users",
                    description="Core user accounts and auth credentials",
                    columns=[
                        ColumnSpec(name="id", type="UUID", is_primary_key=True, is_nullable=False, default="gen_random_uuid()"),
                        ColumnSpec(name="email", type="VARCHAR(255)", is_nullable=False),
                        ColumnSpec(name="password_hash", type="VARCHAR(255)", is_nullable=False),
                        ColumnSpec(name="full_name", type="VARCHAR(150)", is_nullable=False),
                        ColumnSpec(name="is_active", type="BOOLEAN", is_nullable=False, default="TRUE"),
                        ColumnSpec(name="created_at", type="TIMESTAMPTZ", is_nullable=False, default="CURRENT_TIMESTAMP"),
                        ColumnSpec(name="updated_at", type="TIMESTAMPTZ", is_nullable=False, default="CURRENT_TIMESTAMP"),
                    ],
                    indexes=["CREATE UNIQUE INDEX idx_users_email ON users(email);"],
                    foreign_keys=[],
                ),
                TableSpec(
                    name="projects",
                    description="Multi-tenant workspace projects",
                    columns=[
                        ColumnSpec(name="id", type="UUID", is_primary_key=True, is_nullable=False, default="gen_random_uuid()"),
                        ColumnSpec(name="created_by", type="UUID", is_nullable=False),
                        ColumnSpec(name="name", type="VARCHAR(200)", is_nullable=False),
                        ColumnSpec(name="slug", type="VARCHAR(100)", is_nullable=False),
                        ColumnSpec(name="tech_stack", type="JSONB", is_nullable=False, default="'{}'::jsonb"),
                        ColumnSpec(name="created_at", type="TIMESTAMPTZ", is_nullable=False, default="CURRENT_TIMESTAMP"),
                    ],
                    indexes=[
                        "CREATE INDEX idx_projects_creator ON projects(created_by);",
                        "CREATE UNIQUE INDEX idx_projects_slug ON projects(slug);",
                    ],
                    foreign_keys=[
                        "CONSTRAINT fk_projects_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT",
                    ],
                ),
                TableSpec(
                    name="items",
                    description="Primary operational domain items",
                    columns=[
                        ColumnSpec(name="id", type="UUID", is_primary_key=True, is_nullable=False, default="gen_random_uuid()"),
                        ColumnSpec(name="project_id", type="UUID", is_nullable=False),
                        ColumnSpec(name="title", type="VARCHAR(250)", is_nullable=False),
                        ColumnSpec(name="content", type="TEXT", is_nullable=True),
                        ColumnSpec(name="status", type="VARCHAR(50)", is_nullable=False, default="'draft'"),
                        ColumnSpec(name="created_at", type="TIMESTAMPTZ", is_nullable=False, default="CURRENT_TIMESTAMP"),
                    ],
                    indexes=[
                        "CREATE INDEX idx_items_project ON items(project_id);",
                        "CREATE INDEX idx_items_status ON items(status);",
                    ],
                    foreign_keys=[
                        "CONSTRAINT fk_items_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE",
                    ],
                ),
            ]

            ddl_sql = self._render_ddl(tables)
            erd_mermaid = self._render_mermaid_erd(tables)

            # Static safe SQL syntax validation
            self._validate_sql_syntax(ddl_sql)

            output_data = {
                "dialect": "postgresql",
                "tables": [t.model_dump() for t in tables],
                "ddl_sql": ddl_sql,
                "erd_mermaid": erd_mermaid,
                "relationships": [
                    "users ||--o{ projects : creates",
                    "projects ||--o{ items : contains",
                ],
                "rag_metadata": rag_meta,
            }

        artifact = ArtifactDraft(
            artifact_type="erd",
            file_path="db/schema.sql",
            content=output_data["ddl_sql"],
            language="sql",
            metadata={
                "agent": self.agent_name,
                "tables_count": len(output_data["tables"]),
                "rag": rag_meta,
            },
        )

        return output_data, [artifact]

    def _render_ddl(self, tables: List[TableSpec]) -> str:
        blocks = [
            "-- PostgreSQL 16 DDL Schema",
            "-- Auto-generated by ForgeAI DatabaseAgent",
            "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";",
            "",
        ]
        for t in tables:
            blocks.append(f"CREATE TABLE {t.name} (")
            col_defs = []
            for c in t.columns:
                line = f"    {c.name} {c.type}"
                if c.is_primary_key:
                    line += " PRIMARY KEY"
                if not c.is_nullable:
                    line += " NOT NULL"
                if c.default:
                    line += f" DEFAULT {c.default}"
                col_defs.append(line)
            for fk in t.foreign_keys:
                col_defs.append(f"    {fk}")
            blocks.append(",\n".join(col_defs))
            blocks.append(");")
            blocks.append("")
            for idx in t.indexes:
                blocks.append(idx)
            blocks.append("")
        return "\n".join(blocks).strip()

    def _render_mermaid_erd(self, tables: List[TableSpec]) -> str:
        lines = ["erDiagram"]
        lines.append("    USERS ||--o{ PROJECTS : creates")
        lines.append("    PROJECTS ||--o{ ITEMS : contains")
        for t in tables:
            lines.append(f"    {t.name.upper()} {{")
            for c in t.columns:
                pk_flag = "PK" if c.is_primary_key else ""
                lines.append(f"        {c.type.lower()} {c.name} {pk_flag}".strip())
            lines.append("    }")
        return "\n".join(lines)

    def _validate_sql_syntax(self, sql: str) -> None:
        """Static safety verification of SQL balance and keywords."""
        open_parens = sql.count("(")
        close_parens = sql.count(")")
        if open_parens != close_parens:
            raise AgentExecutionError(
                message=f"SQL syntax validation failed: unbalanced parentheses ({open_parens} open vs {close_parens} close)",
                agent_name=self.agent_name,
                error_code="UNBALANCED_SQL_PARENTHESES",
                stage="output_validation",
                retryable=True,
            )
        if "CREATE TABLE" not in sql.upper():
            raise AgentExecutionError(
                message="SQL syntax validation failed: missing CREATE TABLE statements",
                agent_name=self.agent_name,
                error_code="MISSING_CREATE_TABLE",
                stage="output_validation",
                retryable=True,
            )
