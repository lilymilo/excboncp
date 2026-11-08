#!/usr/bin/env bash
# ============================================================================
# ExcbonCP — Start Server Script
# Starts the central engineering server in Docker or local mode.
#
# Usage:
#   ./scripts/start-server.sh --mode docker    # Start with Docker Compose
#   ./scripts/start-server.sh --mode local     # Start locally with uvicorn
#   ./scripts/start-server.sh                  # Defaults to local mode
# ============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[OK]${NC}   $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERR]${NC}  $*"; exit 1; }

# ── Navigate to project root ───────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# ── Parse arguments ────────────────────────────────────────────────────────
MODE="local"

while [[ $# -gt 0 ]]; do
    case $1 in
        --mode)
            MODE="${2:-}"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [--mode docker|local]"
            echo ""
            echo "Modes:"
            echo "  docker   Start with Docker Compose"
            echo "  local    Start locally with uvicorn (default)"
            exit 0
            ;;
        *)
            error "Unknown option: $1 (use --help for usage)"
            ;;
    esac
done

if [[ "$MODE" != "docker" && "$MODE" != "local" ]]; then
    error "Invalid mode: '$MODE'. Use 'docker' or 'local'."
fi

# ── Pre-flight checks ──────────────────────────────────────────────────────
if [ ! -f .env ]; then
    error ".env file not found. Run './scripts/setup.sh' first."
fi

# Load port from .env (default 8000)
SERVER_PORT=$(grep -E "^SERVER_PORT=" .env 2>/dev/null | cut -d= -f2 || echo "8000")
SERVER_PORT="${SERVER_PORT:-8000}"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       ExcbonCP — Starting Server (${MODE})       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ── Start server ───────────────────────────────────────────────────────────
case "$MODE" in
    docker)
        info "Starting with Docker Compose..."

        if ! command -v docker &>/dev/null; then
            error "Docker is not installed."
        fi

        # Build and start
        if docker compose version &>/dev/null; then
            docker compose up -d --build
        elif command -v docker-compose &>/dev/null; then
            docker-compose up -d --build
        else
            error "Neither 'docker compose' nor 'docker-compose' found."
        fi

        success "Docker containers started"
        ;;

    local)
        info "Starting locally with uvicorn..."

        # Activate venv if available
        if [ -f .venv/bin/activate ]; then
            # shellcheck disable=SC1091
            source .venv/bin/activate
            info "Activated virtual environment"
        fi

        # Ensure data directory exists
        mkdir -p data

        # Start uvicorn
        info "Starting uvicorn on port ${SERVER_PORT}..."
        python3 -m uvicorn server.main:app \
            --host 0.0.0.0 \
            --port "$SERVER_PORT" \
            --reload \
            --reload-dir server &

        SERVER_PID=$!
        success "Server started (PID: ${SERVER_PID})"
        ;;
esac

# ── Health check ───────────────────────────────────────────────────────────
info "Waiting for server to become healthy..."

MAX_RETRIES=15
RETRY_INTERVAL=2
HEALTHY=false

for i in $(seq 1 $MAX_RETRIES); do
    if curl -sf "http://localhost:${SERVER_PORT}/api/health" >/dev/null 2>&1; then
        HEALTHY=true
        break
    fi
    echo -n "."
    sleep $RETRY_INTERVAL
done
echo ""

if [ "$HEALTHY" = true ]; then
    success "Server is healthy!"
else
    warn "Server did not respond to health check within $((MAX_RETRIES * RETRY_INTERVAL))s"
    warn "It may still be starting. Check logs for details."
fi

# ── Print access info ──────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Server is running! 🚀                    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo "  API:     http://localhost:${SERVER_PORT}"
echo "  Docs:    http://localhost:${SERVER_PORT}/docs"
echo "  Health:  http://localhost:${SERVER_PORT}/api/health"
echo ""

if [ "$MODE" = "docker" ]; then
    echo "  Logs:    docker compose logs -f server"
    echo "  Stop:    docker compose down"
elif [ "$MODE" = "local" ]; then
    echo "  Stop:    kill ${SERVER_PID:-<PID>}  (or Ctrl+C)"
fi
echo ""
