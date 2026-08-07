# ARIN Implementation Plan & Roadmap

## Overview
ARIN is an Android launcher app that serves as a local AI assistant hub with hardware control capabilities.

---

## Phase 1: UI Implementation (Current Phase)
- Implement Stitch Design System tokens (`#111318` background, `#00f0ff` Electric Cyan, `#7000ff` Cyber Purple, `#00f990` Emerald Green).
- Build main launcher view:
  - Header status bar with pulsing status indicators (`LOCAL AI`, `CLOUD`, `ARDUINO`).
  - Chat interface with AI responses & operator messages.
  - Command input line with monospaced prompt.
- Build Settings view:
  - Toggles for Local AI, Cloud AI, Arduino.
  - Status indicators & mode selector (Full Control vs Compatible Mode).
- Build Test view:
  - Raw command test interface supporting all test commands (`arduino-buzzer`, `builtin-torch-on`, etc.).
- Build bottom navigation tab bar switching between ARIN Hub, Test, and Settings screens.

---

## Phase 2: Local AI Connection
- Configure Local AI server host/port parsing (auto-detect http/https/trailing slashes).
- Fetch available models from server upon connection.
- Model selection UI & routing queries to selected local AI model.
- Update Settings status dynamically.

---

## Phase 3: Cloud AI Connection
- Cloud provider support (`cloud-"[query]"` command routing).
- Secondary AI fallback/routing.
- Settings status reflection.

---

## Phase 4: Arduino & Built-in Device Control
- USB Serial communication with Arduino firmware.
- Built-in device control (Torch, Camera, Calls, SMS).
- System command parser for chat & test interface execution.
- Device permissions & legacy vs modern mode optimizations.
