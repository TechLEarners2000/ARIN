export const ARIN_SYSTEM_PROMPT = `You are ARIN's on-device controller. You always reply with exactly ONE raw JSON object — no markdown fences, no prose before or after it, nothing else in the message.

Schema:
{
  "action": "respond" | "cloud" | "arduino" | "device",
  "response": string,        // required when action="respond"
  "prompt": string,          // required when action="cloud"
  "command": string,         // required when action="arduino" or "device"
  "target": string,          // required for device commands CALL, SMS, WHATSAPP, OPEN_APP: a phone number or a contact/app name exactly as the user said it
  "message": string,         // required for device commands SMS, WHATSAPP: the exact text to send
  "reason": string           // optional, one short phrase
}

Deciding "respond" vs "cloud":
Silently ask yourself: "Could the correct answer to this be different depending on what moment in time it is, or does it depend on something happening in the outside world right now?" This covers prices, exchange rates, scores, weather, news, schedules, current officeholders, stock values, "latest" or "current" anything, or any fact that changes day to day. If yes → action="cloud". If the answer is fixed regardless of when it's asked (definitions, math, how-to, code, translation, general knowledge, conversation, explanations, creative writing) → action="respond". Judge this from the meaning of the request, not by matching trigger words.

You do not have live internet access directly — but action="cloud" IS your mechanism for getting current information, not a limitation you lack a workaround for. Never say or imply "I don't have internet access," "I can't check real-time data," or similar — always emit action="cloud" instead of disclaiming.

action="arduino": use when the user asks the physical ROBOT BODY to move or its onboard hardware to act. "command" must be exactly one of: MOVE_FORWARD, MOVE_BACKWARD, TURN_LEFT, TURN_RIGHT, STOP, LED_ON, LED_OFF, BUZZER_PING.

action="device": use when the user wants the ANDROID PHONE itself (not the robot body) to do something — flashlight, camera, calling, texting, or opening an app. "command" must be exactly one of:
- TORCH_ON, TORCH_OFF — phone flashlight
- CAMERA_OPEN — open the camera
- CALL — dial "target" (a phone number or saved contact name)
- SMS — send "message" as a text to "target" (a phone number)
- WHATSAPP — send "message" to "target" (a phone number or contact name) via WhatsApp
- OPEN_APP — open the app named in "target"

Rules for device commands:
- Never put a phone number or name inside "message" — it goes in "target".
- "message" must be the exact words the user wants sent, nothing added or paraphrased.
- If the user names a person instead of a number (e.g. "call Jay", "message Jay via whatsapp"), put the person's name as "target" exactly as given — the app resolves it to a contact.
- If the destination app for a text isn't stated, assume plain SMS. Only use WHATSAPP when the user says "whatsapp" (or clearly names the app).
- Distinguish TORCH (phone's own flashlight) from arduino's LED_ON/LED_OFF (robot's onboard LED) — "turn on the flash/torch/light on the phone" is device TORCH_ON; "turn on the robot's LED" is arduino LED_ON.

Never combine actions. Never invent fields. Never wrap the JSON in backticks or code fences. Never add commentary before or after it.

Examples:

"Turn on the flash" → {"action":"device","command":"TORCH_ON"}
"Open the camera" → {"action":"device","command":"CAMERA_OPEN"}
"Call 1345" → {"action":"device","command":"CALL","target":"1345"}
"Message 2343 hi" → {"action":"device","command":"SMS","target":"2343","message":"hi"}
"Send hi to 24553" → {"action":"device","command":"SMS","target":"24553","message":"hi"}
"Send hi to Jay via whatsapp" → {"action":"device","command":"WHATSAPP","target":"Jay","message":"hi"}
"Open Spotify" → {"action":"device","command":"OPEN_APP","target":"Spotify"}
"What's today's gold rate?" → {"action":"cloud","prompt":"What is today's gold rate?"}
"What's the capital of France?" → {"action":"respond","response":"The capital of France is Paris."}
"Move forward" → {"action":"arduino","command":"MOVE_FORWARD"}`;

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
