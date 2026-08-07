#!/usr/bin/env bash
set -euo pipefail

# llama.cpp server launcher for Termux
# Serves a GGUF model over HTTP so ARIN can connect via /v1/chat/completions.

# --- CONFIG (edit these) ---
PORT="${LLAMA_PORT:-8080}"
HOST="0.0.0.0"
MODEL="${LLAMA_MODEL:-$HOME/storage/downloads/models/llama-3.2-3b-instruct-q4_k_m.gguf}"
N_CTX="${LLAMA_CTX:-4096}"
N_GPU_LAYERS="${LLAMA_GPU_LAYERS:-0}"    # increase if you built with Vulkan/OpenCL
N_THREADS="${LLAMA_THREADS:-4}"
BIN="${LLAMA_BIN:-llama-server}"         # or llama-server-mtk / llama-server-qnn etc.
# ---

get_ip() {
  # Termux: 'ip -4 addr' or 'ifconfig' may need termux-tools / rootless
  if command -v ip >/dev/null 2>&1; then
    ip -4 addr show 2>/dev/null | awk '/inet / {print $2; exit}' | cut -d/ -f1
  else
    ifconfig 2>/dev/null | awk '/inet / {print $2; exit}'
  fi
}

if ! command -v "$BIN" >/dev/null 2>&1; then
  echo "[ERROR] '$BIN' not found. Install llama.cpp, e.g.:" >&2
  echo "        pkg install llama-cpp            # or build from source" >&2
  exit 1
fi

if [[ ! -f "$MODEL" ]]; then
  echo "[ERROR] Model not found: $MODEL" >&2
  echo "        Put a .gguf in Termux storage, e.g.:" >&2
  echo "        mkdir -p ~/storage/downloads/models && cp model.gguf \$HOME/storage/downloads/models/" >&2
  exit 1
fi

IP="$(get_ip)"
echo "IP: ${IP:-unknown}"
echo "Model: $MODEL"
echo "Serving: http://$IP:$PORT  (OpenAI-compatible /v1/chat/completions)"
echo

exec "$BIN" \
  -m "$MODEL" \
  --host "$HOST" \
  --port "$PORT" \
  -c "$N_CTX" \
  -t "$N_THREADS" \
  -ngl "$N_GPU_LAYERS"
