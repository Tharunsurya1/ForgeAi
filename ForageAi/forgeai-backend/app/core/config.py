from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "ForgeAI"
    API_V1_STR: str = "/api/v1"
    
    # Environment Variables
    DATABASE_URL: str
    JWT_SECRET: str
    OLLAMA_URL: str
    QDRANT_URL: str
    
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
