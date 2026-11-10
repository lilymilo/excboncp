#!/usr/bin/env bash
# ============================================================================
# ExcbonCP — Initial Setup Script
# Sets up the development environment for the ExcbonCP central engineering server.
# ============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()    { echo -e "${BLUE}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[OK]${NC}   $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERR]${NC}  $*"; exit 1; }

# ── Navigate to project root ───────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         ExcbonCP — Initial Setup                 ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ── Check Prerequisites ────────────────────────────────────────────────────
info "Checking prerequisites..."

check_cmd() {
    if command -v "$1" &>/dev/null; then
        success "$1 found: $(command -v "$1")"
        return 0
    else
        warn "$1 not found"
        return 1
    fi
}

MISSING=0

check_cmd git || MISSING=1
check_cmd python3 || MISSING=1

# Docker is optional (can run locally)
if check_cmd docker; then
    if docker compose version &>/dev/null; then
        success "docker compose available"
    elif command -v docker-compose &>/dev/null; then
        success "docker-compose (legacy) available"
    else
        warn "docker compose plugin not found — Docker mode may not work"
    fi
else
    warn "Docker not found — only local mode will be available"
fi

if [ "$MISSING" -eq 1 ]; then
    error "Required prerequisites missing. Please install them and retry."
fi

echo ""

# ── Set up .env ────────────────────────────────────────────────────────────
info "Setting up environment configuration..."

if [ -f .env ]; then
    warn ".env already exists — skipping copy"
else
    cp .env.example .env
    success "Copied .env.example → .env"

    # Generate JWT_SECRET if empty
    JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(64))")
    if grep -q "^JWT_SECRET=$" .env; then
        sed -i "s|^JWT_SECRET=$|JWT_SECRET=${JWT_SECRET}|" .env
        success "Generated JWT_SECRET"
    fi

    # Generate CREDENTIAL_ENCRYPTION_KEY if empty
    ENCRYPTION_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())" 2>/dev/null || true)
    if [ -n "$ENCRYPTION_KEY" ] && grep -q "^CREDENTIAL_ENCRYPTION_KEY=$" .env; then
        sed -i "s|^CREDENTIAL_ENCRYPTION_KEY=$|CREDENTIAL_ENCRYPTION_KEY=${ENCRYPTION_KEY}|" .env
        success "Generated CREDENTIAL_ENCRYPTION_KEY"
    elif [ -z "$ENCRYPTION_KEY" ]; then
        warn "Could not generate CREDENTIAL_ENCRYPTION_KEY (cryptography package not installed yet)"
        warn "Run 'python3 scripts/generate-secrets.py' after installing dependencies"
    fi
fi

echo ""

# ── Create data directory ──────────────────────────────────────────────────
info "Creating data directory..."
mkdir -p data
success "data/ directory ready"

echo ""

# ── Install Python dependencies ───────────────────────────────────────────
info "Installing Python dependencies..."

if [ -f server/requirements.txt ]; then
    if [ -d .venv ]; then
        info "Virtual environment found at .venv/"
    else
        info "Creating virtual environment..."
        python3 -m venv .venv
        success "Created .venv/"
    fi

    info "Activating virtual environment and installing packages..."
    # shellcheck disable=SC1091
    source .venv/bin/activate
    pip install --quiet --upgrade pip
    pip install --quiet -r server/requirements.txt
    success "Python dependencies installed"
else
    warn "server/requirements.txt not found — skipping dependency installation"
fi

echo ""

# ── Initialize database ───────────────────────────────────────────────────
info "Initializing database..."

if python3 -c "from server.database import init_db; init_db()" 2>/dev/null; then
    success "Database initialized"
else
    warn "Could not initialize database (server module may not be ready yet)"
    warn "The database will be created automatically on first server start"
fi

echo ""

# ── Done ───────────────────────────────────────────────────────────────────
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Setup Complete! 🎉                       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo "Next steps:"
echo ""
echo "  1. Review and edit .env with your settings"
echo ""
echo "  2. Start the server:"
echo "     Docker:  ./scripts/start-server.sh --mode docker"
echo "     Local:   ./scripts/start-server.sh --mode local"
echo ""
echo "  3. Create the initial admin user:"
echo "     python3 scripts/create-admin.py"
echo ""
echo "  4. Open the API docs:"
echo "     http://localhost:8000/docs"
echo ""
