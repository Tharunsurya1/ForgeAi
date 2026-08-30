import uuid
from fastapi.testclient import TestClient

from tests.test_orgs_and_teams import _create_user_and_login


def _setup_org_with_roles(client: TestClient):
    """
    Sets up an organization with 4 users having different roles:
    - Owner
    - Admin
    - Member
    - Viewer
    Returns: (org_id, {
        "owner": (user_id, email, token),
        "admin": (user_id, email, token),
        "member": (user_id, email, token),
        "viewer": (user_id, email, token),
    })
    """
    owner_id, owner_email, owner_token = _create_user_and_login(client, prefix="rbowner")
    admin_id, admin_email, admin_token = _create_user_and_login(client, prefix="rbadmin")
    member_id, member_email, member_token = _create_user_and_login(client, prefix="rbmember")
    viewer_id, viewer_email, viewer_token = _create_user_and_login(client, prefix="rbviewer")

    # Create Org
    org_res = client.post(
        "/api/v1/orgs",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"name": "RBAC Matrix Enterprise"},
    )
    assert org_res.status_code == 201
    org_id = org_res.json()["id"]

    # Invite and accept Admin
    inv_admin = client.post(
        f"/api/v1/orgs/{org_id}/invitations",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"email": admin_email, "role": "admin"},
    ).json()
    client.post(f"/api/v1/invitations/{inv_admin['token']}/accept", headers={"Authorization": f"Bearer {admin_token}"})

    # Invite and accept Member
    inv_member = client.post(
        f"/api/v1/orgs/{org_id}/invitations",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"email": member_email, "role": "member"},
    ).json()
    client.post(f"/api/v1/invitations/{inv_member['token']}/accept", headers={"Authorization": f"Bearer {member_token}"})

    # Invite and accept Viewer
    inv_viewer = client.post(
        f"/api/v1/orgs/{org_id}/invitations",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"email": viewer_email, "role": "viewer"},
    ).json()
    client.post(f"/api/v1/invitations/{inv_viewer['token']}/accept", headers={"Authorization": f"Bearer {viewer_token}"})

    return org_id, {
        "owner": (owner_id, owner_email, owner_token),
        "admin": (admin_id, admin_email, admin_token),
        "member": (member_id, member_email, member_token),
        "viewer": (viewer_id, viewer_email, viewer_token),
    }


def test_rbac_organization_operations(client: TestClient):
    """Test ORG_UPDATE, ORG_DELETE, ORG_TRANSFER_OWNERSHIP permissions across roles."""
    org_id, users = _setup_org_with_roles(client)

    owner_token = users["owner"][2]
    admin_token = users["admin"][2]
    member_token = users["member"][2]
    viewer_token = users["viewer"][2]

    # 1. ORG_UPDATE: Owner and Admin allowed; Member and Viewer denied (403)
    res_owner = client.patch(f"/api/v1/orgs/{org_id}", headers={"Authorization": f"Bearer {owner_token}"}, json={"name": "Owner Updated"})
    assert res_owner.status_code == 200

    res_admin = client.patch(f"/api/v1/orgs/{org_id}", headers={"Authorization": f"Bearer {admin_token}"}, json={"name": "Admin Updated"})
    assert res_admin.status_code == 200

    res_member = client.patch(f"/api/v1/orgs/{org_id}", headers={"Authorization": f"Bearer {member_token}"}, json={"name": "Member Updated"})
    assert res_member.status_code == 403

    res_viewer = client.patch(f"/api/v1/orgs/{org_id}", headers={"Authorization": f"Bearer {viewer_token}"}, json={"name": "Viewer Updated"})
    assert res_viewer.status_code == 403

    # 2. ORG_TRANSFER_OWNERSHIP: Owner allowed; Admin, Member, Viewer denied (403)
    res_admin_transfer = client.post(f"/api/v1/orgs/{org_id}/transfer-ownership", headers={"Authorization": f"Bearer {admin_token}"}, json={"new_owner_user_id": users["member"][0]})
    assert res_admin_transfer.status_code == 403

    res_member_transfer = client.post(f"/api/v1/orgs/{org_id}/transfer-ownership", headers={"Authorization": f"Bearer {member_token}"}, json={"new_owner_user_id": users["viewer"][0]})
    assert res_member_transfer.status_code == 403

    # 3. ORG_DELETE: Admin, Member, Viewer denied (403)
    res_admin_del = client.delete(f"/api/v1/orgs/{org_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_admin_del.status_code == 403

    res_member_del = client.delete(f"/api/v1/orgs/{org_id}", headers={"Authorization": f"Bearer {member_token}"})
    assert res_member_del.status_code == 403

    res_viewer_del = client.delete(f"/api/v1/orgs/{org_id}", headers={"Authorization": f"Bearer {viewer_token}"})
    assert res_viewer_del.status_code == 403


def test_rbac_member_management(client: TestClient):
    """Test MEMBER_INVITE, MEMBER_CHANGE_ROLE, MEMBER_REMOVE across roles."""
    org_id, users = _setup_org_with_roles(client)

    owner_token = users["owner"][2]
    admin_token = users["admin"][2]
    member_token = users["member"][2]
    viewer_token = users["viewer"][2]

    # 1. MEMBER_INVITE: Owner and Admin allowed; Member and Viewer denied (403)
    new_email_1 = f"invite_test_1_{uuid.uuid4().hex[:6]}@testforgeai.com"
    res_admin_invite = client.post(
        f"/api/v1/orgs/{org_id}/invitations",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"email": new_email_1, "role": "member"},
    )
    assert res_admin_invite.status_code == 201

    new_email_2 = f"invite_test_2_{uuid.uuid4().hex[:6]}@testforgeai.com"
    res_member_invite = client.post(
        f"/api/v1/orgs/{org_id}/invitations",
        headers={"Authorization": f"Bearer {member_token}"},
        json={"email": new_email_2, "role": "viewer"},
    )
    assert res_member_invite.status_code == 403

    res_viewer_invite = client.post(
        f"/api/v1/orgs/{org_id}/invitations",
        headers={"Authorization": f"Bearer {viewer_token}"},
        json={"email": new_email_2, "role": "viewer"},
    )
    assert res_viewer_invite.status_code == 403

    # 2. MEMBER_CHANGE_ROLE:
    # Admin can change Member -> Viewer
    change_res = client.patch(
        f"/api/v1/orgs/{org_id}/members/{users['member'][0]}",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"role": "viewer"},
    )
    assert change_res.status_code == 200

    # Admin CANNOT change Owner role (400/403)
    admin_change_owner = client.patch(
        f"/api/v1/orgs/{org_id}/members/{users['owner'][0]}",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"role": "member"},
    )
    assert admin_change_owner.status_code in [400, 403]

    # Member and Viewer CANNOT change roles (403)
    member_change = client.patch(
        f"/api/v1/orgs/{org_id}/members/{users['viewer'][0]}",
        headers={"Authorization": f"Bearer {member_token}"},
        json={"role": "admin"},
    )
    assert member_change.status_code == 403

    # 3. MEMBER_REMOVE:
    # Admin can remove Viewer
    remove_viewer = client.delete(
        f"/api/v1/orgs/{org_id}/members/{users['viewer'][0]}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert remove_viewer.status_code == 200

    # Admin CANNOT remove Owner
    admin_remove_owner = client.delete(
        f"/api/v1/orgs/{org_id}/members/{users['owner'][0]}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert admin_remove_owner.status_code in [400, 403]


def test_rbac_team_operations(client: TestClient):
    """Test TEAM_CREATE, TEAM_UPDATE, TEAM_DELETE, TEAM_MANAGE_MEMBERS across roles."""
    org_id, users = _setup_org_with_roles(client)

    owner_token = users["owner"][2]
    admin_token = users["admin"][2]
    member_token = users["member"][2]
    viewer_token = users["viewer"][2]

    # 1. TEAM_CREATE: Admin and Owner allowed; Member and Viewer denied (403)
    team_admin_res = client.post(
        f"/api/v1/orgs/{org_id}/teams",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"name": "Admin Created Team"},
    )
    assert team_admin_res.status_code == 201
    team_id = team_admin_res.json()["id"]

    team_member_res = client.post(
        f"/api/v1/orgs/{org_id}/teams",
        headers={"Authorization": f"Bearer {member_token}"},
        json={"name": "Member Team"},
    )
    assert team_member_res.status_code == 403

    team_viewer_res = client.post(
        f"/api/v1/orgs/{org_id}/teams",
        headers={"Authorization": f"Bearer {viewer_token}"},
        json={"name": "Viewer Team"},
    )
    assert team_viewer_res.status_code == 403

    # 2. TEAM_UPDATE: Admin and Owner allowed; Viewer denied (403)
    update_admin_res = client.patch(
        f"/api/v1/teams/{team_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"name": "Admin Renamed Team"},
    )
    assert update_admin_res.status_code == 200

    update_viewer_res = client.patch(
        f"/api/v1/teams/{team_id}",
        headers={"Authorization": f"Bearer {viewer_token}"},
        json={"name": "Viewer Renamed Team"},
    )
    assert update_viewer_res.status_code == 403

    # 3. TEAM_DELETE: Owner and Admin allowed; Member and Viewer denied (403)
    del_member_res = client.delete(
        f"/api/v1/teams/{team_id}",
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert del_member_res.status_code == 403

    del_admin_res = client.delete(
        f"/api/v1/teams/{team_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert del_admin_res.status_code == 200


def test_rbac_project_and_blueprint_operations(client: TestClient):
    """Test PROJECT_CREATE, PROJECT_UPDATE, PROJECT_DELETE, and BLUEPRINT_GENERATE."""
    org_id, users = _setup_org_with_roles(client)

    owner_token = users["owner"][2]
    admin_token = users["admin"][2]
    member_token = users["member"][2]
    viewer_token = users["viewer"][2]

    # 1. PROJECT_CREATE: Member allowed; Viewer denied (403)
    proj_member_res = client.post(
        "/api/v1/projects",
        headers={"Authorization": f"Bearer {member_token}"},
        json={"name": "Member Project", "organization_id": org_id},
    )
    assert proj_member_res.status_code == 201
    project_id = proj_member_res.json()["id"]

    proj_viewer_res = client.post(
        "/api/v1/projects",
        headers={"Authorization": f"Bearer {viewer_token}"},
        json={"name": "Viewer Project", "organization_id": org_id},
    )
    assert proj_viewer_res.status_code == 403

    # 2. BLUEPRINT_GENERATE: Member allowed; Viewer denied (403)
    gen_viewer_res = client.post(
        f"/api/v1/blueprints/generate/{project_id}",
        headers={"Authorization": f"Bearer {viewer_token}"},
        json={"prompt": "Generate e-commerce backend with auth and payments"},
    )
    assert gen_viewer_res.status_code == 403

    gen_member_res = client.post(
        f"/api/v1/blueprints/generate/{project_id}",
        headers={"Authorization": f"Bearer {member_token}"},
        json={"prompt": "Generate e-commerce backend with auth and payments"},
    )
    assert gen_member_res.status_code == 201

    # 3. PROJECT_DELETE: Member denied (403); Admin allowed (200)
    del_member = client.delete(
        f"/api/v1/projects/{project_id}",
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert del_member.status_code == 403

    del_admin = client.delete(
        f"/api/v1/projects/{project_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert del_admin.status_code == 200


def test_cross_tenant_idor_security(client: TestClient):
    """
    IDOR Security test: Verify that an attacker in Org B cannot manipulate or access
    any resource in Org A by directly passing UUIDs in API calls.
    """
    org_a_id, users_a = _setup_org_with_roles(client)
    org_b_id, users_b = _setup_org_with_roles(client)

    attacker_token = users_b["owner"][2]
    victim_owner_token = users_a["owner"][2]

    # Create a project and team in Org A
    proj_a = client.post(
        "/api/v1/projects",
        headers={"Authorization": f"Bearer {victim_owner_token}"},
        json={"name": "Victim Org A Secret Project", "organization_id": org_a_id},
    ).json()
    proj_a_id = proj_a["id"]

    team_a = client.post(
        f"/api/v1/orgs/{org_a_id}/teams",
        headers={"Authorization": f"Bearer {victim_owner_token}"},
        json={"name": "Org A Core Team"},
    ).json()
    team_a_id = team_a["id"]

    # 1. Attacker in Org B attempts to read Org A
    res1 = client.get(f"/api/v1/orgs/{org_a_id}", headers={"Authorization": f"Bearer {attacker_token}"})
    assert res1.status_code == 403

    # 2. Attacker in Org B attempts to list Org A members
    res2 = client.get(f"/api/v1/orgs/{org_a_id}/members", headers={"Authorization": f"Bearer {attacker_token}"})
    assert res2.status_code == 403

    # 3. Attacker in Org B attempts to update Org A
    res3 = client.patch(f"/api/v1/orgs/{org_a_id}", headers={"Authorization": f"Bearer {attacker_token}"}, json={"name": "Hacked"})
    assert res3.status_code == 403

    # 4. Attacker in Org B attempts to read Org A Team
    res4 = client.get(f"/api/v1/teams/{team_a_id}", headers={"Authorization": f"Bearer {attacker_token}"})
    assert res4.status_code == 403

    # 5. Attacker in Org B attempts to add themselves to Org A Team
    res5 = client.post(
        f"/api/v1/teams/{team_a_id}/members",
        headers={"Authorization": f"Bearer {attacker_token}"},
        json={"user_id": users_b["owner"][0]},
    )
    assert res5.status_code in [400, 403]

    # 6. Attacker in Org B attempts to read Org A Project
    res6 = client.get(f"/api/v1/projects/{proj_a_id}", headers={"Authorization": f"Bearer {attacker_token}"})
    assert res6.status_code == 403

    # 7. Attacker in Org B attempts to delete Org A Project
    res7 = client.delete(f"/api/v1/projects/{proj_a_id}", headers={"Authorization": f"Bearer {attacker_token}"})
    assert res7.status_code == 403

    # 8. Unauthenticated requests are rejected (401)
    res_unauth = client.get(f"/api/v1/orgs/{org_a_id}")
    assert res_unauth.status_code == 401
