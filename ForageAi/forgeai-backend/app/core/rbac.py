from enum import Enum
from typing import Dict, Set
from fastapi import HTTPException, status


class OrgRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"


class Permission(str, Enum):
    # Organization management
    ORG_VIEW = "org:view"
    ORG_UPDATE = "org:update"
    ORG_DELETE = "org:delete"
    ORG_TRANSFER_OWNERSHIP = "org:transfer_ownership"

    # Member management
    MEMBER_VIEW = "member:view"
    MEMBER_INVITE = "member:invite"
    MEMBER_REMOVE = "member:remove"
    MEMBER_CHANGE_ROLE = "member:change_role"

    # Team management
    TEAM_VIEW = "team:view"
    TEAM_CREATE = "team:create"
    TEAM_UPDATE = "team:update"
    TEAM_DELETE = "team:delete"
    TEAM_MANAGE_MEMBERS = "team:manage_members"

    # Project & Blueprint management
    PROJECT_VIEW = "project:view"
    PROJECT_CREATE = "project:create"
    PROJECT_UPDATE = "project:update"
    PROJECT_DELETE = "project:delete"
    BLUEPRINT_VIEW = "blueprint:view"
    BLUEPRINT_GENERATE = "blueprint:generate"


# Role-to-Permission Matrix
ROLE_PERMISSIONS: Dict[str, Set[Permission]] = {
    OrgRole.OWNER.value: {
        # Organization
        Permission.ORG_VIEW,
        Permission.ORG_UPDATE,
        Permission.ORG_DELETE,
        Permission.ORG_TRANSFER_OWNERSHIP,
        # Member
        Permission.MEMBER_VIEW,
        Permission.MEMBER_INVITE,
        Permission.MEMBER_REMOVE,
        Permission.MEMBER_CHANGE_ROLE,
        # Team
        Permission.TEAM_VIEW,
        Permission.TEAM_CREATE,
        Permission.TEAM_UPDATE,
        Permission.TEAM_DELETE,
        Permission.TEAM_MANAGE_MEMBERS,
        # Project & Blueprint
        Permission.PROJECT_VIEW,
        Permission.PROJECT_CREATE,
        Permission.PROJECT_UPDATE,
        Permission.PROJECT_DELETE,
        Permission.BLUEPRINT_VIEW,
        Permission.BLUEPRINT_GENERATE,
    },
    OrgRole.ADMIN.value: {
        # Organization (cannot delete or transfer ownership)
        Permission.ORG_VIEW,
        Permission.ORG_UPDATE,
        # Member (can invite, remove non-owners, change non-owner roles)
        Permission.MEMBER_VIEW,
        Permission.MEMBER_INVITE,
        Permission.MEMBER_REMOVE,
        Permission.MEMBER_CHANGE_ROLE,
        # Team
        Permission.TEAM_VIEW,
        Permission.TEAM_CREATE,
        Permission.TEAM_UPDATE,
        Permission.TEAM_DELETE,
        Permission.TEAM_MANAGE_MEMBERS,
        # Project & Blueprint
        Permission.PROJECT_VIEW,
        Permission.PROJECT_CREATE,
        Permission.PROJECT_UPDATE,
        Permission.PROJECT_DELETE,
        Permission.BLUEPRINT_VIEW,
        Permission.BLUEPRINT_GENERATE,
    },
    OrgRole.MEMBER.value: {
        # Organization
        Permission.ORG_VIEW,
        # Member
        Permission.MEMBER_VIEW,
        # Team (can view teams)
        Permission.TEAM_VIEW,
        # Project & Blueprint (can create and work on projects)
        Permission.PROJECT_VIEW,
        Permission.PROJECT_CREATE,
        Permission.PROJECT_UPDATE,
        Permission.BLUEPRINT_VIEW,
        Permission.BLUEPRINT_GENERATE,
    },
    OrgRole.VIEWER.value: {
        # Read-only across org, members, teams, projects, blueprints
        Permission.ORG_VIEW,
        Permission.MEMBER_VIEW,
        Permission.TEAM_VIEW,
        Permission.PROJECT_VIEW,
        Permission.BLUEPRINT_VIEW,
    },
}

# Role hierarchy rank for authorization comparisons
ROLE_RANK: Dict[str, int] = {
    OrgRole.OWNER.value: 40,
    OrgRole.ADMIN.value: 30,
    OrgRole.MEMBER.value: 20,
    OrgRole.VIEWER.value: 10,
}


def has_permission(
    role: str,
    permission: Permission,
    is_superuser: bool = False,
) -> bool:
    """
    Check if a role has the required permission. Superusers have all permissions.
    """
    if is_superuser:
        return True
    perms = ROLE_PERMISSIONS.get(role, set())
    return permission in perms


def check_permission(
    role: str,
    permission: Permission,
    is_superuser: bool = False,
    custom_error_message: str = None,
) -> None:
    """
    Verify permission and raise HTTP 403 Forbidden if not authorized.
    """
    if not has_permission(role=role, permission=permission, is_superuser=is_superuser):
        detail = custom_error_message or f"Permission denied: Missing required permission '{permission.value}'"
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )


def can_manage_target_role(
    caller_role: str,
    target_role: str,
    is_superuser: bool = False,
) -> bool:
    """
    Ensure caller has strictly higher rank than the target role they are modifying/removing,
    unless superuser.
    """
    if is_superuser:
        return True
    caller_rank = ROLE_RANK.get(caller_role, 0)
    target_rank = ROLE_RANK.get(target_role, 0)
    return caller_rank > target_rank
