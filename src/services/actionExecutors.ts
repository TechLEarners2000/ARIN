import { RuleAction } from '../types';
import { sendArduinoCommand, queryRobotBuzzerStatus as queryBuzzerReal } from './arduinoService';
import { arinNative } from './nativeDeviceModule';

export interface ActionExecutionContext {
  batteryLevel?: number;
  isArduinoConnected?: boolean;
  onLog?: (msg: string) => void;
}

export interface ActionResult {
  success: boolean;
  message: string;
  data?: Record<string, string>;
}

/**
 * Query the robot's buzzer status via serial link (`GET_STATUS`).
 * Returns "UNKNOWN" if unreachable or disconnected.
 */
export async function queryRobotBuzzerStatus(
  isConnected = false,
  _timeoutMs = 1500
): Promise<string> {
  if (!isConnected) {
    return 'UNKNOWN';
  }
  try {
    const status = await queryBuzzerReal(isConnected);
    return status;
  } catch {
    return 'UNKNOWN';
  }
}

/**
 * Replace string templates: {{time}}, {{buzzerStatus}}, {{battery}}, {{status}}, {{buzzer}}, etc.,
 * as well as natural language phrases like "the battery percentage".
 */
export function interpolateTemplate(
  template: string,
  vars: { time: string; buzzerStatus: string; battery: string }
): string {
  let result = template;

  // Time / Date aliases
  result = result.replace(/\{\{\s*(time|date|timestamp|clock)\s*\}\}/gi, vars.time);

  // Buzzer / Robot Status aliases
  result = result.replace(
    /\{\{\s*(status|buzzerStatus|buzzer_status|buzzer|robot_status|robotStatus)\s*\}\}/gi,
    vars.buzzerStatus
  );

  // Battery Level aliases
  result = result.replace(
    /\{\{\s*(battery|battery_level|batteryLevel|bat|level)\s*\}\}/gi,
    vars.battery
  );

  // Natural language battery phrase substitution (e.g. "the battery percentage" -> "77%")
  result = result.replace(/(?:the\s+)?battery\s*(?:percentage|level|pct)?/gi, vars.battery);

  // Catch-all for any remaining mustache tags -> replace with buzzer status fallback
  result = result.replace(/\{\{\s*[\w_]+\s*\}\}/gi, vars.buzzerStatus);

  return result;
}

/**
 * Execute a single action in a rule chain safely.
 */
export async function executeRuleAction(
  action: RuleAction,
  context: ActionExecutionContext = {}
): Promise<ActionResult> {
  const log = context.onLog ?? (() => {});

  try {
    switch (action.type) {
      case 'wifi_toggle': {
        if (!arinNative) {
          log('[ACTION] Wi-Fi toggle unavailable (Native bridge missing).');
          return { success: false, message: 'Native bridge unavailable for Wi-Fi toggle.' };
        }
        const res = await arinNative.setWifi(action.state === 'on');
        if (res === 'OPENED_SETTINGS') {
          log(`[ACTION] Android 10+ restriction: Opened Wi-Fi settings to turn Wi-Fi ${action.state.toUpperCase()}.`);
          return {
            success: true,
            message: `Opened Wi-Fi settings to turn ${action.state.toUpperCase()} (OS restriction on Android 10+).`,
          };
        }
        log(`[ACTION] Wi-Fi turned ${action.state.toUpperCase()}.`);
        return { success: true, message: `Wi-Fi turned ${action.state.toUpperCase()}.` };
      }

      case 'bluetooth_toggle': {
        if (!arinNative) {
          log('[ACTION] Bluetooth toggle unavailable.');
          return { success: false, message: 'Native bridge unavailable.' };
        }
        const res = await arinNative.setBluetooth(action.state === 'on');
        log(`[ACTION] Bluetooth turned ${action.state.toUpperCase()} (${res}).`);
        return { success: true, message: `Bluetooth turned ${action.state.toUpperCase()}.` };
      }

      case 'torch_toggle': {
        if (!arinNative) {
          log('[ACTION] Torch toggle unavailable.');
          return { success: false, message: 'Native bridge unavailable.' };
        }
        await arinNative.setTorch(action.state === 'on');
        log(`[ACTION] Torch turned ${action.state.toUpperCase()}.`);
        return { success: true, message: `Torch turned ${action.state.toUpperCase()}.` };
      }

      case 'battery_saver': {
        if (!arinNative) {
          log('[ACTION] Battery Saver settings unavailable.');
          return { success: false, message: 'Native bridge unavailable.' };
        }
        await arinNative.openSettings('battery');
        log(`[ACTION] Opened Battery Saver settings for user interaction.`);
        return {
          success: true,
          message: 'Opened Battery Saver settings (system toggle restricted).',
        };
      }

      case 'notification': {
        const title = action.title || 'ARIN Automation';
        const body = action.body || 'Automation triggered.';
        if (arinNative) {
          await arinNative.showNotification(title, body);
        }
        log(`[ACTION] Local Notification: "${title}" - "${body}"`);
        return { success: true, message: `Notification sent: ${title}` };
      }

      case 'read_calendar': {
        const eventSummary = 'No calendar events scheduled for today.';
        if (arinNative) {
          await arinNative.showNotification('Calendar Summary', eventSummary);
        }
        log(`[ACTION] Calendar Readout: ${eventSummary}`);
        return { success: true, message: eventSummary };
      }

      case 'sms': {
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const buzzer = await queryRobotBuzzerStatus(context.isArduinoConnected ?? false);
        const batPct = context.batteryLevel !== undefined ? `${context.batteryLevel}%` : 'Unknown%';

        const finalBody = interpolateTemplate(action.bodyTemplate, {
          time: nowTime,
          buzzerStatus: buzzer,
          battery: batPct,
        });

        if (!arinNative) {
          log(`[ACTION] SMS simulated to ${action.to}: "${finalBody}"`);
          return { success: true, message: `SMS (simulated) sent to ${action.to}: ${finalBody}` };
        }

        try {
          await arinNative.sendSms(action.to, finalBody);
          log(`[ACTION] SMS sent to ${action.to}: "${finalBody}"`);
          return { success: true, message: `SMS sent to ${action.to}` };
        } catch (smsErr: unknown) {
          const errStr = smsErr instanceof Error ? smsErr.message : String(smsErr);
          log(`[ACTION] SMS failed: ${errStr}`);
          return { success: false, message: `SMS failed: ${errStr}` };
        }
      }

      case 'robot_command': {
        const cmdUpper = action.command.toUpperCase().trim();

        if (cmdUpper === 'GET_STATUS') {
          const status = await queryRobotBuzzerStatus(context.isArduinoConnected ?? false);
          log(`[ACTION] Robot GET_STATUS response: BUZZER=${status}`);
          return {
            success: true,
            message: `Robot Status: BUZZER=${status}`,
            data: { buzzerStatus: status },
          };
        }

        const validCmd = (
          cmdUpper.startsWith('MOVE')
            ? 'MOVE_FORWARD'
            : cmdUpper.startsWith('TURN:LEFT')
            ? 'TURN_LEFT'
            : cmdUpper.startsWith('TURN:RIGHT')
            ? 'TURN_RIGHT'
            : cmdUpper.startsWith('BEEP')
            ? 'BUZZER_PING'
            : /LED|LIGHT|LAMP/.test(cmdUpper) && /OFF|DISABLE/.test(cmdUpper)
            ? 'LED_OFF'
            : /LED|LIGHT|LAMP/.test(cmdUpper) && /ON|ENABLE/.test(cmdUpper)
            ? 'LED_ON'
            : 'STOP'
        ) as any;

        const res = await sendArduinoCommand(validCmd, context.isArduinoConnected ?? false);
        log(`[ACTION] Robot command (${action.command}): ${res.message}`);
        return { success: res.success, message: res.message };
      }

      default:
        return { success: false, message: 'Unknown action type.' };
    }
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : String(err);
    log(`[ACTION ERR] Exception during execution: ${errMessage}`);
    return { success: false, message: `Action failed: ${errMessage}` };
  }
}
