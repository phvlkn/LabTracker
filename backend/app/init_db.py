from app.database import create_tables
from app.migrations import upgrade_lab2_schema


if __name__ == "__main__":
    upgrade_lab2_schema()
    create_tables()
    print("Таблицы PostgreSQL созданы или уже существуют.")
