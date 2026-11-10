# ExcbonCP API Reference

> Complete REST API reference for the Central AI Engineering Server and the ExcbonCP MRV Application Gateway.

---

## 1. Authentication & Session Management

All protected endpoints require an `Authorization: Bearer <token>` header obtained from `/api/auth/login`.

### `POST /api/auth/register`
Register a new team member account.
- **Access:** Public (First registered user becomes `owner`; subsequent users require owner activation).
- **Request Body:**
  ```json
  {
    "username": "bagus_iot",
    "password": "SecurePassword123!",
    "display_name": "Bagus"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": "e4b6c31a-...",
    "username": "bagus_iot",
    "display_name": "Bagus",
    "role": "member",
    "is_active": true,
    "created_at": "2026-11-08T12:00:00Z"
  }
  ```

### `POST /api/auth/login`
Authenticate and obtain a JWT access token.
- **Request Body:**
  ```json
  {
    "username": "bagus_iot",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "<jwt_access_token>",
    "token_type": "bearer",
    "expires_in_hours": 24,
    "user": {
      "id": "e4b6c31a-...",
      "username": "bagus_iot",
      "display_name": "Bagus",
      "role": "member"
    }
  }
  ```

### `POST /api/auth/logout`
Revoke the current session token.
- **Access:** Authenticated user.
- **Response (200 OK):** `{"message": "Logged out successfully."}`

### `GET /api/auth/me`
Retrieve profile of currently authenticated user.
- **Access:** Authenticated user.

### `GET /api/auth/users`
List all registered users.
- **Access:** `owner` role only.

### `PUT /api/auth/users/{user_id}/role`
Update role for a user (`owner`, `member`, `auditor`).
- **Access:** `owner` role only.

### `PUT /api/auth/users/{user_id}/status`
Activate or deactivate a user account.
- **Access:** `owner` role only.

---

## 2. Per-User AI Credential Vault

Securely stores API keys encrypted with Fernet AES-128-CBC. Keys are isolated per-user and never returned raw.

### `GET /api/credentials`
List active credentials configured by the authenticated user.
- **Response (200 OK):**
  ```json
  [
    {
      "id": "cred-82a1...",
      "provider": "anthropic",
      "display_label": "anthropic-****abcd",
      "is_active": true,
      "created_at": "2026-11-08T12:00:00Z",
      "updated_at": "2026-11-08T12:00:00Z"
    }
  ]
  ```

### `POST /api/credentials`
Register or update an AI provider API key.
- **Request Body:**
  ```json
  {
    "provider": "anthropic",
    "api_key": "your-provider-api-key",
    "display_label": "Bagus Anthropic Key"
  }
  ```
- **Response (201 Created):** Returns masked credential record without raw `api_key`.

### `DELETE /api/credentials/{credential_id}`
Delete a credential owned by the current user.

### `GET /api/credentials/providers`
List supported AI providers (`anthropic`, `openai`, `gemini`, `groq`, `mistral`, `opencode`, `custom`).

---

## 3. Agent Execution & Orchestration

### `GET /api/agents`
List all 8 specialized agents with their purpose, allowed directories, and provider requirements.

### `POST /api/agents/execute`
Queue a task for execution by a specialized agent using the caller's configured credentials.
- **Request Body:**
  ```json
  {
    "agent_type": "backend",
    "task_description": "Implement status engine unit tests for edge cases",
    "provider": "anthropic",
    "model": "claude-3-7-sonnet-20250219"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "task_id": "task-49b2...",
    "agent_type": "backend",
    "status": "pending",
    "message": "Task created. Agent 'Backend Agent' execution queued."
  }
  ```

---

## 4. Task Management & Workspaces

### `GET /api/tasks`
List tasks with optional filters (`status`, `assigned_to`, `agent_type`, `limit`, `offset`).

### `GET /api/tasks/{task_id}`
Retrieve task details including status, execution logs, and workspace directory.

### `PUT /api/tasks/{task_id}`
Update task status (`pending`, `running`, `completed`, `failed`, `cancelled`) or result.

### `POST /api/tasks/{task_id}/cancel`
Cancel an active or queued task. Releases associated file locks.

### `DELETE /api/tasks/{task_id}`
Permanently delete a task record and purge its workspace.
- **Access:** `owner` role only.

---

## 5. System Health & Monitoring

### `GET /health` and `GET /api/health`
Unauthenticated health checks returning database connectivity and service version.
`/api/health` is the canonical Docker/load-balancer endpoint; `/health` is an alias
for simple external monitors.
- **Response (200 OK):**
  ```json
  {
    "status": "healthy",
    "service": "excboncp-central-server",
    "version": "0.1.0",
    "timestamp": "2026-11-08T14:00:00Z",
    "database": "connected"
  }
  ```

### `GET /api/monitoring/status`
Detailed runtime diagnostics (Python version, database size, memory, settings).
- **Access:** Authenticated users.

### `GET /api/monitoring/metrics`
Operational metrics: users by role, tasks by status, registered credentials by provider.
- **Access:** Authenticated users.

### `GET /api/monitoring/audit-logs`
Query immutable audit logs with pagination and filters (`action`, `user_id`, `limit`, `offset`).
- **Access:** `owner` and `auditor` roles only.
