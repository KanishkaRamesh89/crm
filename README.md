# CRM Application

A full-stack CRM application built with a FastAPI backend and a React + Vite frontend. The app helps manage interactions, track follow-ups, view summaries, and support chat and real-time notifications.

## Features

- Log, edit, and delete customer interactions
- View dashboard metrics and recent activity
- Track pending follow-ups and completed visits
- Chat endpoint for AI-assisted workflows
- Real-time notifications through WebSocket
- Clean React dashboard with Redux state management

## Tech Stack

### Backend
- FastAPI
- Python
- SQLAlchemy
- Pydantic
- PostgreSQL
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
Make sure you have these installed:

Python 3.10+
Node.js 18+
PostgreSQL
Setup Instructions

1. Clone the repository
git clone https://github.com/USERNAME/REPO.git
cd CRM
2. Backend Setup

Go to the backend folder and install dependencies:
cd backend
pip install -r requirements.txt
Create a .env file inside backend/:
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

Run the backend server:
uvicorn app.main:app --reload

The backend runs at:
http://localhost:8000

3. Frontend Setup
Open a new terminal and go to the frontend folder:
cd frontend
npm install

If needed, create a .env file inside frontend/:
VITE_API_BASE_URL=http://localhost:8000

Run the frontend:
npm run dev

The frontend runs at:
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
Database tables are created automatically on startup.
Backend JSON uses snake_case naming.
Frontend converts API data into camelCase for React components.
The chat endpoint is currently a placeholder for future AI integration.
Make sure PostgreSQL is running before starting the backend.
