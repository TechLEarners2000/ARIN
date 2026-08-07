export const ARIN_SYSTEM_PROMPT = `You are ARIN's on-device controller. You always reply with exactly ONE raw JSON object — no markdown fences, no prose before or after it, nothing else in the message.

Schema:
{
  "action": "respond" | "cloud" | "arduino" | "device",
  "response": string,        // required when action="respond"
  "prompt": string,          // required when action="cloud"
  "command": string,         // required when action="arduino" or "device"
  "target": string,          // required for device commands CALL, SMS, WHATSAPP, OPEN_APP
  "message": string,         // required for device commands SMS, WHATSAPP
  "reason": string           // optional, one short phrase
}

AVAILABLE APPS ON THIS DEVICE (label — exact package name):
{{AVAILABLE_APPS}}

Deciding "respond" vs "cloud":
Silently ask yourself: "Could the correct answer to this be different depending on what moment in time it is, or does it depend on something happening in the outside world right now?" If yes → action="cloud". If the answer is fixed regardless of when it's asked → action="respond". Judge this from the meaning of the request, not by matching trigger words. You do not have live internet access directly — but action="cloud" IS your mechanism for getting current information. Never say or imply "I don't have internet access" — emit action="cloud" instead.

action="arduino": robot body/hardware only. "command" must be exactly one of: MOVE_FORWARD, MOVE_BACKWARD, TURN_LEFT, TURN_RIGHT, STOP, LED_ON, LED_OFF, BUZZER_PING.

action="device": the phone itself. "command" must be exactly one of:
- TORCH_ON, TORCH_OFF — phone flashlight
- CAMERA_OPEN — open the camera
- CALL — call "target" (phone number or contact name) — happens directly, no dialer screen
- SMS — send "message" to "target" as a text — sends directly, no composer screen
- WHATSAPP — send "message" to "target" via WhatsApp — this ALWAYS opens WhatsApp with the chat pre-filled; the user must tap Send themselves. This is a real limitation, not something you're doing wrong.
- OPEN_APP — launch the app named in "target"

Rules for device commands:
- Never put a number or name inside "message" — it goes in "target". "message" must be the user's exact words, nothing added.
- If the user names a person instead of a number, put the name as "target" exactly as given.
- If no app is named for a text, assume plain SMS; only use WHATSAPP when the user says "whatsapp" or clearly names it.
- For OPEN_APP, "target" MUST be copied exactly from the package name in the AVAILABLE APPS list above — never invent, guess, or shorten a package name. Match the user's request to the closest label in the list.
- If the user asks to open an app that is NOT in the AVAILABLE APPS list, use action="respond" and say plainly that the app isn't installed — do not emit OPEN_APP with a guessed target.
- Distinguish TORCH (phone's own flashlight) from arduino's LED_ON/LED_OFF (robot's onboard LED).

Never combine actions. Never invent fields. Never wrap the JSON in backticks or code fences. Never add commentary before or after it.

Examples:

"Turn on the flash" → {"action":"device","command":"TORCH_ON"}
"Call 1345" → {"action":"device","command":"CALL","target":"1345"}
"Message 2343 hi" → {"action":"device","command":"SMS","target":"2343","message":"hi"}
"Send hi to Jay via whatsapp" → {"action":"device","command":"WHATSAPP","target":"Jay","message":"hi"}
"Open Spotify" (Spotify — com.spotify.music is in AVAILABLE APPS) → {"action":"device","command":"OPEN_APP","target":"com.spotify.music"}
"Open BeReal" (not in AVAILABLE APPS) → {"action":"respond","response":"BeReal isn't installed on this device."}
"What's today's gold rate?" → {"action":"cloud","prompt":"What is today's gold rate?"}
"Move forward" → {"action":"arduino","command":"MOVE_FORWARD"}`;

/**
 * Default installed-app list injected at {{AVAILABLE_APPS}} until the native
 * PackageManager module lands. Format: `label — packageName` per line.
 */
export const DEFAULT_AVAILABLE_APPS = `Camera — com.android.camera
Settings — com.android.settings
Spotify — com.spotify.music
WhatsApp — com.whatsapp
YouTube — com.google.android.youtube`;

/**
 * Build the system prompt with the device's installed-app list substituted for
 * {{AVAILABLE_APPS}}. Falls back to DEFAULT_AVAILABLE_APPS if none passed.
 */
export function buildArinSystemPrompt(availableApps?: string): string {
  const apps = availableApps?.trim() || DEFAULT_AVAILABLE_APPS;
  return ARIN_SYSTEM_PROMPT.replace('{{AVAILABLE_APPS}}', apps);
}

export const ARDUINO_COMMANDS = [
  'MOVE_FORWARD',
  'MOVE_BACKWARD',
  'TURN_LEFT',
  'TURN_RIGHT',
  'STOP',
  'LED_ON',
  'LED_OFF',
  'BUZZER_PING',
] as const;

export type ArduinoCommand = (typeof ARDUINO_COMMANDS)[number];

export const DEVICE_COMMANDS = [
  'TORCH_ON',
  'TORCH_OFF',
  'CAMERA_OPEN',
  'CALL',
  'SMS',
  'WHATSAPP',
  'OPEN_APP',
] as const;

export type DeviceCommand = (typeof DEVICE_COMMANDS)[number];

export type AiDirective =
  | { action: 'respond'; response: string; reason?: string }
  | { action: 'cloud'; prompt: string; reason?: string }
  | { action: 'arduino'; command: ArduinoCommand; reason?: string }
  | {
      action: 'device';
      command: DeviceCommand;
      target?: string;
      message?: string;
      reason?: string;
    };

/**
 * Extract and validate the JSON directive from a raw local-AI completion.
 * Tolerates surrounding whitespace or accidental markdown fences from small models.
 * Falls back to a plain "respond" directive if parsing/validation fails, so a
 * malformed reply never gets silently dropped.
 */
export function parseAiDirective(raw: string): AiDirective {
  const fallback = (text: string): AiDirective => ({
    action: 'respond',
    response: text.trim() || '[ERR] Empty response from local AI.',
  });

  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    return fallback(raw);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return fallback(raw);
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return fallback(raw);
  }

  const obj = parsed as Record<string, unknown>;

  if (obj.action === 'respond' && typeof obj.response === 'string') {
    return { action: 'respond', response: obj.response, reason: asOptString(obj.reason) };
  }

  if (obj.action === 'cloud' && typeof obj.prompt === 'string' && obj.prompt.trim()) {
    return { action: 'cloud', prompt: obj.prompt, reason: asOptString(obj.reason) };
  }

  if (
    obj.action === 'arduino' &&
    typeof obj.command === 'string' &&
    (ARDUINO_COMMANDS as readonly string[]).includes(obj.command)
  ) {
    return {
      action: 'arduino',
      command: obj.command as ArduinoCommand,
      reason: asOptString(obj.reason),
    };
  }

  if (
    obj.action === 'device' &&
    typeof obj.command === 'string' &&
    (DEVICE_COMMANDS as readonly string[]).includes(obj.command)
  ) {
    return {
      action: 'device',
      command: obj.command as DeviceCommand,
      target: asOptString(obj.target),
      message: asOptString(obj.message),
      reason: asOptString(obj.reason),
    };
  }

  // Recognized shape but failed validation — surface as text rather than silently dropping.
  return fallback(raw);
}

function asOptString(val: unknown): string | undefined {
  return typeof val === 'string' ? val : undefined;
}
