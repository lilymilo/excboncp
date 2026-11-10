# Deployment Module

> 11 nodes · cohesion 0.22

## Key Concepts

- **generate-secrets.py** (8 connections) — `scripts/generate-secrets.py`
- **generate_fernet_key()** (4 connections) — `scripts/generate-secrets.py`
- **generate_jwt_secret()** (4 connections) — `scripts/generate-secrets.py`
- **main()** (4 connections) — `scripts/generate-secrets.py`
- **2. Configure environment** (2 connections) — `docs/deployment.md`
- **4. Troubleshooting Guide** (2 connections) — `docs/runbook.md`
- **3. Copy environment config** (2 connections) — `README.md`
- **Generate a 64-byte URL-safe random string for JWT signing.** (1 connections) — `scripts/generate-secrets.py`
- **ExcbonCP — Secret Generator. Generates cryptographic secrets for the .env…** (1 connections) — `scripts/generate-secrets.py`
- **Generate a Fernet encryption key for credential encryption.** (1 connections) — `scripts/generate-secrets.py`
- **Generate and display secrets for .env configuration.** (1 connections) — `scripts/generate-secrets.py`

## Relationships

- [Server Configuration & Settings](Server_Configuration_&_Settings.md) (3 shared connections)
- [Deployment Module](Deployment_Module.md) (1 shared connections)
- [MRV Simulation Runbook](MRV_Simulation_Runbook.md) (1 shared connections)
- [Deployment & Runbook Guides](Deployment_&_Runbook_Guides.md) (1 shared connections)

## Source Files

- `README.md`
- `docs/deployment.md`
- `docs/runbook.md`
- `scripts/generate-secrets.py`

## Audit Trail

- EXTRACTED: 18 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*