#!/usr/bin/env bash
# ============================================================================
# ExcbonCP — Restore Script
# Restores a backup created by backup.sh.
#
# Usage:
#   ./scripts/restore.sh                              # Lists available backups
#   ./scripts/restore.sh excboncp_backup_YYYYMMDD_HHMMSS.tar.gz
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

BACKUP_DIR="$PROJECT_ROOT/backups"
DB_PATH="${DATABASE_PATH:-./data/excboncp.db}"
SERVER_PORT="${SERVER_PORT:-8000}"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       ExcbonCP — Restore Backup                  ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ── List available backups if no argument ──────────────────────────────────
if [ $# -eq 0 ]; then
    info "Available backups:"
    echo ""
    if [ -d "$BACKUP_DIR" ]; then
        BACKUPS=$(find "$BACKUP_DIR" -name "excboncp_backup_*.tar.gz" -type f | sort -r)
        if [ -z "$BACKUPS" ]; then
            warn "No backups found in ${BACKUP_DIR}/"
            exit 0
        fi
        INDEX=1
        while IFS= read -r backup; do
            SIZE=$(du -sh "$backup" | cut -f1)
            NAME=$(basename "$backup")
            echo "  [$INDEX] $NAME ($SIZE)"
            INDEX=$((INDEX + 1))
        done <<< "$BACKUPS"
        echo ""
        echo "Usage: $0 <backup_filename>"
    else
        warn "Backup directory not found: ${BACKUP_DIR}/"
    fi
    exit 0
fi

# ── Validate backup file ──────────────────────────────────────────────────
BACKUP_FILE="$1"
BACKUP_FILEPATH="${BACKUP_DIR}/${BACKUP_FILE}"

if [ ! -f "$BACKUP_FILEPATH" ]; then
    error "Backup file not found: ${BACKUP_FILEPATH}"
fi

info "Selected backup: ${BACKUP_FILE}"

# ── Confirm restore ───────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}⚠️  WARNING: This will replace the current database and data files.${NC}"
echo -e "${YELLOW}   Current data will be OVERWRITTEN.${NC}"
echo ""
read -rp "Are you sure you want to restore? (type 'yes' to confirm): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    info "Restore cancelled."
    exit 0
fi

# ── Stop server if running ─────────────────────────────────────────────────
info "Checking if server is running..."

SERVER_STOPPED=false

# Check Docker
if docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "server"; then
    info "Stopping Docker server..."
    docker compose down
    SERVER_STOPPED=true
    success "Docker server stopped"
fi

# Check local process
if curl -sf "http://localhost:${SERVER_PORT}/api/health" >/dev/null 2>&1; then
    warn "Server appears to be running on port ${SERVER_PORT}"
    warn "Please stop the server manually before restoring, or press Enter to continue anyway"
    read -r
fi

# ── Extract and restore ───────────────────────────────────────────────────
info "Extracting backup..."

TEMP_DIR=$(mktemp -d)
tar -xzf "$BACKUP_FILEPATH" -C "$TEMP_DIR"

# Find the extracted directory
EXTRACTED_DIR=$(find "$TEMP_DIR" -maxdepth 1 -type d -name "excboncp_backup_*" | head -1)
if [ -z "$EXTRACTED_DIR" ]; then
    EXTRACTED_DIR="$TEMP_DIR"
fi

# Restore database
if [ -f "${EXTRACTED_DIR}/excboncp.db" ]; then
    mkdir -p "$(dirname "$DB_PATH")"
    cp "${EXTRACTED_DIR}/excboncp.db" "$DB_PATH"
    success "Database restored: ${DB_PATH}"
else
    warn "No database file found in backup"
fi

# Restore data directory
if [ -d "${EXTRACTED_DIR}/data" ]; then
    mkdir -p data
    cp -r "${EXTRACTED_DIR}/data/"* data/ 2>/dev/null || true
    success "Data directory restored"
else
    info "No additional data files in backup"
fi

# Cleanup temp
rm -rf "$TEMP_DIR"

# ── Restart server ─────────────────────────────────────────────────────────
if [ "$SERVER_STOPPED" = true ]; then
    info "Restarting Docker server..."
    docker compose up -d
    success "Docker server restarted"

    # Health check
    info "Waiting for server health check..."
    for i in $(seq 1 10); do
        if curl -sf "http://localhost:${SERVER_PORT}/api/health" >/dev/null 2>&1; then
            success "Server is healthy after restore"
            break
        fi
        sleep 2
    done
fi

# ── Summary ────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Restore Complete! ✅                     ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo "  Restored from: ${BACKUP_FILE}"
echo ""
