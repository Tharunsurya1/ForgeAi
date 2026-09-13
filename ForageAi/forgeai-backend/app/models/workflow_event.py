import uuid
from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class WorkflowEvent(Base):
    __tablename__ = "workflow_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_execution_id = Column(
        UUID(as_uuid=True),
        ForeignKey("workflow_executions.id", ondelete="CASCADE"),
        nullable=False,
    )
    event_type = Column(String(100), nullable=False)
    agent_name = Column(String(100), nullable=True)
    sequence_number = Column(Integer, nullable=False, server_default="1")
    payload = Column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    workflow_execution = relationship("WorkflowExecution", back_populates="events")

    __table_args__ = (
        Index("idx_workflow_events_seq", "workflow_execution_id", "sequence_number"),
        Index("idx_workflow_events_type", "event_type"),
    )
