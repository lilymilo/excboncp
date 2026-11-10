#!/usr/bin/env bash
# ============================================================================
# ExcbonCP — Health Check Script
# Checks the health of all ExcbonCP components.
#
# Usage:
#   ./scripts/health-check.sh
# ============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS="${GREEN}PASS${NC}"
FAIL="${RED}FAIL${NC}"
WARN_STATUS="${YELLOW}WARN${NC}"

# ── Navigate to project root ───────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

SERVER_PORT="${SERVER_PORT:-8000}"
DB_PATH="${DATABASE_PATH:-./data/excboncp.db}"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       ExcbonCP — Health Check                    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

TOTAL=0
PASSED=0
WARNED=0
FAILED=0

check() {
    local name="$1"
    local status="$2"  # pass, fail, warn
    local detail="${3:-}"

    TOTAL=$((TOTAL + 1))
    case "$status" in
        pass) PASSED=$((PASSED + 1)); echo -e "  [${PASS}] ${name} ${detail}" ;;
        fail) FAILED=$((FAILED + 1)); echo -e "  [${FAIL}] ${name} ${detail}" ;;
        warn) WARNED=$((WARNED + 1)); echo -e "  [${WARN_STATUS}] ${name} ${detail}" ;;
    esac
}

# ── HTTP Health Endpoint ──────────────────────────────────────────────────
echo -e "${BLUE}HTTP Server${NC}"

if HEALTH_RESPONSE=$(curl -sf -w "\n%{http_code}" "http://localhost:${SERVER_PORT}/api/health" 2>/dev/null); then
    HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -1)
    BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)
    if [ "$HTTP_CODE" = "200" ]; then
        check "Health endpoint (port ${SERVER_PORT})" "pass" "— HTTP 200"
    else
        check "Health endpoint (port ${SERVER_PORT})" "fail" "— HTTP ${HTTP_CODE}"
    fi
else
    check "Health endpoint (port ${SERVER_PORT})" "fail" "— not responding"
fi

echo ""

# ── Docker Container Status ──────────────────────────────────────────────
echo -e "${BLUE}Docker${NC}"

if command -v docker &>/dev/null; then
    if docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "server"; then
        CONTAINER_STATUS=$(docker compose ps --format "table {{.Name}}\t{{.Status}}" 2>/dev/null | grep server | awk '{print $2}')
        check "Docker container (server)" "pass" "— ${CONTAINER_STATUS:-running}"
    elif docker compose ps --services 2>/dev/null | grep -q "server"; then
        check "Docker container (server)" "fail" "— not running"
    else
        check "Docker container (server)" "warn" "— not deployed"
    fi
else
    check "Docker" "warn" "— not installed"
fi

echo ""

# ── Database ──────────────────────────────────────────────────────────────
echo -e "${BLUE}Database${NC}"

if [ -f "$DB_PATH" ]; then
    DB_SIZE=$(du -sh "$DB_PATH" | cut -f1)
    check "Database file" "pass" "— ${DB_PATH} (${DB_SIZE})"

    # Check database integrity
    if command -v sqlite3 &>/dev/null; then
        INTEGRITY=$(sqlite3 "$DB_PATH" "PRAGMA integrity_check;" 2>/dev/null || echo "error")
        if [ "$INTEGRITY" = "ok" ]; then
            check "Database integrity" "pass" "— PRAGMA integrity_check OK"
        else
            check "Database integrity" "fail" "— integrity check failed"
        fi
    else
        check "Database integrity" "warn" "— sqlite3 not available for check"
    fi
else
    check "Database file" "warn" "— ${DB_PATH} not found"
fi

echo ""

# ── Disk Space ────────────────────────────────────────────────────────────
echo -e "${BLUE}System${NC}"

DISK_USAGE=$(df -h "$PROJECT_ROOT" | awk 'NR==2 {print $5}' | tr -d '%')
DISK_AVAIL=$(df -h "$PROJECT_ROOT" | awk 'NR==2 {print $4}')

if [ "$DISK_USAGE" -lt 80 ]; then
    check "Disk space" "pass" "— ${DISK_USAGE}% used (${DISK_AVAIL} available)"
elif [ "$DISK_USAGE" -lt 90 ]; then
    check "Disk space" "warn" "— ${DISK_USAGE}% used (${DISK_AVAIL} available)"
else
    check "Disk space" "fail" "— ${DISK_USAGE}% used (${DISK_AVAIL} available)"
fi

# Check .env exists
if [ -f .env ]; then
    check ".env configuration" "pass"
else
    check ".env configuration" "fail" "— .env not found"
fi

# Check data directory
if [ -d data ]; then
    check "Data directory" "pass"
else
    check "Data directory" "warn" "— data/ not found"
fi

echo ""

# ── Summary ────────────────────────────────────────────────────────────────
echo "─────────────────────────────────────────────────────"
echo -e "  Total: ${TOTAL}  |  ${GREEN}Passed: ${PASSED}${NC}  |  ${YELLOW}Warnings: ${WARNED}${NC}  |  ${RED}Failed: ${FAILED}${NC}"
echo "─────────────────────────────────────────────────────"
echo ""

if [ "$FAILED" -gt 0 ]; then
    exit 1
elif [ "$WARNED" -gt 0 ]; then
    exit 0
else
    exit 0
fi
