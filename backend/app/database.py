from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    """Базовый класс SQLAlchemy-моделей."""


engine = create_engine(settings.database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """Предоставляет отдельную сессию БД на время HTTP-запроса."""

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables() -> None:
    """Создаёт отсутствующие таблицы по описанным моделям."""

    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)

