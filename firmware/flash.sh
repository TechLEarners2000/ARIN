#!/bin/bash
# ARIN Robot — Flash Arduino Uno
# Usage: bash firmware/flash.sh

set -e

SKETCH_DIR="$(cd "$(dirname "$0")/arin_robot" && pwd)"
FQBN="arduino:avr:uno"

# Auto-detect serial port
if [ -n "$1" ]; then
  PORT="$1"
elif [ -e /dev/ttyACM0 ]; then
  PORT="/dev/ttyACM0"
elif [ -e /dev/ttyUSB0 ]; then
  PORT="/dev/ttyUSB0"
else
  echo "ERROR: No serial port found. Connect Arduino via USB."
  exit 1
fi

echo "=== ARIN Firmware Flash ==="
echo "Sketch : $SKETCH_DIR"
echo "Board  : $FQBN"
echo "Port   : $PORT"
echo ""

echo "[1/2] Compiling..."
arduino-cli compile --fqbn "$FQBN" "$SKETCH_DIR"
echo ""

echo "[2/2] Uploading..."
if ! arduino-cli upload --fqbn "$FQBN" --port "$PORT" "$SKETCH_DIR" 2>/dev/null; then
  echo ""
  echo "Permission denied on $PORT"
  echo "Fix: sudo usermod -aG dialout \$(whoami)"
  echo "Then log out and log back in."
  exit 1
fi
echo ""

echo "=== Flash complete ==="
echo "Open serial monitor: arduino-cli monitor --port $PORT --config baudrate=115200"
echo "Expected: READY"
