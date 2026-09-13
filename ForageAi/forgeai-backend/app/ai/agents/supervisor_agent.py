"""
Supervisor Agent (Agent 1).
Coordinates workflow planning, ordered stage decomposition, and routing metadata.
"""

import json
from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field

from app.ai.agents.base import BaseAgent
from app.ai.agents.types import AgentContext, AgentExecutionError, ArtifactDraft
from app.ai.agents.utils import extract_json_payload


class SupervisorInputSchema(BaseModel):
    prompt: str = Field(..., min_length=3, description="User intent or project description")
    tech_stack: Dict[str, Any] = Field(default_factory=dict)
    shared_state: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SupervisorOutputSchema(BaseModel):
    workflow_plan: str = Field(..., description="High-level execution blueprint plan")
    stages: List[str] = Field(..., description="Ordered list of agent pipeline stages")
    current_stage: str = Field(default="initialization")
    target_agents: List[str] = Field(..., description="List of required specialist agents")
    execution_strategy: str = Field(default="dag_supervised")
    routing_metadata: Dict[str, Any] = Field(default_factory=dict)


class SupervisorAgent(BaseAgent):
    agent_name = "SupervisorAgent"
    version = "1.0.0"
    description = "Decomposes requirements into structured workflow stages and agent routing plans."
    input_schema = SupervisorInputSchema
    output_schema = SupervisorOutputSchema

    def execute(
        self,
        context: AgentContext,
        validated_input: Dict[str, Any],
    ) -> Tuple[Dict[str, Any], List[ArtifactDraft]]:
        prompt = validated_input["prompt"]
        tech_stack = validated_input.get("tech_stack", {})

        system_prompt = (
            "You are the Lead AI Software Architect and Supervisor. "
            "Decompose the user software request into an ordered execution plan and agent workflow."
        )
        task_prompt = (
            f"Analyze software request: '{prompt}' with tech stack: {json.dumps(tech_stack)}. "
            "Return a structured execution plan covering requirements, architecture, database, API, "
            "backend, frontend, UI/UX, security, devops, testing, documentation, review, and optimization."
        )

        parsed = self.generate_structured_output(prompt=task_prompt, system_prompt=system_prompt)

        ordered_stages = [
            "requirements",
            "business_analysis",
            "database_modeling",
            "api_specification",
            "backend_scaffolding",
            "frontend_scaffolding",
            "ui_ux_design",
            "security_audit",
            "devops_configuration",
            "testing_strategy",
            "documentation",
            "code_review",
            "optimization",
        ]

        target_agents = [
            "RequirementsAgent",
            "BusinessAnalystAgent",
            "DatabaseAgent",
            "APIAgent",
            "BackendAgent",
            "FrontendAgent",
            "UIUXAgent",
            "SecurityAgent",
            "DevOpsAgent",
            "TestingAgent",
            "DocumentationAgent",
            "CodeReviewAgent",
            "OptimizationAgent",
        ]

        if parsed and "workflow_plan" in parsed and "stages" in parsed:
            output_data = parsed
        else:
            output_data = {
                "workflow_plan": f"Orchestrated 14-Agent Engineering Workflow for: {prompt[:80]}",
                "stages": ordered_stages,
                "current_stage": "requirements",
                "target_agents": target_agents,
                "execution_strategy": "dag_supervised",
                "routing_metadata": {
                    "parallel_groups": [
                        ["RequirementsAgent", "BusinessAnalystAgent"],
                        ["BackendAgent", "FrontendAgent", "UIUXAgent"],
                        ["DevOpsAgent", "TestingAgent"],
                    ],
                    "sequential_dependencies": {
                        "DatabaseAgent": ["RequirementsAgent", "BusinessAnalystAgent"],
                        "APIAgent": ["DatabaseAgent"],
                        "SecurityAgent": ["BackendAgent", "APIAgent", "DatabaseAgent"],
                        "DocumentationAgent": ["DevOpsAgent", "TestingAgent"],
                        "CodeReviewAgent": ["BackendAgent", "FrontendAgent"],
                        "OptimizationAgent": ["CodeReviewAgent"],
                    },
                },
            }

        manifest_json = json.dumps(output_data, indent=2)
        artifact = ArtifactDraft(
            artifact_type="plan",
            file_path="workflow_manifest.json",
            content=manifest_json,
            language="json",
            metadata={"agent": self.agent_name, "version": self.version},
        )

        return output_data, [artifact]
