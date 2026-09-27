from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.router import api_router
from app.core.config import settings
from app.database.database import engine

from app.database.base import Base
import app.models  # noqa: F401

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Verify database connection and create missing tables
    try:
        with engine.begin() as conn:
            conn.execute(text("SELECT 1"))
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
            print("Successfully connected to the database and verified tables!", flush=True)
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Warning: Could not connect to the database. Error: {e}", flush=True)
        print("Please check your .env file credentials and ensure PostgreSQL is running.", flush=True)
    yield
    # Shutdown logic can go here


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for the ForgeAI Platform V1",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

# Direct alias for /api/projects, /api/blueprints, and /api/code-generator endpoints
from app.api.v1.projects import router as projects_router
from app.api.v1.blueprints import router as blueprints_router
from app.api.v1.code_generator import router as code_generator_router
app.include_router(projects_router, prefix="/api/projects", include_in_schema=False)
app.include_router(blueprints_router, prefix="/api/blueprints", include_in_schema=False)
app.include_router(code_generator_router, prefix="/api/code-generator", include_in_schema=False)

@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok", "message": f"{settings.PROJECT_NAME} is healthy"}

@app.get("/")
async def root():
    return {"message": "Welcome to ForgeAI API V1"}
