"""
Frontend Agent (Agent 7).
Synthesizes Next.js 15 (React 19 + TypeScript) pages, components, and API client hooks.
Designed to consume UI/UX design tokens and OpenAPI schemas from upstream agents.
"""

from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field

from app.ai.agents.base import BaseAgent
from app.ai.agents.types import AgentContext, AgentExecutionError, ArtifactDraft
from app.ai.agents.utils import extract_json_payload


class FrontendCodeFile(BaseModel):
    path: str = Field(..., min_length=2, description="Target file path, e.g. src/app/dashboard/page.tsx")
    content: str = Field(..., min_length=10, description="TypeScript/TSX source code")
    language: str = Field(default="typescript")


class FrontendInputSchema(BaseModel):
    prompt: str = Field(..., min_length=3)
    tech_stack: Dict[str, Any] = Field(default_factory=dict)
    shared_state: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class FrontendOutputSchema(BaseModel):
    framework: str = Field(default="Next.js 15 (App Router)")
    files: List[FrontendCodeFile] = Field(default_factory=list)
    routes: List[str] = Field(default_factory=list)
    summary: str = Field(..., min_length=5)


class FrontendAgent(BaseAgent):
    agent_name = "FrontendAgent"
    version = "1.0.0"
    description = "Generates Next.js 15 App Router pages, components, and TypeScript API interfaces."
    input_schema = FrontendInputSchema
    output_schema = FrontendOutputSchema

    def execute(
        self,
        context: AgentContext,
        validated_input: Dict[str, Any],
    ) -> Tuple[Dict[str, Any], List[ArtifactDraft]]:
        prompt = validated_input["prompt"]

        # Inspect if UI/UX design tokens or API specs were passed in shared_state
        shared_state = validated_input.get("shared_state", {})
        ui_specs = shared_state.get("ui_specs") or {}
        theme_name = ui_specs.get("design_system_name", "ForgeAI Dark Modern")

        system_prompt = (
            "You are the Principal Frontend Architect for Next.js 15 and React 19. "
            "Generate production-ready TypeScript pages and component trees matching the design system."
        )
        task_prompt = f"Design frontend architecture and components for: '{prompt}' using design system '{theme_name}'."

        parsed = self.generate_structured_output(prompt=task_prompt, system_prompt=system_prompt)

        if parsed and "files" in parsed and "routes" in parsed:
            output_data = parsed
        else:
            # Deterministic domain synthesis fallback
            page_tsx = (
                "import React from 'react';\n\n"
                "export default function DashboardPage() {\n"
                "  return (\n"
                "    <div className='min-h-screen bg-slate-950 text-slate-100 p-8'>\n"
                "      <header className='mb-8 border-b border-slate-800 pb-4'>\n"
                f"        <h1 className='text-3xl font-bold tracking-tight'>{prompt[:40].title()}</h1>\n"
                "        <p className='text-slate-400 mt-1'>Managed AI Application Workspace</p>\n"
                "      </header>\n"
                "      <main className='grid grid-cols-1 md:grid-cols-3 gap-6'>\n"
                "        <div className='p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-sm'>\n"
                "          <h2 className='text-lg font-semibold'>Overview</h2>\n"
                "          <p className='text-slate-400 text-sm mt-2'>Real-time status monitoring.</p>\n"
                "        </div>\n"
                "      </main>\n"
                "    </div>\n"
                "  );\n"
                "}\n"
            )

            api_client_ts = (
                "export interface ApiResponse<T> {\n"
                "  data: T;\n"
                "  status: number;\n"
                "}\n\n"
                "export async function fetchItems(): Promise<any[]> {\n"
                "  const res = await fetch('/api/v1/items');\n"
                "  if (!res.ok) throw new Error('Failed to fetch items');\n"
                "  return res.json();\n"
                "}\n"
            )

            files = [
                FrontendCodeFile(path="frontend/src/app/dashboard/page.tsx", content=page_tsx, language="typescript"),
                FrontendCodeFile(path="frontend/src/lib/api-client.ts", content=api_client_ts, language="typescript"),
            ]

            # Static TS/TSX syntax checks
            for f in files:
                self._validate_tsx_syntax(f.content, f.path)

            output_data = {
                "framework": "Next.js 15 (App Router + React 19)",
                "files": [f.model_dump() for f in files],
                "routes": ["/dashboard", "/dashboard/items"],
                "summary": f"Next.js 15 frontend architecture for '{prompt[:40]}' using {theme_name}.",
            }

        artifacts = [
            ArtifactDraft(
                artifact_type="frontend",
                file_path=f["path"],
                content=f["content"],
                language=f["language"],
                metadata={"agent": self.agent_name, "framework": output_data["framework"]},
            )
            for f in output_data["files"]
        ]

        return output_data, artifacts

    def _validate_tsx_syntax(self, code: str, file_path: str) -> None:
        """Safe static bracket and tag balance check."""
        for open_ch, close_ch in [("{", "}"), ("(", ")"), ("[", "]")]:
            if code.count(open_ch) != code.count(close_ch):
                raise AgentExecutionError(
                    message=f"Frontend code bracket validation failed in {file_path}: unbalanced '{open_ch}' vs '{close_ch}'",
                    agent_name=self.agent_name,
                    error_code="UNBALANCED_FRONTEND_BRACKETS",
                    stage="output_validation",
                    retryable=True,
                )
