import uuid
from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class OrganizationMember(Base):
    __tablename__ = "organization_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), nullable=False, server_default="member")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    organization = relationship("Organization")
    user = relationship("User")

    __table_args__ = (
        UniqueConstraint("organization_id", "user_id", name="uq_org_user"),
        CheckConstraint("role IN ('owner', 'admin', 'member', 'viewer')", name="chk_org_role"),
        Index("idx_org_members_user", "user_id"),
    )
