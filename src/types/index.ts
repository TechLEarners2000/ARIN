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
  backgroundWakeWordEnabled?: boolean;
}

