from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AgentRunResponse(BaseModel):
    id: UUID
    workflow_execution_id: UUID
    agent_name: str
    status: str
    retry_count: int
    execution_time_ms: Optional[int] = None
    input_payload: Dict[str, Any] = Field(default_factory=dict)
    output_payload: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkflowEventResponse(BaseModel):
    id: UUID
    workflow_execution_id: UUID
    event_type: str
    agent_name: Optional[str] = None
    sequence_number: int
    payload: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkflowExecutionResponse(BaseModel):
    id: UUID
    project_id: UUID
    triggered_by_user_id: Optional[UUID] = None
    blueprint_id: Optional[UUID] = None
    workflow_name: str
    status: str
    prompt: str
    tech_stack: Dict[str, Any] = Field(default_factory=dict)
    current_agent: Optional[str] = None
    progress_percentage: int
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict, alias="metadata_")
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class WorkflowExecutionDetailResponse(WorkflowExecutionResponse):
    agent_runs: List[AgentRunResponse] = Field(default_factory=list)
    events: List[WorkflowEventResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
