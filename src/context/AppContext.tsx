import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AiDirective, ARIN_SYSTEM_PROMPT, parseAiDirective, stripWakeWord } from '../services/aiDirective';
import { sendArduinoCommand, onSerialConnect, onSerialDisconnect, queryRobotBuzzerStatus } from '../services/arduinoService';
import { sendDeviceCommand, speakText, stopSpeech } from '../services/deviceService';
import { runPipeline } from '../services/pipelineExecutor';
import { rearmPersistedJobs, scheduleJob } from '../services/schedulerService';
import {
  fetchModels as fetchCloudModelsService,
  sendChatCompletion as sendCloudChatCompletion,
  testConnection as testCloudConnection,
} from '../services/cloudAiService';
import {
  ARIN_MODEL_NAME,
  fetchModels as fetchModelsService,
  initArinModel,
  sendChatCompletion,
  testConnection,
} from '../services/localAiService';
import { darkColors, lightColors, ThemeColors } from '../theme/colors';
import { arinNative, hasNativeBridge, onWakeWordDetected } from '../services/nativeDeviceModule';
import { AppSettings, ChatMessageItem, ExecutionStage, ScreenTab, ThemeMode } from '../types';

const ONBOARDING_KEY = '@arin_onboarding_completed';
const THEME_KEY = '@arin_theme_mode';
const SETTINGS_KEY = '@arin_settings';

interface AppContextType {
  isSplashVisible: boolean;
  finishSplash: () => void;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  themeMode: ThemeMode;
  toggleThemeMode: () => void;
  themeColors: ThemeColors;
  activeTab: ScreenTab;
  setActiveTab: (tab: ScreenTab) => void;
  isControllerOpen: boolean;
  setIsControllerOpen: (open: boolean) => void;
  messages: ChatMessageItem[];
  sendMessage: (text: string) => void;
  addChatMessage: (sender: 'OPERATOR' | 'ARIN' | 'SYSTEM' | 'ERROR', text: string) => void;
  isProcessing: boolean;
  currentStage: ExecutionStage;
  pipelinePath: ExecutionStage[];
  stageErrorMsg: string | null;
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  connectLocalAi: () => Promise<boolean>;
  connectCloudAi: () => Promise<boolean>;
  testLogs: string[];
  addTestLog: (command: string) => void;
  refreshModels: () => Promise<void>;
  refreshCloudModels: () => Promise<void>;
  isSpeaking: boolean;
  stopAudio: () => Promise<void>;
}

const initialSettings: AppSettings = {
  localAiEnabled: false,
  localAiHost: '192.168.1.100:8000',
  localAiStatus: 'disconnected',
  localAiModels: [],
  selectedModel: '',
  cloudEnabled: false,
  cloudProvider: 'Gemini 1.5 Pro',
  cloudBaseUrl: '',
  cloudApiKey: '',
  cloudStatus: 'disconnected',
  cloudModels: [],
  selectedCloudModel: '',
  arduinoConnected: false,
  arduinoStatus: 'disconnected',
  permissionMode: 'compatible',
  preloadedModel: null,
  ttsAutoSpeak: true,
  ttsVoiceGender: 'female',
  backgroundWakeWordEnabled: false,
};

const initialMessages: ChatMessageItem[] = [
  {
    id: '1',
    sender: 'SYSTEM',
    text: '[SYS] Initialization complete.\n[SYS] Neural link established.\n[SYS] ARIN v3.1 ready.',
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    id: '2',
    sender: 'ARIN',
    text: 'ARIN Online. How can I help you today?',
    timestamp: new Date().toLocaleTimeString(),
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [activeTab, setActiveTab] = useState<ScreenTab>('dashboard');
  const [isControllerOpen, setIsControllerOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>(initialMessages);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState<ExecutionStage>('idle');
  const [pipelinePath, setPipelinePath] = useState<ExecutionStage[]>([
    'request_sent',
    'local_processing',
    'response_received',
    'done',
  ]);
  const [stageErrorMsg, setStageErrorMsg] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const stopAudio = async () => {
    await stopSpeech();
    setIsSpeaking(false);
  };

  useEffect(() => {
    const loadSavedState = async () => {
      try {
        const [onboardingVal, themeVal, settingsVal] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_KEY),
          AsyncStorage.getItem(THEME_KEY),
          AsyncStorage.getItem(SETTINGS_KEY),
        ]);
        if (onboardingVal === 'true') {
          setHasCompletedOnboarding(true);
        }
        if (themeVal === 'light' || themeVal === 'dark') {
          setThemeMode(themeVal as ThemeMode);
        }
        if (settingsVal) {
          try {
            setSettings((prev) => ({ ...prev, ...JSON.parse(settingsVal) }));
          } catch {
            // ignore malformed settings
          }
        }
      } catch {
        // error loading state
      }
    };
    loadSavedState();
  }, []);

  useEffect(() => {
    rearmPersistedJobs((directive) => {
      executeDirectiveNow(directive, /* fromScheduler */ true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.arduinoConnected]);

  // USB-OTG serial lifecycle — auto-detect Arduino on plug-in
  useEffect(() => {
    const unsubConnect = onSerialConnect((info) => {
      setSettings((prev) => ({
        ...prev,
        arduinoConnected: true,
        arduinoStatus: 'connected',
      }));
      setTestLogs((prev) => [`[USB] Arduino connected: ${info.name}`, ...prev]);
    });

    const unsubDisconnect = onSerialDisconnect((info) => {
      setSettings((prev) => ({
        ...prev,
        arduinoConnected: false,
        arduinoStatus: 'disconnected',
      }));
      setTestLogs((prev) => [`[USB] Arduino disconnected: ${info.reason || info.error || 'unknown'}`, ...prev]);
    });

    return () => {
      unsubConnect();
      unsubDisconnect();
    };
  }, []);

  // Background Wake Word Service lifecycle
  useEffect(() => {
    if (!hasNativeBridge || !arinNative) return;
    if (settings.backgroundWakeWordEnabled) {
      arinNative.startBackgroundWakeWord().catch(() => {});
      setTestLogs((prev) => ['[BG SERVICE] Started background wake word listener.', ...prev]);
    } else {
      arinNative.stopBackgroundWakeWord().catch(() => {});
      setTestLogs((prev) => ['[BG SERVICE] Stopped background wake word listener.', ...prev]);
    }
  }, [settings.backgroundWakeWordEnabled]);

  // Heartbeat — verify Arduino is alive every 5s while connected
  useEffect(() => {
    if (!settings.arduinoConnected) return;
    const interval = setInterval(async () => {
      try {
        const { arinNative } = require('../services/nativeDeviceModule');
        if (arinNative) {
          const isAlive = await arinNative.isUsbConnected();
          if (!isAlive) {
            setSettings((prev) => ({
              ...prev,
              arduinoConnected: false,
              arduinoStatus: 'disconnected',
            }));
            return;
          }
        }
        await queryRobotBuzzerStatus(true);
      } catch {
        setSettings((prev) => ({
          ...prev,
          arduinoConnected: false,
          arduinoStatus: 'disconnected',
        }));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [settings.arduinoConnected]);

  // Auto-reconnect — poll for USB device every 3s for 30s after disconnect
  useEffect(() => {
    if (settings.arduinoConnected) return;
    const { arinNative } = require('../services/nativeDeviceModule');
    if (!arinNative) return;
    let attempts = 0;
    const maxAttempts = 10;
    const KNOWN_ARDUINO_VIDS = [9025, 6790, 4292, 1027];
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        return;
      }
      try {
        const devices = await arinNative.listUsbDevices();
        if (devices.length > 0) {
          const targetDevice =
            devices.find(
              (d: { vendorId: number; name: string }) =>
                KNOWN_ARDUINO_VIDS.includes(d.vendorId) ||
                /arduino|ch340|cp210|ftdi|usb serial/i.test(d.name)
            ) || devices[0];
          await arinNative.connectUsbSerial(targetDevice.vendorId, targetDevice.productId);
          clearInterval(interval);
        }
      } catch {
        // retry
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [settings.arduinoConnected]);

  const chatHistoryRef = useRef<import('../services/localAiService').ChatMessage[]>([]);

  const finishSplash = () => {
    setIsSplashVisible(false);
  };

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    AsyncStorage.setItem(ONBOARDING_KEY, 'true').catch(() => {});
  };

  const resetOnboarding = () => {
    setHasCompletedOnboarding(false);
    AsyncStorage.removeItem(ONBOARDING_KEY).catch(() => {});
  };

  const toggleThemeMode = () => {
    const nextTheme: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextTheme);
    AsyncStorage.setItem(THEME_KEY, nextTheme).catch(() => {});
  };

  const themeColors = themeMode === 'light' ? lightColors : darkColors;

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const connectLocalAi = useCallback(async (): Promise<boolean> => {
    setSettings((prev) => ({ ...prev, localAiStatus: 'connecting' }));

    let result;
    try {
      result = await testConnection(settings.localAiHost);
    } catch (error: unknown) {
      const rawErr = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      setTestLogs((prev) => [`[CONN] RAW ERROR: ${rawErr}`, ...prev]);
      setSettings((prev) => ({
        ...prev,
        localAiStatus: 'error',
        localAiModels: [],
        selectedModel: '',
      }));
      setStageErrorMsg(`Connection failed: ${rawErr}`);
      return false;
    }

    if (!result.success) {
      setSettings((prev) => ({
        ...prev,
        localAiStatus: 'error',
        localAiModels: [],
        selectedModel: '',
      }));
      setStageErrorMsg(result.message);
      setTestLogs((prev) => [`[CONN] Failed: ${result.message}`, ...prev]);
      return false;
    }

    const modelIds = result.models
      ? result.models.map((m) => m.id)
      : result.serverInfo?.availableModels ?? [];

    setTestLogs((prev) => [
      `[CONN] Discovered ${modelIds.length} model(s): ${modelIds.join(', ') || '(none)'}`,
      ...prev,
    ]);

    setSettings((prev) => {
      const currentSelected = prev.selectedModel;
      const selectedModel =
        modelIds.length > 0
          ? modelIds.includes(currentSelected)
            ? currentSelected
            : modelIds[0]
          : prev.selectedModel;

      return {
        ...prev,
        localAiEnabled: true,
        localAiStatus: 'connected',
        localAiModels: modelIds,
        selectedModel,
      };
    });

    setTestLogs((prev) => [`[CONN] ${result.message}`, ...prev]);
    setStageErrorMsg(null);
    return true;
  }, [settings.localAiHost]);

  const connectCloudAi = useCallback(async (): Promise<boolean> => {
    setSettings((prev) => ({ ...prev, cloudStatus: 'connecting' }));

    let result;
    try {
      result = await testCloudConnection(settings.cloudBaseUrl, settings.cloudApiKey);
    } catch (error: unknown) {
      const rawErr = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      setTestLogs((prev) => [`[CLOUD] RAW ERROR: ${rawErr}`, ...prev]);
      setSettings((prev) => ({
        ...prev,
        cloudStatus: 'error',
        cloudModels: [],
        selectedCloudModel: '',
      }));
      setStageErrorMsg(`Cloud connection failed: ${rawErr}`);
      return false;
    }

    if (!result.success) {
      setSettings((prev) => ({
        ...prev,
        cloudStatus: 'error',
        cloudModels: [],
        selectedCloudModel: '',
      }));
      setStageErrorMsg(result.message);
      setTestLogs((prev) => [`[CLOUD] Failed: ${result.message}`, ...prev]);
      return false;
    }

    const modelIds = (result.models ?? []).map((m) => m.id);

    setTestLogs((prev) => [
      `[CLOUD] Discovered ${modelIds.length} model(s): ${modelIds.join(', ') || '(none)'}`,
      ...prev,
    ]);

    setSettings((prev) => {
      const currentSelected = prev.selectedCloudModel;
      const selectedCloudModel =
        modelIds.length > 0
          ? modelIds.includes(currentSelected)
            ? currentSelected
            : modelIds[0]
          : prev.selectedCloudModel;

      return {
        ...prev,
        cloudEnabled: true,
        cloudStatus: 'connected',
        cloudModels: modelIds,
        selectedCloudModel,
      };
    });

    setTestLogs((prev) => [`[CLOUD] ${result.message}`, ...prev]);
    setStageErrorMsg(null);
    return true;
  }, [settings.cloudBaseUrl, settings.cloudApiKey]);

  const appendError = (errText: string) => {
    setCurrentStage('error');
    setStageErrorMsg(errText);
    const errorMsgItem: ChatMessageItem = {
      id: Date.now().toString(),
      sender: 'ERROR',
      text: errText,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, errorMsgItem]);
    setIsProcessing(false);
  };

  const finishWithReply = (aiText: string) => {
    setCurrentStage('done');
    const aiReply: ChatMessageItem = {
      id: (Date.now() + 1).toString(),
      sender: 'ARIN',
      text: aiText,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, aiReply]);
    setIsProcessing(false);

    if (settings.ttsAutoSpeak) {
      setIsSpeaking(true);
      speakText(aiText, settings.ttsVoiceGender).finally(() => {
        setIsSpeaking(false);
      });
    }

    setTimeout(() => setCurrentStage('idle'), 1500);
  };

  /**
   * Shared executor for a single directive, used by both the immediate
   * sendMessage path and the scheduler-fired path. Handles pipelines, and the
   * respond/speak/arduino/device/cloud branches.
   */
  const executeDirectiveNow = async (directive: AiDirective, fromScheduler = false) => {
    if (fromScheduler) {
      setIsProcessing(true);
      setStageErrorMsg(null);
    }

    // Build the visual pipeline dynamically from the directive contents.
    const path: ExecutionStage[] = ['request_sent', 'local_processing'];
    if (directive.action === 'cloud') {
      path.push('cloud_processing');
    }
    if (directive.action === 'arduino') {
      path.push('arduino_executing');
    }
    if (directive.action === 'device') {
      path.push('device_executing');
    }
    if (directive.action === 'speak') {
      path.push('speaking');
    }
    if (directive.action === 'pipeline') {
      path.push('pipeline_executing');
    }
    path.push('response_received', 'done');
    setPipelinePath(path);
    setCurrentStage(
      directive.action === 'cloud'
        ? 'cloud_processing'
        : directive.action === 'arduino'
        ? 'arduino_executing'
        : directive.action === 'device'
        ? 'device_executing'
        : directive.action === 'speak'
        ? 'speaking'
        : directive.action === 'pipeline'
        ? 'pipeline_executing'
        : 'response_received'
    );

    if (directive.action === 'pipeline') {
      setTestLogs((prev) => [
        `[EXEC] Pipeline: ${directive.steps.length} step(s)${directive.reason ? ` (${directive.reason})` : ''}`,
        ...prev,
      ]);
      const result = await runPipeline(directive.steps, settings, (line) =>
        setTestLogs((prev) => [line, ...prev])
      );
      finishWithReply(result.finalText || (result.stoppedEarly ? 'Pipeline stopped.' : 'Pipeline complete.'));
      return;
    }

    if (directive.action === 'create_rule') {
      const ruleName = directive.rule?.name || 'Automation Rule';
      setTestLogs((prev) => [`[RULE] Received rule directive: "${ruleName}"`, ...prev]);
      finishWithReply(directive.response || `Received rule: "${ruleName}".`);
      return;
    }

    if (directive.action === 'respond') {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 250));
      setTestLogs((prev) => [`[SYS] Local AI responded directly.`, ...prev]);
      finishWithReply(directive.response);
      return;
    }

    if (directive.action === 'speak') {
      const r = await speakText(directive.message);
      setTestLogs((prev) => [`[SPEAK] ${r.message}`, ...prev]);
      finishWithReply(r.message);
      return;
    }

    if (directive.action === 'arduino') {
      setTestLogs((prev) => [
        `[EXEC] Arduino command: ${directive.command}${directive.reason ? ` (${directive.reason})` : ''}`,
        ...prev,
      ]);
      const result = await sendArduinoCommand(directive.command, settings.arduinoConnected);
      setCurrentStage('response_received');
      setTestLogs((prev) => [`[ARDUINO] ${result.message}`, ...prev]);
      finishWithReply(result.message);
      return;
    }

    if (directive.action === 'device') {
      setTestLogs((prev) => [
        `[EXEC] Device command: ${directive.command}${directive.target ? ` target="${directive.target}"` : ''}${directive.message ? ` message="${directive.message}"` : ''}${directive.reason ? ` (${directive.reason})` : ''}`,
        ...prev,
      ]);
      const result = await sendDeviceCommand(
        directive.command,
        directive.target,
        directive.message,
        settings.permissionMode
      );
      setCurrentStage('response_received');
      setTestLogs((prev) => [`[DEVICE] ${result.message}`, ...prev]);
      finishWithReply(result.message);
      return;
    }

    // directive.action === 'cloud'
    setTestLogs((prev) => [
      `[SYS] Local AI delegated to cloud: "${directive.prompt}"${directive.reason ? ` (${directive.reason})` : ''}`,
      ...prev,
    ]);
    const cloudReady = settings.cloudEnabled && settings.cloudStatus === 'connected';
    if (!cloudReady) {
      appendError('[ERR 502] Local AI requested cloud AI, but cloud is not connected. Set it up in SETUP.');
      return;
    }
    if (!settings.selectedCloudModel) {
      appendError('[ERR 412] Local AI requested cloud AI, but no cloud model is selected.');
      return;
    }
    const cloudResponse = await sendCloudChatCompletion(
      settings.cloudBaseUrl,
      settings.cloudApiKey,
      settings.selectedCloudModel,
      [{ role: 'user', content: directive.prompt }]
    );
    const cloudText =
      cloudResponse.choices?.[0]?.message?.content?.trim() ??
      '[ERR] Empty response received from cloud AI.';
    setCurrentStage('response_received');
    setTestLogs((prev) => [`[CLOUD] Responded via "${settings.selectedCloudModel}"`, ...prev]);
    finishWithReply(cloudText);
  };

  const sendMessage = async (text: string) => {
    const userMsg: ChatMessageItem = {
      id: Date.now().toString(),
      sender: 'OPERATOR',
      text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);
    setStageErrorMsg(null);
    setPipelinePath(['request_sent', 'local_processing', 'response_received', 'done']);
    setCurrentStage('request_sent');

    // Check for Wake Word "hey arin"
    const { hasWakeWord, cleanedText } = stripWakeWord(text);
    if (hasWakeWord) {
      setTestLogs((prev) => [`[WAKE WORD] Wake word "hey arin" detected. Processing: "${cleanedText}"`, ...prev]);
    }
    const promptText = cleanedText;

    // Deliberate small delay for stage visibility
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 300));
    setCurrentStage('local_processing');

    const localReady = settings.localAiEnabled && settings.localAiStatus === 'connected';

    // Local AI is primary and drives all routing decisions.
    if (!localReady) {
      if (!settings.localAiEnabled) {
        appendError('[ERR 503] Local AI is disabled. Enable it in SETUP — it drives all routing.');
      } else {
        appendError('[ERR 404] Local AI server not connected. Run test connection in SETUP.');
      }
      return;
    }
    if (!settings.selectedModel) {
      appendError('[ERR 412] No local AI model selected.');
      return;
    }

    try {
      // Always start chat context with ARIN_SYSTEM_PROMPT at position 0, followed by history & prompt
      const outgoingMessages = [
        { role: 'system' as const, content: ARIN_SYSTEM_PROMPT },
        ...chatHistoryRef.current.slice(-10),
        { role: 'user' as const, content: promptText },
      ];
      const localResponse = await sendChatCompletion(
        settings.localAiHost,
        settings.selectedModel,
        outgoingMessages
      );

      const rawText = localResponse.choices?.[0]?.message?.content ?? '';

      // Save turn to conversation history
      chatHistoryRef.current.push({ role: 'user', content: promptText });
      chatHistoryRef.current.push({ role: 'assistant', content: rawText });

      const directive = parseAiDirective(rawText);

      // A top-level "schedule" defers the whole directive to the scheduler.
      if (directive.schedule) {
        const fireAt = new Date(directive.schedule);
        if (isNaN(fireAt.getTime())) {
          appendError(`[ERR 400] AI returned an unparseable schedule time: "${directive.schedule}".`);
          return;
        }
        await scheduleJob(directive, fireAt.toISOString(), (d) => executeDirectiveNow(d, true));
        setTestLogs((prev) => [`[SCHED] Job queued for ${fireAt.toLocaleString()}.`, ...prev]);
        finishWithReply(`Got it — scheduled for ${fireAt.toLocaleString()}.`);
        return;
      }

      // No schedule → run it immediately through the shared executor.
      await executeDirectiveNow(directive);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      appendError(`[ERR 500] ${errMsg}`);
    }
  };

  useEffect(() => {
    const unsub = onWakeWordDetected((transcript) => {
      setTestLogs((prev) => [`[BG VOICE] Heard: "${transcript}"`, ...prev]);
      sendMessage(transcript);
    });
    return () => unsub();
  }, [sendMessage]);

  const addChatMessage = useCallback((sender: 'OPERATOR' | 'ARIN' | 'SYSTEM' | 'ERROR', text: string) => {
    const item: ChatMessageItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
      sender,
      text,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, item]);
  }, []);

  const addTestLog = (command: string) => {
    setTestLogs((prev) => [`[TEST] Command received: ${command}`, ...prev]);
  };

  const refreshModels = async () => {
    try {
      const models = await fetchModelsService(settings.localAiHost);
      const ids = models.map((m) => m.id);
      updateSettings({ localAiModels: ids });
      if (ids.length > 0 && !ids.includes(settings.selectedModel)) {
        updateSettings({ selectedModel: ids[0] });
      }
    } catch {
      // model refresh failed, ignore
    }
  };

  const refreshCloudModels = async () => {
    try {
      const models = await fetchCloudModelsService(settings.cloudBaseUrl, settings.cloudApiKey);
      const ids = models.map((m) => m.id);
      updateSettings({ cloudModels: ids });
      if (ids.length > 0 && !ids.includes(settings.selectedCloudModel)) {
        updateSettings({ selectedCloudModel: ids[0] });
      }
    } catch {
      // model refresh failed, ignore
    }
  };

  return (
    <AppContext.Provider
      value={{
        isSplashVisible,
        finishSplash,
        hasCompletedOnboarding,
        completeOnboarding,
        resetOnboarding,
        themeMode,
        toggleThemeMode,
        themeColors,
        activeTab,
        setActiveTab,
        isControllerOpen,
        setIsControllerOpen,
        messages,
        sendMessage,
        addChatMessage,
        isProcessing,
        currentStage,
        pipelinePath,
        stageErrorMsg,
        settings,
        updateSettings,
        connectLocalAi,
        connectCloudAi,
        testLogs,
        addTestLog,
        refreshModels,
        refreshCloudModels,
        isSpeaking,
        stopAudio,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
