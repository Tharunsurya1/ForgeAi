import uuid
from sqlalchemy import Column, DateTime, ForeignKey, Index, String, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    name = Column(String(200), nullable=False)
    slug = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    repository_url = Column(Text, nullable=True)
    tech_stack = Column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    status = Column(String(50), nullable=False, server_default="active")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    organization = relationship("Organization")
    creator = relationship("User", foreign_keys=[created_by])

    __table_args__ = (
        UniqueConstraint("organization_id", "slug", name="uq_org_project_slug"),
        Index("idx_projects_org", "organization_id"),
        Index("idx_projects_status", "status"),
        Index("idx_projects_tech_stack_gin", "tech_stack", postgresql_using="gin"),
    )
