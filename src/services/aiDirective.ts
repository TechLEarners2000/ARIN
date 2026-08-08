import { ARIN_SYSTEM_PROMPT } from './promptText';
export { ARIN_SYSTEM_PROMPT };

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
  'WIFI_ON',
  'WIFI_OFF',
  'BLUETOOTH_ON',
  'BLUETOOTH_OFF',
  'OPEN_SETTINGS',
  'MUTE_SOUND',
  'UNMUTE_SOUND',
  'VOLUME_UP',
  'VOLUME_DOWN',
  'SET_VOLUME',
  'GET_BATTERY',
  'GET_WEATHER',
] as const;

export type DeviceCommand = (typeof DEVICE_COMMANDS)[number];

// A single step inside a pipeline, or the shape of a non-pipeline directive
// before the optional top-level "schedule" wrapper is applied.
export type AiStep =
  | { action: 'respond'; response: string; reason?: string }
  | { action: 'cloud'; prompt: string; reason?: string }
  | { action: 'arduino'; command: ArduinoCommand; reason?: string }
  | { action: 'speak'; message: string; reason?: string }
  | {
      action: 'device';
      command: DeviceCommand;
      target?: string;
      message?: string;
      reason?: string;
    };

export type AiDirective =
  | (AiStep & { schedule?: string })
  | { action: 'pipeline'; steps: AiStep[]; schedule?: string; reason?: string };

function asOptString(val: unknown): string | undefined {
  return typeof val === 'string' ? val : undefined;
}

function normalizeArduinoCommand(raw: string): ArduinoCommand | null {
  const norm = raw.trim().toUpperCase().replace(/[\s-]+/g, '_');
  if ((ARDUINO_COMMANDS as readonly string[]).includes(norm)) {
    return norm as ArduinoCommand;
  }
  if (norm.includes('FORWARD') || norm === 'FWD') return 'MOVE_FORWARD';
  if (norm.includes('BACK') || norm === 'REV' || norm === 'REVERSE') return 'MOVE_BACKWARD';
  if (norm.includes('LEFT')) return 'TURN_LEFT';
  if (norm.includes('RIGHT')) return 'TURN_RIGHT';
  if (norm.includes('STOP') || norm === 'HALT' || norm === 'BRAKE') return 'STOP';
  if (norm.includes('LED_ON') || norm === 'LIGHT_ON') return 'LED_ON';
  if (norm.includes('LED_OFF') || norm === 'LIGHT_OFF') return 'LED_OFF';
  if (norm.includes('BUZZER') || norm.includes('BEEP') || norm === 'PING') return 'BUZZER_PING';
  return null;
}

/** Validate+coerce a single step object (no schedule, no nested pipeline). */
function parseStep(obj: Record<string, unknown>): AiStep | null {
  // Extract response text tolerating common field name variations from small LLMs
  const responseText =
    asOptString(obj.response) ??
    asOptString(obj.text) ??
    asOptString(obj.answer) ??
    asOptString(obj.content) ??
    asOptString(obj.result);

  if (obj.action === 'respond' || (responseText && !obj.action)) {
    if (responseText && responseText.trim()) {
      return { action: 'respond', response: responseText.trim(), reason: asOptString(obj.reason) };
    }
  }
  if (obj.action === 'cloud' && typeof obj.prompt === 'string' && obj.prompt.trim()) {
    return { action: 'cloud', prompt: obj.prompt.trim(), reason: asOptString(obj.reason) };
  }
  if (obj.action === 'speak' && typeof obj.message === 'string' && obj.message.trim()) {
    return { action: 'speak', message: obj.message.trim(), reason: asOptString(obj.reason) };
  }

  const rawCmd = asOptString(obj.command);
  if (obj.action === 'arduino' || obj.action === 'robot' || (!obj.action && rawCmd)) {
    const arduinoCmd = rawCmd ? normalizeArduinoCommand(rawCmd) : null;
    if (arduinoCmd) {
      return { action: 'arduino', command: arduinoCmd, reason: asOptString(obj.reason) };
    }
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

  // Fallback check: if action is missing or non-standard, but a response text exists
  if (responseText && responseText.trim()) {
    return { action: 'respond', response: responseText.trim(), reason: asOptString(obj.reason) };
  }

  return null;
}

/** Clean up raw text if JSON parsing fails so raw JSON syntax is never shown in chat UI. */
function sanitizeFallbackText(text: string): string {
  let cleaned = text.trim();
  // If text looks like a raw JSON object string, try to extract a user-facing string from it
  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    const responseMatch = cleaned.match(/"(?:response|text|answer|message|content|prompt)":\s*"([^"]+)"/i);
    if (responseMatch && responseMatch[1]) {
      return responseMatch[1];
    }
    const cmdMatch = cleaned.match(/"command":\s*"([^"]+)"/i);
    if (cmdMatch && cmdMatch[1]) {
      return `Executing robot command: ${cmdMatch[1].toUpperCase()}`;
    }
    // Clean JSON syntax artifacts if unparseable
    cleaned = cleaned
      .replace(/[{}"']/g, '')
      .replace(/action\s*:\s*/gi, '')
      .replace(/command\s*:\s*/gi, '')
      .replace(/reason\s*:\s*/gi, '')
      .trim();
  }
  return cleaned || '[ERR] Empty response from local AI.';
}

/**
 * Extract and validate the JSON directive from a raw local-AI completion.
 * Tolerates surrounding whitespace or accidental markdown fences from small models.
 * Falls back to a plain "respond" directive if parsing/validation fails, so a
 * malformed reply never gets silently dropped.
 */
export function parseAiDirective(raw: string): AiDirective {
  const fallback = (text: string): AiDirective => ({
    action: 'respond',
    response: sanitizeFallbackText(text),
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
  const schedule = asOptString(obj.schedule);

  if (obj.action === 'pipeline' && Array.isArray(obj.steps)) {
    const steps = (obj.steps as unknown[])
      .map((s) => (typeof s === 'object' && s !== null ? parseStep(s as Record<string, unknown>) : null))
      .filter((s): s is AiStep => s !== null);
    if (steps.length >= 1) {
      return { action: 'pipeline', steps, schedule, reason: asOptString(obj.reason) };
    }
    return fallback(raw);
  }

  const step = parseStep(obj);
  if (step) {
    return { ...step, schedule } as AiDirective;
  }

  // Recognized shape but failed validation — surface clean response text rather than raw JSON.
  return fallback(raw);
}
