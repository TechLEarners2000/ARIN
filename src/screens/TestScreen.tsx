import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const presetCommands = [
  'arduino-buzzer',
  'arduino-motor-F',
  'arduino-motor-B',
  'local-"HI"',
  'cloud-"HI"',
  'error-test',
  'builtin-torch-on',
  'builtin-torch-off',
  'cam-on',
  'call-1098712',
  'message-0987654-"hi"',
];

export const TestScreen: React.FC = () => {
  const [customCmd, setCustomCmd] = useState('');
  const { testLogs, addTestLog, sendMessage, themeColors } = useApp();

  const handleRunCommand = (cmd: string) => {
    if (!cmd.trim()) return;
    addTestLog(cmd.trim());
    sendMessage(cmd.trim());
    setCustomCmd('');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={[typography.headlineMd, { color: themeColors.primaryContainer }]}>
        TEST INTERFACE (DEBUG)
      </Text>
      <Text style={[typography.bodyMd, styles.subtitle, { color: themeColors.onSurfaceVariant }]}>
        Raw Command Execution & Payload Inspector
      </Text>

      {/* Preset Command Chips */}
      <View style={styles.chipContainer}>
        <Text style={[typography.labelCaps, styles.sectionHeader, { color: themeColors.onSurfaceVariant }]}>
          PRESET TEST COMMANDS
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {presetCommands.map((cmd) => (
            <TouchableOpacity
              key={cmd}
              style={[
                styles.chip,
                {
                  backgroundColor: themeColors.surfaceContainerHigh,
                  borderColor: themeColors.outlineVariant,
                },
              ]}
              onPress={() => handleRunCommand(cmd)}
              activeOpacity={0.7}
            >
              <Text style={[typography.codeSm, { color: themeColors.primaryContainer }]}>{cmd}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Custom Command Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={[
            typography.codeSm,
            styles.customInput,
            {
              backgroundColor: themeColors.surfaceContainerLow,
              color: themeColors.onSurface,
              borderColor: themeColors.outlineVariant,
            },
          ]}
          value={customCmd}
          onChangeText={setCustomCmd}
          placeholder="Type raw command string..."
          placeholderTextColor={themeColors.onSurfaceVariant}
          onSubmitEditing={() => handleRunCommand(customCmd)}
        />
        <TouchableOpacity
          style={[styles.runBtn, { backgroundColor: themeColors.primaryContainer }]}
          onPress={() => handleRunCommand(customCmd)}
          activeOpacity={0.8}
        >
          <Text style={[typography.labelCaps, { color: themeColors.onPrimary }]}>SEND TEST</Text>
        </TouchableOpacity>
      </View>

      {/* Console Log Area */}
      <View
        style={[
          styles.logBox,
          {
            backgroundColor: themeColors.surfaceContainerLowest,
            borderColor: themeColors.outlineVariant,
          },
        ]}
      >
        <Text style={[typography.labelCaps, styles.logHeader, { color: themeColors.secondary }]}>
          LOG OUTPUT
        </Text>
        <FlatList
          data={testLogs}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Text style={[typography.codeSm, styles.logLine, { color: themeColors.onSurface }]}>
              {item}
            </Text>
          )}
          ListEmptyComponent={
            <Text style={[typography.codeSm, styles.emptyText, { color: themeColors.onSurfaceVariant }]}>
              No test commands sent yet. Select a preset or type a command above.
            </Text>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.containerMargin,
    gap: spacing.md,
  },
  subtitle: {
    marginTop: -spacing.xs,
  },
  sectionHeader: {
    marginBottom: spacing.xs,
  },
  chipContainer: {
    gap: spacing.xs,
  },
  chipScroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  customInput: {
    flex: 1,
    height: 48,
    borderRadius: spacing.borderRadius.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
  },
  runBtn: {
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logBox: {
    flex: 1,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
  },
  logHeader: {
    marginBottom: spacing.sm,
  },
  logLine: {
    marginBottom: spacing.xs,
  },
  emptyText: {
    opacity: 0.5,
  },
});
