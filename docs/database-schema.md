# ExcbonCP Database Schema Reference

> Formal specification of SQLite database tables, column constraints, relational integrity, and indexing strategies.

---

## 1. Engine & Configuration

- **Storage Engine:** SQLite 3.40+
- **File Location:** `./data/excboncp.db`
- **Concurrency Mode:** Write-Ahead Logging (`PRAGMA journal_mode=WAL;`)
- **Foreign Key Constraints:** Enforced (`PRAGMA foreign_keys=ON;`)
- **Synchronous Mode:** Normal (`PRAGMA synchronous=NORMAL;`)

---

## 2. Table Specifications

### 2.1 `users`
Stores user identities, display profiles, and administrative roles.

| Column | Type | Nullable | Default | Description |
|---|---|:---:|---|---|
| `id` | `TEXT` | No | PK | UUIDv4 string. |
| `username` | `TEXT` | No | UNIQUE | Alphanumeric account identifier (3–32 chars). |
| `password_hash` | `TEXT` | No | - | Salted bcrypt hash string. |
| `display_name` | `TEXT` | No | - | Human-readable user name. |
| `role` | `TEXT` | No | `'member'` | Role name: `owner`, `member`, `auditor`. |
| `is_active` | `INTEGER` | No | `1` | `1` = active, `0` = deactivated. |
| `created_at` | `TEXT` | No | - | ISO-8601 UTC timestamp. |
| `updated_at` | `TEXT` | No | - | ISO-8601 UTC timestamp. |

*Indexes:*
- `idx_users_username` on `username` (UNIQUE).

---

### 2.2 `credentials`
Encrypted per-user AI provider credentials.

| Column | Type | Nullable | Default | Description |
|---|---|:---:|---|---|
| `id` | `TEXT` | No | PK | UUIDv4 string. |
| `user_id` | `TEXT` | No | FK | References `users(id)` ON DELETE CASCADE. |
| `provider` | `TEXT` | No | - | `openai`, `anthropic`, `gemini`, `groq`, `mistral`, `opencode`, `custom`. |
| `encrypted_key` | `TEXT` | No | - | Fernet AES-128-CBC cipher text. |
| `display_label` | `TEXT` | No | - | Masked string representation. |
| `is_active` | `INTEGER` | No | `1` | `1` = active, `0` = revoked. |
| `created_at` | `TEXT` | No | - | ISO-8601 UTC timestamp. |
| `updated_at` | `TEXT` | No | - | ISO-8601 UTC timestamp. |

*Indexes:*
- `idx_credentials_user_id` on `user_id`.

---

### 2.3 `tasks`
Task orchestration and agent execution lifecycle records.

| Column | Type | Nullable | Default | Description |
|---|---|:---:|---|---|
| `id` | `TEXT` | No | PK | UUIDv4 string. |
| `title` | `TEXT` | No | - | Concise task title. |
| `description` | `TEXT` | Yes | `NULL` | Detailed task instructions. |
| `assigned_to` | `TEXT` | Yes | FK | References `users(id)` ON DELETE SET NULL. |
| `created_by` | `TEXT` | No | FK | References `users(id)`. |
| `agent_type` | `TEXT` | Yes | - | Name of authorized agent assigned. |
| `status` | `TEXT` | No | `'pending'` | `pending`, `running`, `completed`, `failed`, `cancelled`. |
| `workspace_path` | `TEXT` | Yes | `NULL` | Filesystem path: `data/workspaces/<id>`. |
| `result` | `TEXT` | Yes | `NULL` | JSON or textual execution output. |
| `created_at` | `TEXT` | No | - | ISO-8601 UTC timestamp. |
| `started_at` | `TEXT` | Yes | `NULL` | Timestamp execution began. |
| `completed_at` | `TEXT` | Yes | `NULL` | Timestamp execution concluded. |

*Indexes:*
- `idx_tasks_status` on `status`.
- `idx_tasks_assigned` on `assigned_to`.

---

### 2.4 `audit_logs`
Immutable audit log records for administrative and compliance review.

| Column | Type | Nullable | Default | Description |
|---|---|:---:|---|---|
| `id` | `TEXT` | No | PK | UUIDv4 string. |
| `user_id` | `TEXT` | Yes | FK | References `users(id)` or `NULL` for system events. |
| `action` | `TEXT` | No | - | Action name: `user.login`, `agent.execute`, `task.cancel`, etc. |
| `resource_type` | `TEXT` | Yes | `NULL` | E.g. `auth`, `task`, `credential`, `parcel`. |
| `resource_id` | `TEXT` | Yes | `NULL` | Primary key of affected resource. |
| `details` | `TEXT` | Yes | `NULL` | Sanitized metadata or change summary. |
| `ip_address` | `TEXT` | Yes | `NULL` | Originating client IP. |
| `created_at` | `TEXT` | No | - | ISO-8601 UTC timestamp. |

*Indexes:*
- `idx_audit_user` on `user_id`.
- `idx_audit_action` on `action`.
- `idx_audit_created` on `created_at DESC`.

---

### 2.5 `sessions`
Tracks active user authentication sessions and token revocation.

| Column | Type | Nullable | Default | Description |
|---|---|:---:|---|---|
| `id` | `TEXT` | No | PK | UUIDv4 string. |
| `user_id` | `TEXT` | No | FK | References `users(id)` ON DELETE CASCADE. |
| `token_hash` | `TEXT` | No | - | SHA-256 hash of JWT signature. |
| `expires_at` | `TEXT` | No | - | ISO-8601 UTC timestamp. |
| `created_at` | `TEXT` | No | - | ISO-8601 UTC timestamp. |
| `revoked` | `INTEGER` | No | `0` | `1` = revoked, `0` = active. |

*Indexes:*
- `idx_sessions_user` on `user_id`.
- `idx_sessions_token` on `token_hash`.

---

## 3. MRV Domain Tables

```sql
-- Land parcel boundaries and baseline
CREATE TABLE IF NOT EXISTS parcels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    polygon_geojson TEXT NOT NULL,
    area_hectares REAL NOT NULL,
    vegetation_type TEXT NOT NULL,
    baseline_ndvi REAL NOT NULL,
    current_status TEXT NOT NULL DEFAULT 'BLOCKED',
    owner_wallet TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- IoT sensor telemetry
CREATE TABLE IF NOT EXISTS sensor_readings (
    id TEXT PRIMARY KEY,
    parcel_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    temperature_celsius REAL NOT NULL,
    humidity_percent REAL NOT NULL,
    soil_moisture_percent REAL NOT NULL,
    gps_latitude REAL NOT NULL,
    gps_longitude REAL NOT NULL,
    recorded_at TEXT NOT NULL,
    FOREIGN KEY (parcel_id) REFERENCES parcels(id)
);

-- Tamper-evident hash chain ledger
CREATE TABLE IF NOT EXISTS ledger_blocks (
    block_index INTEGER PRIMARY KEY AUTOINCREMENT,
    parcel_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    co2e_metric_tons REAL NOT NULL,
    parcel_status TEXT NOT NULL,
    prev_hash TEXT NOT NULL,
    current_hash TEXT NOT NULL,
    canonical_data TEXT NOT NULL,
    FOREIGN KEY (parcel_id) REFERENCES parcels(id)
);

-- Base Sepolia EAS Attestation records
CREATE TABLE IF NOT EXISTS attestations (
    id TEXT PRIMARY KEY,
    parcel_id TEXT NOT NULL,
    block_hash TEXT NOT NULL,
    eas_uid TEXT NOT NULL UNIQUE,
    tx_hash TEXT NOT NULL,
    schema_uid TEXT NOT NULL,
    auditor_id TEXT NOT NULL,
    attested_at TEXT NOT NULL,
    FOREIGN KEY (parcel_id) REFERENCES parcels(id),
    FOREIGN KEY (auditor_id) REFERENCES users(id)
);
```
