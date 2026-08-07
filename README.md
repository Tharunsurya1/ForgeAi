# ForgeAI 🚀

> **Autonomous Multi-Agent AI Platform for Enterprise Software Engineering & Architecture**

[![System Architecture](https://img.shields.io/badge/Architecture-ARCHITECTURE.md-blue.svg)](ARCHITECTURE.md)
[![Database Architecture](https://img.shields.io/badge/Database-DATABASE.md-purple.svg)](DATABASE.md)
[![Backend Architecture](https://img.shields.io/badge/Backend-BACKEND__ARCHITECTURE.md-green.svg)](BACKEND_ARCHITECTURE.md)
[![API Specification](https://img.shields.io/badge/API-API__SPEC.md-red.svg)](API_SPEC.md)
[![Next.js 15](https://img.shields.io/badge/Frontend-Next.js%2015-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/AI-LangGraph-orange.svg)](https://langchain-ai.github.io/langgraph/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Architecture & Specification Documentation Quick Links

- 🏛 **[System Architecture (ARCHITECTURE.md)](ARCHITECTURE.md)**: Overall platform design, micro-services routing, 14 AI agent specs, OWASP matrix, ADRs.
- 🗄 **[Database Architecture (DATABASE.md)](DATABASE.md)**: 36 PostgreSQL entity schemas, ER diagrams, partitioning strategy, data dictionary, indexing, and `schema.sql`.
- ⚡ **[Backend Architecture (BACKEND_ARCHITECTURE.md)](BACKEND_ARCHITECTURE.md)**: FastAPI Python 3.13 layered architecture, Celery worker queues, WebSocket streaming gateway, Pydantic validation, and dependency injection setup.
- 🔌 **[API Specification (API_SPEC.md)](API_SPEC.md)**: Production REST & WebSocket OpenAPI 3.1 specification, RFC 7807 error standards, rate limiting, and endpoint taxonomy.

---

## 🌟 Overview

**ForgeAI** transforms natural language software ideas, product specs, and business requirements into complete, enterprise-grade engineering blueprints. By orchestrating **14 specialized AI agents**, ForgeAI generates everything needed to take a product from concept to production in minutes:

- 📋 Functional Requirements & User Story Matrices
- 🏗 System Architecture Topologies & C4 Diagrams
- 🗄 PostgreSQL Database Schemas & Interactive ER Diagrams
- 🔌 OpenAPI 3.1 REST Specs & Endpoint Contracts
- 🎨 Next.js 15 + React 19 Frontend Component Trees
- ⚡ FastAPI + Async SQLAlchemy Backend Scaffolding
- 🔒 Security Audits & OWASP Top 10 Mitigation Strategies
- 🐳 Docker, Nginx, & GitHub Actions Deployment Plans
- 🧪 Automated Pytest & Jest Test Suites

---

## 🤖 The 14 Autonomous AI Agents

ForgeAI employs a Directed Cyclic Graph (DCG) state machine driven by **LangGraph** to coordinate 14 specialized agents:

1. **Supervisor Agent**: Master coordinator & workflow orchestrator.
2. **Requirements Agent**: Extracts functional & non-functional requirements.
3. **Business Analyst Agent**: Formulates domain models & logic matrices.
4. **Database Agent**: Designs relational database schemas & ERD metadata.
5. **API Agent**: Generates OpenAPI 3.1 REST contracts.
6. **Backend Agent**: Scaffolds clean FastAPI controllers, services & repos.
7. **Frontend Agent**: Generates Next.js 15 App Router pages & React 19 components.
8. **UI/UX Agent**: Defines design tokens, layouts, & Tailwind CSS v4 themes.
9. **Security Agent**: Conducts OWASP audits & security flow verification.
10. **DevOps Agent**: Authors Dockerfiles, Nginx configs, & CI/CD workflows.
11. **Testing Agent**: Synthesizes Pytest & Jest integration test suites.
12. **Documentation Agent**: Generates comprehensive documentation & guides.
13. **Code Review Agent**: Enforces clean code principles & static analysis.
14. **Optimization Agent**: Tunes SQL queries, indexing, & bundle size.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui, Framer Motion
- **State Management**: Zustand (Client UI State), React Query v5 (Server State)

### Backend
- **Framework**: FastAPI (Python 3.13)
- **Validation**: Pydantic v2
- **ORM & DB Access**: SQLAlchemy 2.0 (Async Engine)

### Database & Storage
- **Primary Relational DB**: PostgreSQL 16
- **Vector Database**: Qdrant (HNSW Vector Indexing)
- **Object Storage**: Supabase Storage
- **Caching & Pub/Sub**: Redis 7.2

### AI Orchestration
- **Frameworks**: LangGraph, LangChain
- **Models**: OpenAI (GPT-4o), Anthropic Claude (Claude 3.5 Sonnet), Ollama (Local Llama 3)

---

## 📁 Repository Structure

```
.
├── ARCHITECTURE.md           # Master System Architecture Document
├── DATABASE.md               # Master Database Architecture Document
├── BACKEND_ARCHITECTURE.md   # Master Backend Architecture Document
├── API_SPEC.md               # Master REST & WebSocket API Specification
├── schema.sql                # Complete PostgreSQL DDL Script
├── README.md                 # Project Overview & Quickstart Guide
├── forgeai-frontend/         # Next.js 15 Web Client & Dashboard
│   ├── src/
│   │   ├── app/              # App Router Pages (Dashboard, Chat, Blueprint, Settings)
│   │   ├── components/       # shadcn/ui & Canvas Visualizers
│   │   ├── hooks/            # Custom Hooks & WebSocket Streaming
│   │   └── store/            # Zustand Stores
│   ├── package.json
│   └── next.config.ts
└── forgeai-backend/          # FastAPI Service & AI Orchestrator
    ├── app/
    │   ├── api/              # REST Endpoints & WebSocket Handlers
    │   ├── ai/               # 14 LangGraph AI Agents & Prompt Pipeline
    │   ├── core/             # Auth, Security, Config, Redis, DB Engine
    │   ├── db/               # SQLAlchemy Models & Migrations
    │   └── services/         # Business Logic Layer
    ├── schema.sql            # Local copy of Database DDL
    └── requirements.txt
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js** >= 20.x
- **Python** >= 3.13
- **Docker** & **Docker Compose**
- **PostgreSQL** & **Redis** instances (or via Docker Compose)

---

### 1. Backend Setup (`forgeai-backend`)

```bash
# Navigate to backend folder
cd forgeai-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set Environment Variables
cp .env.example .env

# Run Database Migrations
alembic upgrade head

# Start FastAPI Development Server
uvicorn app.main:app --reload --port 8000
```

Backend API Docs will be available at `http://localhost:8000/docs`.

---

### 2. Frontend Setup (`forgeai-frontend`)

```bash
# Navigate to frontend folder
cd forgeai-frontend

# Install dependencies
npm install

# Set Environment Variables
cp .env.example .env.local

# Run Next.js Development Server
npm run dev
```

Open `http://localhost:3000` in your browser to view the platform dashboard.

---

### 3. Environment Variables Configuration

#### Backend `.env`
```env
PROJECT_NAME="ForgeAI"
ENVIRONMENT="development"
SECRET_KEY="your-super-secret-jwt-key"
DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/forgeai_db"
REDIS_URL="redis://localhost:6379/0"
QDRANT_URL="http://localhost:6333"

# LLM Providers
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
OLLAMA_BASE_URL="http://localhost:11434"
```

#### Frontend `.env.local`
```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:8000/api/v1"
NEXT_PUBLIC_WS_BASE_URL="ws://localhost:8000/api/v1/ws"
```

---

## 🔒 Security & Compliance

ForgeAI adheres to enterprise security standards:
- **JWT & HTTP-Only Refresh Cookies** for safe authentication.
- **RBAC (Role-Based Access Control)** to isolate tenant access.
- **OWASP Top 10 Protections** (SQL injection prevention via ORM, CSP headers, rate limiting).
- **AES-256 Data Encryption** at rest and TLS 1.3 in transit.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
