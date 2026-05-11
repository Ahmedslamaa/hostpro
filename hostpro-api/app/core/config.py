from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "HOST PRO"
    APP_ENV: str = "development"

    SECRET_KEY: str = "hostpro-dev-secret-key-2025-slama-riviera"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # ── Base de données ────────────────────────────────────────────────────────
    # SQLite local par défaut → Azure Database for PostgreSQL en production
    DATABASE_URL: str = "sqlite+aiosqlite:///./hostpro.db"
    # Pour Alembic (synchrone) — si absent, dérivé automatiquement dans startup.sh
    DATABASE_URL_SYNC: str = ""

    # ── Redis ─────────────────────────────────────────────────────────────────
    # Redis local (dev) → Azure Cache for Redis en production
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── CORS & Frontend ───────────────────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    FRONTEND_URL: str = "http://localhost:3000"

    # ── Email (Resend) ────────────────────────────────────────────────────────
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "noreply@hostpro.fr"
    EMAIL_FROM_NAME: str = "HOST PRO"

    # ── Stripe ────────────────────────────────────────────────────────────────
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_STARTER: str = ""
    STRIPE_PRICE_PRO: str = ""
    STRIPE_PRICE_ENTERPRISE: str = ""

    # ── Azure Blob Storage (photos & fichiers) ────────────────────────────────
    AZURE_STORAGE_CONNECTION_STRING: str = ""
    AZURE_STORAGE_CONTAINER: str = "property-photos"
    # Ou via Managed Identity / SAS URL
    AZURE_STORAGE_ACCOUNT_NAME: str = ""
    AZURE_STORAGE_ACCOUNT_KEY: str = ""

    # ── Azure Container Apps / App Service ────────────────────────────────────
    WEBSITE_HOSTNAME: str = ""          # Injecté automatiquement par Azure App Service
    CONTAINER_APP_HOSTNAME: str = ""    # Injecté par Azure Container Apps

    # ── Application Insights (observabilité) ─────────────────────────────────
    APPLICATIONINSIGHTS_CONNECTION_STRING: str = ""

    @property
    def origins(self) -> List[str]:
        base = [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]
        # Azure App Service
        if self.WEBSITE_HOSTNAME:
            base.append(f"https://{self.WEBSITE_HOSTNAME}")
        # Azure Container Apps
        if self.CONTAINER_APP_HOSTNAME:
            base.append(f"https://{self.CONTAINER_APP_HOSTNAME}")
        return list(dict.fromkeys(base))  # dédupliquer

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def database_url_async(self) -> str:
        """DATABASE_URL normalisé pour asyncpg."""
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url

    @property
    def database_url_sync(self) -> str:
        """DATABASE_URL synchrone pour Alembic / psycopg2."""
        if self.DATABASE_URL_SYNC:
            return self.DATABASE_URL_SYNC
        url = self.DATABASE_URL
        url = url.replace("postgresql+asyncpg://", "postgresql://")
        url = url.replace("postgres+asyncpg://", "postgresql://")
        url = url.replace("+aiosqlite", "")
        return url


settings = Settings()
