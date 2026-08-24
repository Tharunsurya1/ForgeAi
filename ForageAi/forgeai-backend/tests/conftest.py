from typing import Generator
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.database.database import SessionLocal, get_db
from app.main import app
from app.models.user import User
from app.models.user_session import UserSession


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
                session.query(UserSession).filter(UserSession.user_id == u.id).delete()
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

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
