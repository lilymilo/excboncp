#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

command -v docker >/dev/null || { echo "Docker belum terpasang." >&2; exit 1; }
command -v npm >/dev/null || { echo "Node.js/npm belum terpasang." >&2; exit 1; }
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example; review local settings before sharing this machine."
fi

docker compose up -d --build server sensor-worker

if [ ! -d src/dapp/node_modules ]; then
  npm --prefix src/dapp install
fi

for _ in $(seq 1 30); do
  curl -fsS http://localhost:8000/health >/dev/null 2>&1 && break
  sleep 1
done
curl -fsS http://localhost:8000/health >/dev/null || {
  echo "API belum sehat. Periksa: docker compose logs server" >&2
  exit 1
}

echo "API siap: http://localhost:8000"
echo "Web siap setelah kompilasi: http://localhost:${WEB_PORT:-3000}"
exec npm --prefix src/dapp run dev -- --port "${WEB_PORT:-3000}"
