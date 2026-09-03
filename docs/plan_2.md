# Plan 2 — Bluetooth Remote Controller App + Voice-to-AI

> Companion to `docs/plan.md`. Adds a **second React Native app** that acts as a
> game-style controller for the ARIN robot from a separate phone, connected via
> **Bluetooth Classic (SPP)** using `react-native-bluetooth-serial`.
>
> **Existing ARIN features must not be affected.**

---

## 1. Architecture

```
┌──────────────────────────────┐          Bluetooth Classic (SPP)          ┌──────────────────────────────┐
│ DEVICE A — "ARIN Host"       │◄─────────────────────────────────────────►│ DEVICE B — "ARIN Remote"      │
│ • Existing ARIN app (repo root)│   text commands + voice transcripts     │ • NEW second RN app           │
│ • USB-OTG -> Arduino          │   (rn-bluetooth-serial server)           │ • D-pad + joystick + speed    │
│ • Runs the ARIN AI            │                                          │ • SPP client                  │
│    (local Ollama / cloud)     │                                          │ • Mic -> streams to Host for AI│
└──────────────────────────────┘                                          └──────────────────────────────┘
```

- **Device A** stays tethered to the robot over USB-OTG and continues to run the
  existing controller (chat, automation, wake word, TTS). **Unchanged behavior.**
- **Device B** is a brand-new RN app that drives the robot *through* Device A.

---

## 2. Communication transport: `react-native-bluetooth-serial`

[`react-native-bluetooth-serial`](https://github.com/rusel1989/react-native-bluetooth-serial)
provides Bluetooth Classic SPP **both directions** on Android + iOS:

- `BluetoothSerial.connect(address)`, `disconnect()`
- `write(data)`, `writeToDevice`
- `BluetoothSerial.list()`, `isEnabled()`, `requestEnable()`
- Device discovery / pairing helpers

Both apps add the library. Device A runs the **server** (RFCOMM listen and accept
remote connections); Device B runs the **client** (scan, pair, connect, send).

**Firmware: unchanged.** The robot keeps talking over USB serial on Device A. The
existing one-shot command protocol still applies; Device A translates text from
the remote into the same Arduino wire format it already uses.

---

## 3. Shared text protocol over the BT link

Reuses the existing command vocabulary; adds a small framing layer so one side can
tell "direct drive command" from "AI voice transcript":

| Direction | Frame | Meaning |
|-----------|-------|---------|
| B → A | `CMD:MOVE_FORWARD:<speed>` | Drive directly (fast path, no AI) |
| B → A | `CMD:MOVE_BACKWARD:<speed>` | Direct drive |
| B → A | `CMD:TURN_LEFT:<speed>` | Direct turn |
| B → A | `CMD:TURN_RIGHT:<speed>` | Direct turn |
| B → A | `CMD:STOP` | Stop both motors |
| B → A | `CMD:GET_DISTANCE` / `CMD:GET_STATUS` | Query robot state (passthrough) |
| B → A | `AI:<transcript>` | Voice → run full ARIN AI, reply back |
| A → B | `ACK:<robot_serial_line>` | Forward a raw Arduino response |
| A → B | `ARIN_REPLY:<text>` | ARIN's spoken/text reply to a voice query |
| A → B | `STATE:CONNECTED` / `STATE:ERROR:<msg>` | Connection lifecycle |

---

## 4. Device A — Host additions (no regression)

Add **new, additive** code only. Existing background service, wake word, rules
engine, TTS, and serial heartbeat stay untouched.

### 4.1 Native: Bluetooth SPP server
- Android `BluetoothAdapter.listenUsingRfcommWithServiceRecord(UUID, name)`.
- Accept thread forwards received frames as a JS event (`BtData`).
- Send-from-host helper (`BtSend`) for ARIN replies.
- Runtime BT permissions (Android 12+): `BLUETOOTH_CONNECT`, `BLUETOOTH_LISTEN`,
  plus `android.permission.BLUETOOTH`, `BLUETOOTH_ADMIN`.
- `react-native-bluetooth-serial` includes an SPP **server** API
  (`BluetoothSerial.isOpen` / `write`) but is primarily a client; add a thin
  Kotlin wrapper (`BtSppHostModule`) around `accept()` so the app can act as the
  pairer-with-remote side if needed. Default: Device A uses the SPP **server**
  mode via the RN module's `acceptOpen`-style call or a small Kotlin service.

### 4.2 JS: `src/services/bluetoothBridge.ts`
- `startBtHost()` / `stopBtHost()`
- `sendToRemote(frame)` → `BtSend`
- `onBluetoothFrame((frame) => void)`

### 4.3 `src/context/AppContext.tsx` (additive)
- Subscribe to `bluetoothBridge.onBluetoothFrame`.
- `f="CMD:..."` → translate to `sendArduinoCommand`/new `sendArduinoSpeed`,
  forward robot ack back as `ACK:...`.
- `f="AI:..."` → call existing `sendMessage(transcript)`; pipe the eventual ARIN
  reply (and `stopAudio`-independent surface) back via `sendToRemote`.

> **Non-regression guards:** all Bluetooth code is opt-in and gated so that when no
> remote is connected the existing app runs exactly as before. No existing
> screen/context state is removed or renamed.

---

## 5. Device B — NEW controller app (`remote-controller/`)

A separate RN app under the repo:

```
remote-controller/
  package.json          # name "ARINRemote", deps include rn-bluetooth-serial
  app.json
  index.js
  App.tsx
  android/  ios/
  src/
    services/btClient.ts
    services/voice.ts          # SpeechRecognizer mic -> transcript
    screens/ConnectScreen.tsx
    screens/DriveScreen.tsx
    components/Dpad.tsx
    components/Joystick.tsx
    components/SpeedSlider.tsx
    components/MicButton.tsx
    theme/colors.ts
    types/index.ts
```

### 5.1 `btClient.ts`
- Scan/pair/connect to Device A SPP server (remember last MAC in AsyncStorage).
- Queued writes, frame splitter (`\n`), reconnection timer.
- API: `connectToHost()`, `sendCommand(frame)`, `sendVoice(text)`,
  `onFrame(handler)`.

### 5.2 Drive screen
- **D-pad** (press-and-hold):
  - FWD → `CMD:MOVE_FORWARD:<speed>`, release → `CMD:STOP`
  - BACK → `CMD:MOVE_BACKWARD:<speed>`
  - LEFT/RIGHT → `CMD:TURN_LEFT/TURN_RIGHT:<speed>`
  - Big center **STOP** button.
- **Joystick** (toggle) — analog mapping to forward/back + turn; left/right only
  (matches 4WD tank; no diagonal mixing, keeps firmware/robot simplest).
- **Speed slider** 0–255 feeds `<speed>` into every command.
- **Live status** card: periodically send `CMD:GET_DISTANCE` / `CMD:GET_STATUS`,
  render returned distance + connection state.

### 5.3 Mic → full-voice AI
- `voice.ts` uses Android `SpeechRecognizer` (reuse logic/patterns from Device A's
  `startVoiceInput`).
- On transcript → `CMD... ` actually `AI:<transcript>` over BT.
- Device A runs ARIN AI → robot moves; A replies `ARIN_REPLY:<text>`, which the
  remote shows (and optionally speaks via local TTS).

---

## 6. Build & verification

1. `firmware/arin_robot` — **no changes**; recompile check only (must still build).
2. Device A native BT host + `bluetoothBridge` + AppContext hook → build APK.
3. Device B `remote-controller` → `npm install`, run on second phone.
4. Manual test matrix:
   - D-pad press/release → motor moves/stops on robot.
   - Speed slider changes motor speed.
   - Joystick maps to forward/turn.
   - Mic voice → ARIN reply → robot action over the two-hop link.
   - Verify Device A core features (chat, wake word, rules, TTS) still work with
     no remote connected (non-regression).

---

## 7. Risks / Notes

- `react-native-bluetooth-serial` is somewhat stale; RN 0.86 / Android 13+ may need
  a small patch (permission changes, Gradle). Mitigate with a thin Kotlin wrapper.
- Bluetooth Classic SPP range ~10m line-of-sight. Not suitable for long-range.
- Both devices must pair once; AA battery / discoverability toggles required on
  connect screen.

## 8. Out of scope (this pass)
- Multi-robot support, camera streaming, firmware BT module directly on the
  Arduino (Device A stays as the USB/serial bridge).