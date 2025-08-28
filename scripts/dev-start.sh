#!/usr/bin/env bash
set -euo pipefail

# Simple starter for the Vite dev server with backend direct URL.
# Usage:
#   ./scripts/dev-start.sh                # uses default backend http://127.0.0.1:8081/api
#   VITE_API_BASE=http://host:port/api ./scripts/dev-start.sh

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="$ROOT_DIR/.devserver.pid"
LOG_DIR="$ROOT_DIR/logs"
LOG_FILE="$LOG_DIR/dev-server.log"

mkdir -p "$LOG_DIR"

VITE_API_BASE_VALUE="${VITE_API_BASE:-http://127.0.0.1:8081/api}"
export VITE_API_BASE="$VITE_API_BASE_VALUE"

echo "[dev-start] Using VITE_API_BASE=$VITE_API_BASE"

# Kill anything already on 5173
if lsof -ti:5173 >/dev/null 2>&1; then
  echo "[dev-start] Port 5173 in use. Killing existing process..."
  kill -9 "$(lsof -ti:5173)" || true
fi

# If a previous PID file exists, try to stop it gracefully
if [[ -f "$PID_FILE" ]]; then
  OLD_PID="$(cat "$PID_FILE" || true)"
  if [[ -n "${OLD_PID}" ]] && ps -p "$OLD_PID" >/dev/null 2>&1; then
    echo "[dev-start] Stopping previous dev server (PID=$OLD_PID) ..."
    kill "$OLD_PID" || true
    sleep 1
  fi
  rm -f "$PID_FILE"
fi

cd "$ROOT_DIR"
echo "[dev-start] Starting dev server... (logs: $LOG_FILE)"

# Start in background, keep logs
nohup npm run dev -- --host > "$LOG_FILE" 2>&1 &
NEW_PID=$!
echo "$NEW_PID" > "$PID_FILE"

echo "[dev-start] Dev server started (PID=$NEW_PID)"
echo "[dev-start] Local:   http://localhost:5173/"
echo "[dev-start] Network: http://$(ipconfig getifaddr en0 2>/dev/null || echo 127.0.0.1):5173/"
echo "[dev-start] To view logs: tail -f $LOG_FILE"
echo "[dev-start] To stop:      ./scripts/dev-stop.sh"


