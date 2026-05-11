from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import StaticPool, NullPool
from app.core.config import settings

DATABASE_URL = settings.database_url_async
IS_SQLITE = "sqlite" in DATABASE_URL

# Azure PostgreSQL nécessite SSL — asyncpg accepte ssl="require" dans connect_args
_pg_connect_args = {}
if not IS_SQLITE and settings.is_production:
    _pg_connect_args = {"ssl": "require"}

engine = create_async_engine(
    DATABASE_URL,
    **(
        {"connect_args": {"check_same_thread": False}, "poolclass": StaticPool}
        if IS_SQLITE
        else {"poolclass": NullPool, "connect_args": _pg_connect_args}
    ),
    echo=False,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
