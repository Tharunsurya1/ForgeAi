import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.organization_member import OrganizationMember
from app.models.user import User


def _create_user_and_login(client: TestClient, prefix: str = "user") -> tuple[str, str, str]:
    """Helper to register and login a test user. Returns (user_id, email, access_token)."""
    unique_email = f"{prefix}_{uuid.uuid4().hex[:8]}@testforgeai.com"
    raw_password = "Password123!"

    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": raw_password,
            "full_name": f"{prefix.capitalize()} Tester",
        },
    )
    assert reg_res.status_code == 201
    user_id = reg_res.json()["id"]

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": raw_password},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return user_id, unique_email, token


def test_list_and_create_organization(client: TestClient):
    """Test listing user's default organization and creating a new one."""
    _, _, token = _create_user_and_login(client, prefix="orgowner")

    # 1. Default organization from registration should be listed
    list_res = client.get(
        "/api/v1/orgs",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert list_res.status_code == 200
    orgs = list_res.json()
    assert len(orgs) >= 1
    assert orgs[0]["role"] == "owner"

    # 2. Create second organization
    create_res = client.post(
        "/api/v1/orgs",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Acme AI Labs", "plan_tier": "pro"},
    )
    assert create_res.status_code == 201
    new_org = create_res.json()
    assert new_org["name"] == "Acme AI Labs"
    assert new_org["role"] == "owner"
    assert "slug" in new_org

    # 3. List again - should have at least 2
    list_res2 = client.get(
        "/api/v1/orgs",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert list_res2.status_code == 200
    assert len(list_res2.json()) >= 2


def test_list_organization_members(client: TestClient):
    """Test listing members of an organization."""
    user_id, email, token = _create_user_and_login(client, prefix="listmem")

    list_res = client.get(
        "/api/v1/orgs",
        headers={"Authorization": f"Bearer {token}"},
    )
    org_id = list_res.json()[0]["id"]

    members_res = client.get(
        f"/api/v1/orgs/{org_id}/members",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert members_res.status_code == 200
    members = members_res.json()
    assert len(members) == 1
    assert members[0]["user_id"] == user_id
    assert members[0]["email"] == email.lower()
    assert members[0]["role"] == "owner"


def test_invite_member_and_rbac(client: TestClient, db: Session):
    """Test owner inviting new members and member RBAC restrictions."""
    _, _, owner_token = _create_user_and_login(client, prefix="owner")
    _, member_email, member_token = _create_user_and_login(client, prefix="member")

    # Get owner's org
    org_res = client.get(
        "/api/v1/orgs",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    org_id = org_res.json()[0]["id"]

    # 1. Owner invites member as 'member'
    invite_res = client.post(
        f"/api/v1/orgs/{org_id}/members/invite",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"email": member_email, "role": "member"},
    )
    assert invite_res.status_code == 201
    assert invite_res.json()["email"] == member_email.lower()
    assert invite_res.json()["role"] == "member"

    # 2. Duplicate invite should fail with 400
    dup_res = client.post(
        f"/api/v1/orgs/{org_id}/members/invite",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"email": member_email, "role": "member"},
    )
    assert dup_res.status_code == 400

    # 3. Regular member attempts to invite someone else (should fail with 403 Forbidden)
    third_email = f"third_{uuid.uuid4().hex[:8]}@testforgeai.com"
    denied_res = client.post(
        f"/api/v1/orgs/{org_id}/members/invite",
        headers={"Authorization": f"Bearer {member_token}"},
        json={"email": third_email, "role": "viewer"},
    )
    assert denied_res.status_code == 403


def test_tenant_isolation(client: TestClient):
    """Test User A cannot access or query User B's organization data."""
    _, _, token_a = _create_user_and_login(client, prefix="usera")
    _, _, token_b = _create_user_and_login(client, prefix="userb")

    # Get User A's org
    org_a = client.get("/api/v1/orgs", headers={"Authorization": f"Bearer {token_a}"}).json()[0]
    org_a_id = org_a["id"]

    # User B attempts to access User A's organization details
    unauth_get = client.get(
        f"/api/v1/orgs/{org_a_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert unauth_get.status_code == 403

    # User B attempts to list User A's organization members
    unauth_members = client.get(
        f"/api/v1/orgs/{org_a_id}/members",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert unauth_members.status_code == 403

    # User B attempts to list User A's teams
    unauth_teams = client.get(
        f"/api/v1/orgs/{org_a_id}/teams",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert unauth_teams.status_code == 403


def test_team_lifecycle_and_members(client: TestClient):
    """Test creating a team, listing teams, adding members, and deleting a team."""
    _, _, owner_token = _create_user_and_login(client, prefix="teamowner")
    member_user_id, member_email, member_token = _create_user_and_login(client, prefix="teammem")

    org_res = client.get("/api/v1/orgs", headers={"Authorization": f"Bearer {owner_token}"})
    org_id = org_res.json()[0]["id"]

    # Add member to org first
    client.post(
        f"/api/v1/orgs/{org_id}/members/invite",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"email": member_email, "role": "member"},
    )

    # 1. Create Team under Org
    create_team_res = client.post(
        f"/api/v1/orgs/{org_id}/teams",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"name": "AI Architecture Guild", "description": "Core ML and Rust systems"},
    )
    assert create_team_res.status_code == 201
    team = create_team_res.json()
    team_id = team["id"]
    assert team["name"] == "AI Architecture Guild"
    assert team["member_count"] == 1  # creator included

    # 2. List teams
    teams_list_res = client.get(
        f"/api/v1/orgs/{org_id}/teams",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert teams_list_res.status_code == 200
    assert len(teams_list_res.json()) >= 1

    # 3. Add second member to team
    add_mem_res = client.post(
        f"/api/v1/teams/{team_id}/members",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"user_id": member_user_id},
    )
    assert add_mem_res.status_code == 201
    assert add_mem_res.json()["email"] == member_email.lower()

    # 4. List team members
    team_members_res = client.get(
        f"/api/v1/teams/{team_id}/members",
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert team_members_res.status_code == 200
    assert len(team_members_res.json()) == 2

    # 5. Delete team
    del_res = client.delete(
        f"/api/v1/teams/{team_id}",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert del_res.status_code == 200
    assert "deleted" in del_res.json()["message"].lower()


def test_team_creation_rbac_viewer_denial(client: TestClient):
    """Test that a viewer role in an organization cannot create teams."""
    _, _, owner_token = _create_user_and_login(client, prefix="viewerowner")
    _, viewer_email, viewer_token = _create_user_and_login(client, prefix="vieweruser")

    org_res = client.get("/api/v1/orgs", headers={"Authorization": f"Bearer {owner_token}"})
    org_id = org_res.json()[0]["id"]

    # Add as viewer
    client.post(
        f"/api/v1/orgs/{org_id}/members/invite",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"email": viewer_email, "role": "viewer"},
    )

    # Viewer attempts to create team -> 403 Forbidden
    create_res = client.post(
        f"/api/v1/orgs/{org_id}/teams",
        headers={"Authorization": f"Bearer {viewer_token}"},
        json={"name": "Unauthorized Viewer Team"},
    )
    assert create_res.status_code == 403
