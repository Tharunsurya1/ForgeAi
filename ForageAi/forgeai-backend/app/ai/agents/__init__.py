"""
ForgeAI Agent Foundation & 14 Specialist Agents Catalog.
Exporting core abstractions, provider interfaces, and domain specialist agents.
"""

from app.ai.agents.base import BaseAgent
from app.ai.agents.provider import (
    AnthropicProvider,
    DeterministicMockProvider,
    LLMAuthenticationError,
    LLMConfigurationError,
    LLMProvider,
    LLMProviderError,
    LLMRateLimitError,
    LLMSchemaValidationError,
    LLMTimeoutError,
    OpenAIProvider,
    create_llm_provider,
    get_default_provider,
    set_default_provider,
)

from app.ai.agents.types import (
    AgentContext,
    AgentExecutionError,
    AgentResult,
    ArtifactDraft,
)
from app.ai.agents.utils import sanitize_payload, extract_json_payload

# 14 Specialist Agents
from app.ai.agents.supervisor_agent import SupervisorAgent
from app.ai.agents.requirements_agent import RequirementsAgent
from app.ai.agents.business_analyst_agent import BusinessAnalystAgent
from app.ai.agents.database_agent import DatabaseAgent
from app.ai.agents.api_agent import APIAgent
from app.ai.agents.backend_agent import BackendAgent
from app.ai.agents.frontend_agent import FrontendAgent
from app.ai.agents.ui_ux_agent import UIUXAgent
from app.ai.agents.security_agent import SecurityAgent
from app.ai.agents.devops_agent import DevOpsAgent
from app.ai.agents.testing_agent import TestingAgent
from app.ai.agents.documentation_agent import DocumentationAgent
from app.ai.agents.code_review_agent import CodeReviewAgent
from app.ai.agents.optimization_agent import OptimizationAgent

__all__ = [
    # Foundation
    "BaseAgent",
    "AgentContext",
    "AgentResult",
    "ArtifactDraft",
    "AgentExecutionError",
    "LLMProvider",
    "DeterministicMockProvider",
    "get_default_provider",
    "set_default_provider",
    "sanitize_payload",
    "extract_json_payload",
    # 14 Specialist Agents
    "SupervisorAgent",
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
