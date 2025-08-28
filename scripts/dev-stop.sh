#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="$ROOT_DIR/.devserver.pid"

STOPPED=false

if lsof -ti:5173 >/dev/null 2>&1; then
  echo "[dev-stop] Killing process on port 5173 ..."
  kill -9 "$(lsof -ti:5173)" || true
  STOPPED=true
fi

if [[ -f "$PID_FILE" ]]; then
  PID="$(cat "$PID_FILE" || true)"
  if [[ -n "$PID" ]] && ps -p "$PID" >/dev/null 2>&1; then
    echo "[dev-stop] Killing dev server (PID=$PID) ..."
    kill -9 "$PID" || true
    STOPPED=true
  fi
  rm -f "$PID_FILE"
fi

pkill -f "vite --host" || true
pkill -f "npm run dev" || true

if [[ "$STOPPED" = true ]]; then
  echo "[dev-stop] Frontend dev server stopped."
else
  echo "[dev-stop] No dev server detected."
fi


