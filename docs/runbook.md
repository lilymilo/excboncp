# ExcbonCP Operational Runbook

> Step-by-step operational procedures for server lifecycle management, team onboarding, credential administration, backups, and emergency troubleshooting.

---

## 1. Server Lifecycle Management

### 1.1 Initial Setup
```bash
# 1. Clone repository
git clone https://github.com/lilymilo/excboncp.git
cd excboncp

# 2. Run automated setup script
chmod +x scripts/*.sh scripts/*.py
./scripts/setup.sh

# 3. Create initial Owner account (Revand)
./.venv/bin/python3 scripts/create-admin.py --username revand --display-name "Revand Aqila"
```

### 1.2 Starting the Central Server
```bash
# Mode A: Production / Staging using Docker Compose
./scripts/start-server.sh --mode docker

# Mode B: Local Development with Uvicorn Hot-Reload
./scripts/start-server.sh --mode local
```

### 1.3 Stopping the Server
```bash
# Docker mode
docker compose down

# Local mode
pkill -f "uvicorn server.main:app"
```

---

## 2. Team Member Onboarding & Credentials

### 2.1 Registering a New Member
1. New member registers via API or Web UI:
   ```bash
   curl -X POST http://localhost:8000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username": "bagus", "password": "BagusPassword123!", "display_name": "Bagus"}'
   ```
2. Owner activates the user and sets role if needed:
   ```bash
   curl -X PUT http://localhost:8000/api/auth/users/<user_id>/role \
     -H "Authorization: Bearer <owner_token>" \
     -H "Content-Type: application/json" \
     -d '{"role": "member"}'
   ```

### 2.2 Adding Personal AI Provider Credentials
Each member configures their own AI API key:
```bash
curl -X POST http://localhost:8000/api/credentials \
  -H "Authorization: Bearer <member_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "anthropic",
    "api_key": "sk-ant-api03-personal-key-here",
    "display_label": "Bagus Anthropic Key"
  }'
```

---

## 3. Maintenance & Recovery Procedures

### 3.1 Executing Health Checks
```bash
./scripts/health-check.sh
```
Verifies HTTP API health, database file presence, PRAGMA integrity, and disk space.

### 3.2 Creating a Snapshot Backup
```bash
./scripts/backup.sh
```
Creates a timestamped, gzip-compressed snapshot of `./data/excboncp.db` and active workspace state in `./backups/`. Keeps the last 30 snapshots automatically.

### 3.3 Restoring from a Backup
```bash
# List available snapshots
./scripts/restore.sh

# Restore specific snapshot
./scripts/restore.sh excboncp_backup_YYYYMMDD_HHMMSS.tar.gz
```

---

## 4. Troubleshooting Guide

| Symptom | Root Cause | Remediation Step |
|---|---|---|
| `Server did not respond to health check` | Server process crashed on startup due to missing `.env` secrets. | Check logs: `cat logs/server.log` or `docker compose logs server`. Run `python3 scripts/generate-secrets.py` and ensure `.env` is populated. |
| `sqlite3.OperationalError: database is locked` | Concurrent write lock contention. | Ensure WAL mode is active: `sqlite3 ./data/excboncp.db "PRAGMA journal_mode;"`. |
| `HTTP 401: Token has expired` | JWT token exceeded configured lifespan. | Re-authenticate via `/api/auth/login` to obtain a fresh access token. |
| `HTTP 400: User has no active credential for provider` | Member attempted to run an agent requiring Anthropic or OpenAI without configuring their key. | Configure personal API key via `POST /api/credentials`. |
| `Port 8000 already in use` | Existing server process running in background. | Find and kill occupying process: `lsof -i :8000` followed by `kill -9 <PID>`. |
