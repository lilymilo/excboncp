# ExcbonCP Toolchain & Environment Specifications

> Verified developer toolchain, package managers, linter configurations, and system-level utility requirements.

---

## 1. Verified Toolchain Inventory

| Tool | Category | Verified Version | Purpose | Verification Command |
|---|---|:---:|---|---|
| **Python** | Runtime | 3.12+ (tested on 3.14) | Central server API, deterministic algorithms, CLI scripts. | `python3 --version` |
| **Docker Engine** | Virtualization | 24.0+ (tested on 29.9) | Containerized multi-service deployment. | `docker --version` |
| **Docker Compose** | Orchestration | v2.20+ (tested on v5.7) | Multi-container coordination (`server`, `mosquitto`, `dapp`). | `docker compose version` |
| **Git** | VCS | 2.40+ | Version control, branch tracking, code review. | `git --version` |
| **FastAPI** | Web Framework | 0.115+ | High-performance asynchronous REST API gateway. | `.venv/bin/python3 -c "import fastapi; print(fastapi.__version__)"` |
| **Uvicorn** | ASGI Server | 0.30+ | Production and hot-reload ASGI HTTP server. | `.venv/bin/uvicorn --version` |
| **aiosqlite** | Database Driver | 0.20+ | Asynchronous SQLite connection manager. | `.venv/bin/python3 -c "import aiosqlite; print(aiosqlite.__version__)"` |
| **Cryptography** | Security | 43.0+ | Fernet AES-128-CBC key encryption engine. | `.venv/bin/python3 -c "import cryptography; print(cryptography.__version__)"` |
| **Bcrypt** | Security | 4.0+ | Salted password hashing engine. | `.venv/bin/python3 -c "import bcrypt; print(bcrypt.__version__)"` |
| **Pytest** | Testing | 8.0+ | Automated unit and integration test runner. | `.venv/bin/pytest --version` |
| **Ruff** | Code Quality | 0.6+ | Extremely fast Python linter and formatter. | `.venv/bin/ruff --version` |
| **PlatformIO** | Embedded | Core 6.1+ | ESP32 firmware compilation and flashing (client-only). | `pio --version` |

---

## 2. Package Management & Virtual Environments

The central server uses standard Python virtual environments (`.venv`):

```bash
# Initialize and activate
python3 -m venv .venv
source .venv/bin/activate

# Upgrade pip and install production dependencies
pip install --upgrade pip
pip install -r server/requirements.txt

# Install development and quality tooling
pip install -r requirements-dev.txt
```

---

## 3. Code Style & Quality Configuration

Code formatting and static analysis are enforced via Ruff (`pyproject.toml`):

```bash
# Check for lint errors
ruff check .

# Automatically fix supported lint issues
ruff check --fix .

# Check code formatting
ruff format --check .
```

---

## 4. Rollback and Cleanup

To reset the development environment to a pristine state:
```bash
# Deactivate and remove virtual environment
deactivate 2>/dev/null || true
rm -rf .venv

# Clean temporary Python artifacts and caches
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type d -name ".pytest_cache" -exec rm -rf {} +
find . -type d -name ".ruff_cache" -exec rm -rf {} +
```
