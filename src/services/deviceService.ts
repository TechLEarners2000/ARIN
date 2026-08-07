import { Linking } from 'react-native';
import { DeviceCommand } from './aiDirective';
import { arinNative, hasNativeBridge, InstalledAppNative } from './nativeDeviceModule';

export interface DeviceCommandResult {
  success: boolean;
  message: string;
}

/** RN wraps native rejections as `CODE: message` — keep only the readable part. */
function nativeErrorText(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : String(err);
  const idx = raw.indexOf(': ');
  const stripped = idx >= 0 ? raw.slice(idx + 2) : raw;
  return stripped.trim() || fallback;
}

export interface InstalledApp {
  label: string;
  packageName: string;
}

/**
 * List apps installed on the phone, fed into the prompt's {{AVAILABLE_APPS}}.
 *
 * Uses the native PackageManager module when available; otherwise returns a
 * small curated placeholder so OPEN_APP still has valid package names.
 */
export async function getInstalledApps(): Promise<InstalledApp[]> {
  if (hasNativeBridge && arinNative) {
    try {
      const apps: InstalledAppNative[] = await arinNative.getInstalledApps();
      if (apps.length > 0) {
        return apps;
      }
    } catch {
      // fall through to placeholder
    }
  }
  return [
    { label: 'Camera', packageName: 'com.android.camera' },
    { label: 'Settings', packageName: 'com.android.settings' },
    { label: 'Spotify', packageName: 'com.spotify.music' },
    { label: 'WhatsApp', packageName: 'com.whatsapp' },
    { label: 'YouTube', packageName: 'com.google.android.youtube' },
  ];
}

/** Format installed apps as the "label — packageName" list the prompt expects. */
export function formatInstalledApps(apps: InstalledApp[]): string {
  return apps.map((app) => `${app.label} — ${app.packageName}`).join('\n');
}

/**
 * Execute a single phone-native command.
 *
 * Native path (Android): silent CALL via ACTION_CALL, silent SMS via
 * SmsManager.sendTextMessage, torch via CameraManager.setTorchMode, and
 * OPEN_APP via getLaunchIntentForPackage. Each falls back to Linking deep
 * links when the native bridge is missing or permission is denied.
 */
export async function sendDeviceCommand(
  command: DeviceCommand,
  target?: string,
  message?: string,
  _permissionMode?: 'full_control' | 'compatible'
): Promise<DeviceCommandResult> {
  switch (command) {
    case 'TORCH_ON':
    case 'TORCH_OFF': {
      const enabled = command === 'TORCH_ON';
      if (hasNativeBridge && arinNative) {
        try {
          await arinNative.setTorch(enabled);
          return { success: true, message: `Phone flashlight turned ${enabled ? 'on' : 'off'}.` };
        } catch (err) {
          return {
            success: false,
            message: `Torch failed: ${err instanceof Error ? err.message : String(err)}`,
          };
        }
      }
      return {
        success: true,
        message: `Phone flashlight turned ${enabled ? 'on' : 'off'} (no native module — not actually switched).`,
      };
    }

    case 'CAMERA_OPEN': {
      if (hasNativeBridge && arinNative) {
        try {
          await arinNative.openCamera();
          return { success: true, message: 'Opened the camera app.' };
        } catch (err) {
          return {
            success: false,
            message: `Failed to open camera: ${err instanceof Error ? err.message : String(err)}`,
          };
        }
      }
      return { success: false, message: 'Camera not available (no native module).' };
    }

    case 'CALL': {
      if (!target) {
        return { success: false, message: 'No target specified for CALL.' };
      }
      if (hasNativeBridge && arinNative) {
        try {
          const direct = await arinNative.callPhone(target);
          return direct
            ? { success: true, message: `Calling ${target}...` }
            : { success: true, message: `Opening dialer for ${target} (CALL_PHONE permission missing).` };
        } catch (err) {
          return {
            success: false,
            message: nativeErrorText(err, `Failed to call ${target}.`),
          };
        }
      }
      try {
        await Linking.openURL(`tel:${encodeURIComponent(target)}`);
        return { success: true, message: `Opening dialer for ${target}...` };
      } catch {
        return { success: false, message: `Failed to dial ${target}.` };
      }
    }

    case 'SMS': {
      if (!target) {
        return { success: false, message: 'No target specified for SMS.' };
      }
      if (hasNativeBridge && arinNative) {
        try {
          await arinNative.sendSms(target, message ?? '');
          return {
            success: true,
            message: `SMS sent to ${target}${message ? `: "${message}"` : ''}.`,
          };
        } catch (err) {
          return {
            success: false,
            message: nativeErrorText(err, `Failed to send SMS to ${target}.`),
          };
        }
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
      // No silent API exists for WhatsApp — deep-link with the chat pre-filled.
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
      if (hasNativeBridge && arinNative) {
        try {
          await arinNative.launchApp(target);
          return { success: true, message: `Opened ${target}.` };
        } catch (err) {
          return {
            success: false,
            message: `Failed to open ${target}: ${err instanceof Error ? err.message : String(err)}`,
          };
        }
      }
      return { success: true, message: `Opening app "${target}" (no native module).` };
    }

    default:
      return { success: false, message: `Unknown device command: ${command}` };
  }
}