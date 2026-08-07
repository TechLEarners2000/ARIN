#!/usr/bin/env bash
set -euo pipefail

# ARIN Local AI server launcher
# Starts Ollama bound to all interfaces with the populated models dir.

HOST_PORT="${OLLAMA_HOST_PORT:-0.0.0.0:11434}"
MODELS_DIR="${OLLAMA_MODELS_DIR:-/usr/share/ollama/.ollama/models}"

IP="$(hostname -I | awk '{print $1}')"
echo "IP: $IP"

if [[ ! -d "$MODELS_DIR/manifests" ]]; then
  echo "[ERROR] Models dir not found or empty: $MODELS_DIR" >&2
  echo "        Set OLLAMA_MODELS_DIR to your populated models directory." >&2
  exit 1
fi

echo "[INFO] Models dir: $MODELS_DIR"
echo "[INFO] Binding:    $HOST_PORT"
echo "[INFO] Serving:    http://$IP:${HOST_PORT##*:}"
echo

exec env OLLAMA_HOST="$HOST_PORT" OLLAMA_MODELS="$MODELS_DIR" ollama serve
