"""Script de création des tables — remplace Alembic pour le dev local SQLite."""
import asyncio
from app.core.database import engine, Base
import app.models  # noqa — enregistre tous les modèles


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables creees avec succes dans hostpro.db")


if __name__ == "__main__":
    asyncio.run(create_tables())
