import uuid
from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_execution_id = Column(
        UUID(as_uuid=True),
        ForeignKey("workflow_executions.id", ondelete="CASCADE"),
        nullable=False,
    )
    agent_name = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, server_default="pending")
    retry_count = Column(Integer, nullable=False, server_default="0")
    execution_time_ms = Column(Integer, nullable=True)
    input_payload = Column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    output_payload = Column(JSONB, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    workflow_execution = relationship("WorkflowExecution", back_populates="agent_runs")

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'running', 'completed', 'failed', 'skipped', 'cancelled')",
            name="chk_agent_run_status",
        ),
        Index("idx_agent_runs_workflow", "workflow_execution_id"),
        Index("idx_agent_runs_status", "status"),
        Index("idx_agent_runs_name", "agent_name"),
    )
