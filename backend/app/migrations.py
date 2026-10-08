import secrets

from sqlalchemy import inspect, text

from app.database import engine
from app.security import hash_password


def upgrade_lab2_schema() -> None:
    """Добавляет владельца к таблицам ЛР №2 без удаления старых данных."""

    from app import models

    inspector = inspect(engine)
    if "courses" not in inspector.get_table_names():
        return
    course_columns = {column["name"] for column in inspector.get_columns("courses")}
    if "owner_id" in course_columns:
        return

    models.User.__table__.create(bind=engine, checkfirst=True)
    legacy_password_hash = hash_password(secrets.token_urlsafe(32))

    with engine.begin() as connection:
        legacy_user_id = connection.scalar(
            text(
                """
                INSERT INTO users (email, username, password_hash)
                VALUES (:email, :username, :password_hash)
                ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username
                RETURNING id
                """
            ),
            {
                "email": "legacy@labtracker.local",
                "username": "Данные ЛР №2",
                "password_hash": legacy_password_hash,
            },
        )
        connection.execute(text("ALTER TABLE courses ADD COLUMN owner_id INTEGER"))
        connection.execute(
            text("UPDATE courses SET owner_id = :owner_id WHERE owner_id IS NULL"),
            {"owner_id": legacy_user_id},
        )
        connection.execute(text("ALTER TABLE courses ALTER COLUMN owner_id SET NOT NULL"))
        connection.execute(
            text(
                """
                ALTER TABLE courses
                ADD CONSTRAINT courses_owner_id_fkey
                FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
                """
            )
        )
        connection.execute(
            text("CREATE INDEX ix_courses_owner_id ON courses (owner_id)")
        )
