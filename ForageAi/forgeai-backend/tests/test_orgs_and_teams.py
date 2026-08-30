from datetime import datetime, timezone, timedelta
import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.organization import Organization
from app.models.organization_invitation import OrganizationInvitation
from app.models.organization_member import OrganizationMember
from app.models.team import Team
from app.models.team_member import TeamMember
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


def test_update_and_delete_organization(client: TestClient):
    """Test updating organization settings and deleting organization."""
    _, _, owner_token = _create_user_and_login(client, prefix="orgmgr")
    _, _, member_token = _create_user_and_login(client, prefix="orgother")

    # Create Org
    create_res = client.post(
        "/api/v1/orgs",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"name": "Initial Org Name", "plan_tier": "free"},
    )
    org_id = create_res.json()["id"]

    # Update Org details (Owner allowed)
    update_res = client.patch(
        f"/api/v1/orgs/{org_id}",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"name": "Updated Org Name", "plan_tier": "enterprise"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Updated Org Name"
    assert update_res.json()["plan_tier"] == "enterprise"

    # Non-member cannot update (403)
    unauth_update = client.patch(
        f"/api/v1/orgs/{org_id}",
        headers={"Authorization": f"Bearer {member_token}"},
        json={"name": "Hacked Org Name"},
    )
    assert unauth_update.status_code == 403

    # Delete Org (Owner allowed)
    del_res = client.delete(
        f"/api/v1/orgs/{org_id}",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert del_res.status_code == 200
    assert "deleted" in del_res.json()["message"].lower()

    # Get after deletion -> 404
    get_res = client.get(
        f"/api/v1/orgs/{org_id}",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert get_res.status_code == 404


def test_transfer_ownership_and_leave(client: TestClient, db: Session):
    """Test transferring ownership to another member and member leaving."""
    owner_id, owner_email, owner_token = _create_user_and_login(client, prefix="prevowner")
    member_id, member_email, member_token = _create_user_and_login(client, prefix="newowner")

    # Create Org
    org_res = client.post(
        "/api/v1/orgs",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"name": "Ownership Test Workspace"},
    )
    org_id = org_res.json()["id"]

    # Add second user as member
    invite_res = client.post(
        f"/api/v1/orgs/{org_id}/invitations",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"email": member_email, "role": "member"},
    )
    assert invite_res.status_code == 201
    invite_token = invite_res.json()["token"]

    accept_res = client.post(
        f"/api/v1/invitations/{invite_token}/accept",
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert accept_res.status_code == 200

    # Transfer ownership
    transfer_res = client.post(
        f"/api/v1/orgs/{org_id}/transfer-ownership",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"new_owner_user_id": member_id},
    )
    assert transfer_res.status_code == 200

    # Verify new roles: previous owner is admin, new owner is owner
    members_res = client.get(
        f"/api/v1/orgs/{org_id}/members",
        headers={"Authorization": f"Bearer {member_token}"},
    )
    members_map = {m["user_id"]: m["role"] for m in members_res.json()}
    assert members_map[owner_id] == "admin"
    assert members_map[member_id] == "owner"

    # Previous owner (now admin) can leave the organization
    leave_res = client.post(
        f"/api/v1/orgs/{org_id}/leave",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert leave_res.status_code == 200

    # Sole owner cannot leave without transfer (400)
    owner_leave_res = client.post(
        f"/api/v1/orgs/{org_id}/leave",
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert owner_leave_res.status_code == 400


def test_member_role_changes_and_removal(client: TestClient):
    """Test updating member role and removing member."""
    owner_id, _, owner_token = _create_user_and_login(client, prefix="roleowner")
    target_id, target_email, target_token = _create_user_and_login(client, prefix="roletarget")

    org_res = client.post(
        "/api/v1/orgs",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"name": "Role Management Org"},
    )
    org_id = org_res.json()["id"]

    # Invite and accept as member
    inv = client.post(
        f"/api/v1/orgs/{org_id}/invitations",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"email": target_email, "role": "viewer"},
    ).json()

    client.post(
        f"/api/v1/invitations/{inv['token']}/accept",
        headers={"Authorization": f"Bearer {target_token}"},
    )

    # 1. Promote Viewer to Admin
    update_role_res = client.patch(
        f"/api/v1/orgs/{org_id}/members/{target_id}",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"role": "admin"},
    )
    assert update_role_res.status_code == 200
    assert update_role_res.json()["role"] == "admin"

    # 2. Demote Admin to Member
    demote_res = client.patch(
        f"/api/v1/orgs/{org_id}/members/{target_id}",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"role": "member"},
    )
    assert demote_res.status_code == 200
    assert demote_res.json()["role"] == "member"

    # 3. Create a team and add member to team
    team_res = client.post(
        f"/api/v1/orgs/{org_id}/teams",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"name": "Frontend Core"},
    )
    team_id = team_res.json()["id"]

    add_tm = client.post(
        f"/api/v1/teams/{team_id}/members",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"user_id": target_id},
    )
    assert add_tm.status_code == 201

    # 4. Remove member from Organization -> verify team membership is also purged
    del_member_res = client.delete(
        f"/api/v1/orgs/{org_id}/members/{target_id}",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert del_member_res.status_code == 200

    # Team members list should now only contain creator
    team_mems = client.get(
        f"/api/v1/teams/{team_id}/members",
        headers={"Authorization": f"Bearer {owner_token}"},
    ).json()
    assert len(team_mems) == 1
    assert team_mems[0]["user_id"] == owner_id


def test_invitation_lifecycle(client: TestClient):
    """Test full invitation lifecycle: invite, duplicate check, preview, accept, revoke."""
    _, _, owner_token = _create_user_and_login(client, prefix="invowner")
    _, invitee_email, invitee_token = _create_user_and_login(client, prefix="invitee")

    org_res = client.get("/api/v1/orgs", headers={"Authorization": f"Bearer {owner_token}"})
    org_id = org_res.json()[0]["id"]

    # 1. Create Invitation
    inv_res = client.post(
        f"/api/v1/orgs/{org_id}/invitations",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"email": invitee_email, "role": "member"},
    )
    assert inv_res.status_code == 201
    inv_data = inv_res.json()
    inv_token = inv_data["token"]
    inv_id = inv_data["id"]
    assert inv_data["email"] == invitee_email.lower()
    assert inv_data["status"] == "pending"

    # 2. Duplicate active invitation fails with 400
    dup_res = client.post(
        f"/api/v1/orgs/{org_id}/invitations",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"email": invitee_email, "role": "member"},
    )
    assert dup_res.status_code == 400

    # 3. Public Preview
    preview_res = client.get(f"/api/v1/invitations/{inv_token}")
    assert preview_res.status_code == 200
    preview_data = preview_res.json()
    assert preview_data["email"] == invitee_email.lower()
    assert preview_data["is_expired"] is False

    # 4. List Invitations
    list_inv = client.get(
        f"/api/v1/orgs/{org_id}/invitations",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert list_inv.status_code == 200
    assert len(list_inv.json()) >= 1

    # 5. Accept Invitation
    accept_res = client.post(
        f"/api/v1/invitations/{inv_token}/accept",
        headers={"Authorization": f"Bearer {invitee_token}"},
    )
    assert accept_res.status_code == 200
    assert "accepted" in accept_res.json()["message"].lower()

    # 6. Accepting again fails with 400
    accept_again = client.post(
        f"/api/v1/invitations/{inv_token}/accept",
        headers={"Authorization": f"Bearer {invitee_token}"},
    )
    assert accept_again.status_code == 400

    # 7. Revoke flow: create new invitation and revoke
    other_email = f"other_{uuid.uuid4().hex[:8]}@testforgeai.com"
    inv2_res = client.post(
        f"/api/v1/orgs/{org_id}/invitations",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"email": other_email, "role": "viewer"},
    )
    inv2_id = inv2_res.json()["id"]
    inv2_token = inv2_res.json()["token"]

    revoke_res = client.delete(
        f"/api/v1/orgs/{org_id}/invitations/{inv2_id}",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert revoke_res.status_code == 200

    # Accepting revoked invitation fails with 400
    _, _, other_token = _create_user_and_login(client, prefix="otheruser")
    accept_revoked = client.post(
        f"/api/v1/invitations/{inv2_token}/accept",
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert accept_revoked.status_code == 400


def test_team_lifecycle_and_members(client: TestClient):
    """Test creating a team, updating team, adding members, and deleting a team."""
    owner_id, _, owner_token = _create_user_and_login(client, prefix="teamowner")
    member_user_id, member_email, member_token = _create_user_and_login(client, prefix="teammem")

    org_res = client.get("/api/v1/orgs", headers={"Authorization": f"Bearer {owner_token}"})
    org_id = org_res.json()[0]["id"]

    # Add member to org first via invitation
    inv = client.post(
        f"/api/v1/orgs/{org_id}/invitations",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"email": member_email, "role": "member"},
    ).json()

    client.post(
        f"/api/v1/invitations/{inv['token']}/accept",
        headers={"Authorization": f"Bearer {member_token}"},
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

    # Duplicate team name in same org fails with 400
    dup_team = client.post(
        f"/api/v1/orgs/{org_id}/teams",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"name": "AI Architecture Guild"},
    )
    assert dup_team.status_code == 400

    # 2. Update Team
    update_team_res = client.patch(
        f"/api/v1/teams/{team_id}",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"name": "AI Architecture & Systems", "description": "Updated description"},
    )
    assert update_team_res.status_code == 200
    assert update_team_res.json()["name"] == "AI Architecture & Systems"

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

    # 5. Remove member from team
    del_tm_res = client.delete(
        f"/api/v1/teams/{team_id}/members/{member_user_id}",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert del_tm_res.status_code == 200

    # Verify team member count is back to 1
    team_after_remove = client.get(
        f"/api/v1/teams/{team_id}",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert team_after_remove.json()["member_count"] == 1

    # 6. Delete team
    del_res = client.delete(
        f"/api/v1/teams/{team_id}",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert del_res.status_code == 200
    assert "deleted" in del_res.json()["message"].lower()


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
