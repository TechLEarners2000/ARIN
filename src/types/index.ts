export type ScreenTab = 'dashboard' | 'test-interface' | 'settings';

export type ConnectionState = 'connected' | 'disconnected' | 'connecting' | 'error';

export type ThemeMode = 'dark' | 'light';

export type ExecutionStage =
  | 'idle'
  | 'request_sent'
  | 'local_processing'
  | 'cloud_processing'
  | 'arduino_executing'
  | 'device_executing'
  | 'speaking'
  | 'pipeline_executing'
  | 'response_received'
  | 'done'
  | 'error';

export interface ChatMessageItem {
  id: string;
  sender: 'ARIN' | 'OPERATOR' | 'SYSTEM' | 'ERROR';
  text: string;
  timestamp: string;
}

export interface AppSettings {
  localAiEnabled: boolean;
  localAiHost: string;
  localAiStatus: ConnectionState;
  localAiModels: string[];
  selectedModel: string;
  cloudEnabled: boolean;
  cloudProvider: string;
  cloudBaseUrl: string;
  cloudApiKey: string;
  cloudStatus: ConnectionState;
  cloudModels: string[];
  selectedCloudModel: string;
  arduinoConnected: boolean;
  arduinoStatus: ConnectionState;
  permissionMode: 'full_control' | 'compatible';
  /** Name of the preloaded Ollama model (prompt baked in) — empty when not initialized. */
  preloadedModel: string | null;
  ttsAutoSpeak: boolean;
  ttsVoiceGender: 'female' | 'male';
}

// ---------------- Automation Engine Types ----------------

export interface RuleTriggerLocation {
  type: 'location';
  lat: number;
  lng: number;
  radiusMeters: number;
  event: 'enter' | 'exit';
  locationName?: string;
}

export interface RuleTriggerTime {
  type: 'time';
  cron?: string;
  hour?: number;
  minute?: number;
  repeat: 'daily' | 'once';
}

export interface RuleTriggerBattery {
  type: 'battery';
  threshold: number;
  direction: 'below' | 'above' | 'equals';
}

export interface RuleTriggerManual {
  type: 'manual';
}

export interface RuleTriggerDeviceState {
  type: 'device_state';
  deviceFeature: 'torch' | 'wifi' | 'bluetooth' | 'ringer';
  state: 'on' | 'off' | 'silent' | 'normal' | 'vibrate';
}

export type RuleTrigger =
  | RuleTriggerLocation
  | RuleTriggerTime
  | RuleTriggerBattery
  | RuleTriggerDeviceState
  | RuleTriggerManual;

export type RuleAction =
  | { type: 'wifi_toggle'; state: 'on' | 'off' }
  | { type: 'bluetooth_toggle'; state: 'on' | 'off' }
  | { type: 'torch_toggle'; state: 'on' | 'off' }
  | { type: 'battery_saver'; state: 'on' | 'off' }
  | { type: 'notification'; title: string; body: string }
  | { type: 'read_calendar' }
  | { type: 'sms'; to: string; bodyTemplate: string }
  | { type: 'robot_command'; command: string };

export interface Rule {
  id: string;
  name: string;
  trigger: RuleTrigger;
  actions: RuleAction[];
  enabled: boolean;
  lastTriggeredAt: string | null;
  cooldownMs: number;
  latchedState?: boolean;
}

