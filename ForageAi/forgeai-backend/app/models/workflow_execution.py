import uuid
from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    triggered_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    blueprint_id = Column(UUID(as_uuid=True), ForeignKey("blueprints.id", ondelete="SET NULL"), nullable=True)
    workflow_name = Column(String(100), nullable=False, server_default="full_blueprint_generation")
    status = Column(String(50), nullable=False, server_default="pending")
    prompt = Column(Text, nullable=False)
    tech_stack = Column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    current_agent = Column(String(100), nullable=True)
    progress_percentage = Column(Integer, nullable=False, server_default="0")
    error_message = Column(Text, nullable=True)
    metadata_ = Column("metadata", JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    project = relationship("Project")
    triggered_by = relationship("User", foreign_keys=[triggered_by_user_id])
    blueprint = relationship("Blueprint")
    agent_runs = relationship("AgentRun", back_populates="workflow_execution", cascade="all, delete-orphan", lazy="selectin")
    events = relationship("WorkflowEvent", back_populates="workflow_execution", cascade="all, delete-orphan", lazy="selectin")

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'running', 'completed', 'failed', 'cancelled')",
            name="chk_workflow_execution_status",
        ),
        CheckConstraint(
            "progress_percentage >= 0 AND progress_percentage <= 100",
            name="chk_workflow_progress_percentage",
        ),
        Index("idx_workflow_executions_project", "project_id"),
        Index("idx_workflow_executions_status", "status"),
        Index("idx_workflow_executions_user", "triggered_by_user_id"),
    )
