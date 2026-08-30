from typing import Generator
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database.base import Base
from app.database.database import SessionLocal, engine, get_db
from app.main import app as fastapi_app
import app.models  # noqa: F401
from app.models.organization import Organization
from app.models.organization_invitation import OrganizationInvitation
from app.models.organization_member import OrganizationMember
from app.models.project import Project
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.user import User
from app.models.user_session import UserSession


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Ensure all tables and updated columns are created in the database before running tests."""
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE teams ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;"))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS organization_invitations (
                id UUID PRIMARY KEY,
                organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
                email VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'member',
                token VARCHAR(100) NOT NULL UNIQUE,
                status VARCHAR(50) NOT NULL DEFAULT 'pending',
                invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        """))
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """
    Yields a fresh SQLAlchemy database session for testing,
    and cleans up test user records created during test runs.
    """
    session = SessionLocal()
    try:
        yield session
    finally:
        # Cleanup test records created with test domains
        try:
            test_users = (
                session.query(User)
                .filter(User.email.like("%@testforgeai.com"))
                .all()
            )
            for u in test_users:
                # Delete user sessions
                session.query(UserSession).filter(UserSession.user_id == u.id).delete()

                # Find and delete org memberships
                org_members = session.query(OrganizationMember).filter(OrganizationMember.user_id == u.id).all()
                org_ids = [om.organization_id for om in org_members]

                session.query(TeamMember).filter(TeamMember.user_id == u.id).delete()
                session.query(Project).filter(Project.created_by == u.id).delete()
                session.query(OrganizationInvitation).filter(OrganizationInvitation.invited_by == u.id).delete()
                session.query(OrganizationMember).filter(OrganizationMember.user_id == u.id).delete()

                if org_ids:
                    session.query(OrganizationInvitation).filter(OrganizationInvitation.organization_id.in_(org_ids)).delete(synchronize_session=False)
                    session.query(Team).filter(Team.organization_id.in_(org_ids)).delete(synchronize_session=False)
                    session.query(Organization).filter(Organization.id.in_(org_ids)).delete(synchronize_session=False)

                session.delete(u)
            session.commit()
        except Exception:
            session.rollback()
        finally:
            session.close()


@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    """
    FastAPI TestClient fixture with overridden DB dependency.
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass

    fastapi_app.dependency_overrides[get_db] = override_get_db
    with TestClient(fastapi_app) as test_client:
        yield test_client
    fastapi_app.dependency_overrides.clear()
