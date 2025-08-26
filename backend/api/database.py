from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from config import POSTGRES_URL


engine = create_async_engine(
    POSTGRES_URL,
    pool_size=20,
    max_overflow=10
)
new_session = async_sessionmaker(engine, expire_on_commit=False)


class Model(DeclarativeBase):
    """ Model for ORM-classes """
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """ Dependency для получения сессии БД """
    session = new_session()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()


async def close_db_connection():
    """Закрытие подключений при shutdown"""
    await engine.dispose()