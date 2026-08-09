import { NativeModules, Platform } from 'react-native';

export interface InstalledAppNative {
  label: string;
  packageName: string;
}

export interface BatteryStatusNative {
  level: number;
  isCharging: boolean;
}

export interface UsbDeviceInfo {
  name: string;
  address: string;
  vendorId: number;
  productId: number;
  deviceClass: number;
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
  showNotification(title: string, body: string): Promise<boolean>;
  speak(text: string, gender?: string): Promise<boolean>;
  stopSpeaking(): Promise<boolean>;
  startListening(): Promise<string>;
  stopListening(): Promise<boolean>;
  // USB-OTG Serial
  listUsbDevices(): Promise<UsbDeviceInfo[]>;
  connectUsbSerial(vendorId: number, productId: number): Promise<boolean>;
  disconnectUsbSerial(): Promise<boolean>;
  writeSerial(data: string): Promise<boolean>;
  isUsbConnected(): Promise<boolean>;
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