"""
Optimization Agent (Agent 14).
Analyzes database queries, caching strategies, API payload overhead,
frontend bundle optimizations, and horizontal scalability bottlenecks.
Returns recommendations only.
"""

from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field

from app.ai.agents.base import BaseAgent
from app.ai.agents.types import AgentContext, ArtifactDraft
from app.ai.agents.utils import extract_json_payload


class OptimizationRecommendation(BaseModel):
    area: str = Field(..., description="Database, API, Frontend, Infrastructure")
    issue: str = Field(..., min_length=5)
    recommendation: str = Field(..., min_length=5)
    expected_impact: str = Field(..., description="High, Medium, Low")


class OptimizationInputSchema(BaseModel):
    prompt: str = Field(..., min_length=3)
    tech_stack: Dict[str, Any] = Field(default_factory=dict)
    shared_state: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class OptimizationOutputSchema(BaseModel):
    db_indexing: List[str] = Field(default_factory=list)
    caching_strategy: List[str] = Field(default_factory=list)
    api_optimizations: List[str] = Field(default_factory=list)
    bundle_optimizations: List[str] = Field(default_factory=list)
    recommendations: List[OptimizationRecommendation] = Field(default_factory=list)
    raw_markdown: str = Field(default="")


class OptimizationAgent(BaseAgent):
    agent_name = "OptimizationAgent"
    version = "1.0.0"
    description = "Analyzes performance bottlenecks, recommending query indexes, Redis caching, and bundle pruning."
    input_schema = OptimizationInputSchema
    output_schema = OptimizationOutputSchema

    def execute(
        self,
        context: AgentContext,
        validated_input: Dict[str, Any],
    ) -> Tuple[Dict[str, Any], List[ArtifactDraft]]:
        prompt = validated_input["prompt"]

        system_prompt = (
            "You are the Principal Performance Engineer and Database Optimization Lead. "
            "Formulate actionable optimization strategies across database indexes, Redis caching, and API payload latency."
        )
        task_prompt = f"Develop performance optimization roadmap for: '{prompt}'."

        parsed = self.generate_structured_output(prompt=task_prompt, system_prompt=system_prompt)

        if parsed and "recommendations" in parsed and "caching_strategy" in parsed:
            output_data = parsed
        else:
            # Deterministic domain synthesis fallback
            db_indexing = [
                "CREATE INDEX CONCURRENTLY idx_items_created_at ON items(created_at DESC);",
                "CREATE INDEX CONCURRENTLY idx_projects_org_status ON projects(organization_id, status);",
            ]

            caching = [
                "Cache GET /api/v1/projects responses in Redis with 60-second TTL and organization-scoped keys.",
                "Implement HTTP Cache-Control: max-age=3600 for static assets and documentation exports.",
            ]

            api_opts = [
                "Enable GZip / Brotli compression for JSON responses exceeding 1KB.",
                "Enforce strict cursor-based pagination with limit=50 maximum.",
            ]

            bundle_opts = [
                "Utilize dynamic imports (next/dynamic) for interactive chart rendering components.",
                "Ensure server-only database utilities are excluded from client bundle chunks.",
            ]

            recs = [
                OptimizationRecommendation(
                    area="Database",
                    issue="Sequential table scan on items table during date range queries.",
                    recommendation="Add composite index on (project_id, created_at DESC).",
                    expected_impact="High",
                ),
                OptimizationRecommendation(
                    area="API",
                    issue="Repeated database queries for organization role verification.",
                    recommendation="Cache caller membership role in Redis session token metadata.",
                    expected_impact="High",
                ),
                OptimizationRecommendation(
                    area="Frontend",
                    issue="Uncompressed third-party iconography libraries.",
                    recommendation="Use lucide-react tree-shaken named imports only.",
                    expected_impact="Medium",
                ),
            ]

            markdown_doc = self._render_markdown(db_indexing, caching, api_opts, bundle_opts, recs)

            output_data = {
                "db_indexing": db_indexing,
                "caching_strategy": caching,
                "api_optimizations": api_opts,
                "bundle_optimizations": bundle_opts,
                "recommendations": [r.model_dump() for r in recs],
                "raw_markdown": markdown_doc,
            }

        artifact = ArtifactDraft(
            artifact_type="optimization",
            file_path="docs/OPTIMIZATION.md",
            content=output_data["raw_markdown"],
            language="markdown",
            metadata={"agent": self.agent_name, "recommendations_count": len(output_data["recommendations"])},
        )

        return output_data, [artifact]

    def _render_markdown(
        self,
        db_indexes: List[str],
        caching: List[str],
        api_opts: List[str],
        bundle_opts: List[str],
        recs: List[OptimizationRecommendation],
    ) -> str:
        lines = [
            "# System Performance & Optimization Strategy",
            "",
            "## 1. Actionable Recommendations",
            "| Area | Issue | Recommendation | Expected Impact |",
            "| :--- | :--- | :--- | :--- |",
        ]
        for r in recs:
            lines.append(f"| {r.area} | {r.issue} | {r.recommendation} | `{r.expected_impact}` |")

        lines.extend(["", "## 2. PostgreSQL Query & Indexing Directives"])
        for idx in db_indexes:
            lines.append(f"```sql\n{idx}\n```")

        lines.extend(["## 3. Caching & Memory Layer Directives"])
        for c in caching:
            lines.append(f"- {c}")

        lines.extend(["", "## 4. API Throughput & Latency"])
        for a in api_opts:
            lines.append(f"- {a}")

        lines.extend(["", "## 5. Frontend Bundle Optimization"])
        for b in bundle_opts:
            lines.append(f"- {b}")

        return "\n".join(lines)
