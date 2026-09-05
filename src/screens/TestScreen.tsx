import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { sendArduinoCommand, sendArduinoSpeedCommand, onSerialData } from '../services/arduinoService';
import { executeShortcutCommand } from '../services/commandShortcutService';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const TestScreen: React.FC = () => {
  const { sendMessage, addChatMessage, settings, themeColors, testLogs, addTestLog } = useApp();

  const [manualInput, setManualInput] = useState<string>('');
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  // Listen to raw incoming serial data from Arduino
  useEffect(() => {
    const unsub = onSerialData((line) => {
      const trimmed = line.trim();
      if (trimmed && trimmed !== 'READY') {
        addTestLog(`[SERIAL_rx] ${trimmed}`);
      }
    });
    return () => unsub();
  }, [addTestLog]);

  // Manual Command / Query Execution
  const handleExecuteInput = useCallback(async () => {
    const raw = manualInput.trim();
    if (!raw) return;
    setManualInput('');

    addTestLog(`[EXEC_input] "${raw}"`);

    // Check if input matches short codes like flash_on, mv_for:200, fwd:200, stop, led_on, etc.
    const scResult = await executeShortcutCommand(raw, settings.arduinoConnected);
    if (scResult.isShortcut) {
      addTestLog(`[DIRECT_cmd] ${scResult.commandExecuted}: ${scResult.message}`);
      // Log input and response directly into ARIN Chat history
      addChatMessage('OPERATOR', raw);
      addChatMessage('ARIN', scResult.message);
      return;
    }

    const upper = raw.toUpperCase();
    if (['MOVE_FORWARD', 'MOVE_BACKWARD', 'TURN_LEFT', 'TURN_RIGHT', 'STOP', 'LED_ON', 'LED_OFF', 'BUZZER_PING'].includes(upper)) {
      const res = await sendArduinoCommand(upper as any, settings.arduinoConnected);
      addTestLog(`[ROBOT_mv] ${upper}: ${res.message}`);
      addChatMessage('OPERATOR', raw);
      addChatMessage('ARIN', res.message);
    } else {
      // Direct text AI query on same device
      sendMessage(raw);
    }
  }, [manualInput, settings.arduinoConnected, sendMessage, addChatMessage, addTestLog]);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleRow}>
          <Text style={[typography.headlineMd, { color: themeColors.primaryContainer }]}>
            SYSTEM LOG CONSOLE
          </Text>
          <View style={[styles.logBadge, { backgroundColor: themeColors.surfaceContainerHigh }]}>
            <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, fontSize: 10 }]}>
              {testLogs.length} LOGS
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.infoIconBtn} onPress={() => setShowInfoModal(true)}>
          <Text style={{ fontSize: 20 }}>ℹ️</Text>
        </TouchableOpacity>
      </View>

      {/* TELEMETRY METRICS SUMMARY BAR */}
      <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xs }}>
        <View style={{ flex: 1, padding: 8, borderRadius: 8, backgroundColor: themeColors.surfaceContainerLow, borderWidth: 1, borderColor: themeColors.outlineVariant, alignItems: 'center' }}>
          <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, fontSize: 9 }]}>ULTRASONIC DIST</Text>
          <Text style={[typography.headlineMedium, { color: themeColors.tertiaryContainer, fontSize: 16 }]}>42 CM</Text>
        </View>
        <View style={{ flex: 1, padding: 8, borderRadius: 8, backgroundColor: themeColors.surfaceContainerLow, borderWidth: 1, borderColor: themeColors.outlineVariant, alignItems: 'center' }}>
          <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, fontSize: 9 }]}>MOTOR SPEED</Text>
          <Text style={[typography.headlineMedium, { color: themeColors.primaryContainer, fontSize: 16 }]}>200 PWM</Text>
        </View>
        <View style={{ flex: 1, padding: 8, borderRadius: 8, backgroundColor: themeColors.surfaceContainerLow, borderWidth: 1, borderColor: themeColors.outlineVariant, alignItems: 'center' }}>
          <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, fontSize: 9 }]}>SERIAL BAUD</Text>
          <Text style={[typography.headlineMedium, { color: themeColors.secondary, fontSize: 16 }]}>115200</Text>
        </View>
      </View>

      {/* FULLSCREEN REAL-TIME LOG STREAM WINDOW */}
      <View style={[styles.logConsoleWindow, { backgroundColor: themeColors.surfaceContainerLow, borderColor: themeColors.outlineVariant }]}>
        {testLogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[typography.bodyMd, { color: themeColors.onSurfaceVariant, textAlign: 'center' }]}>
              No log entries yet. Drive the robot, speak to AI, or execute commands below to view live logs.
            </Text>
          </View>
        ) : (
          <FlatList
            data={testLogs}
            keyExtractor={(_, index) => index.toString()}
            style={styles.logList}
            contentContainerStyle={styles.logListContent}
            renderItem={({ item }) => (
              <View style={styles.logLineRow}>
                <Text
                  style={[
                    typography.codeSm,
                    {
                      fontSize: 11,
                      lineHeight: 16,
                      color: item.includes('[AI_query]') || item.includes('OPERATOR')
                        ? themeColors.secondary
                        : item.includes('[AI_response]') || item.includes('ARIN')
                        ? themeColors.primaryContainer
                        : item.includes('[ROBOT_mv]') || item.includes('MOVE')
                        ? '#00f990'
                        : item.includes('[SERIAL_rx]') || item.includes('USB')
                        ? themeColors.onSurfaceVariant
                        : item.includes('ERR') || item.includes('ERROR')
                        ? themeColors.error
                        : themeColors.onSurface,
                    },
                  ]}
                >
                  {item}
                </Text>
              </View>
            )}
          />
        )}
      </View>

      {/* BOTTOM MANUAL COMMAND EXECUTION INPUT BAR */}
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.hudInput,
            { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant },
          ]}
          value={manualInput}
          onChangeText={setManualInput}
          placeholder="Type command (e.g. MOVE_FORWARD, STOP, LED_ON) or text..."
          placeholderTextColor={themeColors.onSurfaceVariant}
          onSubmitEditing={handleExecuteInput}
        />
        <TouchableOpacity style={[styles.execBtn, { backgroundColor: themeColors.primaryContainer }]} onPress={handleExecuteInput}>
          <Text style={[typography.labelCaps, { color: themeColors.onPrimaryContainer, fontWeight: 'bold' }]}>EXECUTE</Text>
        </TouchableOpacity>
      </View>

      {/* COMMAND INFO CHEAT-SHEET MODAL */}
      <Modal visible={showInfoModal} transparent animationType="fade" onRequestClose={() => setShowInfoModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.infoModalCard, { backgroundColor: themeColors.surfaceContainerLow, borderColor: themeColors.primaryContainer }]}>
            <View style={styles.headerRow}>
              <Text style={[typography.headlineMd, { color: themeColors.primaryContainer, fontSize: 16 }]}>
                ℹ️ ROBOT COMMAND CHEAT-SHEET
              </Text>
              <TouchableOpacity onPress={() => setShowInfoModal(false)}>
                <Text style={{ color: themeColors.onSurface, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: spacing.xs, marginVertical: spacing.sm }}>
              <Text style={[typography.bodyMd, { color: themeColors.onSurface, fontWeight: 'bold' }]}>Direct Short Commands:</Text>
              <Text style={[typography.codeSm, { color: themeColors.onSurfaceVariant }]}>• flash_on / flash_off (Phone Flashlight)</Text>
              <Text style={[typography.codeSm, { color: themeColors.onSurfaceVariant }]}>• mv_for:200 / fwd:200 / fwd</Text>
              <Text style={[typography.codeSm, { color: themeColors.onSurfaceVariant }]}>• mv_back:200 / back:200 / back</Text>
              <Text style={[typography.codeSm, { color: themeColors.onSurfaceVariant }]}>• turn_left:200 / left:200 / left</Text>
              <Text style={[typography.codeSm, { color: themeColors.onSurfaceVariant }]}>• turn_right:200 / right:200 / right</Text>
              <Text style={[typography.codeSm, { color: themeColors.onSurfaceVariant }]}>• stop / led_on / led_off / beep:300 / dist</Text>

              <Text style={[typography.bodyMd, { color: themeColors.onSurface, fontWeight: 'bold', marginTop: spacing.xs }]}>AI Natural Language Queries:</Text>
              <Text style={[typography.codeSm, { color: themeColors.onSurfaceVariant }]}>• "Move forward 2 seconds", "Turn left", "Pivot right"</Text>
              <Text style={[typography.codeSm, { color: themeColors.onSurfaceVariant }]}>• "Turn on flashlight", "Sound the horn"</Text>
            </View>

            <TouchableOpacity style={[styles.execBtn, { backgroundColor: themeColors.primaryContainer, alignSelf: 'flex-end' }]} onPress={() => setShowInfoModal(false)}>
              <Text style={[typography.labelCaps, { color: themeColors.onPrimaryContainer }]}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.sm,
  },
  infoIconBtn: {
    padding: 4,
  },
  logConsoleWindow: {
    flex: 1,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    padding: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logList: {
    flex: 1,
  },
  logListContent: {
    paddingVertical: spacing.xs,
  },
  logLineRow: {
    paddingVertical: 2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  hudInput: {
    flex: 1,
    height: 44,
    borderRadius: spacing.borderRadius.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    fontSize: 13,
  },
  execBtn: {
    paddingHorizontal: spacing.lg,
    height: 44,
    borderRadius: spacing.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  infoModalCard: {
    width: '90%',
    maxWidth: 420,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1.5,
  },
});
