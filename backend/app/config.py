from __future__ import annotations

import os
from pathlib import Path
from urllib.parse import quote_plus

from dotenv import load_dotenv


PROJECT_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(PROJECT_ROOT / ".env")


def _env_list(name: str, default: str) -> list[str]:
    raw_value = os.getenv(name, default)
    return [item.strip() for item in raw_value.split(",") if item.strip()]


def build_database_url() -> str:
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url

    user = os.getenv("POSTGRES_USER", "postgres")
    password = quote_plus(os.getenv("POSTGRES_PASSWORD", ""))
    host = os.getenv("POSTGRES_HOST", "127.0.0.1")
    port = os.getenv("POSTGRES_PORT", "5433")
    database = os.getenv("POSTGRES_DB", os.getenv("DATABASE_NAME", "crm_db"))
    return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}"


APP_NAME = os.getenv("APP_NAME", "CRM Backend")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
API_PREFIX = os.getenv("API_PREFIX", "/api").rstrip("/") or "/api"
DATABASE_URL = build_database_url()
FRONTEND_ORIGINS = _env_list(
    "FRONTEND_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)
DEBUG = os.getenv("DEBUG", "false").lower() in {"1", "true", "yes", "on"}
