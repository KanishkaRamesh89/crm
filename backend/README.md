# CRM Backend

FastAPI backend foundation for the CRM application.

## Stack

- FastAPI
- Python
- PostgreSQL
- SQLAlchemy ORM
- Pydantic
- python-dotenv

## Folder Structure

```text
backend/
  app/
    main.py
    database.py
    config.py
    models.py
    schemas.py
    crud.py
    dependencies.py
    routes/
      interaction.py
      dashboard.py
    services/
    utils/
  .env.example
  requirements.txt
  README.md
```

## Setup

1. Create a virtual environment.
2. Install dependencies.

```bash
pip install -r requirements.txt
```

3. Copy `.env.example` to `.env` and update PostgreSQL values.
4. Make sure PostgreSQL is running and the database exists.

## Environment Variables

```env
APP_NAME=CRM Backend
APP_VERSION=1.0.0
API_PREFIX=/api
DEBUG=false

DATABASE_URL=postgresql+psycopg2://postgres:password@127.0.0.1:5433/crm_db

POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5433
POSTGRES_DB=crm_db

FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Run

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

## API Endpoints

- `GET /api/interactions`
- `GET /api/interactions/{id}`
- `POST /api/interactions`
- `PUT /api/interactions/{id}`
- `DELETE /api/interactions/{id}`
- `GET /api/dashboard`
- `POST /api/chat`
- `WS /api/notifications/ws`

## Notes

- Tables are created automatically on startup.
- The backend returns snake_case JSON for clean React integration.
- The chat endpoint is a placeholder for future LangGraph and Groq work.

