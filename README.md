# CRM Application

A full-stack CRM application with a FastAPI backend and a React + Vite frontend.

## Features

- Log, edit, and delete interactions
- View dashboard summaries
- Track follow-ups and visit status
- Chat endpoint support
- Real-time notifications via WebSocket

## Tech Stack

### Backend
- FastAPI
- Python
- PostgreSQL
- SQLAlchemy
- Pydantic
- Uvicorn

### Frontend
- React
- Vite
- Redux Toolkit
- React Router
- Axios
- Tailwind CSS

## Project Structure

```text
CRM/
  backend/
  frontend/
  .gitignore
  README.md
Prerequisites
Python 3.10 or higher
Node.js 18 or higher
PostgreSQL
Setup

1. Clone the repository
git clone https://github.com/USERNAME/REPO.git
cd CRM

2. Backend Setup
Go to the backend folder and install dependencies:
cd backend
pip install -r requirements.txt
Create a .env file in backend/:
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
Run the backend:
uvicorn app.main:app --reload
Backend URL:
http://localhost:8000

3. Frontend Setup
Open a new terminal and go to the frontend folder:
cd frontend
npm install
Create a .env file in frontend/ if needed:
VITE_API_BASE_URL=http://localhost:8000
Run the frontend:
npm run dev

Frontend URL:
http://localhost:5173
Available Scripts
Frontend
npm run dev
npm run build
npm run lint
npm run preview
API Endpoints
GET /api/interactions
GET /api/interactions/{id}
POST /api/interactions
PUT /api/interactions/{id}
DELETE /api/interactions/{id}
GET /api/dashboard
POST /api/chat
WS /api/notifications/ws

Notes
Tables are created automatically on startup.
The frontend API base URL defaults to http://localhost:8000.
Backend uses snake_case JSON.
Frontend converts API data to camelCase.
The chat endpoint is ready for future AI integration.
