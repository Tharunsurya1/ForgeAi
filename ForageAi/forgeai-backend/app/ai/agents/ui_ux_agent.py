"""
UI/UX Agent (Agent 8).
Synthesizes comprehensive design system specifications, Tailwind color palettes,
typography scale, spacing tokens, component hierarchy, responsive breakpoints,
and WCAG AA accessibility rules.
"""

from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field

from app.ai.agents.base import BaseAgent
from app.ai.agents.types import AgentContext, ArtifactDraft
from app.ai.agents.utils import extract_json_payload


class ColorToken(BaseModel):
    name: str = Field(..., min_length=2)
    hex_code: str = Field(..., pattern=r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
    role: str = Field(..., min_length=3)


class UIUXInputSchema(BaseModel):
    prompt: str = Field(..., min_length=3)
    tech_stack: Dict[str, Any] = Field(default_factory=dict)
    shared_state: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class UIUXOutputSchema(BaseModel):
    design_system_name: str = Field(default="ForgeAI Modern Obsidian")
    color_palette: List[ColorToken] = Field(default_factory=list)
    typography: Dict[str, str] = Field(default_factory=dict)
    spacing_scale: Dict[str, str] = Field(default_factory=dict)
    component_hierarchy: List[str] = Field(default_factory=list)
    responsive_breakpoints: Dict[str, str] = Field(default_factory=dict)
    accessibility_guidelines: List[str] = Field(default_factory=list)
    raw_markdown: str = Field(default="")


class UIUXAgent(BaseAgent):
    agent_name = "UIUXAgent"
    version = "1.0.0"
    description = "Defines design systems, Tailwind tokens, typography, component hierarchies, and WCAG guidelines."
    input_schema = UIUXInputSchema
    output_schema = UIUXOutputSchema

    def execute(
        self,
        context: AgentContext,
        validated_input: Dict[str, Any],
    ) -> Tuple[Dict[str, Any], List[ArtifactDraft]]:
        prompt = validated_input["prompt"]

        system_prompt = (
            "You are the Principal Design Systems Lead and UI/UX Architect. "
            "Formulate design tokens, Tailwind theme palettes, responsive layout rules, "
            "and accessibility requirements."
        )
        task_prompt = f"Create UI/UX Design System for: '{prompt}'."

        parsed = self.generate_structured_output(prompt=task_prompt, system_prompt=system_prompt)

        if parsed and "color_palette" in parsed and "typography" in parsed:
            output_data = parsed
        else:
            # Deterministic domain synthesis fallback
            colors = [
                ColorToken(name="background", hex_code="#020617", role="Default surface background (slate-950)"),
                ColorToken(name="surface", hex_code="#0f172a", role="Card and modal panels (slate-900)"),
                ColorToken(name="border", hex_code="#1e293b", role="Subtle borders and dividers (slate-800)"),
                ColorToken(name="primary", hex_code="#6366f1", role="Brand action accent (indigo-500)"),
                ColorToken(name="primary-hover", hex_code="#4f46e5", role="Hover state for primary actions (indigo-600)"),
                ColorToken(name="text-primary", hex_code="#f8fafc", role="High-contrast body text (slate-50)"),
                ColorToken(name="text-muted", hex_code="#94a3b8", role="Secondary descriptive text (slate-400)"),
                ColorToken(name="danger", hex_code="#ef4444", role="Destructive alerts and actions (red-500)"),
            ]

            typography = {
                "font-family-sans": "Inter, system-ui, -apple-system, sans-serif",
                "font-family-mono": "JetBrains Mono, Menlo, monospace",
                "h1": "2.25rem (36px), font-bold, -0.025em tracking",
                "h2": "1.5rem (24px), font-semibold, -0.02em tracking",
                "body": "0.875rem (14px), font-normal, leading-6",
            }

            spacing = {
                "sm": "0.5rem (8px)",
                "md": "1rem (16px)",
                "lg": "1.5rem (24px)",
                "xl": "2rem (32px)",
            }

            components = [
                "AppShell -> TopNavigation + CollapsibleSidebar",
                "ProjectCard -> Thumbnail, Title, Badge, ActionMenu",
                "DataTable -> SearchFilter, SortableColumns, Pagination",
                "ModalDialog -> BackdropBlur, FormContainer, PrimaryAction",
            ]

            breakpoints = {
                "sm": "640px",
                "md": "768px",
                "lg": "1024px",
                "xl": "1280px",
            }

            a11y = [
                "Ensure minimum 4.5:1 contrast ratio for normal text against background (WCAG AA).",
                "All interactive elements must display visible focus-visible outlines.",
                "Provide aria-labels for icon-only action buttons.",
                "Ensure full keyboard navigability across modals and dropdown menus.",
            ]

            markdown_doc = self._render_markdown(colors, typography, spacing, components, a11y)

            output_data = {
                "design_system_name": "ForgeAI Obsidian Modern",
                "color_palette": [c.model_dump() for c in colors],
                "typography": typography,
                "spacing_scale": spacing,
                "component_hierarchy": components,
                "responsive_breakpoints": breakpoints,
                "accessibility_guidelines": a11y,
                "raw_markdown": markdown_doc,
            }

        artifact = ArtifactDraft(
            artifact_type="design",
            file_path="design/design-system.md",
            content=output_data["raw_markdown"],
            language="markdown",
            metadata={"agent": self.agent_name, "design_system": output_data["design_system_name"]},
        )

        return output_data, [artifact]

    def _render_markdown(
        self,
        colors: List[ColorToken],
        typography: Dict[str, str],
        spacing: Dict[str, str],
        components: List[str],
        a11y: List[str],
    ) -> str:
        lines = [
            "# Design System Specification",
            "",
            "## 1. Color Palette Tokens",
            "| Token Name | Hex Code | Role / Usage |",
            "| :--- | :--- | :--- |",
        ]
        for c in colors:
            lines.append(f"| `{c.name}` | `{c.hex_code}` | {c.role} |")

        lines.extend(["", "## 2. Typography Hierarchy"])
        for k, v in typography.items():
            lines.append(f"- **{k}**: {v}")

        lines.extend(["", "## 3. Spacing Scale"])
        for k, v in spacing.items():
            lines.append(f"- **{k}**: {v}")

        lines.extend(["", "## 4. Component Hierarchy"])
        for comp in components:
            lines.append(f"- {comp}")

        lines.extend(["", "## 5. Accessibility (WCAG 2.1 AA)"])
        for rule in a11y:
            lines.append(f"- [x] {rule}")

        return "\n".join(lines)
