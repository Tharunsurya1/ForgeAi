from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.router import api_router
from app.core.config import settings
from app.database.database import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Verify database connection
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            print("Successfully connected to the database!", flush=True)
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

@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok", "message": f"{settings.PROJECT_NAME} is healthy"}

@app.get("/")
async def root():
    return {"message": "Welcome to ForgeAI API V1"}
