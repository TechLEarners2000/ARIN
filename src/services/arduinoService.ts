import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { ArduinoCommand } from './aiDirective';

export interface ArduinoCommandResult {
  success: boolean;
  message: string;
  data?: string;
}

export interface ArduinoDistanceResult {
  success: boolean;
  distance?: number;
}

// ---------------------------------------------------------------------------
// Command token → firmware wire format
// ---------------------------------------------------------------------------

const COMMAND_MAP: Record<string, string> = {
  MOVE_FORWARD: 'MOVE:FWD:200',
  MOVE_BACKWARD: 'MOVE:BACK:200',
  TURN_LEFT: 'TURN:LEFT:200',
  TURN_RIGHT: 'TURN:RIGHT:200',
  STOP: 'STOP',
  BUZZER_PING: 'BEEP:300',
};

const ARDUINO_MESSAGES: Record<ArduinoCommand, string> = {
  MOVE_FORWARD: 'Moving robot forward...',
  MOVE_BACKWARD: 'Reversing robot...',
  TURN_LEFT: 'Pivoting robot left...',
  TURN_RIGHT: 'Pivoting robot right...',
  STOP: 'Robot stopped.',
  LED_ON: 'LED control not available on this robot.',
  LED_OFF: 'LED control not available on this robot.',
  BUZZER_PING: 'Robot buzzer sounded.',
};

// ---------------------------------------------------------------------------
// Native event subscription
// ---------------------------------------------------------------------------

let eventEmitter: NativeEventEmitter | null = null;
let pendingTimeout: ReturnType<typeof setTimeout> | null = null;
const SERIAL_TIMEOUT_MS = 3000;

function getEventEmitter(): NativeEventEmitter {
  if (!eventEmitter && Platform.OS === 'android' && NativeModules.ArinNative) {
    eventEmitter = new NativeEventEmitter(NativeModules.ArinNative);
  }
  return eventEmitter!;
}

/** Subscribe to raw serial lines from the native read thread. */
export function onSerialData(handler: (line: string) => void): () => void {
  const emitter = getEventEmitter();
  if (!emitter) return () => {};
  const sub = emitter.addListener('SerialData', (event: { data: string }) => {
    handler(event.data);
  });
  return () => sub.remove();
}

/** Subscribe to connection lifecycle events. */
export function onSerialConnect(handler: (info: { name: string; vendorId: number; productId: number }) => void): () => void {
  const emitter = getEventEmitter();
  if (!emitter) return () => {};
  const sub = emitter.addListener('SerialConnect', handler);
  return () => sub.remove();
}

export function onSerialDisconnect(handler: (info: { reason: string; error?: string }) => void): () => void {
  const emitter = getEventEmitter();
  if (!emitter) return () => {};
  const sub = emitter.addListener('SerialDisconnect', handler);
  return () => sub.remove();
}

// ---------------------------------------------------------------------------
// Low-level serial I/O (request/response with timeout)
// ---------------------------------------------------------------------------

function waitForResponse(timeoutMs: number = SERIAL_TIMEOUT_MS): Promise<string> {
  return new Promise((resolve, reject) => {
    if (pendingTimeout) clearTimeout(pendingTimeout);

    const sub = onSerialData((line) => {
      if (pendingTimeout) clearTimeout(pendingTimeout);
      pendingTimeout = null;
      sub();
      resolve(line);
    });

    pendingTimeout = setTimeout(() => {
      sub();
      pendingTimeout = null;
      reject(new Error('Serial timeout — no response from Arduino'));
    }, timeoutMs);
  });
}

async function writeAndRead(command: string, timeoutMs?: number): Promise<string> {
  const { arinNative } = require('./nativeDeviceModule');
  await arinNative.writeSerial(command);
  return waitForResponse(timeoutMs);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send a command token to the Arduino and wait for its response.
 */
export async function sendArduinoCommand(
  command: ArduinoCommand,
  isConnected: boolean
): Promise<ArduinoCommandResult> {
  const label = ARDUINO_MESSAGES[command] || `Executed ${command} on robot.`;

  if (!isConnected) {
    return { success: false, message: `${label} (Arduino not connected)` };
  }

  const wire = COMMAND_MAP[command];
  if (!wire) {
    return { success: false, message: `${label} (unsupported command)` };
  }

  try {
    const response = await writeAndRead(wire);
    return parseResponse(response, label);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `${label} — ${msg}` };
  }
}

/**
 * Query the robot's buzzer status via GET_STATUS.
 */
export async function queryRobotBuzzerStatus(isConnected: boolean): Promise<'ON' | 'OFF'> {
  if (!isConnected) return 'OFF';
  try {
    const response = await writeAndRead('GET_STATUS');
    const match = response.match(/STATUS:BUZZER=(ON|OFF)/i);
    if (match) return match[1].toUpperCase() as 'ON' | 'OFF';
  } catch {
    // fallback
  }
  return 'OFF';
}

/**
 * Query the ultrasonic distance sensor.
 */
export async function getDistanceCm(isConnected: boolean): Promise<number> {
  if (!isConnected) return -1;
  try {
    const response = await writeAndRead('GET_DISTANCE');
    const match = response.match(/DIST:(-?\d+)/);
    if (match) return parseInt(match[1], 10);
  } catch {
    // fallback
  }
  return -1;
}

// ---------------------------------------------------------------------------
// Response parser
// ---------------------------------------------------------------------------

function parseResponse(raw: string, label: string): ArduinoCommandResult {
  const trimmed = raw.trim();

  if (trimmed.startsWith('OK:')) {
    return { success: true, message: label, data: trimmed };
  }

  if (trimmed.startsWith('DIST:')) {
    const match = trimmed.match(/DIST:(-?\d+)/);
    const dist = match ? parseInt(match[1], 10) : -1;
    return { success: true, message: `Distance: ${dist}cm`, data: trimmed };
  }

  if (trimmed.startsWith('STATUS:')) {
    return { success: true, message: trimmed, data: trimmed };
  }

  if (trimmed.startsWith('OBSTACLE:')) {
    const match = trimmed.match(/OBSTACLE:(\d+)/);
    const cm = match ? match[1] : '?';
    return { success: true, message: `Obstacle detected at ${cm}cm`, data: trimmed };
  }

  if (trimmed === 'CLEAR') {
    return { success: true, message: 'Path clear', data: trimmed };
  }

  if (trimmed.startsWith('ERR:')) {
    return { success: false, message: `Arduino error: ${trimmed}`, data: trimmed };
  }

  return { success: true, message: label, data: trimmed };
}
