#!/usr/bin/env bash
# ============================================================================
# ExcbonCP — Backup Script
# Creates timestamped backups of the data/ directory and SQLite database.
#
# Usage:
#   ./scripts/backup.sh
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

# ── Configuration ──────────────────────────────────────────────────────────
BACKUP_DIR="$PROJECT_ROOT/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="excboncp_backup_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
MAX_BACKUPS=30

DB_PATH="${DATABASE_PATH:-./data/excboncp.db}"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       ExcbonCP — Backup                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ── Create backup directory ────────────────────────────────────────────────
mkdir -p "$BACKUP_PATH"
info "Backup directory: ${BACKUP_PATH}"

# ── Backup SQLite database ────────────────────────────────────────────────
if [ -f "$DB_PATH" ]; then
    info "Backing up database: ${DB_PATH}"

    # Use SQLite .backup command for a consistent snapshot
    if command -v sqlite3 &>/dev/null; then
        sqlite3 "$DB_PATH" ".backup '${BACKUP_PATH}/excboncp.db'"
        success "Database backed up using sqlite3 .backup"
    else
        # Fallback: simple copy
        cp "$DB_PATH" "${BACKUP_PATH}/excboncp.db"
        success "Database backed up (file copy)"
    fi
else
    warn "Database file not found at ${DB_PATH} — skipping database backup"
fi

# ── Backup data directory ──────────────────────────────────────────────────
if [ -d data ]; then
    info "Backing up data/ directory..."
    # Copy everything in data/ except the main db (already backed up)
    rsync -a --exclude="excboncp.db" data/ "${BACKUP_PATH}/data/" 2>/dev/null || \
        cp -r data/ "${BACKUP_PATH}/data/" 2>/dev/null || true
    success "Data directory backed up"
else
    warn "data/ directory not found — skipping"
fi

# ── Create compressed archive ──────────────────────────────────────────────
info "Compressing backup..."
cd "$BACKUP_DIR"
tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"
success "Backup compressed: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

# ── Prune old backups ─────────────────────────────────────────────────────
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "excboncp_backup_*.tar.gz" -type f | wc -l)
if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    EXCESS=$((BACKUP_COUNT - MAX_BACKUPS))
    info "Pruning ${EXCESS} old backup(s) (keeping last ${MAX_BACKUPS})..."
    find "$BACKUP_DIR" -name "excboncp_backup_*.tar.gz" -type f -printf '%T+ %p\n' | \
        sort | head -n "$EXCESS" | awk '{print $2}' | xargs rm -f
    success "Old backups pruned"
fi

# ── Summary ────────────────────────────────────────────────────────────────
BACKUP_SIZE=$(du -sh "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" | cut -f1)

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Backup Complete! ✅                      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo "  Location:  ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
echo "  Size:      ${BACKUP_SIZE}"
echo "  Retained:  $(find "$BACKUP_DIR" -name "excboncp_backup_*.tar.gz" -type f | wc -l) / ${MAX_BACKUPS} max"
echo ""
echo "  Restore:   ./scripts/restore.sh ${BACKUP_NAME}.tar.gz"
echo ""
