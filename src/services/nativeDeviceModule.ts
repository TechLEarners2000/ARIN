import { NativeModules, Platform } from 'react-native';

export interface InstalledAppNative {
  label: string;
  packageName: string;
}

export interface BatteryStatusNative {
  level: number;
  isCharging: boolean;
}

interface ArinNativeBridge {
  setTorch(enabled: boolean): Promise<boolean>;
  openCamera(): Promise<boolean>;
  callPhone(number: string): Promise<boolean>;
  sendSms(number: string, message: string): Promise<boolean>;
  getInstalledApps(): Promise<InstalledAppNative[]>;
  getContactNames(): Promise<string[]>;
  launchApp(packageName: string): Promise<boolean>;
  setWifi(enabled: boolean): Promise<string>;
  setBluetooth(enabled: boolean): Promise<string>;
  openSettings(target: string): Promise<boolean>;
  setRingerMode(mode: string): Promise<boolean>;
  adjustVolume(direction: string): Promise<boolean>;
  setVolumePercent(percent: number): Promise<number>;
  getBatteryStatus(): Promise<BatteryStatusNative>;
}

/**
 * Thin wrapper around the ArinNative Kotlin module.
 *
 * On iOS (or if the module failed to register) these resolve as unsupported so
 * the JS deviceService can degrade to Linking/open-URL behavior instead of
 * throwing. On Android we'll get the real native bridge.
 */
export const arinNative: ArinNativeBridge | null =
  Platform.OS === 'android' ? ((NativeModules.ArinNative as ArinNativeBridge) ?? null) : null;

export const hasNativeBridge = arinNative != null;