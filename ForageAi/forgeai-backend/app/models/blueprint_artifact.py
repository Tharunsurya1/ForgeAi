import uuid
from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class BlueprintArtifact(Base):
    __tablename__ = "blueprint_artifacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    blueprint_id = Column(UUID(as_uuid=True), ForeignKey("blueprints.id", ondelete="CASCADE"), nullable=False)
    version = Column(Integer, nullable=False, default=1, server_default="1")
    artifact_type = Column(String(100), nullable=False)
    file_path = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    language = Column(String(50), nullable=False, server_default="text")
    file_size_bytes = Column(Integer, nullable=False, default=0, server_default="0")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    blueprint = relationship("Blueprint")

    __table_args__ = (
        Index("idx_artifacts_blueprint", "blueprint_id", "version"),
        Index("idx_artifacts_type", "artifact_type"),
    )
