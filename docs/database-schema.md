# ExcbonCP Database Schema Reference

> Formal specification of SQLite tables, column constraints, relational integrity, and indexing strategies.
>
> **Schema authority:** Blueprint v5 Model 6 (ERD) and Model 3 (data flow). Sensor
> columns use the Model 3 names `temp_c`, `humidity_pct`, `flame`, `soil_raw`,
> `soil_pct`, and `source`. See ADR-009 for the resolution of the earlier schema
> documentation conflict.

---

## 1. Engine & Configuration

- **Storage engine:** SQLite 3.40+
- **Default file:** `./data/excboncp.db` (overridable with `DATABASE_PATH` or `DATABASE_URL`)
- **Concurrency mode:** Write-Ahead Logging (`PRAGMA journal_mode=WAL;`)
- **Foreign keys:** Enforced (`PRAGMA foreign_keys=ON;`)
- **Synchronous mode:** Normal (`PRAGMA synchronous=NORMAL;`)
- **Timestamps:** ISO-8601 UTC strings in `TEXT` columns.
- **Identifiers:** Application records use `TEXT` primary keys. Ledger sequence uses
  `INTEGER PRIMARY KEY AUTOINCREMENT` so block order is monotonic.
- **Schema creation:** Idempotent `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS`
  in `server/database.py`.
- **Simulation data:** `server/seed.json` is explicitly marked `"simulation": true`.
  Seeded accounts, parcels, zones, consent, readings, and status snapshots are fictional.

---

## 2. Central Server Tables

### 2.1 `users`

Stores identities for both the engineering server and MRV demo roles.

| Column | Type | Nullable | Default | Description |
|---|---|:---:|---|---|
| `id` | `TEXT` | No | PK | UUID or seed identifier. |
| `username` | `TEXT` | No | — | Unique login identifier. |
| `password_hash` | `TEXT` | No | — | Bcrypt hash; never a plaintext password. |
| `display_name` | `TEXT` | No | — | Human-readable name. |
| `email` | `TEXT` | Yes | `NULL` | Optional email; unique when present (R23). |
| `role` | `TEXT` | No | `'member'` | Role label. Central-server auth uses `owner`, `admin`, `member`, `auditor`; MRV seed also uses `community`, `manager`, `receiver`. |
| `parcel_id` | `TEXT` | Yes | `NULL` | Optional parcel scope (R23). |
| `zone_id` | `TEXT` | Yes | `NULL` | Optional zone scope (R23). |
| `is_active` | `INTEGER` | No | `1` | `1` = active, `0` = deactivated. |
| `created_at` | `TEXT` | No | — | ISO-8601 UTC timestamp. |
| `updated_at` | `TEXT` | No | — | ISO-8601 UTC timestamp. |

*Foreign keys:*
- `parcel_id` → `parcels(id)` `ON DELETE SET NULL`
- `zone_id` → `zones(id)` `ON DELETE SET NULL`

*Indexes:*
- `idx_users_username` on `username` (UNIQUE).
- `idx_users_email` on `email` (UNIQUE partial index where `email IS NOT NULL`).
- `idx_users_parcel` on `parcel_id`.
- `idx_users_zone` on `zone_id`.

> **Auth integration note:** the existing auth role-update request model accepts
> `owner`, `admin`, `member`, and `auditor`. The seed stores MRV scopes
> `community`, `manager`, and `receiver` directly. Extending role management for
> those MRV scopes belongs to the auth owner (Bagus), not the database layer.

---

### 2.2 `credentials`

Encrypted per-user AI provider credentials.

| Column | Type | Nullable | Default | Description |
|---|---|:---:|---|---|
| `id` | `TEXT` | No | PK | UUID. |
| `user_id` | `TEXT` | No | FK | References `users(id)` `ON DELETE CASCADE`. |
| `provider` | `TEXT` | No | — | Provider name. |
| `encrypted_key` | `TEXT` | No | — | Fernet ciphertext. |
| `display_label` | `TEXT` | No | — | Masked label. |
| `is_active` | `INTEGER` | No | `1` | `1` = active, `0` = revoked. |
| `created_at` | `TEXT` | No | — | ISO-8601 UTC timestamp. |
| `updated_at` | `TEXT` | No | — | ISO-8601 UTC timestamp. |

*Indexes:* `idx_credentials_user_id` on `user_id`.

---

### 2.3 `tasks`

Task orchestration and agent execution lifecycle records.

| Column | Type | Nullable | Default | Description |
|---|---|:---:|---|---|
| `id` | `TEXT` | No | PK | UUID. |
| `title` | `TEXT` | No | — | Concise task title. |
| `description` | `TEXT` | Yes | `NULL` | Detailed instructions. |
| `assigned_to` | `TEXT` | Yes | FK | References `users(id)` `ON DELETE SET NULL`. |
| `created_by` | `TEXT` | No | FK | References `users(id)` `ON DELETE RESTRICT`. |
| `agent_type` | `TEXT` | Yes | `NULL` | Assigned agent type. |
| `status` | `TEXT` | No | `'pending'` | `pending`, `running`, `completed`, `failed`, `cancelled`. |
| `workspace_path` | `TEXT` | Yes | `NULL` | Workspace directory. |
| `result` | `TEXT` | Yes | `NULL` | Execution output. |
| `created_at` | `TEXT` | No | — | ISO-8601 UTC timestamp. |
| `started_at` | `TEXT` | Yes | `NULL` | Execution start. |
| `completed_at` | `TEXT` | Yes | `NULL` | Execution end. |

*Indexes:* `idx_tasks_status` on `status`; `idx_tasks_assigned` on `assigned_to`.

---

### 2.4 `audit_logs`

Append-oriented audit records for administrative and compliance review.

| Column | Type | Nullable | Default | Description |
|---|---|:---:|---|---|
| `id` | `TEXT` | No | PK | UUID. |
| `user_id` | `TEXT` | Yes | `NULL` | Actor identifier, or `NULL` for system events. |
| `action` | `TEXT` | No | — | Action name, e.g. `user.login`. |
| `resource_type` | `TEXT` | Yes | `NULL` | Resource category. |
| `resource_id` | `TEXT` | Yes | `NULL` | Affected resource identifier. |
| `details` | `TEXT` | Yes | `NULL` | Sanitized metadata. |
| `ip_address` | `TEXT` | Yes | `NULL` | Originating client IP. |
| `created_at` | `TEXT` | No | — | ISO-8601 UTC timestamp. |

*Indexes:* `idx_audit_user`, `idx_audit_action`, `idx_audit_created` (`created_at DESC`).

---

### 2.5 `sessions`

Tracks active authentication sessions and token revocation.

| Column | Type | Nullable | Default | Description |
|---|---|:---:|---|---|
| `id` | `TEXT` | No | PK | UUID. |
| `user_id` | `TEXT` | No | FK | References `users(id)` `ON DELETE CASCADE`. |
| `token_hash` | `TEXT` | No | — | SHA-256 hash of the JWT. |
| `expires_at` | `TEXT` | No | — | ISO-8601 UTC timestamp. |
| `created_at` | `TEXT` | No | — | ISO-8601 UTC timestamp. |
| `revoked` | `INTEGER` | No | `0` | `1` = revoked, `0` = active. |

*Indexes:* `idx_sessions_user` on `user_id`; `idx_sessions_token` on `token_hash`.

---

## 3. MRV Reference Tables

### 3.1 `zones`

Administrative or recipient zones used by the simulated market and reports (R19).

| Column | Type | Nullable | Default | Description |
|---|---|:---:|---|---|
| `id` | `TEXT` | No | PK | Zone identifier, e.g. `ZONE-DEMO-A`. |
| `name` | `TEXT` | No | — | Zone display name. |
| `type` | `TEXT` | No | — | `kek` or `kota`. |
| `jurisdiction` | `TEXT` | Yes | `NULL` | Jurisdiction label. |
| `created_at` | `TEXT` | No | — | ISO-8601 UTC timestamp. |

*Constraint:* `CHECK (type IN ('kek', 'kota'))`.

---

### 3.2 `parcels`

Land parcel boundaries, baseline, and current deterministic status.

| Column | Type | Nullable | Default | Description |
|---|---|:---:|---|---|
| `id` | `TEXT` | No | PK | Parcel identifier, e.g. `PARCEL-A`. |
| `name` | `TEXT` | No | — | Display name. |
| `polygon_geojson` | `TEXT` | No | — | GeoJSON polygon as text. |
| `area_hectares` | `REAL` | No | — | Area in hectares; must be positive. |
| `vegetation_type` | `TEXT` | No | — | Vegetation classification. |
| `baseline_ndvi` | `REAL` | No | — | Baseline NDVI in `[-1, 1]`. |
| `current_status` | `TEXT` | No | `'BLOCKED'` | `VERIFIED`, `WARNING`, `DISPUTE`, or `BLOCKED`. |
| `owner_wallet` | `TEXT` | No | — | Simulated owner wallet identifier. |
| `created_at` | `TEXT` | No | — | ISO-8601 UTC timestamp. |

*Constraints:*
- `CHECK (area_hectares > 0)`
- `CHECK (baseline_ndvi >= -1 AND baseline_ndvi <= 1)`
- `CHECK (current_status IN ('VERIFIED', 'WARNING', 'DISPUTE', 'BLOCKED'))`

*Indexes:* `idx_parcels_status` on `current_status`.

---

## 4. MRV Event & Decision Tables

### 4.1 `sensor_readings`

IoT telemetry using the Blueprint v5 Model 3 field names.

| Column | Type | Nullable | Default | Description |
|---|---|:---:|---|---|
| `id` | `TEXT` | No | PK | Reading identifier. |
| `parcel_id` | `TEXT` | No | FK | References `parcels(id)` `ON DELETE CASCADE`. |
| `device_id` | `TEXT` | No | — | ESP32 or simulator device identifier. |
| `ts` | `TEXT` | No | — | Sensor timestamp, ISO-8601 UTC. |
| `temp_c` | `REAL` | No | — | Air temperature in °C. |
| `humidity_pct` | `REAL` | No | — | Relative humidity, `0–100`. |
| `flame` | `INTEGER` | No | — | `0` or `1`. |
| `soil_raw` | `INTEGER` | No | — | Raw capacitive soil ADC value. |
| `soil_pct` | `REAL` | No | — | Calibrated soil moisture, `0–100`. |
| `source` | `TEXT` | No | — | `esp` or `simulator`. |
| `sig` | `TEXT` | Yes | `NULL` | Optional message signature. |
| `received_at` | `TEXT` | No | — | Server receipt timestamp. |

*Constraints:*
- `CHECK (humidity_pct >= 0 AND humidity_pct <= 100)`
- `CHECK (flame IN (0, 1))`
- `CHECK (soil_pct >= 0 AND soil_pct <= 100)`
- `CHECK (source IN ('esp', 'simulator'))`

*Indexes:* `idx_sensor_parcel_ts` on `(parcel_id, ts DESC)`; `idx_sensor_device` on `device_id`.

---

### 4.2 `satellite_observations`

Satellite NDVI and optional SAR observations for a parcel.

| Column | Type | Nullable | Default | Description |
|---|---|:---:|---|---|
| `id` | `TEXT` | No | PK | Observation identifier. |
| `parcel_id` | `TEXT` | No | FK | References `parcels(id)` `ON DELETE CASCADE`. |
| `observed_at` | `TEXT` | No | — | Observation timestamp. |
| `ndvi_mean` | `REAL` | No | — | Mean NDVI in `[-1, 1]`. |
| `sar_vv_db` | `REAL` | Yes | `NULL` | Optional SAR VV backscatter in dB. |
| `source` | `TEXT` | No | — | Satellite/provider source label. |
| `created_at` | `TEXT` | No | — | Record creation timestamp. |

*Constraint:* `CHECK (ndvi_mean >= -1 AND ndvi_mean <= 1)`.

*Indexes:* `idx_satellite_parcel_date` on `(parcel_id, observed_at DESC)`.

---

### 4.3 `consent_records`

Community consent history. The latest record per parcel determines the active state.

| Column | Type | Nullable | Default | Description |
|---|---|:---:|---|---|
| `id` | `TEXT` | No | PK | Consent record identifier. |
| `parcel_id` | `TEXT` | No | FK | References `parcels(id)` `ON DELETE CASCADE`. |
| `user_id` | `TEXT` | No | FK | References `users(id)` `ON DELETE RESTRICT`. |
| `consent_state` | `TEXT` | No | — | `granted`, `none`, or `revoked`. |
| `signature` | `TEXT` | Yes | `NULL` | Optional signature or simulation marker. |
| `terms_version` | `TEXT` | No | — | Consent terms version. |
| `recorded_at` | `TEXT` | No | — | ISO-8601 UTC timestamp. |

*Constraint:* `CHECK (consent_state IN ('granted', 'none', 'revoked'))`.

*Indexes:* `idx_consent_parcel_time` on `(parcel_id, recorded_at DESC)`; `idx_consent_user` on `user_id`.

---

### 4.4 `status_results`

Deterministic status decision history. This table records the inputs and outputs of
the status rule; CO2e tonnage is persisted in `ledger_blocks` when a block is approved.

| Column | Type | Nullable | Default | Description |
|---|---|:---:|---|---|
| `id` | `TEXT` | No | PK | Result identifier. |
| `parcel_id` | `TEXT` | No | FK | References `parcels(id)` `ON DELETE CASCADE`. |
| `status` | `TEXT` | No | — | `VERIFIED`, `WARNING`, `DISPUTE`, or `BLOCKED`. |
| `reasons` | `TEXT` | No | — | JSON array of human-readable reasons. |
| `rule_version` | `TEXT` | No | — | Deterministic rule version. |
| `sensor_flag` | `INTEGER` | No | `0` | `0` or `1`. |
| `consent_state` | `TEXT` | No | — | `granted`, `none`, or `revoked`. |
| `dispute_open` | `INTEGER` | No | `0` | `0` or `1`. |
| `computed_at` | `TEXT` | No | — | ISO-8601 UTC timestamp. |

*Constraints:*
- `CHECK (status IN ('VERIFIED', 'WARNING', 'DISPUTE', 'BLOCKED'))`
- `CHECK (sensor_flag IN (0, 1))`
- `CHECK (consent_state IN ('granted', 'none', 'revoked'))`
- `CHECK (dispute_open IN (0, 1))`

*Indexes:* `idx_status_parcel_time` on `(parcel_id, computed_at DESC)`.

---

### 4.5 `ledger_blocks`

Append-only local SHA-256 hash chain. `current_hash` must equal
`SHA-256(prev_hash || canonical_data)` according to the ledger implementation.

| Column | Type | Nullable | Default | Description |
|---|---|:---:|---|---|
| `block_index` | `INTEGER` | No | PK AUTOINCREMENT | Monotonic block order. |
| `parcel_id` | `TEXT` | No | FK | References `parcels(id)` `ON DELETE CASCADE`. |
| `timestamp` | `TEXT` | No | — | Block timestamp. |
| `co2e_metric_tons` | `REAL` | No | — | Carbon tonnage for this block. |
| `parcel_status` | `TEXT` | No | — | Status at block creation. |
| `prev_hash` | `TEXT` | No | — | Previous block hash. |
| `current_hash` | `TEXT` | No | — | This block's SHA-256 hash. |
| `canonical_data` | `TEXT` | No | — | Canonical JSON payload. |
| `approved_by` | `TEXT` | Yes | FK | Auditor/user who approved, or `NULL`. |
| `eas_uid` | `TEXT` | Yes | `NULL` | EAS attestation UID once anchored. |

*Constraints:* `parcel_status` is one of the four deterministic statuses.

*Foreign keys:*
- `parcel_id` → `parcels(id)` `ON DELETE CASCADE`
- `approved_by` → `users(id)` `ON DELETE SET NULL`

*Indexes:* `idx_ledger_parcel` on `(parcel_id, block_index)`; `idx_ledger_hash` on `current_hash`.

---

### 4.6 `attestations`

Base Sepolia EAS attestation records.

| Column | Type | Nullable | Default | Description |
|---|---|:---:|---|---|
| `id` | `TEXT` | No | PK | Local attestation record identifier. |
| `parcel_id` | `TEXT` | No | FK | References `parcels(id)` `ON DELETE CASCADE`. |
| `block_hash` | `TEXT` | No | — | Ledger block hash that was attested. |
| `eas_uid` | `TEXT` | No | UNIQUE | EAS attestation UID. |
| `tx_hash` | `TEXT` | No | — | Base Sepolia transaction hash. |
| `schema_uid` | `TEXT` | No | — | EAS schema UID. |
| `auditor_id` | `TEXT` | No | FK | References `users(id)` `ON DELETE RESTRICT`. |
| `attested_at` | `TEXT` | No | — | ISO-8601 UTC timestamp. |

*Indexes:* `idx_attest_parcel` on `parcel_id`.

---

### 4.7 `market_orders`

Simulated carbon-credit orders. No real money or on-chain settlement is represented.

| Column | Type | Nullable | Default | Description |
|---|---|:---:|---|---|
| `id` | `TEXT` | No | PK | Order identifier. |
| `parcel_id` | `TEXT` | No | FK | References `parcels(id)` `ON DELETE CASCADE`. |
| `seller_account` | `TEXT` | No | — | Seller account label. |
| `buyer_account` | `TEXT` | Yes | `NULL` | Buyer account label after matching. |
| `credit_amount` | `REAL` | No | — | Simulated credit amount; must be positive. |
| `simulated_price_idr` | `REAL` | No | — | Simulated price in IDR; non-negative. |
| `zone_id` | `TEXT` | Yes | FK | Optional recipient zone, `ON DELETE SET NULL`. |
| `order_status` | `TEXT` | No | `'LISTED'` | `LISTED`, `MATCHED`, `COMPLETED`, or `CANCELLED`. |
| `created_at` | `TEXT` | No | — | ISO-8601 UTC timestamp. |

*Constraints:*
- `CHECK (credit_amount > 0)`
- `CHECK (simulated_price_idr >= 0)`
- `CHECK (order_status IN ('LISTED', 'MATCHED', 'COMPLETED', 'CANCELLED'))`

*Indexes:* `idx_market_parcel` on `parcel_id`; `idx_market_status` on `order_status`.

---

## 5. Relationship Summary

| Child table | Parent | Delete behavior |
|---|---|---|
| `users.parcel_id` | `parcels.id` | `SET NULL` |
| `users.zone_id` | `zones.id` | `SET NULL` |
| `credentials.user_id` | `users.id` | `CASCADE` |
| `tasks.assigned_to` | `users.id` | `SET NULL` |
| `tasks.created_by` | `users.id` | `RESTRICT` |
| `sessions.user_id` | `users.id` | `CASCADE` |
| `sensor_readings.parcel_id` | `parcels.id` | `CASCADE` |
| `satellite_observations.parcel_id` | `parcels.id` | `CASCADE` |
| `consent_records.parcel_id` | `parcels.id` | `CASCADE` |
| `consent_records.user_id` | `users.id` | `RESTRICT` |
| `status_results.parcel_id` | `parcels.id` | `CASCADE` |
| `ledger_blocks.parcel_id` | `parcels.id` | `CASCADE` |
| `ledger_blocks.approved_by` | `users.id` | `SET NULL` |
| `attestations.parcel_id` | `parcels.id` | `CASCADE` |
| `attestations.auditor_id` | `users.id` | `RESTRICT` |
| `market_orders.parcel_id` | `parcels.id` | `CASCADE` |
| `market_orders.zone_id` | `zones.id` | `SET NULL` |

---

## 6. Migration & Seed Policy

### 6.1 Additive migrations

Databases created by earlier versions already contain `users`. The startup migration
adds `email`, `parcel_id`, and `zone_id` with `ALTER TABLE ... ADD COLUMN` and creates
the related indexes. Existing rows are never dropped or rewritten.

This preserves compatibility with the central-server auth layer while adding the R23
scope links required by the MRV blueprint.

### 6.2 Simulation seed

`python -m server.seed` loads `server/seed.json` into an initialized database:

- 2 zones (`ZONE-DEMO-A`, `ZONE-DEMO-B`)
- 2 parcels: `PARCEL-A` (VERIFIED) and `PARCEL-B` (BLOCKED)
- 5 demo accounts
- 1 granted consent record for `PARCEL-A`
- 6 simulator readings
- 2 status snapshots

The loader is idempotent (`INSERT OR IGNORE`). Passwords are never stored in
`server/seed.json`; set `SEED_DEMO_PASSWORD` or let the CLI generate and print a
one-time password. All seeded records are fictional simulation data.

---

## Metadata

- **Source file:** `docs/database-schema.md`
- **Schema implementation:** `server/database.py`
- **Seed implementation:** `server/seed.py`, `server/seed.json`
- **Tests:** `tests/test_schema.py`, `tests/test_seed.py`
- **Related requirements:** R11 (SQLite), R23 (accounts/scopes), R19 (zones)
- **Responsible owner:** Revand (Database & Ledger)
