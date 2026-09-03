import { sendArduinoCommand, sendArduinoSpeedCommand, getDistanceCm } from './arduinoService';
import { arinNative } from './nativeDeviceModule';

export interface ShortcutResult {
  isShortcut: boolean;
  success: boolean;
  message: string;
  commandExecuted?: string;
}

/**
 * Parses and directly executes short command codes like:
 * - flash_on / flash_off
 * - mv_for:200 / mv_fwd:200 / fwd:200 / fwd
 * - mv_back:200 / back:200 / back
 * - turn_left:200 / left:200 / left
 * - turn_right:200 / right:200 / right
 * - stop
 * - led_on / led_off
 * - beep:300 / horn
 * - get_dist / dist
 */
export async function executeShortcutCommand(
  rawInput: string,
  isConnected: boolean
): Promise<ShortcutResult> {
  const clean = rawInput.trim().toLowerCase();
  if (!clean) {
    return { isShortcut: false, success: false, message: '' };
  }

  // --- Flashlight (Torch) Shortcuts ---
  if (clean === 'flash_on' || clean === 'torch_on') {
    if (arinNative) {
      await arinNative.setTorch(true).catch(() => {});
    }
    return {
      isShortcut: true,
      success: true,
      message: 'Phone flashlight (torch) turned ON.',
      commandExecuted: 'FLASH_ON',
    };
  }

  if (clean === 'flash_off' || clean === 'torch_off') {
    if (arinNative) {
      await arinNative.setTorch(false).catch(() => {});
    }
    return {
      isShortcut: true,
      success: true,
      message: 'Phone flashlight (torch) turned OFF.',
      commandExecuted: 'FLASH_OFF',
    };
  }

  // --- Motor Movement Shortcuts ---
  const moveMatch = clean.match(/^(mv_for|mv_fwd|fwd|mv_back|back|turn_left|left|turn_right|right)(?::(\d+))?$/);
  if (moveMatch) {
    const key = moveMatch[1];
    const spd = moveMatch[2] ? parseInt(moveMatch[2], 10) : 200;

    let action: 'FWD' | 'BACK' | 'LEFT' | 'RIGHT' = 'FWD';
    if (key.includes('back')) action = 'BACK';
    else if (key.includes('left')) action = 'LEFT';
    else if (key.includes('right')) action = 'RIGHT';

    const res = await sendArduinoSpeedCommand(action, spd, isConnected);
    return {
      isShortcut: true,
      success: res.success,
      message: res.message,
      commandExecuted: `MOVE:${action}:${spd}`,
    };
  }

  // --- Stop Shortcut ---
  if (clean === 'stop' || clean === 'halt') {
    const res = await sendArduinoCommand('STOP', isConnected);
    return {
      isShortcut: true,
      success: res.success,
      message: res.message,
      commandExecuted: 'STOP',
    };
  }

  // --- LED Shortcuts ---
  if (clean === 'led_on') {
    const res = await sendArduinoCommand('LED_ON', isConnected);
    return {
      isShortcut: true,
      success: res.success,
      message: res.message,
      commandExecuted: 'LED_ON',
    };
  }

  if (clean === 'led_off') {
    const res = await sendArduinoCommand('LED_OFF', isConnected);
    return {
      isShortcut: true,
      success: res.success,
      message: res.message,
      commandExecuted: 'LED_OFF',
    };
  }

  // --- Buzzer / Horn Shortcuts ---
  if (clean.startsWith('beep') || clean === 'horn') {
    const res = await sendArduinoCommand('BUZZER_PING', isConnected);
    return {
      isShortcut: true,
      success: res.success,
      message: res.message,
      commandExecuted: 'BUZZER_PING',
    };
  }

  // --- Distance Shortcuts ---
  if (clean === 'dist' || clean === 'get_dist' || clean === 'distance') {
    const cm = await getDistanceCm(isConnected);
    const msg = cm >= 0 ? `Obstacle distance: ${cm}cm` : 'Distance sensor query failed (disconnected).';
    return {
      isShortcut: true,
      success: cm >= 0,
      message: msg,
      commandExecuted: 'GET_DISTANCE',
    };
  }

  return { isShortcut: false, success: false, message: '' };
}
