# ForgeAI System Integration Architecture Specification

> **Document Version**: 1.0.0  
> **Status**: Approved for Enterprise Production & System Integration  
> **Platform Stack**: Next.js 15 | FastAPI | Python 3.13 | PostgreSQL 16 | SQLAlchemy 2.0 | Redis | Celery | OpenAI GPT-4o / Multi-Agent Engine | Docker | Nginx  
> **Author**: Principal Solutions Architect & Enterprise System Design Team  
> **Target Audience**: CTOs, VPs of Engineering, Lead System Architects, DevOps Engineers, & Enterprise Security Auditors  
> **Last Updated**: July 2026  

---

## Executive Summary

The **ForgeAI System Integration Architecture** specifies the unified communication protocols, data flows, security boundaries, fault-tolerance mechanisms, and multi-agent orchestration frameworks across the entire **ForgeAI SaaS Platform**.

ForgeAI transforms high-level human product intents into complete, production-ready software engineering blueprints by coordinating **14 specialized AI agents**, a high-throughput **FastAPI async backend**, a **Next.js 15 App Router frontend**, and an enterprise-grade **PostgreSQL relational database**.

```
┌────────────────────────────────────────────────────────────────────────┐
│               ForgeAI Integration Architecture Pillars                 │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ End-to-End Type   │ Event-Driven &    │ Multi-Tier Data & Cache        │
│ Safety & Schema   │ Real-Time Streaming│ PostgreSQL SSOT, Redis L1/L2   │
│ Strict Zod /      │ Sub-10ms token    │ cache, S3 artifact storage,    │
│ Pydantic DTO      │ chunk SSE delivery│ transactional integrity with   │
│ synchronization   │ & status tracking │ SQLAlchemy 2.0 async           │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ Zero-Trust Dual-  │ Resilient Multi-  │ Multi-Level Fault Tolerance    │
│ Token Security    │ Agent Execution   │ Circuit breakers, exponential  │
│ In-memory JWT,    │ Supervisor-worker │ backoff, fallback models,      │
│ HttpOnly cookie,  │ DAG topology with │ automated state rollback,      │
│ RBAC & rate-limit │ self-correction   │ component isolation            │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [High-Level System Overview](#2-high-level-system-overview)
3. [Overall System Architecture](#3-overall-system-architecture)
4. [System Components](#4-system-components)
5. [End-to-End Request Lifecycle](#5-end-to-end-request-lifecycle)
6. [Authentication & Session Authorization Flow](#6-authentication--session-authorization-flow)
7. [Multi-Agent Blueprint Generation Pipeline](#7-multi-agent-blueprint-generation-pipeline)
8. [AI Engine & LLM Integration Architecture](#8-ai-engine--llm-integration-architecture)
9. [API Gateway & Communication Protocols](#9-api-gateway--communication-protocols)
10. [Database Architecture & Data Persistence](#10-database-architecture--data-persistence)
11. [Object Storage & File Management Pipeline](#11-object-storage--file-management-pipeline)
12. [Asynchronous Background Task Processing](#12-asynchronous-background-task-processing)
13. [Real-Time Event Streaming & WebSockets](#13-real-time-event-streaming--websockets)
14. [Systemic Error Handling & Resilience](#14-systemic-error-handling--resilience)
15. [Centralized Observability & Logging Architecture](#15-centralized-observability--logging-architecture)
16. [Telemetry, Metrics & System Monitoring](#16-telemetry-metrics--system-monitoring)
17. [Enterprise Security Integration & Hardening](#17-enterprise-security-integration--hardening)
18. [System Scalability Strategy](#18-system-scalability-strategy)
19. [Deployment Infrastructure & CI/CD Pipeline](#19-deployment-infrastructure--cicd-pipeline)
20. [Disaster Recovery & Business Continuity](#20-disaster-recovery--business-continuity)
21. [Architecture Decision Records (ADR)](#21-architecture-decision-records-adr)
22. [Future System Architecture Roadmap](#22-future-system-architecture-roadmap)

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to define the holistic system integration specification for the **ForgeAI Platform**. It provides an authoritative blueprint detailing how sub-systems integrate, communicate, handle state transitions, enforce security, scale under load, and recover from failures.

### 1.2 Scope
This document covers the end-to-end architecture encompassing the client browser interface, edge proxying, backend application services, background worker pools, database persistence layers, multi-agent AI execution engines, object storage repositories, and telemetry monitoring pipelines.

### 1.3 Architectural Goals
* **Deterministic Multi-Agent Execution**: Ensure complex agent workflows complete reliably with verified structural outputs.
* **Sub-100ms API Latency**: Maintain non-blocking async I/O across all REST and streaming endpoints.
* **Zero-Trust Security**: Standardize dual-token authentication, strict Role-Based Access Control (RBAC), and sanitization against prompt injection attack vectors.
* **Enterprise High Availability**: Achieve 99.99% system uptime through stateless application tiers, automated health checks, and database replication.

---

## 2. High-Level System Overview

### 2.1 Subsystem Breakdown

| Subsystem | Core Technology | Primary Responsibility |
| :--- | :--- | :--- |
| **Frontend SPA / RSC** | Next.js 15, TypeScript, Zustand, TanStack Query | Serves UI components, manages client state, displays real-time agent streams, handles user interactions. |
| **Edge Gateway Proxy** | Nginx, TLS 1.3, Rate Limiter | SSL termination, path-based routing, HTTP rate-limiting, static asset caching, header security enforcement. |
| **Backend Core Engine** | FastAPI, Python 3.13, Pydantic v2 | Manages REST endpoints, enforces auth/RBAC, orchestrates DB transactions, triggers background agent workflows. |
| **AI Multi-Agent Core** | LangGraph, OpenAI GPT-4o, Anthropic Claude | Coordinates 14 domain-specialized AI agents to execute structured software analysis, design, and code generation. |
| **Relational Database** | PostgreSQL 16, SQLAlchemy 2.0 Async | System of Record for user identities, organization tenants, project metadata, generated blueprints, and execution logs. |
| **Cache & Task Broker** | Redis 7.2 | In-memory session cache, fast API rate-limiting store, Pub/Sub event router, and task broker for background workers. |
| **Background Task Pool** | Celery Async Workers | Executes asynchronous long-running generation workflows, PDF/ZIP artifact packaging, and email notifications. |
| **Object Storage** | S3 / MinIO Compatible Storage | Persists generated code repositories, exported PDF/Markdown technical documents, user avatars, and system backups. |
| **Observability Suite** | Sentry, Prometheus, Grafana | Continuous performance tracking, exception reporting, AI token expenditure analytics, and latency telemetry. |

### 2.2 System Component Architecture (C4 Model)

```mermaid
C4Component
    title ForgeAI High-Level Subsystem Integration Architecture

    Container_Boundary(c_client, "Client Layer") {
        Component(browser, "Next.js 15 Frontend", "React 19 / TypeScript", "Renders SPA dashboard, manages Zustand stores, streams LLM tokens")
    }

    Container_Boundary(c_ingress, "Ingress Layer") {
        Component(nginx, "Nginx Reverse Proxy", "Nginx 1.26", "TLS 1.3 termination, rate-limiting, path routing (/api/v1)")
    }

    Container_Boundary(c_app, "Application & AI Execution Layer") {
        Component(fastapi, "FastAPI Application Server", "Python 3.13", "Handles REST endpoints, auth validation, DB transactions, SSE endpoints")
        Component(agent_engine, "Multi-Agent Orchestrator", "LangGraph / OpenAI", "Executes 14 specialized AI agents in a supervised DAG pipeline")
        Component(celery, "Celery Worker Pool", "Python / Redis", "Asynchronous long-running blueprint export, PDF building, background cleanup")
    }

    Container_Boundary(c_data, "Persistence & Storage Layer") {
        ComponentDb(postgres, "PostgreSQL 16 DB", "PostgreSQL", "Primary Relational System of Record (Users, Projects, Blueprints)")
        ComponentDb(redis, "Redis Cache & Broker", "Redis 7.2", "Session tokens, cache, rate limits, Pub/Sub channel gateway, Celery queue")
        ComponentDb(storage, "S3 Object Storage", "AWS S3 / MinIO", "Persists generated blueprint Markdown, code ZIPs, and asset files")
    }

    Container_Boundary(c_ext, "External AI Providers") {
        Component(openai, "OpenAI API", "GPT-4o / o1", "Primary LLM inference for code, schema, and system design generation")
        Component(anthropic, "Anthropic API", "Claude 3.5 Sonnet", "Fallback LLM provider for complex architectural reasoning")
    }

    Rel(browser, nginx, "1. HTTPS / WSS Requests", "TLS 1.3")
    Rel(nginx, fastapi, "2. Reverse Proxies Request", "HTTP / ASGI")
    Rel(fastapi, postgres, "3. Async Queries / Transactions", "SQLAlchemy / asyncpg")
    Rel(fastapi, redis, "4. Session & Rate-Limit Check", "Redis Protocol")
    Rel(fastapi, agent_engine, "5. Dispatches Agent Task", "Internal Python Calls")
    Rel(fastapi, celery, "6. Enqueues Async Jobs", "Redis Task Broker")
    Rel(agent_engine, openai, "7. LLM Inference Calls", "HTTPS / JSON")
    Rel(agent_engine, anthropic, "8. Fallback LLM Calls", "HTTPS / JSON")
    Rel(celery, storage, "9. Uploads Export Artifacts", "S3 API / Boto3")
```

---

## 3. Overall System Architecture

### 3.1 End-to-End Data Integration Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Overall Tiered Data Pipeline                    │
└────────────────────────────────────────────────────────────────────────┘

  [ Client Browser ]
         │
         ▼ (HTTPS / TLS 1.3)
  [ Nginx Ingress Gateway ] ──► (Rate Limit & SSL Termination)
         │
         ▼ (ASGI Protocol)
  [ FastAPI Backend Core ] ──► [ Redis Cache ] (Sub-5ms Session Auth)
         │
         ├──► [ PostgreSQL 16 ] (Transactional Metadata & State)
         │
         ├──► [ Multi-Agent AI Engine ] ──► [ OpenAI / Claude LLMs ]
         │           │
         │           ▼ (Token Streaming / SSE)
         │    [ Client Canvas ]
         │
         └──► [ Celery Workers ] ──► [ S3 Object Storage ] (PDF / ZIP Export)
```

### 3.2 Tier Dependencies & Isolation Rules
> [!IMPORTANT]
> The database and object storage layers are completely isolated behind private Docker networks. External clients can NEVER directly connect to PostgreSQL, Redis, or Celery. All communication MUST pass through Nginx and FastAPI.

---

## 4. System Components

### 4.1 Component Responsibility Matrix

| Component | Primary Responsibilities | Direct Dependencies | Downstream Consumers | Failure Recovery Strategy | Scalability Mode |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend (Next.js 15)** | UI rendering, client state management, form validation, token stream parsing. | Axios, TanStack Query, Zustand | End-User Browser | Client Error Boundary, automatic API retry. | CDN Edge Caching, Static Export. |
| **Nginx Proxy** | Reverse proxying, TLS offloading, DDOS rate-limiting, static asset serving. | SSL Certs, Upstream Hosts | Frontend, Backend | Auto-restart container, secondary backup pod. | Horizontal Load Balancing (DNS). |
| **FastAPI Core** | REST API endpoints, JWT authentication, business logic, ORM data mapping. | PostgreSQL, Redis, Pydantic | Nginx Proxy | Uvicorn worker process restart on failure. | Horizontal scaling (Uvicorn workers). |
| **AI Agent Engine** | Agent DAG orchestration, prompt building, token parsing, structural validation. | OpenAI API, Anthropic API, FastAPI | FastAPI Core | Circuit breaker, model fallback, automatic retry. | Stateless thread pool scaling. |
| **Celery Worker** | Asynchronous document export, ZIP generation, scheduled database cleanups. | Redis Queue, S3 Storage, PostgreSQL | FastAPI Core | Task retry with exponential backoff. | Horizontal worker process scaling. |
| **PostgreSQL 16** | System of Record, ACID compliance, relational integrity, transactional lock. | Disk Storage | FastAPI, Celery | Streaming replication, automatic failover. | Vertical scaling + Read Replicas. |
| **Redis 7.2** | Key-Value caching, task broker queue, SSE Pub/Sub router, rate limiting. | RAM Memory | FastAPI, Celery | Redis Sentinel / Cluster auto-failover. | Redis Cluster sharding. |
| **S3 Storage** | Persistent object storage for exports, user uploads, system logs. | Disk / Cloud Provider | Celery, FastAPI | Multi-region bucket replication. | Infinite Cloud Scale. |

---

## 5. End-to-End Request Lifecycle

### 5.1 Comprehensive Lifecycle Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Enterprise User
    participant FE as Next.js 15 Frontend
    participant GW as Nginx Ingress Proxy
    participant BE as FastAPI Core Server
    participant DB as PostgreSQL Database
    participant AI as Multi-Agent AI Engine
    participant LLM as OpenAI GPT-4o API
    participant Worker as Celery Worker Pool
    participant S3 as S3 Object Storage

    %% Stage 1: User Login
    User->>FE: 1. Enters Credentials (Email/Password)
    FE->>GW: 2. POST /api/v1/auth/login
    GW->>BE: 3. Forwards Request to Auth Service
    BE->>DB: 4. Queries User Identity & Verifies Argon2 Hash
    DB-->>BE: 5. User Validated (Returns Role & Tenant ID)
    BE-->>GW: 6. Returns Access Token (JSON) + Set-Cookie (HttpOnly Refresh)
    GW-->>FE: 7. Session Established
    
    %% Stage 2: Dashboard Load
    FE->>GW: 8. GET /api/v1/projects (With Bearer Access Token)
    GW->>BE: 9. Verifies JWT Access Token Signature
    BE->>DB: 10. SELECT * FROM projects WHERE tenant_id = :id
    DB-->>BE: 11. Returns Active Projects Array
    BE-->>FE: 12. Hydrates Dashboard View (TanStack Query Cache)

    %% Stage 3: Blueprint Generation
    User->>FE: 13. Submits Product Prompt ("Build a SaaS Billing System")
    FE->>GW: 14. POST /api/v1/blueprints/generate (SSE Request)
    GW->>BE: 15. Dispatches Stream Request to Multi-Agent Engine
    BE->>DB: 16. Creates Blueprint Record (Status: PENDING)
    BE->>AI: 17. Initializes Supervisor Agent & Context Builder
    
    loop Agent Execution Loop
        AI->>LLM: 18. Sends Structured Prompt to LLM
        LLM-->>AI: 19. Streams Response Chunks
        AI-->>BE: 20. Dispatches SSE Event (Agent Output Chunk)
        BE-->>FE: 21. Real-Time Token Rendered on UI Canvas
    end
    
    AI->>DB: 22. Saves Final Validated Blueprint JSON (Status: COMPLETED)
    
    %% Stage 4: Document Export
    User->>FE: 23. Clicks "Export Blueprint as PDF/ZIP"
    FE->>GW: 24. POST /api/v1/blueprints/:id/export
    GW->>BE: 25. Enqueues Task into Celery Worker Queue
    BE-->>FE: 26. Returns Task ID (Status: PROCESSING)
    
    Worker->>DB: 27. Fetches Complete Blueprint JSON
    Worker->>Worker: 28. Compiles Markdown & Renders PDF
    Worker->>S3: 29. Uploads ZIP Artifact to S3 Bucket
    S3-->>Worker: 30. Returns Presigned Storage URL
    Worker->>DB: 31. Updates Task Record with S3 Presigned URL
    
    FE->>BE: 32. Polls /api/v1/tasks/:task_id
    BE-->>FE: 33. Returns S3 Presigned Download URL
    FE-->>User: 34. Downloads Production Artifact ZIP
```

---

## 6. Authentication & Session Authorization Flow

### 6.1 Security Architecture
ForgeAI implements an **Enterprise Dual-Token Authentication Strategy**:
* **Short-Lived Access Tokens**: Signed JWTs with a 15-minute expiration, held purely in frontend memory (Zustand state).
* **Long-Lived Refresh Tokens**: Secure, cryptographically random tokens with a 7-day expiration, stored strictly inside `HttpOnly`, `SameSite=Strict`, `Secure` cookies.

### 6.2 Authentication State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated: User visits website
    
    Unauthenticated --> Authenticated: POST /api/v1/auth/login (Success)
    
    state Authenticated {
        [*] --> ActiveSession: Access Token Valid (In Memory)
        ActiveSession --> TokenExpired: 15 minutes elapsed
        TokenExpired --> SilentRefreshing: Axios Interceptor Catches 401
        
        state SilentRefreshing {
            [*] --> SubmitCookie: POST /api/v1/auth/refresh
            SubmitCookie --> IssueNewToken: Refresh Token Valid
            SubmitCookie --> SessionInvalidated: Refresh Token Expired / Revoked
        }
        
        IssueNewToken --> ActiveSession: New Access Token Saved in Memory
    }
    
    SessionInvalidated --> Unauthenticated: Redirect to /login
    Authenticated --> Unauthenticated: POST /api/v1/auth/logout
```

### 6.3 Protected Route Guard Matrix

| User Role | Dashboard Access | Create Blueprint | Export Code | Organization Admin | System Settings |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Viewer** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Developer** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Architect** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Org Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 7. Multi-Agent Blueprint Generation Pipeline

### 7.1 Multi-Agent Orchestration Architecture
The AI Engine employs a **Supervised Directed Acyclic Graph (DAG)** topology containing **14 domain-specialized AI agents**. The Supervisor Agent orchestrates execution order, verifies output schemas, and enforces self-correction loops.

```mermaid
flowchart TD
    UserPrompt([User Concept Prompt]) --> FE_Val[Frontend Input Validation & Sanitation]
    FE_Val --> API_Gateway[FastAPI Endpoint: /api/v1/blueprints/generate]
    API_Gateway --> SupAgent[1. Supervisor Agent: DAG Coordinator]
    
    subgraph Multi Agent Execution Pipeline
        SupAgent --> ReqAgent[2. Requirements Agent: Scope & User Stories]
        ReqAgent --> ArchAgent[3. System Architecture Agent: C4 & Containers]
        ArchAgent --> DBAgent[4. Database Agent: Schema & ER Diagrams]
        DBAgent --> APIAgent[5. API Specification Agent: REST / OpenAPI Specs]
        APIAgent --> BEAgent[6. Backend Agent: Code Scaffolding & Services]
        BEAgent --> FEAgent[7. Frontend Agent: Component & UI Specs]
        FEAgent --> SecAgent[8. Security Agent: OWASP Audit & Auth Rules]
        SecAgent --> QAAgent[9. QA & Testing Agent: Vitest / Pytest Suites]
    end

    QAAgent --> ValGuard{Output Validation Check}
    ValGuard -->|Schema Errors Detected| SupAgent
    ValGuard -->|Validation Passed| DocGen[10. Technical Document Compiler]
    
    DocGen --> SaveDB[(Save Complete Blueprint to PostgreSQL)]
    SaveDB --> StreamFE[Stream Execution Complete Signal to Client]
```

### 7.2 Specialized Agent Breakdown

| Agent Name | Primary Output Responsibility | Validation Rule / Schema |
| :--- | :--- | :--- |
| **1. Supervisor Agent** | Task dispatching, agent execution routing, dependency checks. | Valid Execution Plan DAG |
| **2. Requirements Agent** | Functional requirements, user stories, acceptance criteria. | Markdown + User Story JSON Array |
| **3. Architecture Agent** | High-level system design, C4 container specs, component layouts. | Valid Mermaid C4 Diagrams |
| **4. Database Agent** | Relational schemas, table structures, foreign keys, index designs. | Valid PostgreSQL DDL & ERD |
| **5. API Spec Agent** | Endpoint schemas, request/response models, HTTP status codes. | Valid OpenAPI 3.1 Spec (JSON) |
| **6. Backend Agent** | FastAPI router code, service logic, ORM models, dependencies. | Executable Python Code Syntax |
| **7. Frontend Agent** | Next.js page layouts, component specs, Zustand store contracts. | Valid TypeScript / JSX Syntax |
| **8. Security Agent** | Threat modeling, OWASP compliance rules, authentication specs. | Security Audit Checklist |
| **9. QA Agent** | Unit test specifications, integration test scripts, edge cases. | Valid Pytest & Vitest Suites |
| **10. Document Generator** | Merges agent outputs into unified production Markdown/PDF docs. | Complete Technical Spec Doc |

---

## 8. AI Engine & LLM Integration Architecture

### 8.1 LLM Communication Infrastructure
The AI Integration Layer abstracts interaction with external LLM providers using Pydantic output parsers, automated token streaming, and multi-tier fallbacks.

```
┌────────────────────────────────────────────────────────────────────────┐
│                      AI Integration Layer Pipeline                     │
├────────────────────────────────────────────────────────────────────────┤
│  Prompt Builder ──► System Context Injector ──► Pydantic Output Guard │
│                                                          │             │
│  Client SSE Stream ◄── Token Buffer Queue ◄── OpenAI GPT-4o API        │
│                                                          │ (On Error)  │
│                                                          ▼             │
│                                               Anthropic Claude 3.5     │
└────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Resilience & Fallback Protocol
> [!TIP]
> If OpenAI returns a 500 error, rate limit (429), or JSON schema validation fails twice, the AI Engine automatically reroutes the prompt to **Anthropic Claude 3.5 Sonnet** without terminating the active user generation session.

### 8.3 AI Integration Decision Matrix

| Mechanism | Implementation Detail | Purpose |
| :--- | :--- | :--- |
| **Context Building** | RAG Vector Search (Qdrant) + Dynamic System Prompts | Injects enterprise architectural standards and past blueprints. |
| **Structured Output** | OpenAI Function Calling / Pydantic V2 Models | Guarantees deterministic JSON outputs from LLMs. |
| **Streaming Engine** | Server-Sent Events (SSE) via FastAPI `EventSourceResponse` | Delivers real-time token chunks to frontend with sub-10ms latency. |
| **Caching Layer** | Redis Semantic Cache (SHA256 Prompt Hash) | Prevents redundant LLM calls for identical prompts, reducing cost by up to 40%. |
| **Retry Strategy** | Exponential Backoff with Jitter (3 Attempts) | Mitigates transient LLM API hiccups and rate-limit throttles. |

---

## 9. API Gateway & Communication Protocols

### 9.1 API Interface Protocols

```
┌────────────────────────────────────────────────────────────────────────┐
│                         API Interface Protocols                        │
├──────────────────┬────────────────────────────┬────────────────────────┤
│ Interface Type   │ Transport Protocol         │ Usage Scope            │
├──────────────────┼────────────────────────────┼────────────────────────┤
│ Standard REST API│ HTTPS / JSON (v1 Engine)   │ Authentication, CRUD,  │
│                  │                            │ User Profile, Billing  │
├──────────────────┼────────────────────────────┼────────────────────────┤
│ Real-Time Stream │ Server-Sent Events (SSE)   │ Live Multi-Agent LLM   │
│                  │                            │ Token Streaming        │
├──────────────────┼────────────────────────────┼────────────────────────┤
│ Async WebSockets │ WSS (WebSocket Secure)     │ Live Collaborative     │
│                  │                            │ Canvas Editing         │
└──────────────────┴────────────────────────────┴────────────────────────┘
```

### 9.2 API Error Response Standard (RFC 7807)
All API errors return standardized JSON payloads:
```json
{
  "type": "https://api.forgeai.com/v1/errors/validation-error",
  "title": "Unprocessable Entity Payload",
  "status": 422,
  "detail": "Field 'agent_count' must be an integer between 1 and 14.",
  "instance": "/api/v1/blueprints/generate",
  "code": "INVALID_AGENT_COUNT",
  "timestamp": "2026-07-29T18:00:00Z"
}
```

---

## 10. Database Architecture & Data Persistence

### 10.1 Entity-Relationship (ER) Schema Overview

```mermaid
erDiagram
    TENANTS ||--o{ USERS : owns
    TENANTS ||--o{ PROJECTS : contains
    USERS ||--o{ PROJECTS : creates
    PROJECTS ||--o{ BLUEPRINTS : generates
    BLUEPRINTS ||--o{ AGENT_LOGS : records
    PROJECTS ||--o{ EXPORT_ARTIFACTS : produces

    TENANTS {
        uuid id PK
        string name
        string plan_tier
        datetime created_at
    }

    USERS {
        uuid id PK
        uuid tenant_id FK
        string email
        string password_hash
        string role
        datetime created_at
    }

    PROJECTS {
        uuid id PK
        uuid tenant_id FK
        uuid user_id FK
        string title
        string description
        string status
        datetime created_at
    }

    BLUEPRINTS {
        uuid id PK
        uuid project_id FK
        jsonb system_architecture
        jsonb database_schema
        jsonb api_specifications
        jsonb backend_code
        jsonb frontend_code
        datetime generated_at
    }

    AGENT_LOGS {
        uuid id PK
        uuid blueprint_id FK
        string agent_name
        string status
        integer execution_time_ms
        jsonb output_payload
    }

    EXPORT_ARTIFACTS {
        uuid id PK
        uuid project_id FK
        string file_type
        string s3_key
        datetime created_at
    }
```

### 10.2 Database Performance Optimization
* **Connection Pooling**: Async SQLAlchemy engine configured with `pool_size=20`, `max_overflow=10`, and `pool_recycle=1800`.
* **JSONB Indexing**: GIN indexes on `blueprints.system_architecture` and `blueprints.database_schema` for sub-5ms JSON querying.
* **Database Migrations**: Automated schema upgrades via **Alembic** integrated into CI/CD pipelines.

---

## 11. Object Storage & File Management Pipeline

### 11.1 File Storage Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                       S3 Object Storage Taxonomy                       │
├────────────────────────────────────────────────────────────────────────┤
│  s3://forgeai-production-bucket/                                       │
│  ├── tenants/{tenant_id}/                                              │
│  │   ├── projects/{project_id}/                                        │
│  │   │   ├── exports/                                                  │
│  │   │   │   ├── blueprint_{timestamp}.zip                             │
│  │   │   │   └── technical_spec_{timestamp}.pdf                        │
│  │   │   └── assets/                                                   │
│  │   │       └── architecture_diagram.svg                              │
│  └── system/                                                           │
│      └── backups/                                                      │
└────────────────────────────────────────────────────────────────────────┘
```

### 11.2 Presigned URL Security
Clients NEVER upload or download files directly through the FastAPI server. The server generates **S3 Presigned URLs** (valid for 15 minutes), allowing the client browser to securely upload/download directly to/from S3.

---

## 12. Asynchronous Background Task Processing

### 12.1 Background Task Architecture
Long-running, compute-heavy, or I/O-intensive tasks are offloaded to **Celery Workers** backed by a **Redis Message Broker**.

```mermaid
graph LR
    A[FastAPI HTTP Request] -->|Enqueue Task| B[(Redis Celery Queue)]
    B -->|Fetch Next Job| C[Celery Worker 1: Document Export]
    B -->|Fetch Next Job| D[Celery Worker 2: PDF Rendering]
    B -->|Fetch Next Job| E[Celery Worker 3: Cleanup Tasks]
    
    C -->|Save File| F[S3 Storage]
    D -->|Save File| F
    C -->|Update Status| G[(PostgreSQL DB)]
    D -->|Update Status| G
```

### 12.2 Worker Task Routing Matrix

| Task Name | Queue Name | Timeout | Retry Policy |
| :--- | :--- | :--- | :--- |
| `tasks.generate_zip_export` | `exports_queue` | 300 sec | 3 Retries (Exponential Backoff) |
| `tasks.render_pdf_document` | `exports_queue` | 180 sec | 2 Retries |
| `tasks.send_welcome_email` | `notifications_queue` | 30 sec | 5 Retries |
| `tasks.cleanup_expired_sessions` | `periodic_queue` | 60 sec | No Retry |

---

## 13. Real-Time Communication

### 13.1 Streaming Communication Engine
ForgeAI supports live streaming of multi-agent token output using **Server-Sent Events (SSE)**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Real-Time SSE Event Stream                      │
├────────────────────────────────────────────────────────────────────────┤
│  event: agent_start\n                                                  │
│  data: {"agent": "DatabaseAgent", "status": "RUNNING"}\n\n            │
│                                                                        │
│  event: token_chunk\n                                                  │
│  data: {"chunk": "CREATE TABLE users (id UUID PRIMARY KEY..."}\n\n    │
│                                                                        │
│  event: agent_complete\n                                               │
│  data: {"agent": "DatabaseAgent", "status": "COMPLETED"}\n\n          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 14. Systemic Error Handling & Resilience

### 14.1 Layered Fault Isolation Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Hierarchical Error Resilience                     │
├───────────────────┬───────────────────────────┬────────────────────────┤
│ System Tier       │ Potential Failure         │ Resilience Mechanism   │
├───────────────────┼───────────────────────────┼────────────────────────┤
│ Frontend SPA      │ Network disconnection     │ Toast alert, local RHF │
│                   │                           │ state retention        │
├───────────────────┼───────────────────────────┼────────────────────────┤
│ FastAPI Server    │ Uncaught exception        │ Global exception filter│
│                   │                           │ (500 JSON RFC 7807)    │
├───────────────────┼───────────────────────────┼────────────────────────┤
│ Multi-Agent Engine│ LLM API Timeout / Rate Limit│ Circuit Breaker +     │
│                   │                           │ Anthropic Fallback     │
├───────────────────┼───────────────────────────┼────────────────────────┤
│ PostgreSQL DB     │ Transaction deadlock      │ Auto rollback + retry  │
│                   │                           │ 3 times with jitter    │
└───────────────────┴───────────────────────────┴────────────────────────┘
```

---

## 15. Centralized Observability & Logging Architecture

### 15.1 Structured Logging Architecture
All platform logs are formatted as **Structured JSON** and shipped to a centralized log aggregator (Elasticsearch / Loki).

```json
{
  "timestamp": "2026-07-29T18:00:25Z",
  "level": "INFO",
  "service": "forgeai-backend",
  "trace_id": "c8f94a12-881b-42e3-b541-11a22b84920a",
  "tenant_id": "t_991823",
  "user_id": "u_441029",
  "endpoint": "/api/v1/blueprints/generate",
  "agent_name": "ArchitectureAgent",
  "duration_ms": 1420,
  "tokens_consumed": 3840,
  "message": "Successfully generated system container architecture diagram."
}
```

---

## 16. Telemetry, Metrics & System Monitoring

### 16.1 Key Performance Indicators (KPI Monitoring)

```mermaid
graph TD
    A[Prometheus Metrics Exporter] --> B[Grafana Dashboards]
    
    subgraph Operational Metrics
        B --> C[API Latency p95 < 80ms]
        B --> D[HTTP Error Rate < 0.01%]
        B --> E[PostgreSQL Pool Saturation < 60%]
    end

    subgraph AI Business Metrics
        B --> F[LLM Token Usage Velocity]
        B --> G[Agent Execution Cost Per Blueprint]
        B --> H[Agent Fallback Rate < 1%]
    end
```

---

## 17. Enterprise Security Integration & Hardening

### 17.1 Security Controls & Hardening Matrix

| Security Layer | Implemented Control | Target Vulnerability |
| :--- | :--- | :--- |
| **Edge Ingress** | Nginx Rate Limiting (100 req/min per IP) | Brute force, DDoS attacks |
| **Authentication** | Argon2id Hashing + Dual-Token JWT | Credential theft, rainbow table attacks |
| **Session Control** | HttpOnly, SameSite=Strict Cookies | Cross-Site Scripting (XSS) token theft |
| **Transport** | Enforced TLS 1.3 Encryption | Man-in-the-Middle (MitM) eavesdropping |
| **AI Defense** | Strict Prompt Sanitizer + Pydantic Schema Validation | Prompt Injection & Jailbreaking |
| **Data Protection** | AES-256 Storage Encryption & pgcrypto DB Column Encryption | Unsalted database leaks |

---

## 18. System Scalability Strategy

### 18.1 Horizontal & Vertical Scaling Blueprint

```mermaid
graph TD
    SubGraph1[Load Balancer: Nginx Ingress] --> App1[FastAPI Node 1]
    SubGraph1 --> App2[FastAPI Node 2]
    SubGraph1 --> App3[FastAPI Node N]

    App1 --> RedisCluster[(Redis Cluster: Cache / Queue)]
    App2 --> RedisCluster
    App3 --> RedisCluster

    RedisCluster --> Worker1[Celery Worker Pod 1]
    RedisCluster --> Worker2[Celery Worker Pod 2]

    App1 --> DB_Primary[(PostgreSQL Primary: Writes)]
    DB_Primary -->|Streaming Replication| DB_Replica1[(PostgreSQL Replica 1: Reads)]
    DB_Primary -->|Streaming Replication| DB_Replica2[(PostgreSQL Replica 2: Reads)]

    App2 --> DB_Replica1
    App3 --> DB_Replica2
```

---

## 19. Deployment Infrastructure & CI/CD Pipeline

### 19.1 CI/CD Production Deployment Pipeline

```mermaid
graph LR
    A[Git Push to main] --> B[GitHub Actions Triggered]
    B --> C[Run Pytest & Vitest Suites]
    C --> D[Build Docker Images]
    D --> E[Scan Vulnerabilities with Trivy]
    E --> F[Push Container Images to Registry]
    F --> G[Execute Alembic DB Migrations]
    G --> H[Rolling Upgrade Container Pods]
    H --> I[Health Check Verification]
```

---

## 20. Disaster Recovery & Business Continuity

### 20.1 Disaster Recovery (DR) Plan

| Metric | Targeted SLA Target | Recovery Procedure |
| :--- | :--- | :--- |
| **Recovery Point Objective (RPO)** | < 5 Minutes | Automated WAL (Write-Ahead Logging) archiving to S3 every 5 minutes. |
| **Recovery Time Objective (RTO)** | < 15 Minutes | Automated Kubernetes / Docker container redeployment from secondary cloud region. |
| **Backup Frequency** | Daily Full + Hourly Incremental | Encrypted PostgreSQL database dumps stored in multi-region S3 buckets. |
| **Failover Mode** | Multi-AZ Automated Failover | Redis Sentinel auto-promotion and PostgreSQL Patroni cluster failover. |

---

## 21. Architecture Decision Records (ADR)

### ADR Summary Matrix

| ADR ID | Decision Title | Selected Option | Rationale & Key Trade-Offs |
| :--- | :--- | :--- | :--- |
| **ADR-001** | Backend Framework Selection | **FastAPI (Python 3.13)** | Native async I/O support, automatic OpenAPI doc generation, native Pydantic v2 validation. Accepted higher CPU usage vs Rust. |
| **ADR-002** | Multi-Agent Orchestration Framework | **LangGraph** | Enables cyclic graph workflows required for agent self-correction loops. Trade-off: Higher initial state graph complexity. |
| **ADR-003** | Primary Database | **PostgreSQL 16** | Robust relational ACID compliance combined with JSONB document querying. Trade-off: Requires strict schema migration discipline via Alembic. |
| **ADR-004** | Client State Engine | **Zustand + TanStack Query** | Strict separation of server cache from local UI state; lightweight footprint (< 1KB). |

---

## 22. Future System Architecture Roadmap

### 22.1 Evolution Timeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                   System Architecture Roadmap Timeline                 │
├───────────────────┬───────────────────────────┬────────────────────────┤
│ Phase / Quarter   │ Technical Milestone       │ System Capability      │
├───────────────────┼───────────────────────────┼────────────────────────┤
│ Q3 2026 (Phase 1) │ Modular Monolith Core     │ Unified FastAPI/Next.js│
│                   │                           │ 14-Agent DAG Pipeline  │
├───────────────────┼───────────────────────────┼────────────────────────┤
│ Q4 2026 (Phase 2) │ Vector RAG Memory Integration│ Agent memory caching  │
│                   │                           │ via Qdrant HNSW Index  │
├───────────────────┼───────────────────────────┼────────────────────────┤
│ Q2 2027 (Phase 3) │ Microservices & Event-Driven│ Split agent execution  │
│                   │ Architecture              │ into independent pods  │
├───────────────────┼───────────────────────────┼────────────────────────┤
│ Q4 2027 (Phase 4) │ Enterprise Multi-Tenant   │ Dedicated VPCs, SAML   │
│                   │ Isolated Clusters         │ 2.0, WebGPU Graph UI   │
└───────────────────┴───────────────────────────┴────────────────────────┘
```

---

### Summary Sign-Off
> **Approved By**: Chief Technology Officer & Principal Solutions Architect  
> **Repository Governance**: `ForgeAI Enterprise Platform Architecture`  
> **Compliance Verification**: SOC 2 Type II Readiness, OWASP Top 10 Resilient, WAI-ARIA Level AA  
