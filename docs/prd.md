You are a React Native developer building ARIN, an Android launcher application that acts as a local AI assistant hub with hardware control capabilities.

## Objective

Build ARIN incrementally using a gated completion model: **UI → Local AI → Cloud AI → Arduino**. Before starting, generate a `plan.md` file outlining the full implementation roadmap. After each phase completes, test thoroughly and request explicit confirmation ("CONTINUE TO NEXT") before proceeding to the next phase. Only advance when you have personally tested and confirmed the phase works as specified.

## Core Architecture

**Primary Interface:** Chat-based screen as the main launcher view—users interact primarily through natural language conversation.

**Secondary Navigation:** Two persistent icons in the launcher:
- Settings icon (gear)
- Test icon (terminal/debug symbol)

**Launcher Mode:** ARIN replaces the Android home screen entirely and is set as the default launcher.

## Phase 1: UI

Build the chat interface, settings screen, and test interface. Do not implement backend connections yet.

### Chat Interface
- Render a chat input field and message display area
- Parse user input as natural language queries or direct commands
- Display command execution status inline

### Settings Screen
Create a settings screen with checkboxes/toggles for:
- Local AI (enabled/disabled + connection status indicator)
- Cloud Provider (enabled/disabled + connection status indicator)
- Arduino Connected (enabled/disabled + connection status indicator)

Display current configuration state.

### Test Interface
Provide a dedicated test input box accessible from the Test icon that accepts raw command strings (do not execute yet, only display received input for verification):
- `arduino-buzzer`
- `arduino-motor-F`
- `arduino-motor-B`
- `local-"HI"`
- `cloud-"HI"`
- `builtin-torch-on`
- `builtin-torch-off`
- `cam-on`
- `call-[number]`
- `message-[number]-"[text]"`

## Phase 2: Local AI Connection

Implement connection to a local AI server after UI is confirmed working.

**Local AI Server Connection**
- Accept manual user input: IP address and port (e.g., `192.168.1.100:8000`, `0.0.0.0:8000`, or `192.34.55.22:0992`)
- Auto-detect and parse multiple URL syntax formats (http, https, with/without trailing slashes, with/without protocol prefix)
- Establish persistent connection to fetch available models after connection succeeds
- Display fetched models in the chat interface for selection
- Route chat queries to the selected local AI model
- Display responses inline

Update the Settings screen to reflect actual connection status.

## Phase 3: Cloud AI Connection

Implement optional secondary cloud-based AI connection after Local AI is confirmed working.

**Cloud Provider Support**
- Test command format: `cloud-"[query]"`
- Establish connection to cloud provider
- Route cloud queries to the provider
- Display responses inline

Update the Settings screen to reflect actual connection status.

## Phase 4: Arduino & Built-in Device Control

Implement hardware control after cloud AI is confirmed working.

**Arduino Communication**
- Establish **USB serial connection** to Arduino device
- Arduino must have **specific pre-loaded firmware** to communicate with ARIN
- Send command signals based on user input
- Support test commands: `arduino-buzzer`, `arduino-motor-F`, `arduino-motor-B`

**Built-in Device Control**
- Torch/flashlight: `builtin-torch-on`, `builtin-torch-off`
- Camera: `cam-on`
- Phone calls: `call-[phone-number]` (e.g., `call-1098712`)
- SMS messaging: `message-[phone-number]-"[text]"` (e.g., `message-0987654-"hi"`)

Detect and execute system commands from chat input. Update the Settings screen to reflect actual connection status.

## Permissions & Device Behavior

**For legacy/old phones (full control mode):**
- Request full device permissions
- Disable background tasks to free resources
- Occupy full available RAM for launcher operation

**For modern phones (compatible mode):**
- Request necessary permissions (call, SMS, camera, torch, etc.)
- Allow other apps to run concurrently
- Request permissions on-demand when specific features are used

## Before Starting

Generate `plan.md` with:
- Full implementation roadmap for all four phases
- File structure and component breakdown
- Key dependencies and libraries
- Estimated scope per phase

Wait for explicit confirmation before proceeding to Phase 1 implementation.

## Workflow

After each phase completes:
1. Test the phase thoroughly to confirm it works as specified
2. Request explicit confirmation: "CONTINUE TO NEXT"
3. Proceed to the next phase only after confirmation is received

Ensure robust error handling for connection failures, command parsing, and permission denials. Provide clear user feedback for all operations (connection status, command execution results, available models).
