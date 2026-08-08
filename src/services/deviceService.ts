import { Linking } from 'react-native';
import { DeviceCommand } from './aiDirective';
import { arinNative, hasNativeBridge, InstalledAppNative } from './nativeDeviceModule';
import { fetchWeather } from './weatherService';

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
 * List apps installed on the phone, fed into the prompt's PACKAGES block as
 * package names only (the model infers an app's identity from its package).
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

    case 'WIFI_ON':
    case 'WIFI_OFF': {
      const enabled = command === 'WIFI_ON';
      if (hasNativeBridge && arinNative) {
        try {
          const res = await arinNative.setWifi(enabled);
          return res === 'TOGGLED_DIRECTLY'
            ? { success: true, message: `Wi-Fi turned ${enabled ? 'on' : 'off'}.` }
            : { success: true, message: `Opened Wi-Fi settings to switch Wi-Fi ${enabled ? 'on' : 'off'}.` };
        } catch (err) {
          return { success: false, message: `Wi-Fi failed: ${err instanceof Error ? err.message : String(err)}` };
        }
      }
      return { success: true, message: `Wi-Fi turned ${enabled ? 'on' : 'off'} (no native module).` };
    }

    case 'BLUETOOTH_ON':
    case 'BLUETOOTH_OFF': {
      const enabled = command === 'BLUETOOTH_ON';
      if (hasNativeBridge && arinNative) {
        try {
          const res = await arinNative.setBluetooth(enabled);
          return res === 'TOGGLED_DIRECTLY'
            ? { success: true, message: `Bluetooth turned ${enabled ? 'on' : 'off'}.` }
            : { success: true, message: `Opened Bluetooth settings to switch Bluetooth ${enabled ? 'on' : 'off'}.` };
        } catch (err) {
          return { success: false, message: `Bluetooth failed: ${err instanceof Error ? err.message : String(err)}` };
        }
      }
      return { success: true, message: `Bluetooth turned ${enabled ? 'on' : 'off'} (no native module).` };
    }

    case 'OPEN_SETTINGS': {
      const settingTarget = target || 'settings';
      if (hasNativeBridge && arinNative) {
        try {
          await arinNative.openSettings(settingTarget);
          return { success: true, message: `Opened ${settingTarget} settings.` };
        } catch (err) {
          return { success: false, message: `Failed to open settings: ${err instanceof Error ? err.message : String(err)}` };
        }
      }
      return { success: true, message: `Opened ${settingTarget} settings (no native module).` };
    }

    case 'MUTE_SOUND':
    case 'UNMUTE_SOUND': {
      const isMute = command === 'MUTE_SOUND';
      const mode = isMute ? 'SILENT' : 'NORMAL';
      if (hasNativeBridge && arinNative) {
        try {
          await arinNative.setRingerMode(mode);
          return { success: true, message: `Phone sound ${isMute ? 'muted (silent mode)' : 'unmuted (normal mode)'}.` };
        } catch (err) {
          return { success: false, message: `Failed to change ringer mode: ${err instanceof Error ? err.message : String(err)}` };
        }
      }
      return { success: true, message: `Phone sound ${isMute ? 'muted' : 'unmuted'} (no native module).` };
    }

    case 'VOLUME_UP':
    case 'VOLUME_DOWN': {
      const dir = command === 'VOLUME_UP' ? 'UP' : 'DOWN';
      if (hasNativeBridge && arinNative) {
        try {
          await arinNative.adjustVolume(dir);
          return { success: true, message: `Volume turned ${dir.toLowerCase()}.` };
        } catch (err) {
          return { success: false, message: `Failed to adjust volume: ${err instanceof Error ? err.message : String(err)}` };
        }
      }
      return { success: true, message: `Volume turned ${dir.toLowerCase()} (no native module).` };
    }

    case 'SET_VOLUME': {
      const level = parseInt(target || '50', 10);
      const clampedPct = isNaN(level) ? 50 : Math.max(0, Math.min(100, level));
      if (hasNativeBridge && arinNative) {
        try {
          await arinNative.setVolumePercent(clampedPct);
          return {
            success: true,
            message: clampedPct === 0 ? 'Volume set to 0% (Phone muted).' : `Volume set to ${clampedPct}%.`,
          };
        } catch (err) {
          return { success: false, message: `Failed to set volume: ${err instanceof Error ? err.message : String(err)}` };
        }
      }
      return {
        success: true,
        message: clampedPct === 0 ? 'Volume set to 0% (Phone muted).' : `Volume set to ${clampedPct}% (no native module).`,
      };
    }

    case 'GET_WEATHER': {
      return await fetchWeather(target);
    }

    case 'GET_BATTERY': {
      if (hasNativeBridge && arinNative) {
        try {
          const info = await arinNative.getBatteryStatus();
          return {
            success: true,
            message: `Battery is at ${info.level}%${info.isCharging ? ' (Charging)' : ''}.`,
          };
        } catch (err) {
          return { success: false, message: `Failed to get battery status: ${err instanceof Error ? err.message : String(err)}` };
        }
      }
      return { success: true, message: 'Battery level is 85% (no native module).' };
    }

    default:
      return { success: false, message: `Unknown device command: ${command}` };
  }
}

export interface SpeakResult {
  success: boolean;
  message: string;
}

/**
 * Execute a SPEAK step. For now this has no real TTS — it just returns the
 * text so the caller can print it into chat as an ARIN message. Swap the
 * body of this function for a real TTS call (expo-speech / react-native-tts)
 * later; every call site already treats this as async.
 */
export async function speakText(message: string): Promise<SpeakResult> {
  // TODO(TTS): call a real speech engine here, e.g.:
  //   import * as Speech from 'expo-speech';
  //   await Speech.speak(message);
  return { success: true, message };
}