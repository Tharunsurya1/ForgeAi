"""
Requirements Agent (Agent 2).
Extracts functional requirements (FR-xxx), non-functional requirements (NFR-xxx),
user personas, scope, assumptions, and constraints.
"""

from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field

from app.ai.agents.base import BaseAgent
from app.ai.agents.types import AgentContext, ArtifactDraft
from app.ai.agents.utils import extract_json_payload


class FunctionalRequirement(BaseModel):
    id: str = Field(..., pattern=r"^FR-\d{3,}$", description="Stable requirement identifier, e.g. FR-001")
    title: str = Field(..., min_length=3)
    description: str = Field(..., min_length=5)
    priority: str = Field(default="High", description="High, Medium, Low")


class NonFunctionalRequirement(BaseModel):
    id: str = Field(..., pattern=r"^NFR-\d{3,}$", description="Stable requirement identifier, e.g. NFR-001")
    category: str = Field(..., description="Performance, Security, Reliability, Scalability, Compliance")
    description: str = Field(..., min_length=5)
    target_metric: str = Field(..., description="Measurable SLA or KPI threshold")


class Persona(BaseModel):
    role: str = Field(..., min_length=2)
    description: str = Field(..., min_length=5)


class RequirementsInputSchema(BaseModel):
    prompt: str = Field(..., min_length=3)
    tech_stack: Dict[str, Any] = Field(default_factory=dict)
    shared_state: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)


import logging
import time

logger = logging.getLogger("forgeai.requirements_agent")


class RequirementsOutputSchema(BaseModel):
    system_scope: str = Field(..., min_length=10)
    personas: List[Persona] = Field(default_factory=list)
    functional_requirements: List[FunctionalRequirement] = Field(default_factory=list)
    non_functional_requirements: List[NonFunctionalRequirement] = Field(default_factory=list)
    assumptions: List[str] = Field(default_factory=list)
    constraints: List[str] = Field(default_factory=list)
    raw_markdown: str = Field(default="")
    rag_metadata: Dict[str, Any] = Field(default_factory=dict)


class RequirementsAgent(BaseAgent):
    agent_name = "RequirementsAgent"
    version = "1.0.0"
    description = "Synthesizes structured Software Requirements Specification (SRS) with unique FR and NFR IDs."
    input_schema = RequirementsInputSchema
    output_schema = RequirementsOutputSchema

    def execute(
        self,
        context: AgentContext,
        validated_input: Dict[str, Any],
    ) -> Tuple[Dict[str, Any], List[ArtifactDraft]]:
        prompt = validated_input["prompt"]

        # RAG Context Retrieval
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
                    artifact_types=["requirements", "architecture_summary", "overview", "srs"],
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
                        heading="HISTORICAL REQUIREMENTS & ARCHITECTURAL KNOWLEDGE",
                    )
            except Exception as rag_err:
                logger.warning(f"RequirementsAgent RAG retrieval failed: {rag_err}")
                rag_meta["error"] = str(rag_err)

        system_prompt = (
            "You are the Principal Requirements Engineer. "
            "Extract system scope, user personas, functional requirements with IDs (FR-001, FR-002), "
            "non-functional requirements with IDs (NFR-001, NFR-002), assumptions, and constraints."
        )
        task_prompt = f"Extract comprehensive software requirements for: '{prompt}'."
        if rag_context_block:
            task_prompt = f"{task_prompt}\n\n{rag_context_block}"

        parsed = self.generate_structured_output(prompt=task_prompt, system_prompt=system_prompt)

        if parsed and "functional_requirements" in parsed and "non_functional_requirements" in parsed:
            output_data = parsed
            output_data["rag_metadata"] = rag_meta
        else:
            # Deterministic domain synthesis fallback
            app_title = prompt[:50].title()
            frs = [
                FunctionalRequirement(
                    id="FR-001",
                    title="User Identity & Authentication",
                    description="Support secure registration, token-based authentication, and session management.",
                    priority="High",
                ),
                FunctionalRequirement(
                    id="FR-002",
                    title="Core Entity Lifecycle Management",
                    description=f"Provide full lifecycle management (CRUD) for primary entities in {app_title}.",
                    priority="High",
                ),
                FunctionalRequirement(
                    id="FR-003",
                    title="Role-Based Access Control",
                    description="Enforce granular authorization rules across admin, member, and viewer roles.",
                    priority="Medium",
                ),
                FunctionalRequirement(
                    id="FR-004",
                    title="Auditing & Reporting",
                    description="Maintain audit trail logs for critical state transitions and exports.",
                    priority="Medium",
                ),
            ]

            nfrs = [
                NonFunctionalRequirement(
                    id="NFR-001",
                    category="Performance",
                    description="API response latency for transactional endpoints.",
                    target_metric="p95 < 150ms",
                ),
                NonFunctionalRequirement(
                    id="NFR-002",
                    category="Security",
                    description="Transport and resting cryptographic guarantees.",
                    target_metric="TLS 1.3 in-transit, AES-256 at-rest, OWASP ASVS Level 2",
                ),
                NonFunctionalRequirement(
                    id="NFR-003",
                    category="Reliability",
                    description="High-availability service uptime SLA.",
                    target_metric="99.9% uptime with automated health checks",
                ),
            ]

            personas = [
                Persona(role="Administrator", description="Configures system settings, permissions, and billing."),
                Persona(role="End User", description="Operates domain workflows and consumes features."),
                Persona(role="Auditor", description="Reviews logs and compliance verifications."),
            ]

            markdown_doc = self._render_markdown(prompt, personas, frs, nfrs)

            output_data = {
                "system_scope": f"Enterprise software platform solving: {prompt}",
                "personas": [p.model_dump() for p in personas],
                "functional_requirements": [f.model_dump() for f in frs],
                "non_functional_requirements": [n.model_dump() for n in nfrs],
                "assumptions": [
                    "Users access the system via standard modern web browsers.",
                    "PostgreSQL and Redis services are available in the hosting environment.",
                ],
                "constraints": [
                    "Must comply with standard GDPR data privacy regulations.",
                    "Zero hardcoded credentials allowed in code repositories.",
                ],
                "raw_markdown": markdown_doc,
                "rag_metadata": rag_meta,
            }

        artifact = ArtifactDraft(
            artifact_type="requirements",
            file_path="docs/REQUIREMENTS.md",
            content=output_data["raw_markdown"],
            language="markdown",
            metadata={
                "agent": self.agent_name,
                "requirements_count": len(output_data["functional_requirements"]),
                "rag": rag_meta,
            },
        )

        return output_data, [artifact]

    def _render_markdown(
        self,
        prompt: str,
        personas: List[Persona],
        frs: List[FunctionalRequirement],
        nfrs: List[NonFunctionalRequirement],
    ) -> str:
        lines = [
            f"# Software Requirements Specification (SRS)",
            f"",
            f"## 1. Executive Summary & Scope",
            f"> {prompt}",
            f"",
            f"## 2. User Personas",
        ]
        for p in personas:
            lines.append(f"- **{p.role}**: {p.description}")

        lines.extend(["", "## 3. Functional Requirements"])
        for fr in frs:
            lines.append(f"- **{fr.id} [{fr.priority}]**: {fr.title} — {fr.description}")

        lines.extend(["", "## 4. Non-Functional Requirements"])
        for nfr in nfrs:
            lines.append(f"- **{nfr.id} [{nfr.category}]**: {nfr.description} *(Target: {nfr.target_metric})*")

        return "\n".join(lines)
