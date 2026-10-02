from app.database import create_tables


if __name__ == "__main__":
    create_tables()
    print("Таблицы PostgreSQL созданы или уже существуют.")

