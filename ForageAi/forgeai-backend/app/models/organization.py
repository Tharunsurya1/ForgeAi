import uuid
from sqlalchemy import Column, DateTime, String, Text, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.database.base import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    slug = Column(String(100), nullable=False, unique=True)
    logo_url = Column(Text, nullable=True)
    plan_tier = Column(String(50), nullable=False, server_default='free')
    billing_email = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint("plan_tier IN ('free', 'pro', 'enterprise')", name='chk_plan_tier'),
        Index('idx_organizations_slug', 'slug'),
    )
