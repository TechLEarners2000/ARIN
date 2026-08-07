import { ArduinoCommand } from './aiDirective';

export interface ArduinoCommandResult {
  success: boolean;
  message: string;
}

/**
 * Send a single command token to the Arduino over the active transport.
 * TODO: wire to the real USB-serial/BLE link once that transport lands —
 * this stub only reports whether a link is currently marked connected.
 */
export async function sendArduinoCommand(
  command: ArduinoCommand,
  isConnected: boolean
): Promise<ArduinoCommandResult> {
  if (!isConnected) {
    return { success: false, message: 'Arduino not connected.' };
  }

  // Placeholder until the real transport (USB serial / BLE) is implemented.
  return { success: true, message: `Sent ${command} to Arduino.` };
}
