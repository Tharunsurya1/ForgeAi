import uuid
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import create_access_token, get_password_hash, hash_token
from app.models.user import User
from app.models.user_session import UserSession


def test_health_and_root(client: TestClient):
    """Verify that root and health endpoints remain operational."""
    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "ok"

    res_root = client.get("/")
    assert res_root.status_code == 200


def test_register_success(client: TestClient, db: Session):
    """Test successful user registration and field verification."""
    unique_email = f"user_{uuid.uuid4().hex[:8]}@testforgeai.com"
    payload = {
        "email": unique_email,
        "password": "StrongPassword123!",
        "full_name": "Test User",
    }

    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 201
    data = res.json()

    assert data["email"] == unique_email.lower()
    assert data["full_name"] == "Test User"
    assert data["is_active"] is True
    assert data["is_superuser"] is False
    assert data["email_verified"] is False
    assert "password" not in data
    assert "password_hash" not in data

    # Verify user saved in DB with hashed password
    user_in_db = db.query(User).filter(User.email == unique_email.lower()).first()
    assert user_in_db is not None
    assert user_in_db.password_hash != "StrongPassword123!"
    assert user_in_db.password_hash.startswith("$2b$")


def test_register_duplicate_email(client: TestClient):
    """Test duplicate email rejection with 400 Bad Request."""
    unique_email = f"dup_{uuid.uuid4().hex[:8]}@testforgeai.com"
    payload = {
        "email": unique_email,
        "password": "StrongPassword123!",
        "full_name": "Original User",
    }

    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    # Attempt to register the exact same email
    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already registered" in res2.json()["detail"].lower()


def test_register_invalid_input(client: TestClient):
    """Test validation errors for short passwords and malformed emails."""
    # Short password (< 8 chars)
    res_short_pw = client.post(
        "/api/v1/auth/register",
        json={
            "email": "valid@testforgeai.com",
            "password": "123",
            "full_name": "Short Pw",
        },
    )
    assert res_short_pw.status_code == 422

    # Malformed email
    res_bad_email = client.post(
        "/api/v1/auth/register",
        json={
            "email": "not-an-email",
            "password": "StrongPassword123!",
            "full_name": "Bad Email",
        },
    )
    assert res_bad_email.status_code == 422


def test_login_success(client: TestClient, db: Session):
    """Test login issuing access token, refresh token, and creating user session."""
    unique_email = f"login_{uuid.uuid4().hex[:8]}@testforgeai.com"
    raw_password = "SecurePassword2026!"

    # Register first
    client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": raw_password,
            "full_name": "Login Tester",
        },
    )

    # Login
    res = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": raw_password},
    )
    assert res.status_code == 200
    data = res.json()

    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["expires_in"] == 1800  # 30 minutes in seconds
    assert data["user"]["email"] == unique_email.lower()

    # Verify session recorded in DB with hashed refresh token
    user = db.query(User).filter(User.email == unique_email.lower()).first()
    expected_hash = hash_token(data["refresh_token"])
    session = (
        db.query(UserSession)
        .filter(UserSession.user_id == user.id, UserSession.refresh_token_hash == expected_hash)
        .first()
    )
    assert session is not None
    assert session.is_revoked is False


def test_login_wrong_password(client: TestClient):
    """Test login rejection with incorrect password."""
    unique_email = f"wrong_pw_{uuid.uuid4().hex[:8]}@testforgeai.com"
    client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": "CorrectPassword123!",
            "full_name": "Wrong Pw Tester",
        },
    )

    res = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": "WrongPassword999!"},
    )
    assert res.status_code == 401
    assert "invalid email or password" in res.json()["detail"].lower()


def test_login_unknown_email(client: TestClient):
    """Test login rejection with non-existent email."""
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@testforgeai.com", "password": "Password123!"},
    )
    assert res.status_code == 401
    assert "invalid email or password" in res.json()["detail"].lower()


def test_login_inactive_user(client: TestClient, db: Session):
    """Test login rejection when user account is inactive."""
    unique_email = f"inactive_{uuid.uuid4().hex[:8]}@testforgeai.com"
    raw_password = "Password123!"

    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": raw_password,
            "full_name": "Inactive User",
        },
    )
    assert reg_res.status_code == 201

    # Deactivate user in DB
    user = db.query(User).filter(User.email == unique_email.lower()).first()
    assert user is not None
    user.is_active = False
    db.commit()

    res = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": raw_password},
    )
    assert res.status_code == 403
    assert "inactive" in res.json()["detail"].lower()


def test_get_me_authenticated(client: TestClient):
    """Test GET /api/v1/auth/me with valid Bearer token."""
    unique_email = f"me_{uuid.uuid4().hex[:8]}@testforgeai.com"
    raw_password = "Password123!"

    client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": raw_password,
            "full_name": "Me Tester",
        },
    )

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": raw_password},
    )
    token = login_res.json()["access_token"]

    res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == unique_email.lower()
    assert data["full_name"] == "Me Tester"


def test_get_me_unauthenticated(client: TestClient):
    """Test GET /api/v1/auth/me with missing or invalid token."""
    # Missing token
    res_missing = client.get("/api/v1/auth/me")
    assert res_missing.status_code == 401

    # Invalid garbage token
    res_invalid = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.token.value"},
    )
    assert res_invalid.status_code == 401


def test_get_me_expired_token(client: TestClient, db: Session):
    """Test GET /api/v1/auth/me rejection when access token has expired."""
    unique_email = f"exp_{uuid.uuid4().hex[:8]}@testforgeai.com"
    user = User(
        email=unique_email.lower(),
        password_hash=get_password_hash("Password123!"),
        full_name="Expired Tester",
        is_active=True,
    )
    db.add(user)
    db.commit()

    # Generate an already expired access token (-1 minute)
    expired_token = create_access_token(
        subject=str(user.id),
        expires_delta=timedelta(minutes=-1),
    )

    res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert res.status_code == 401
    assert "could not validate credentials" in res.json()["detail"].lower()


def test_refresh_token_rotation_and_revocation(client: TestClient, db: Session):
    """Test token refresh, session rotation, and replay prevention."""
    unique_email = f"refresh_{uuid.uuid4().hex[:8]}@testforgeai.com"
    raw_password = "Password123!"

    client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": raw_password,
            "full_name": "Refresh Tester",
        },
    )

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": raw_password},
    )
    original_refresh_token = login_res.json()["refresh_token"]

    # 1. Perform refresh
    refresh_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": original_refresh_token},
    )
    assert refresh_res.status_code == 200
    refresh_data = refresh_res.json()

    new_access_token = refresh_data["access_token"]
    new_refresh_token = refresh_data["refresh_token"]

    assert new_access_token is not None
    assert new_refresh_token is not None
    assert new_refresh_token != original_refresh_token

    # 2. Verify new access token works on /me
    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {new_access_token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == unique_email.lower()

    # 3. Verify previous refresh token is revoked and cannot be reused (rotation security)
    replay_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": original_refresh_token},
    )
    assert replay_res.status_code == 401
    assert "invalid or revoked" in replay_res.json()["detail"].lower()


def test_refresh_token_expired(client: TestClient, db: Session):
    """Test refresh token rejection when session has expired."""
    unique_email = f"refexp_{uuid.uuid4().hex[:8]}@testforgeai.com"
    user = User(
        email=unique_email.lower(),
        password_hash=get_password_hash("Password123!"),
        full_name="Expired Refresh Tester",
        is_active=True,
    )
    db.add(user)
    db.commit()

    raw_token = "expired_raw_refresh_token_123"
    token_hash = hash_token(raw_token)

    # Session expired 2 days ago
    expired_session = UserSession(
        user_id=user.id,
        refresh_token_hash=token_hash,
        is_revoked=False,
        expires_at=datetime.now(timezone.utc) - timedelta(days=2),
    )
    db.add(expired_session)
    db.commit()

    res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": raw_token},
    )
    assert res.status_code == 401
    assert "expired" in res.json()["detail"].lower()


def test_logout_revokes_session(client: TestClient, db: Session):
    """Test that logout revokes session and prevents subsequent token refresh."""
    unique_email = f"logout_{uuid.uuid4().hex[:8]}@testforgeai.com"
    raw_password = "Password123!"

    client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": raw_password,
            "full_name": "Logout Tester",
        },
    )

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": raw_password},
    )
    access_token = login_res.json()["access_token"]
    refresh_token = login_res.json()["refresh_token"]

    # Logout
    logout_res = client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"refresh_token": refresh_token},
    )
    assert logout_res.status_code == 200
    assert "successfully logged out" in logout_res.json()["message"].lower()

    # Attempting to refresh with the logged-out refresh token must fail
    try_refresh_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert try_refresh_res.status_code == 401


def test_list_sessions_authenticated(client: TestClient):
    """Test GET /api/v1/auth/sessions returns active sessions with valid schema."""
    unique_email = f"sess_{uuid.uuid4().hex[:8]}@testforgeai.com"
    raw_password = "Password123!"

    client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": raw_password,
            "full_name": "Session Tester",
        },
    )

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": raw_password},
    )
    token = login_res.json()["access_token"]

    res = client.get(
        "/api/v1/auth/sessions",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    sessions = res.json()
    assert isinstance(sessions, list)
    assert len(sessions) >= 1

    first_sess = sessions[0]
    assert "id" in first_sess
    assert "device_info" in first_sess
    assert "ip_address" in first_sess
    assert "is_current" in first_sess
    assert "is_revoked" in first_sess
    assert "created_at" in first_sess
    assert "expires_at" in first_sess
    # Ensure sensitive token material is NOT exposed
    assert "refresh_token" not in first_sess
    assert "refresh_token_hash" not in first_sess
    assert "user_id" not in first_sess


def test_list_sessions_unauthenticated(client: TestClient):
    """Test GET /api/v1/auth/sessions returns 401 when unauthorized."""
    res = client.get("/api/v1/auth/sessions")
    assert res.status_code == 401


def test_revoke_specific_session(client: TestClient, db: Session):
    """Test DELETE /api/v1/auth/sessions/{session_id} revokes targeted session."""
    unique_email = f"revsess_{uuid.uuid4().hex[:8]}@testforgeai.com"
    raw_password = "Password123!"

    client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": raw_password,
            "full_name": "Revoke Session Tester",
        },
    )

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": raw_password},
    )
    token = login_res.json()["access_token"]

    # List sessions to get ID
    list_res = client.get(
        "/api/v1/auth/sessions",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert list_res.status_code == 200
    session_id = list_res.json()[0]["id"]

    # Revoke specific session
    del_res = client.delete(
        f"/api/v1/auth/sessions/{session_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert del_res.status_code == 200
    assert "successfully revoked" in del_res.json()["message"].lower()

    # Verify session is now revoked
    sess_in_db = db.query(UserSession).filter(UserSession.id == session_id).first()
    assert sess_in_db.is_revoked is True


def test_logout_all_other_sessions(client: TestClient, db: Session):
    """Test POST /api/v1/auth/logout with all_other=True revokes all other sessions."""
    unique_email = f"logoutall_{uuid.uuid4().hex[:8]}@testforgeai.com"
    raw_password = "Password123!"

    client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": raw_password,
            "full_name": "Logout All Other Tester",
        },
    )

    # Session 1 (Device A)
    login1_res = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": raw_password},
    )
    token1 = login1_res.json()["access_token"]
    refresh1 = login1_res.json()["refresh_token"]

    # Session 2 (Device B)
    login2_res = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": raw_password},
    )
    refresh2 = login2_res.json()["refresh_token"]

    # Logout all other devices from Session 1
    logout_other_res = client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {token1}"},
        json={"refresh_token": refresh1, "all_other": True},
    )
    assert logout_other_res.status_code == 200

    # Session 1's refresh token should still be active
    refresh1_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh1},
    )
    assert refresh1_res.status_code == 200

    # Session 2's refresh token must be revoked
    refresh2_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh2},
    )
    assert refresh2_res.status_code == 401


def test_update_profile_success(client: TestClient, db: Session):
    """Test PATCH /api/v1/auth/me updates permitted fields and persists in DB."""
    unique_email = f"prof_{uuid.uuid4().hex[:8]}@testforgeai.com"
    raw_password = "Password123!"

    client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": raw_password,
            "full_name": "Original Name",
        },
    )

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": raw_password},
    )
    token = login_res.json()["access_token"]

    # Update profile
    patch_res = client.patch(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "full_name": "Updated Real Name",
            "avatar_url": "https://example.com/avatar.png",
        },
    )
    assert patch_res.status_code == 200
    updated_data = patch_res.json()
    assert updated_data["full_name"] == "Updated Real Name"
    assert updated_data["avatar_url"] == "https://example.com/avatar.png"
    assert updated_data["email"] == unique_email.lower()

    # Verify DB persistence
    user_in_db = db.query(User).filter(User.email == unique_email.lower()).first()
    assert user_in_db.full_name == "Updated Real Name"
    assert user_in_db.avatar_url == "https://example.com/avatar.png"


def test_update_profile_unauthenticated(client: TestClient):
    """Test PATCH /api/v1/auth/me returns 401 when unauthorized."""
    res = client.patch("/api/v1/auth/me", json={"full_name": "Test"})
    assert res.status_code == 401


def test_update_profile_validation(client: TestClient):
    """Test PATCH /api/v1/auth/me rejects empty name."""
    unique_email = f"profval_{uuid.uuid4().hex[:8]}@testforgeai.com"
    raw_password = "Password123!"

    client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": raw_password,
            "full_name": "Original Name",
        },
    )

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": raw_password},
    )
    token = login_res.json()["access_token"]

    # Empty string full_name
    res = client.patch(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"full_name": "   "},
    )
    assert res.status_code in (400, 422)
