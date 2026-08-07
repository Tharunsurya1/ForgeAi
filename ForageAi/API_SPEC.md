# ForgeAI REST & WebSocket API Specification

> **Document Version**: 1.0.0  
> **Target Framework**: FastAPI / Python 3.13  
> **API Version**: `v1` (`/api/v1`)  
> **Protocol**: HTTPS (TLS 1.3), WSS  
> **Standard Specification**: OpenAPI 3.1  
> **Author**: Principal API Architect  
> **Last Updated**: July 2026  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [API Standards](#2-api-standards)
3. [Authentication](#3-authentication)
4. [Common Request Format](#4-common-request-format)
5. [Common Response Format](#5-common-response-format)
6. [Error Handling](#6-error-handling)
7. [Rate Limiting](#7-rate-limiting)
8. [Module APIs](#8-module-apis)
9. [WebSocket APIs](#9-websocket-apis)
10. [AI APIs](#10-ai-apis)
11. [File APIs](#11-file-apis)
12. [Search APIs](#12-search-apis)
13. [Analytics APIs](#13-analytics-apis)
14. [Billing APIs](#14-billing-apis)
15. [Security](#15-security)
16. [API Versioning](#16-api-versioning)
17. [OpenAPI Integration & Client Generation](#17-openapi-integration--client-generation)
18. [Testing Strategy](#18-testing-strategy)
19. [Future APIs](#19-future-apis)
20. [Deliverables Summary](#20-deliverables-summary)

---

## 1 Executive Summary

### 1.1 API Philosophy
The **ForgeAI REST & WebSocket API** is designed as a developer-first, resilient interface powering web clients, mobile dashboards, CLI tools, and external programmatic integrations. Built on strict **RESTful principles**, **OpenAPI 3.1**, and **RFC 7807 Error Handling**, it provides predictable resources, granular error feedback, and streaming capabilities for high-throughput AI agent interactions.

### 1.2 Core Design Principles
* **Predictable Resource Topography**: Plural noun endpoints (`/api/v1/projects`, `/api/v1/blueprints`).
* **Streaming First**: Server-Sent Events (SSE) and WebSockets for real-time AI token streaming and live progress traces.
* **Strict Type Validation**: Pydantic v2 schemas enforce typed request validation and response serialization.
* **Granular Idempotency**: Support for `X-Idempotency-Key` headers on non-idempotent operations (`POST`, `PATCH`).

---

## 2 API Standards

### 2.1 HTTP Methods Taxonomy
* `GET`: Idempotent read requests. Never alters server state.
* `POST`: Create a new resource or trigger an asynchronous background operation (e.g., blueprint generation).
* `PUT`: Complete resource replacement.
* `PATCH`: Partial resource updates.
* `DELETE`: Remove a resource.

### 2.2 Pagination Standard (Cursor & Limit-Offset)
All listing endpoints support cursor-based pagination for high-volume entities (`agent_runs`, `activity_logs`) and limit-offset for administrative views:

```
GET /api/v1/projects?limit=20&cursor=eyJjcmVhdGVkX2F0IjoxNzg5MTAwMDAwfQ==
```

### 2.3 Sorting & Filtering Conventions
* **Filter Parameters**: `?status=active&plan_tier=pro`
* **Sorting Parameters**: `?sort_by=created_at&sort_order=desc`

---

## 3 Authentication

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client App
    participant Auth as Auth Controller (/api/v1/auth)
    participant Cache as Redis Store
    participant API as Protected API Endpoint

    Client->>Auth: POST /api/v1/auth/login {email, password}
    Auth-->>Client: 200 OK + {access_token: "jwt...", expires_in: 900} + Cookie (HttpOnly: refresh_token)
    
    Client->>API: GET /api/v1/projects (Header: Authorization Bearer jwt...)
    API->>Cache: Verify Token JTI Blacklist
    Cache-->>API: Active Token
    API-->>Client: 200 OK + Projects Payload
```

---

## 4 Common Request Format

### 4.1 Required & Recommended Request Headers
```http
POST /api/v1/projects HTTP/1.1
Host: api.forgeai.dev
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Correlation-ID: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
X-Idempotency-Key: 7c9e6679-7425-40de-944b-e07fc1f90ae7
Content-Type: application/json
Accept: application/json
```

---

## 5 Common Response Format

### 5.1 Success Response Wrapper
```json
{
  "success": true,
  "data": {
    "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "name": "Cloud Native E-Commerce",
    "slug": "cloud-native-e-commerce",
    "status": "active",
    "created_at": "2026-07-28T18:27:44Z"
  },
  "meta": {
    "timestamp": "2026-07-28T18:27:44Z",
    "correlation_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
  }
}
```

### 5.2 Error Response Format (RFC 7807)
```json
{
  "type": "https://api.forgeai.dev/errors/validation-error",
  "title": "Unprocessable Entity",
  "status": 422,
  "code": "VALIDATION_FAILED",
  "detail": "Field 'name' is required and must be between 3 and 200 characters.",
  "instance": "/api/v1/projects",
  "errors": [
    {
      "field": "name",
      "message": "String should have at least 3 characters",
      "location": "body"
    }
  ],
  "timestamp": "2026-07-28T18:27:44Z",
  "correlation_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
```

---

## 6 Error Handling

| Status Code | Error Code | Description | Recovery Suggestion |
|---|---|---|---|
| **400 Bad Request** | `INVALID_PAYLOAD` | Malformed JSON or invalid syntax | Fix payload structure |
| **401 Unauthorized** | `TOKEN_EXPIRED` | Expired or invalid Bearer JWT | Invoke `/api/v1/auth/refresh` |
| **403 Forbidden** | `PERMISSION_DENIED` | Insufficient RBAC role | Request permission upgrade |
| **404 Not Found** | `RESOURCE_NOT_FOUND` | Target resource UUID does not exist | Verify resource ID |
| **409 Conflict** | `RESOURCE_EXISTS` | Slug or email collision | Change unique field name |
| **422 Unprocessable** | `VALIDATION_FAILED` | Pydantic schema validation error | Inspect `errors` list |
| **429 Rate Limited** | `RATE_LIMIT_EXCEEDED` | Request threshold exceeded | Exponential backoff & retry |
| **500 Server Error** | `INTERNAL_ERROR` | Unexpected backend failure | Contact support with correlation ID |

---

## 7 Rate Limiting

Rate limiting is enforced via Redis Sliding Windows:

| API Scope | Limit Threshold | Burst Capacity |
|---|---|---|
| **Authentication APIs** | 5 requests / minute | 10 requests |
| **Standard REST APIs** | 120 requests / minute | 200 requests |
| **AI Generation Triggers** | 10 requests / minute | 15 requests |
| **WebSocket Connections** | 20 connections / minute | 30 connections |

Header feedback:
```http
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 118
X-RateLimit-Reset: 1785293000
```

---

## 8 Module APIs Summary Table

Below is the complete REST API taxonomy across all system modules:

| Domain | Method | Endpoint URL | Description | Auth / Scope |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/v1/auth/register` | Register new account | Public |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate & issue tokens | Public |
| **Auth** | `POST` | `/api/v1/auth/refresh` | Refresh access token | Refresh Cookie |
| **Auth** | `POST` | `/api/v1/auth/logout` | Revoke session refresh token | Bearer Token |
| **Users** | `GET` | `/api/v1/users/me` | Fetch authenticated user profile | Bearer Token |
| **Users** | `PATCH` | `/api/v1/users/me` | Update user profile | Bearer Token |
| **Orgs** | `GET` | `/api/v1/orgs` | List organizations user belongs to | Bearer Token |
| **Orgs** | `POST` | `/api/v1/orgs` | Create new tenant organization | Bearer Token |
| **Projects**| `GET` | `/api/v1/projects` | List projects for organization | Bearer Token |
| **Projects**| `POST` | `/api/v1/projects` | Create new software project | Bearer: Admin/Dev |
| **Projects**| `GET` | `/api/v1/projects/{id}` | Get project details | Bearer Token |
| **Projects**| `DELETE`| `/api/v1/projects/{id}` | Archive software project | Bearer: Admin |
| **Blueprints**|`POST`| `/api/v1/projects/{id}/generate` | Trigger multi-agent blueprint generation | Bearer: Admin/Dev |
| **Blueprints**|`GET` | `/api/v1/blueprints/{id}` | Get generated blueprint & artifacts | Bearer Token |
| **Blueprints**|`GET` | `/api/v1/blueprints/{id}/export` | Download blueprint package (ZIP) | Bearer Token |
| **AI Chat** | `POST` | `/api/v1/projects/{id}/chat` | Post message to AI assistant | Bearer Token |
| **Agents** | `GET` | `/api/v1/agents` | List active 14 AI agents | Bearer Token |
| **Agents** | `GET` | `/api/v1/agent-runs/{id}` | Get agent execution run logs | Bearer Token |
| **Files** | `POST` | `/api/v1/files/upload-url` | Generate presigned upload URL | Bearer Token |
| **Search** | `GET` | `/api/v1/search` | Global semantic search across workspace | Bearer Token |
| **Analytics**|`GET` | `/api/v1/analytics/usage` | Fetch token usage & cost summary | Bearer: Admin |
| **Billing** | `GET` | `/api/v1/billing/subscription`| Get active Stripe subscription | Bearer: Admin |

---

## 9 WebSocket APIs

### 9.1 Connection Protocol & Auth
Establish connection via:
```
WSS /api/v1/ws/projects/{project_id}?token=eyJhbGciOiJIUzI1...
```

### 9.2 Event Payload Schema
```json
{
  "event": "AGENT_PROGRESS_UPDATE",
  "project_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "data": {
    "agent_name": "DatabaseAgent",
    "status": "RUNNING",
    "step": "Generating PostgreSQL schema definitions and GIN indexes...",
    "progress_percentage": 65,
    "timestamp": "2026-07-28T18:27:44Z"
  }
}
```

---

## 10 AI APIs

### 10.1 Streaming AI Chat Response (SSE)
```http
POST /api/v1/projects/{id}/chat/stream HTTP/1.1
Accept: text/event-stream
```

Stream Output:
```
event: token
data: {"content": "Here is the proposed "}

event: token
data: {"content": "PostgreSQL schema definition..."}

event: done
data: {"status": "completed", "total_tokens": 420}
```

---

## 11 File APIs

```http
POST /api/v1/files/upload-url HTTP/1.1
Content-Type: application/json

{
  "file_name": "architecture-diagram.png",
  "mime_type": "image/png",
  "size_bytes": 1048576
}
```

Response:
```json
{
  "success": true,
  "data": {
    "file_id": "8f2a1b90-4c7b-4d9f-9e12-3a4b5c6d7e8f",
    "upload_url": "https://supabase.forgeai.dev/storage/v1/object/upload/sign/...",
    "storage_path": "project-123/architecture-diagram.png",
    "expires_in": 3600
  }
}
```

---

## 12 Search APIs

```http
GET /api/v1/search?query=PostgreSQL+indexing+strategy&scope=blueprints HTTP/1.1
```

Response includes similarity search results powered by Qdrant vector retrieval.

---

## 13 Analytics APIs

```http
GET /api/v1/analytics/usage?start_date=2026-07-01&end_date=2026-07-31 HTTP/1.1
```

Returns aggregate token consumption, model split (OpenAI vs Claude vs Ollama), and calculated USD cost.

---

## 14 Billing APIs

Integrates Stripe Webhook listeners and subscription quota retrieval (`/api/v1/billing/subscription`).

---

## 15 Security & RBAC Matrix

| Role | Read Projects | Create Projects | Trigger Blueprint | Access Billing | Manage Org |
|---|---|---|---|---|---|
| **SuperAdmin**| Yes | Yes | Yes | Yes | Yes |
| **Org Admin** | Yes | Yes | Yes | Yes | Yes |
| **Developer** | Yes | Yes | Yes | No | No |
| **Viewer** | Yes | No | No | No | No |

---

## 16 API Versioning

* **URI Versioning**: `/api/v1/`
* **Deprecation Notice**: Headers `Deprecation: @1785293000` and `Sunset: Wed, 11 Nov 2026 00:00:00 GMT` will accompany deprecated endpoints 6 months prior to removal.

---

## 17 OpenAPI Integration & Client Generation

* Interactive OpenAPI UI available at `/docs` (Swagger UI) and `/redoc` (ReDoc).
* Automated client SDK generation for TypeScript and Python using `@openapitools/openapi-generator-cli`.

---

## 18 Testing Strategy

* **Unit Tests**: FastAPI endpoint route testing via `httpx.AsyncClient`.
* **Contract Tests**: Schema enforcement verified against OpenAPI spec using Prism mock servers.

---

## 19 Future APIs

1. **Public REST API & Personal Access Tokens (PATs)** for CLI integrations.
2. **Custom Webhook Subscriptions** (`POST /api/v1/webhooks`) for real-time agent completion signals.

---

## 20 Deliverables Summary

1. `API_SPEC.md` OpenAPI Specification Document (this file)
2. Interactive Swagger UI `/docs` Endpoint Configuration
3. Endpoint & Authorization Taxonomy Tables

---

*(End of API Specification Document)*
