import { ArduinoCommand } from './aiDirective';

export interface ArduinoCommandResult {
  success: boolean;
  message: string;
}

const ARDUINO_MESSAGES: Record<ArduinoCommand, string> = {
  MOVE_FORWARD: 'Moving robot forward...',
  MOVE_BACKWARD: 'Reversing robot...',
  TURN_LEFT: 'Pivoting robot left...',
  TURN_RIGHT: 'Pivoting robot right...',
  STOP: 'Robot stopped.',
  LED_ON: 'Robot LED turned on.',
  LED_OFF: 'Robot LED turned off.',
  BUZZER_PING: 'Robot buzzer sounded.',
};

/**
 * Send a single command token to the Arduino over the active transport.
 */
export async function sendArduinoCommand(
  command: ArduinoCommand,
  isConnected: boolean
): Promise<ArduinoCommandResult> {
  const label = ARDUINO_MESSAGES[command] || `Executed ${command} on robot.`;
  if (!isConnected) {
    return { success: false, message: `${label} (Arduino not connected)` };
  }

  // Placeholder until the real transport (USB serial / BLE) is implemented.
  return { success: true, message: label };
}
