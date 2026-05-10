from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "HOST PRO"
    APP_ENV: str = "development"

    SECRET_KEY: str = "hostpro-dev-secret-key-2025-slama-riviera"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # SQLite local par défaut, PostgreSQL Azure en production
    DATABASE_URL: str = "sqlite+aiosqlite:///./hostpro.db"

    ALLOWED_ORIGINS: str = "http://localhost:3000"
    FRONTEND_URL: str = "http://localhost:3000"

    # Email (Resend)
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "noreply@hostpro.fr"

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # Azure Blob Storage (photos)
    AZURE_STORAGE_CONNECTION_STRING: str = ""
    AZURE_STORAGE_CONTAINER: str = "property-photos"

    # Azure (déployé)
    WEBSITE_HOSTNAME: str = ""  # Automatique sur Azure App Service

    @property
    def origins(self) -> List[str]:
        base = [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]
        if self.WEBSITE_HOSTNAME:
            base.append(f"https://{self.WEBSITE_HOSTNAME}")
        return base


settings = Settings()
