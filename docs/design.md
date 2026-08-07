# ARIN AI Launcher Hub — Design System & UI Specifications

Design pulled directly from Stitch (`projects/8442475670571581884` - *ARIN AI Launcher Hub*).

---

## 1. Brand & Aesthetic Guidelines

- **System Name:** ARIN Intelligence Interface
- **Concept:** Next-generation Android Launcher acting as an AI assistant command center.
- **Visual Style:** Cybernetic Utility, Modern Minimalism, Low-latency & High Information Density.
- **Theme:** Low-light Dark Theme with high-contrast electric accents.
- **Grid & Spacing:** Strict 4px base grid system (`xs: 4px`, `sm: 8px`, `md: 16px`, `lg: 24px`, `xl: 40px`, `container-margin: 20px`).
- **Corner Roundness:** Base 8px (`0.5rem`) for cards & inputs, 4px for tags, Pill (`9999px`) for status badges.

---

## 2. Color System Tokens

### Background & Surface Hierarchy
| Token Name | Hex Value | Role / Usage |
|---|---|---|
| `background` / `surface` | `#111318` | Base dark backdrop (OLED-friendly charcoal) |
| `surface-container-lowest` | `#0c0e12` | Deeper recessed panels |
| `surface-container-low` | `#1a1c20` | Command input background |
| `surface-container` | `#1e2024` | Bottom navigation bar background |
| `surface-container-high` | `#282a2e` | Interactive icon button containers |
| `surface-container-highest` / `surface-variant` | `#333539` | Hover/active states |
| `surface-bright` | `#37393e` | AI Response bubble background |

### Accent Palette
| Color Role | Hex Value | Description |
|---|---|---|
| **Primary (Electric Cyan)** | `#00f0ff` / `#dbfcff` | Active states, primary buttons, AI headers |
| **Secondary (Cyber Purple)** | `#7000ff` / `#d1bcff` | Auxiliary streams & secondary AI suggestions |
| **Tertiary (Emerald Green)** | `#00f990` / `#dcffe2` | System online indicators & active status |
| **Error (Crimson)** | `#ffb4ab` / `#93000a` | Disconnected states & error logs |

### Typography & Border Colors
| Token Name | Hex Value | Usage |
|---|---|---|
| `on-surface` | `#e2e2e8` | Primary text |
| `on-surface-variant` | `#b9cacb` | Secondary/operator text |
| `outline` | `#849495` | Secondary borders & inactive dots |
| `outline-variant` | `#3b494b` | Card borders & input outlines |

---

## 3. Typography Scale & Fonts

| Usage | Font Family | Size / Line Height | Font Weight | Extra Styles |
|---|---|---|---|---|
| **Display Header** | `Hanken Grotesk` | 40px / 48px | 700 (Bold) | Letter spacing `-0.02em` |
| **Headline Mobile** | `Hanken Grotesk` | 32px / 40px | 700 (Bold) | - |
| **Headline Medium** | `Hanken Grotesk` | 24px / 32px | 600 (SemiBold) | - |
| **Body Content** | `Inter` | 16px / 24px | 400 (Regular) | Main UI text & messages |
| **Code / Log Text** | `JetBrains Mono` | 13px / 20px | 500 (Medium) | Command prompt, status logs |
| **Label Caps** | `JetBrains Mono` | 11px / 16px | 700 (Bold) | Uppercase (`letter-spacing: 0.08em`) |

---

## 4. Screens & UI Component Layouts

### Screen 1: Welcome to ARIN (`adf24e...`)
- Onboarding screen introducing the ARIN Intelligence Launcher.
- Feature badges: **Local AI**, **Cloud AI**, **Arduino Hardware**.
- Primary CTA: *INITIALIZE SETUP*.

### Screen 2: Connect Intelligence (`344dec...`)
- Setup view for configuring connection parameters:
  - Local AI Server host/IP & port.
  - Cloud AI API key & provider.
  - Hardware / Arduino serial pairing setup.

### Screen 3: Grant Agency (`1b4c80...`)
- Permission & Execution mode selection:
  - **Full Control Mode (Legacy / Old Phones):** Background tasks disabled, full RAM utilization, full system permission access.
  - **Compatible Mode (Modern Phones):** On-demand permissions for Flashlight, Camera, Phone Call, SMS.

### Screen 4: System Ready (`706609...`)
- Onboarding completion screen confirming all status links (Local, Cloud, Arduino).
- CTA: *ENTER ARIN LAUNCHER*.

### Screen 5: ARIN Launcher (Main Hub View - `665855...`)
- **Status Header Bar (Top):** Pulsing status dots (`LOCAL AI`, `CLOUD`, `ARDUINO`), quick action buttons for Settings (`settings`) and Terminal (`terminal`).
- **System Startup Log Area:** Monospaced system log lines (`[SYS] Neural link established.`).
- **Chat Feed:**
  - AI Message: Left-aligned, `surface-bright` container, 2px Primary Cyan left border, `smart_toy` icon header.
  - Operator (User) Message: Right-aligned, transparent card with `outline-variant` border, `person` icon header.
  - Typing Indicator: Animated 3-dot Cyan pulse when AI is processing.
- **Terminal Command Input (Bottom Bar):** Monospaced `>` prompt, text field `Enter command...`, cyan `SEND` button with `send` icon.
- **Bottom Navigation Bar:** Persistent bottom tab bar with 3 items:
  - `grid_view` — ARIN (Launcher Hub)
  - `terminal` — TEST (Terminal Test Interface)
  - `settings` — SETUP (Configuration & Status)

### Screen 6: Settings (`5cc9f5...`)
- Configuration interface matching PRD requirements:
  - Toggles & connection status indicators for Local AI, Cloud AI, and Arduino.
  - Mode selector (Full Control vs Compatible Mode).

### Screen 7: Terminal Test Interface (`c8ed37...`)
- Raw command execution test suite for manual hardware & built-in command verification (`arduino-buzzer`, `arduino-motor-F`, `builtin-torch-on`, `cam-on`, `call-[number]`, `message-[number]`).
