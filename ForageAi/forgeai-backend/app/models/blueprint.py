import uuid
from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Blueprint(Base):
    __tablename__ = "blueprints"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    current_version = Column(Integer, nullable=False, default=1, server_default="1")
    title = Column(String(250), nullable=False)
    summary = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, server_default="draft")
    metadata_ = Column("metadata", JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    project = relationship("Project")

    __table_args__ = (
        Index("idx_blueprints_project", "project_id"),
    )
