from __future__ import annotations

import os
import sys
from pathlib import Path

import psycopg2
from dotenv import load_dotenv
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.database import Base, engine
import app.models  # noqa: F401 - registers ORM models with SQLAlchemy metadata


def main() -> None:
    load_dotenv()

    host = os.getenv("POSTGRES_HOST", "127.0.0.1")
    port = os.getenv("POSTGRES_PORT", "5432")
    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "")
    database = os.getenv("POSTGRES_DB", "crm_db")

    admin_conn = psycopg2.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        dbname="postgres",
    )
    admin_conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    admin_cur = admin_conn.cursor()
    admin_cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (database,))
    exists = admin_cur.fetchone() is not None
    if not exists:
        admin_cur.execute(f'CREATE DATABASE "{database}"')
        print(f"Created database: {database}")
    else:
        print(f"Database already exists: {database}")
    admin_cur.close()
    admin_conn.close()

    Base.metadata.create_all(bind=engine)
    print("Database tables are ready.")


if __name__ == "__main__":
    main()
