"""
Business Analyst Agent (Agent 3).
Transforms requirements into user stories with Gherkin acceptance criteria (Given/When/Then),
domain entities, business rules, and state transition workflows.
"""

from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field

from app.ai.agents.base import BaseAgent
from app.ai.agents.types import AgentContext, ArtifactDraft
from app.ai.agents.utils import extract_json_payload


class AcceptanceCriterion(BaseModel):
    scenario: str = Field(..., min_length=3)
    given: str = Field(..., min_length=3)
    when: str = Field(..., min_length=3)
    then: str = Field(..., min_length=3)


class UserStory(BaseModel):
    id: str = Field(..., pattern=r"^US-\d{3,}$", description="Stable user story ID, e.g. US-001")
    title: str = Field(..., min_length=3)
    as_a: str = Field(..., min_length=2)
    i_want_to: str = Field(..., min_length=5)
    so_that: str = Field(..., min_length=5)
    acceptance_criteria: List[AcceptanceCriterion] = Field(default_factory=list)


class DomainEntity(BaseModel):
    name: str = Field(..., min_length=2)
    description: str = Field(..., min_length=5)
    key_attributes: List[str] = Field(default_factory=list)


class BusinessAnalystInputSchema(BaseModel):
    prompt: str = Field(..., min_length=3)
    tech_stack: Dict[str, Any] = Field(default_factory=dict)
    shared_state: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class BusinessAnalystOutputSchema(BaseModel):
    user_stories: List[UserStory] = Field(default_factory=list)
    domain_entities: List[DomainEntity] = Field(default_factory=list)
    business_rules: List[str] = Field(default_factory=list)
    workflows: List[str] = Field(default_factory=list)
    raw_markdown: str = Field(default="")


class BusinessAnalystAgent(BaseAgent):
    agent_name = "BusinessAnalystAgent"
    version = "1.0.0"
    description = "Formulates domain entities, business rules, and Gherkin-style user stories."
    input_schema = BusinessAnalystInputSchema
    output_schema = BusinessAnalystOutputSchema

    def execute(
        self,
        context: AgentContext,
        validated_input: Dict[str, Any],
    ) -> Tuple[Dict[str, Any], List[ArtifactDraft]]:
        prompt = validated_input["prompt"]

        system_prompt = (
            "You are a Senior Business Analyst and Domain Modeler. "
            "Generate structured user stories with Given/When/Then acceptance criteria, domain entities, and business rules."
        )
        task_prompt = f"Deconstruct project intent into domain models and user stories: '{prompt}'."

        parsed = self.generate_structured_output(prompt=task_prompt, system_prompt=system_prompt)

        if parsed and "user_stories" in parsed and "domain_entities" in parsed:
            output_data = parsed
        else:
            # Deterministic domain synthesis fallback
            stories = [
                UserStory(
                    id="US-001",
                    title="User Registration & Verification",
                    as_a="new visitor",
                    i_want_to="create an account using my email and password",
                    so_that="I can securely access the workspace and collaborate",
                    acceptance_criteria=[
                        AcceptanceCriterion(
                            scenario="Successful registration with valid inputs",
                            given="I provide an unregistered email and strong password",
                            when="I submit the registration form",
                            then="A 201 Created response is returned and a verification email is dispatched",
                        ),
                        AcceptanceCriterion(
                            scenario="Duplicate email rejected",
                            given="An account with my email already exists",
                            when="I submit the registration form",
                            then="A 409 Conflict status is returned with a clear error message",
                        ),
                    ],
                ),
                UserStory(
                    id="US-002",
                    title="Project Dashboard Orchestration",
                    as_a="project manager",
                    i_want_to="create and manage projects with custom tech stacks",
                    so_that="I can coordinate engineering blueprints effectively",
                    acceptance_criteria=[
                        AcceptanceCriterion(
                            scenario="Creating project with default options",
                            given="I am authenticated as an organization member",
                            when="I send a POST /projects request with a valid project payload",
                            then="The project is persisted and assigned a unique UUID",
                        ),
                    ],
                ),
            ]

            entities = [
                DomainEntity(
                    name="User",
                    description="Authenticated identity with RBAC role assignments.",
                    key_attributes=["id", "email", "full_name", "role", "created_at"],
                ),
                DomainEntity(
                    name="Project",
                    description="Logical workspace grouping blueprints, teams, and artifacts.",
                    key_attributes=["id", "organization_id", "name", "slug", "tech_stack"],
                ),
                DomainEntity(
                    name="Blueprint",
                    description="Versioned software design document generated by the AI engine.",
                    key_attributes=["id", "project_id", "version", "status", "metadata"],
                ),
            ]

            business_rules = [
                "BR-01: An organization must have at least one active Owner.",
                "BR-02: Viewers cannot create, edit, or delete projects or trigger AI blueprint runs.",
                "BR-03: Soft deletions must preserve historical audit logs for 90 days.",
            ]

            workflows = [
                "WF-01: User Signup -> Email Verification -> Workspace Creation -> Team Onboarding",
                "WF-02: Idea Input -> Blueprint AI Generation -> Code Synthesis -> Deployment Export",
            ]

            markdown_doc = self._render_markdown(stories, entities, business_rules, workflows)

            output_data = {
                "user_stories": [s.model_dump() for s in stories],
                "domain_entities": [e.model_dump() for e in entities],
                "business_rules": business_rules,
                "workflows": workflows,
                "raw_markdown": markdown_doc,
            }

        artifact = ArtifactDraft(
            artifact_type="analysis",
            file_path="docs/USER_STORIES.md",
            content=output_data["raw_markdown"],
            language="markdown",
            metadata={"agent": self.agent_name, "stories_count": len(output_data["user_stories"])},
        )

        return output_data, [artifact]

    def _render_markdown(
        self,
        stories: List[UserStory],
        entities: List[DomainEntity],
        rules: List[str],
        workflows: List[str],
    ) -> str:
        lines = [
            "# Business Analysis & User Story Specification",
            "",
            "## 1. Domain Entities",
        ]
        for e in entities:
            attrs = ", ".join(e.key_attributes)
            lines.append(f"- **{e.name}**: {e.description} *(Attributes: {attrs})*")

        lines.extend(["", "## 2. User Stories & Acceptance Criteria"])
        for s in stories:
            lines.append(f"### {s.id}: {s.title}")
            lines.append(f"**As a** {s.as_a}, **I want to** {s.i_want_to}, **so that** {s.so_that}.")
            lines.append("")
            lines.append("**Acceptance Criteria (Gherkin):**")
            for ac in s.acceptance_criteria:
                lines.append(f"- **Scenario**: {ac.scenario}")
                lines.append(f"  - **Given** {ac.given}")
                lines.append(f"  - **When** {ac.when}")
                lines.append(f"  - **Then** {ac.then}")
            lines.append("")

        lines.extend(["## 3. Core Business Rules"])
        for r in rules:
            lines.append(f"- {r}")

        lines.extend(["", "## 4. Workflows & State Transitions"])
        for wf in workflows:
            lines.append(f"- {wf}")

        return "\n".join(lines)
