# ExcbonCP Deployment Guide

> Configuration and operational instructions for local development, central team server, staging, and competition finalist deployment.

---

## 1. Environment Topology

ExcbonCP defines four distinct deployment environments to ensure development stability and prevent accidental production state corruption:

```
[ Local Dev ] ──▶ [ Central Team Server ] ──▶ [ Staging ] ──▶ [ Finalist Demo ]
  (Developer       (Shared Team Runtime       (Pre-demo        (Competition
   Laptop)          & Credential Vault)        Validation)      Environment)
```

| Dimension | Local Development | Central Team Server | Staging | Finalist Deployment |
|---|---|---|---|---|
| **Host** | Individual laptop | Shared Linux VPS / Bare Metal | Isolated cloud instance | Demo venue server |
| **Server Mode** | Local (Uvicorn `--reload`) | Docker Compose stack | Docker Compose stack | Hardened Docker Compose |
| **Database** | In-memory or local test DB | `./data/excboncp.db` (WAL) | Persistent Docker volume | Seeded demo dataset |
| **Network** | `localhost:8000` | Private VPN / Tailscale | Protected HTTPS endpoint | HTTPS with domain |
| **Secrets** | Ephemeral dev keys | Encrypted `.env` vault | Secure vault injection | Production-grade secrets |
| **Blockchain** | Mock / Local testnet | Base Sepolia Testnet | Base Sepolia Testnet | Base Sepolia Testnet |

---

## 2. Central Team Server Deployment

The central server serves as the unified engineering runtime for Revand, Bagus, Davin, and Malik.

### 2.1 Server Host Provisioning
Recommended minimum server specifications:
- **OS:** Ubuntu 22.04 LTS / Debian 12 / Fedora Linux
- **CPU:** 4 vCPU
- **RAM:** 8 GB
- **Storage:** 50 GB SSD

### 2.2 Automated Deployment Steps
```bash
# 1. Clone repository to server host
git clone https://github.com/lilymilo/excboncp.git
cd excboncp

# 2. Configure environment
cp .env.example .env
python3 scripts/generate-secrets.py
# Paste generated JWT_SECRET and CREDENTIAL_ENCRYPTION_KEY into .env

# Set server host and production CORS
sed -i 's|SERVER_HOST=0.0.0.0|SERVER_HOST=0.0.0.0|g' .env
sed -i 's|LOG_LEVEL=info|LOG_LEVEL=info|g' .env

# 3. Build and launch container stack
docker compose up -d --build

# 4. Verify deployment health
./scripts/health-check.sh
```

---

## 3. Pre-Demo Security Hardening Checklist

Before exposing the central server or DApp to judges and external evaluators:
- [x] **No Secrets in Version Control:** Verified clean Git history; `.gitignore` covers all credentials and database files.
- [x] **Per-User Credential Encryption:** Fernet encryption verified at rest.
- [x] **Authentication Mandatory:** All non-health API endpoints strictly guarded by JWT middleware.
- [x] **CORS Origins Restricted:** Set specific domains in `.env` (e.g. `https://demo.excboncp.org`) rather than wildcard `*`.
- [x] **Rate Limiting Active:** Auth endpoints throttled to 10 requests/minute.
- [x] **Automated Backups Operational:** Tested `scripts/backup.sh` and verified snapshot integrity.
- [x] **Database WAL Mode:** Non-blocking concurrent read mode active.
- [x] **Human Approval Enforced:** EAS attestation and simulated trading require human role verification.

---

## 4. Resetting System for Live Demonstrations

To reset the database to a clean, verifiable state between judge evaluations:
```bash
# 1. Stop containers
docker compose down

# 2. Reset database and run migrations
rm -f ./data/excboncp.db
./.venv/bin/python3 scripts/create-admin.py --username judge_demo --password "DemoJudge2026!" --display-name "Judge Account"

# 3. Restart server
docker compose up -d
```
