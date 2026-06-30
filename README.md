# Multi-Agent DataOps

AI-driven data pipeline automation platform built with a multi-agent architecture using LangGraph.

## Project Description

**Multi-Agent DataOps** is a web application that allows users to create projects and generate automated technical content through a system of specialized multi-agents. The system takes a Product Requirements Document (PRD) as input and transforms it into structured and verified content through a coordinated agent workflow.

## System Architecture

### Tech Stack

| Component | Technology |
|-----------|-------------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS v4, Framer Motion |
| **Backend** | FastAPI (Python), LangGraph, LangChain |
| **Database** | Neon (PostgreSQL Serverless) |
| **Authentication** | Neon Auth (JWT with EdDSA) |
| **Search** | Tavily Search API |
| **LLM** | Google Gemini (configurable) |
| **Task Queue** | Celery + Redis |
| **Real-time Communication** | Server-Sent Events (SSE) |
| **Monitoring** | LangSmith |


### Project Structure

```
multi-agents-data-ops/
├── app/
│   ├── backend/               # FastAPI API
│   │   ├── agents/            # LangGraph multi-agent system
│   │   │   ├── nodes/         # Agents: researcher, writer, checker, polisher
│   │   │   ├── validators/    # Workflow validations
│   │   │   ├── graph.py       # Agent graph definition
│   │   │   └── state.py       # Shared state definition
│   │   ├── api/              # REST endpoints
│   │   │   ├── projects/      # Projects CRUD
│   │   │   └── metrics/       # Metrics and statistics
│   │   ├── services/         # Business logic
│   │   ├── config/           # Configuration (DB, pricing)
│   │   ├── middleware/       # JWT authentication
│   │   ├── schemas/          # Pydantic models
│   │   └── tasks/           # Celery tasks for async processing
│   │
│   └── frontend/             # Next.js application
│       ├── app/
│       │   ├── dashboard/    # User main dashboard
│       │   ├── auth/         # Authentication (sign-in, sign-up)
│       │   ├── profile/      # User profile
│       │   └── api/         # Frontend API routes
│       └── lib/
│           ├── auth/         # Authentication utilities
│           └── components/  # Reusable UI components
```

## Multi-Agent System

The core of the system is a LangGraph workflow with **4 specialized agents**:

```
┌─────────────┐    ┌─────────┐    ┌────────────┐    ┌──────────┐
│ Researcher  │───▶│  Writer │───▶│   Checker  │───▶│ Polisher │
└─────────────┘    └─────────┘    └────────────┘    └──────────┘
       │                                   │
       │           Confidence < 0.6        │
       └───────────────────────────────────┘
```

### Workflow

1. **Researcher Agent**
   - Analyzes the user's provided PRD
   - Generates 3 optimized search queries
   - Executes web searches via Tavily
   - Collects technical facts and sources

2. **Writer Agent**
   - Receives PRD and researcher facts
   - Generates structured English draft
   - Handles checker feedback (retries)
   - Retry limit: 3 attempts

3. **Checker Agent (Fast Checker)**
   - Verifies draft consistency with facts
   - Calculates confidence score (0.0 - 1.0)
   - Identifies "failed facts" (contradicted/omitted facts)
   - Threshold: confidence >= 0.6 to pass

4. **Polisher Agent**
   - Refines content style and structure
   - Fixes identified failed facts
   - Validates minimum output quality
   - Generates final post

### Token Metrics

The system tracks tokens consumed by each agent:

| Model | Input Cost | Output Cost |
|-------|------------|-------------|
| Gemini | $0.075 / 1M tokens | $0.30 / 1M tokens |

## Asynchronous Processing with Celery

The system uses **Celery** with **Redis** as the broker to handle asynchronous pipeline processing:

- Projects are created in "pending" state and queued for processing
- Celery tasks execute the agent pipeline in the background
- Backend can scale horizontally to handle multiple concurrent projects
- Redis acts as message broker and also as storage for streaming state

### Celery Flow

```
Frontend → POST /api/projects → Redis Queue → Celery Worker → Pipeline Agents
                              ↓
                         Stream Hub (Redis)
                               ↓
                          SSE Connection
```

## Real-time Communication with SSE

The system implements **Server-Sent Events (SSE)** to provide real-time feedback to the frontend:

- The `/api/projects/{id}/stream` endpoint maintains an open SSE connection
- The **Stream Hub** (implemented with Redis Pub/Sub) publishes progress events
- Each agent sends state updates during execution
- Frontend receives progress events, partial metrics, and final results

### SSE Events

| Event | Description |
|-------|-------------|
| `status` | Pipeline progress (researcher: 25%, writer: 50%, checker: 65%, polisher: 90%) |
| `complete` | Pipeline completed successfully (final metrics) |
| `error` | Pipeline error (error details) |

### Stream Hub

The Stream Hub is a component that manages SSE subscriptions:

- Subscribers register by `project_id`
- Events are published to Redis channels
- Each client receives only events for their projects
- 30-second timeout with heartbeats to keep connection alive

## API Endpoints

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/projects` | Create new project (queued in Celery) |
| `GET` | `/api/projects` | List user's projects |
| `GET` | `/api/projects/{id}` | Get specific project |
| `PATCH` | `/api/projects/{id}` | Update project metrics |
| `GET` | `/api/projects/{id}/stream` | SSE progress streaming |

### Metrics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/metrics/overview` | Projects summary (total, completed, failed) |
| `GET` | `/api/metrics/costs` | Token costs in USD |
| `GET` | `/api/metrics/recent-posts` | Recently generated posts |
| `GET` | `/api/metrics/health` | System health (success rate, avg retries) |

## Authentication

The system uses **Neon Auth** for authentication:

- JWT middleware with EdDSA signature validation
- Cached JWKS for token verification
- Google OAuth support (optional)
- Persistent sessions with secure tokens

## Configuration

### Environment Variables (Backend)

```env
NEON_DATABASE_CONNECTION_STRING=postgresql://...
NEON_AUTH_BASE_URL=https://auth.neon.tech
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
LLM_PROVIDER=google
LLM_API_KEY=your_gemini_key

# Redis for Celery and Stream Hub
REDIS_URL=redis://localhost:6379/0

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### Environment Variables (Frontend)

```env
DATABASE_URL=postgresql://...
AUTH_SIGNING_KEY=your_signing_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## Running the Project

### Backend

```bash
cd app/backend
pip install -r requirements.txt

# Start Redis (required for Celery and Stream Hub)
redis-server

# Start Celery worker
celery -A tasks worker --loglevel=info

# Start FastAPI server
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd app/frontend
npm install
npm run dev
```

### Docker Compose

```bash
# From the app/ directory
cd app

# Build and start both services
docker compose up --build
```

> **Note:** The Celery worker requires a Redis instance. Make sure Redis is running and accessible via the `REDIS_URL` variable in your `backend/.env` file. If you don't have Redis running locally, you can add a `redis` service to `docker-compose.yml`.

## Key Features

- **Complete Automation**: From PRD to final post in a single step
- **Fact Verification**: Each draft is validated against sources
- **Smart Retries**: System automatically retries when confidence is low
- **Asynchronous Processing**: Celery handles pipelines without blocking server
- **Real-time Feedback**: SSE for progress and metrics streaming
- **Detailed Metrics**: Token, cost, and execution time tracking
- **Project History**: Persistence of projects and generated posts
- **Interactive Dashboard**: Web interface to manage projects

## Contributing

This project is under active development. To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request
