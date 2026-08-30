import uuid
from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class OrganizationInvitation(Base):
    __tablename__ = "organization_invitations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    email = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, server_default="member")
    token = Column(String(100), nullable=False, unique=True, index=True)
    status = Column(String(50), nullable=False, server_default="pending")
    invited_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    organization = relationship("Organization")
    inviter = relationship("User", foreign_keys=[invited_by])

    __table_args__ = (
        CheckConstraint("role IN ('owner', 'admin', 'member', 'viewer')", name="chk_invitation_role"),
        CheckConstraint("status IN ('pending', 'accepted', 'rejected', 'revoked', 'expired')", name="chk_invitation_status"),
        Index("idx_org_invitations_org_email", "organization_id", "email"),
        Index("idx_org_invitations_status", "status"),
    )
