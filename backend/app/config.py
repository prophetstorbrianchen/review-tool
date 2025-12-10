"""
Application configuration management.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
import json


class Settings(BaseSettings):
    """Application settings."""

    # Application
    APP_NAME: str = "Spaced Repetition Review Tool"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    # Default to SQLite for local development
    # For production, use PostgreSQL (e.g., from Neon, Supabase, or Vercel Postgres)
    # Example PostgreSQL: postgresql://user:password@host:5432/dbname
    DATABASE_URL: str = "sqlite:///./data/review_tool.db"

    # CORS
    CORS_ORIGINS: str = '["http://localhost:3000","http://localhost:5173"]'

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def cors_origins_list(self) -> list:
        """Parse CORS origins from JSON string."""
        try:
            return json.loads(self.CORS_ORIGINS)
        except:
            return ["http://localhost:3000", "http://localhost:5173"]


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
