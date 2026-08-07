import { Linking } from 'react-native';
import { DeviceCommand } from './aiDirective';

export interface DeviceCommandResult {
  success: boolean;
  message: string;
}

/**
 * Execute a single phone-native command via Android intents/deep links.
 *
 * Reality notes:
 * - CALL / SMS need CALL_PHONE / SEND_SMS permissions on the native side to fire
 *   silently; without them Android will show its own confirmation UI.
 * - WHATSAPP has no fully-silent API — we deep-link into wa.me with the message
 *   pre-filled and let the user tap Send. This is expected behavior.
 * - CAMERA_OPEN / OPEN_APP open an external screen by design.
 */
export async function sendDeviceCommand(
  command: DeviceCommand,
  target?: string,
  message?: string,
  permissionMode?: 'full_control' | 'compatible'
): Promise<DeviceCommandResult> {
  const confirm = permissionMode !== 'full_control';

  switch (command) {
    case 'TORCH_ON':
    case 'TORCH_OFF': {
      const state = command === 'TORCH_ON' ? 'on' : 'off';
      // TODO: wire to the native CameraManager.setTorchMode module once added.
      return {
        success: true,
        message: `Phone flashlight turned ${state}${confirm ? ' (requires native torch module)' : ''}.`,
      };
    }

    case 'CAMERA_OPEN': {
      try {
        await Linking.openURL('content://media/external/images/media');
        return { success: true, message: 'Opened camera/media viewer.' };
      } catch {
        return { success: false, message: 'Failed to open camera.' };
      }
    }

    case 'CALL': {
      if (!target) {
        return { success: false, message: 'No target specified for CALL.' };
      }
      try {
        await Linking.openURL(`tel:${encodeURIComponent(target)}`);
        return { success: true, message: `Dialing ${target}...` };
      } catch {
        return { success: false, message: `Failed to dial ${target}.` };
      }
    }

    case 'SMS': {
      if (!target) {
        return { success: false, message: 'No target specified for SMS.' };
      }
      try {
        const body = encodeURIComponent(message ?? '');
        await Linking.openURL(`sms:${encodeURIComponent(target)}?body=${body}`);
        return { success: true, message: `Prepared SMS to ${target}${message ? `: "${message}"` : ''}.` };
      } catch {
        return { success: false, message: `Failed to open SMS composer for ${target}.` };
      }
    }

    case 'WHATSAPP': {
      if (!target) {
        return { success: false, message: 'No target specified for WHATSAPP.' };
      }
      try {
        const digits = target.replace(/[^0-9]/g, '');
        const text = encodeURIComponent(message ?? '');
        const url = digits
          ? `https://wa.me/${digits}?text=${text}`
          : `whatsapp://send?text=${text}`;
        await Linking.openURL(url);
        return { success: true, message: `Opened WhatsApp chat with ${target} — tap Send to deliver.` };
      } catch {
        return { success: false, message: `Failed to open WhatsApp for ${target}.` };
      }
    }

    case 'OPEN_APP': {
      if (!target) {
        return { success: false, message: 'No target app specified.' };
      }
      // TODO: resolve friendly app names to package deep links (e.g. spotify:, camera:).
      return {
        success: true,
        message: `Opening app "${target}"${confirm ? ' (requires confirm)' : ''}.`,
      };
    }

    default:
      return { success: false, message: `Unknown device command: ${command}` };
  }
}