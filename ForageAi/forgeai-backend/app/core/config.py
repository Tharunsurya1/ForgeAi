from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "ForgeAI"
    API_V1_STR: str = "/api/v1"
    
    # Environment Variables
    DATABASE_URL: str = "sqlite:///./forgeai.db"
    JWT_SECRET: str = "dev-secret-key-change-in-production"
    OLLAMA_URL: str = "http://localhost:11434"
    QDRANT_URL: str = "http://localhost:6333"
    
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]
    
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    JWT_ALGORITHM: str = "HS256"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
