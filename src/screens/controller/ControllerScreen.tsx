import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  GestureResponderEvent,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { sendArduinoCommand, sendArduinoSpeedCommand, getDistanceCm } from '../../services/arduinoService';
import { startVoiceInput, stopVoiceInput } from '../../services/deviceService';
import { arinNative, onDeviceTilt, TiltData } from '../../services/nativeDeviceModule';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface ControllerScreenProps {
  onClose?: () => void;
}

export const ControllerScreen: React.FC<ControllerScreenProps> = ({ onClose }) => {
  const { themeColors, settings, sendMessage, isProcessing, setActiveTab, testLogs, addTestLog } = useApp();

  // Telemetry & State
  const [speed, setSpeed] = useState<number>(200);
  const [distance, setDistance] = useState<number | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceText, setVoiceText] = useState<string>('');
  const [activeDirection, setActiveDirection] = useState<string | null>(null);
  const [ledOn, setLedOn] = useState<boolean>(false);

  // Pedals state
  const [isGasPressed, setIsGasPressed] = useState<boolean>(false);
  const [isBrakePressed, setIsBrakePressed] = useState<boolean>(false);
  const isGasPressedRef = useRef<boolean>(false);
  const isBrakePressedRef = useRef<boolean>(false);
  isGasPressedRef.current = isGasPressed;
  isBrakePressedRef.current = isBrakePressed;

  // Brake hold reverse state
  const brakeHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isReversing, setIsReversing] = useState<boolean>(false);
  const isReversingRef = useRef<boolean>(false);
  isReversingRef.current = isReversing;

  // Phone tilt motion telemetry
  const [tiltData, setTiltData] = useState<TiltData>({ pitch: 0, roll: 0, ax: 0, ay: 0, az: 0 });
  const tiltRollRef = useRef<number>(0);
  const speedRef = useRef<number>(speed);
  speedRef.current = speed;

  const micPulse = useRef(new Animated.Value(1)).current;
  const wheelAnim = useRef(new Animated.Value(0)).current;

  // Fullscreen Immersive & Landscape on mount
  useEffect(() => {
    if (arinNative) {
      arinNative.setScreenOrientation(true).catch(() => {});
      arinNative.setFullscreenImmersive(true).catch(() => {});
      arinNative.startTiltSensor().catch(() => {});
    }
    return () => {
      if (arinNative) {
        arinNative.setFullscreenImmersive(false).catch(() => {});
        arinNative.setScreenOrientation(false).catch(() => {});
        arinNative.stopTiltSensor().catch(() => {});
      }
    };
  }, []);

  // Continuous tilt processing
  useEffect(() => {
    let lastSentDir: string | null = null;

    const unsub = onDeviceTilt((data) => {
      setTiltData(data);
      tiltRollRef.current = data.roll;

      // Realistic smooth spring animation for steering wheel rotation
      const targetRotation = Math.max(-45, Math.min(45, data.roll * 1.1));
      Animated.spring(wheelAnim, {
        toValue: targetRotation,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }).start();

      const STEER_RIGHT = 14;
      const STEER_LEFT = -14;

      let currentSteer: 'FWD' | 'LEFT' | 'RIGHT' = 'FWD';
      if (data.roll > STEER_RIGHT) {
        currentSteer = 'RIGHT';
      } else if (data.roll < STEER_LEFT) {
        currentSteer = 'LEFT';
      }

      const curSpeed = speedRef.current;

      if (isGasPressedRef.current) {
        if (currentSteer !== lastSentDir) {
          lastSentDir = currentSteer;
          setActiveDirection(currentSteer);
          addTestLog(`[ROBOT_mv] ${currentSteer} (spd:${curSpeed})`);
          sendArduinoSpeedCommand(currentSteer, curSpeed, settings.arduinoConnected).catch(() => {});
        }
      } else if (isReversingRef.current) {
        if (lastSentDir !== 'BACK') {
          lastSentDir = 'BACK';
          setActiveDirection('BACK');
          addTestLog(`[ROBOT_mv] BACK [REVERSE] (spd:${curSpeed})`);
          sendArduinoSpeedCommand('BACK', curSpeed, settings.arduinoConnected).catch(() => {});
        }
      } else {
        if (lastSentDir !== null && lastSentDir !== 'STOP') {
          lastSentDir = 'STOP';
          setActiveDirection(null);
        }
      }
    });

    return () => {
      unsub();
    };
  }, [settings.arduinoConnected, addTestLog]);

  // Distance poller
  useEffect(() => {
    if (!settings.arduinoConnected) {
      setDistance(null);
      return;
    }
    const interval = setInterval(async () => {
      try {
        const d = await getDistanceCm(settings.arduinoConnected);
        if (d >= 0) setDistance(d);
      } catch {
        // ignore
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [settings.arduinoConnected]);

  // Pulse animation for mic
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(micPulse, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(micPulse, { toValue: 1.0, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      micPulse.setValue(1);
    }
  }, [isListening, micPulse]);

  // --- GAS PEDAL DYNAMIC SPEED (Top=255, Center=190, Bottom=130) ---
  const calcSpeedFromTouchY = (locationY: number, height: number): number => {
    if (height <= 0) return 200;
    const ratio = Math.max(0, Math.min(1, locationY / height));
    // Top (ratio ~0) -> 255 MAX; Bottom (ratio ~1) -> 130 LOW
    const calc = Math.round(255 - ratio * (255 - 130));
    return Math.max(120, Math.min(255, calc));
  };

  const handleGasTouchStart = (evt: GestureResponderEvent) => {
    const { locationY } = evt.nativeEvent;
    // Assume pedal height ~180px
    const dynamicSpeed = calcSpeedFromTouchY(locationY, 180);
    setSpeed(dynamicSpeed);
    speedRef.current = dynamicSpeed;

    setIsGasPressed(true);
    const roll = tiltRollRef.current;
    const steerDir = roll > 14 ? 'RIGHT' : roll < -14 ? 'LEFT' : 'FWD';
    setActiveDirection(steerDir);
    addTestLog(`[ROBOT_mv] ${steerDir} (spd:${dynamicSpeed})`);
    sendArduinoSpeedCommand(steerDir, dynamicSpeed, settings.arduinoConnected).catch(() => {});
  };

  const handleGasTouchMove = (evt: GestureResponderEvent) => {
    if (!isGasPressedRef.current) return;
    const { locationY } = evt.nativeEvent;
    const dynamicSpeed = calcSpeedFromTouchY(locationY, 180);
    if (Math.abs(dynamicSpeed - speedRef.current) > 15) {
      setSpeed(dynamicSpeed);
      speedRef.current = dynamicSpeed;
      const roll = tiltRollRef.current;
      const steerDir = roll > 14 ? 'RIGHT' : roll < -14 ? 'LEFT' : 'FWD';
      sendArduinoSpeedCommand(steerDir, dynamicSpeed, settings.arduinoConnected).catch(() => {});
    }
  };

  const handleGasTouchEnd = () => {
    setIsGasPressed(false);
    setActiveDirection(null);
    addTestLog('[ROBOT_mv] STOP');
    sendArduinoCommand('STOP', settings.arduinoConnected).catch(() => {});
  };

  // --- BRAKE PEDAL HANDLERS ---
  const handleBrakePressIn = useCallback(() => {
    setIsBrakePressed(true);
    addTestLog('[ROBOT_mv] BRAKE (STOP)');
    sendArduinoCommand('STOP', settings.arduinoConnected).catch(() => {});

    brakeHoldTimerRef.current = setTimeout(() => {
      if (isBrakePressedRef.current) {
        setIsReversing(true);
        setActiveDirection('BACK');
        addTestLog(`[ROBOT_mv] BACK [REVERSE] (spd:${speedRef.current})`);
        sendArduinoSpeedCommand('BACK', speedRef.current, settings.arduinoConnected).catch(() => {});
      }
    }, 250);
  }, [settings.arduinoConnected, addTestLog]);

  const handleBrakePressOut = useCallback(() => {
    setIsBrakePressed(false);
    setIsReversing(false);
    if (brakeHoldTimerRef.current) {
      clearTimeout(brakeHoldTimerRef.current);
      brakeHoldTimerRef.current = null;
    }
    setActiveDirection(null);
    addTestLog('[ROBOT_mv] STOP');
    sendArduinoCommand('STOP', settings.arduinoConnected).catch(() => {});
  }, [settings.arduinoConnected, addTestLog]);

  // Quick Action Handlers
  const handleHorn = useCallback(async () => {
    addTestLog('[SYS] Horn sounded');
    await sendArduinoCommand('BUZZER_PING', settings.arduinoConnected);
  }, [settings.arduinoConnected, addTestLog]);

  const handlePlayMusic = useCallback(async () => {
    addTestLog('[SYS] Playing music on phone speaker');
    if (arinNative) {
      await arinNative.playPhoneMusic();
    }
  }, [addTestLog]);

  const handleToggleLed = useCallback(async () => {
    const nextState = !ledOn;
    setLedOn(nextState);
    addTestLog(`[SYS] Phone Flashlight (Torch) ${nextState ? 'ON' : 'OFF'}`);
    if (arinNative) {
      await arinNative.setTorch(nextState).catch(() => {});
    }
    await sendArduinoCommand(nextState ? 'LED_ON' : 'LED_OFF', settings.arduinoConnected);
  }, [ledOn, settings.arduinoConnected, addTestLog]);

  // Voice Mic Handler
  const handleMicPress = useCallback(async () => {
    if (isListening) {
      await stopVoiceInput();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setVoiceText('Listening...');
    addTestLog('[AI_query] Voice STT listening...');
    const result = await startVoiceInput();
    setIsListening(false);

    if (result.success && result.text) {
      setVoiceText(`"${result.text}"`);
      addTestLog(`[AI_query] ${result.text}`);
      sendMessage(result.text);
    } else if (result.error) {
      setVoiceText(`Error: ${result.error}`);
      addTestLog(`[SYS] STT Error: ${result.error}`);
    } else {
      setVoiceText('');
    }
  }, [isListening, sendMessage, addTestLog]);

  const handleOpenTestScreen = useCallback(() => {
    if (onClose) onClose();
    setActiveTab('test-interface');
  }, [onClose, setActiveTab]);

  const isConnected = settings.arduinoConnected;
  const wheelSpin = wheelAnim.interpolate({
    inputRange: [-180, 180],
    outputRange: ['-180deg', '180deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar hidden />

      {/* Top Telemetry Dashboard Bar */}
      <View style={[styles.topBar, { backgroundColor: themeColors.surfaceContainerLow, borderColor: themeColors.outlineVariant }]}>
        {onClose && (
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={[styles.closeIcon, { color: themeColors.onSurface }]}>✕</Text>
            <Text style={[typography.caption, { color: themeColors.onSurface }]}>EXIT</Text>
          </TouchableOpacity>
        )}

        <View style={styles.badgeRow}>
          <View style={[styles.dot, { backgroundColor: isConnected ? '#00f990' : themeColors.error }]} />
          <Text style={[typography.labelCaps, { color: themeColors.onSurface }]}>
            {isConnected ? 'LINKED' : 'DISCONNECTED'}
          </Text>
        </View>

        <View style={styles.badgeRow}>
          <Text style={[typography.caption, { color: themeColors.onSurfaceVariant }]}>RANGE: </Text>
          <Text style={[typography.labelCaps, { color: distance !== null && distance < 20 ? themeColors.error : themeColors.primaryContainer }]}>
            {distance !== null ? `${distance}cm` : '---'}
          </Text>
        </View>

        <View style={styles.badgeRow}>
          <Text style={[typography.caption, { color: themeColors.onSurfaceVariant }]}>PWR: </Text>
          <Text style={[typography.labelCaps, { color: themeColors.secondary }]}>
            {speed} PWM
          </Text>
        </View>

        {/* Test Mode Switch Button */}
        <TouchableOpacity
          style={[styles.testHudBtn, { backgroundColor: themeColors.primaryContainer }]}
          onPress={handleOpenTestScreen}
        >
          <Text style={[typography.labelCaps, { color: themeColors.onPrimaryContainer, fontWeight: 'bold' }]}>
            🧪 TEST MODE LOGS
          </Text>
        </TouchableOpacity>
      </View>

      {/* SUB-TOP TOOLBAR: Horn, Light (Flash), Mic, Music */}
      <View style={[styles.subTopToolbar, { backgroundColor: themeColors.surfaceContainerLow, borderColor: themeColors.outlineVariant }]}>
        <TouchableOpacity style={[styles.toolbarBtn, { backgroundColor: themeColors.surfaceContainerHigh }]} onPress={handleHorn}>
          <Text style={{ fontSize: 18 }}>📢</Text>
          <Text style={[typography.labelCaps, { color: themeColors.onSurface, fontSize: 10 }]}>HORN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolbarBtn, { backgroundColor: ledOn ? themeColors.tertiaryContainer : themeColors.surfaceContainerHigh }]}
          onPress={handleToggleLed}
        >
          <Text style={{ fontSize: 18 }}>{ledOn ? '💡' : '🔦'}</Text>
          <Text style={[typography.labelCaps, { color: themeColors.onSurface, fontSize: 10 }]}>{ledOn ? 'LIGHT ON' : 'LIGHT OFF'}</Text>
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ scale: micPulse }] }}>
          <TouchableOpacity
            style={[styles.toolbarMicBtn, { backgroundColor: isListening ? themeColors.error : themeColors.primaryContainer }]}
            onPress={handleMicPress}
          >
            <Text style={{ fontSize: 18 }}>{isListening ? '🎙️' : '🎤'}</Text>
            <Text style={[typography.labelCaps, { color: themeColors.onPrimaryContainer, fontSize: 10 }]}>AI MIC</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity style={[styles.toolbarBtn, { backgroundColor: themeColors.surfaceContainerHigh }]} onPress={handlePlayMusic}>
          <Text style={{ fontSize: 18 }}>🎵</Text>
          <Text style={[typography.labelCaps, { color: themeColors.onSurface, fontSize: 10 }]}>MUSIC</Text>
        </TouchableOpacity>
      </View>

      {/* Main Racing Cockpit Body */}
      <View style={styles.cockpitRow}>
        {/* LEFT SIDE: WIDER BRAKE PEDAL (Brake & Hold to Reverse) */}
        <View style={styles.pedalCol}>
          <TouchableOpacity
            style={[
              styles.pedal,
              styles.brakePedal,
              {
                backgroundColor: isReversing
                  ? themeColors.errorContainer
                  : isBrakePressed
                  ? '#b3261e'
                  : themeColors.surfaceContainerHigh,
                borderColor: isBrakePressed ? themeColors.error : themeColors.outline,
              },
            ]}
            onPressIn={handleBrakePressIn}
            onPressOut={handleBrakePressOut}
            activeOpacity={0.8}
          >
            <Text style={styles.pedalIcon}>🛑</Text>
            <Text style={[typography.labelCaps, { color: isBrakePressed ? '#ffffff' : themeColors.onSurface, fontSize: 18, fontWeight: 'bold' }]}>
              {isReversing ? 'REVERSE' : 'BRAKE'}
            </Text>
            <Text style={[typography.caption, { color: themeColors.onSurfaceVariant, fontSize: 10, marginTop: 4 }]}>
              HOLD REVERSE
            </Text>
          </TouchableOpacity>
        </View>

        {/* CENTER AREA: ENLARGED DYNAMIC ROTATING STEERING WHEEL */}
        <View style={styles.steeringCol}>
          <View style={styles.steeringFrame}>
            <Animated.View
              style={[
                styles.wheelOuter,
                {
                  borderColor: activeDirection ? themeColors.primaryContainer : themeColors.outline,
                  transform: [{ rotate: wheelSpin }],
                },
              ]}
            >
              <View style={styles.wheelSpokeHoriz} />
              <View style={styles.wheelSpokeVert} />

              <TouchableOpacity style={styles.wheelHub} onPress={handleHorn} activeOpacity={0.7}>
                <Text style={{ fontSize: 32 }}>📢</Text>
                <Text style={[typography.caption, { color: '#ffffff', fontSize: 10, fontWeight: 'bold' }]}>HORN</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* RIGHT SIDE: WIDER DYNAMIC TOUCH-SPEED ACCELERATE PEDAL */}
        <View style={styles.pedalCol}>
          <View
            style={[
              styles.pedal,
              styles.gasPedal,
              {
                backgroundColor: isGasPressed ? themeColors.primaryContainer : themeColors.surfaceContainerHigh,
                borderColor: isGasPressed ? themeColors.primary : themeColors.outline,
              },
            ]}
            onTouchStart={handleGasTouchStart}
            onTouchMove={handleGasTouchMove}
            onTouchEnd={handleGasTouchEnd}
          >
            {/* Speed indicator inside pedal bar */}
            <View style={styles.pedalSpeedBar}>
              <Text style={[typography.labelCaps, { fontSize: 9, color: themeColors.primaryContainer }]}>MAX (255)</Text>
              <Text style={[typography.labelCaps, { fontSize: 9, color: themeColors.onSurfaceVariant }]}>MID (190)</Text>
              <Text style={[typography.labelCaps, { fontSize: 9, color: themeColors.onSurfaceVariant }]}>LOW (130)</Text>
            </View>

            <Text style={styles.pedalIcon}>⚡</Text>
            <Text style={[typography.labelCaps, { color: isGasPressed ? themeColors.onPrimaryContainer : themeColors.onSurface, fontSize: 18, fontWeight: 'bold' }]}>
              GAS
            </Text>
            <Text style={[typography.caption, { color: themeColors.onSurfaceVariant, fontSize: 10, marginTop: 2 }]}>
              TOUCH SPEED
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    marginBottom: 4,
  },
  closeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  closeIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  testHudBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: spacing.borderRadius.sm,
  },
  subTopToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    marginBottom: 6,
  },
  toolbarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: spacing.borderRadius.sm,
  },
  toolbarMicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: spacing.borderRadius.sm,
  },
  cockpitRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  pedalCol: {
    width: 145,
    height: '95%',
    justifyContent: 'center',
  },
  pedal: {
    flex: 1,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    position: 'relative',
  },
  brakePedal: {
    borderLeftWidth: 5,
  },
  gasPedal: {
    borderRightWidth: 5,
  },
  pedalSpeedBar: {
    position: 'absolute',
    left: 6,
    top: 8,
    bottom: 8,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pedalIcon: {
    fontSize: 32,
  },
  steeringCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  steeringFrame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  wheelSpokeHoriz: {
    position: 'absolute',
    width: '100%',
    height: 12,
    backgroundColor: '#555',
  },
  wheelSpokeVert: {
    position: 'absolute',
    width: 12,
    height: '100%',
    backgroundColor: '#555',
  },
  wheelHub: {
    width: 85,
    height: 85,
    borderRadius: 43,
    backgroundColor: '#222',
    borderWidth: 4,
    borderColor: '#777',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
