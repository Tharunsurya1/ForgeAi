from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.blueprints import router as blueprints_router
from app.api.v1.invitations import router as invitations_router
from app.api.v1.organizations import router as organizations_router
from app.api.v1.projects import router as projects_router
from app.api.v1.teams import router as teams_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(projects_router, prefix="/projects", tags=["projects"])
api_router.include_router(blueprints_router, prefix="/blueprints", tags=["blueprints"])
api_router.include_router(organizations_router, prefix="/orgs", tags=["organizations"])
api_router.include_router(teams_router, prefix="/teams", tags=["teams"])
api_router.include_router(invitations_router, prefix="/invitations", tags=["invitations"])
