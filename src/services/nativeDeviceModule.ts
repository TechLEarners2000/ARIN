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
  // Background Wake Word Service
  startBackgroundWakeWord(): Promise<boolean>;
  stopBackgroundWakeWord(): Promise<boolean>;
  isBackgroundWakeWordActive(): Promise<boolean>;
  // Tilt Sensor & Orientation & Immersive & Music
  setScreenOrientation(landscape: boolean): Promise<boolean>;
  setFullscreenImmersive(enable: boolean): Promise<boolean>;
  startTiltSensor(): Promise<boolean>;
  stopTiltSensor(): Promise<boolean>;
  playPhoneMusic(): Promise<boolean>;
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

/** Subscribe to background wake word events ("WakeWordDetected"). */
export function onWakeWordDetected(handler: (transcript: string) => void): () => void {
  if (Platform.OS !== 'android' || !NativeModules.ArinNative) return () => {};
  const { NativeEventEmitter } = require('react-native');
  const emitter = new NativeEventEmitter(NativeModules.ArinNative);
  const sub = emitter.addListener('WakeWordDetected', (transcript: string) => {
    handler(transcript);
  });
  return () => sub.remove();
}

export interface TiltData {
  pitch: number;
  roll: number;
  ax: number;
  ay: number;
  az: number;
}

/** Subscribe to accelerometer tilt events ("DeviceTilt"). */
export function onDeviceTilt(handler: (data: TiltData) => void): () => void {
  if (Platform.OS !== 'android' || !NativeModules.ArinNative) return () => {};
  const { NativeEventEmitter } = require('react-native');
  const emitter = new NativeEventEmitter(NativeModules.ArinNative);
  const sub = emitter.addListener('DeviceTilt', (data: TiltData) => {
    handler(data);
  });
  return () => sub.remove();
}