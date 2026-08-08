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
  { label: 'Vol 100%', cmd: 'Set volume to 100%' },
  { label: 'Mute (0%)', cmd: 'Mute phone' },
  { label: 'Weather Tokyo', cmd: 'What is the weather in Tokyo?' },
  { label: 'Spotify App Info', cmd: 'Open Spotify app info' },
  { label: 'Battery %', cmd: 'Check battery level' },
  { label: 'Wi-Fi On', cmd: 'Turn on wifi' },
  { label: 'Bluetooth Off', cmd: 'Turn off bluetooth' },
  { label: 'Open Settings', cmd: 'Open settings' },
  { label: 'Flash On', cmd: 'Turn on the flash' },
  { label: 'Flash Off', cmd: 'Turn off the flash' },
  { label: 'Camera', cmd: 'Open camera' },
  { label: 'Call 1345', cmd: 'Call 1345' },
  { label: 'SMS 2343', cmd: 'Message 2343 hi' },
  { label: 'WhatsApp Jay', cmd: 'Send hi to Jay via whatsapp' },
  { label: 'Open Spotify', cmd: 'Open Spotify' },
  { label: 'Move Forward', cmd: 'Move forward' },
  { label: 'Robot Buzzer', cmd: 'Buzzer ping' },
];

const commandSyntaxes = [
  { category: 'Device & Audio', syntax: 'Set volume to 100% | Mute phone | Volume up / down' },
  { category: 'Weather API', syntax: 'What is the weather in [City]?' },
  { category: 'App Info Settings', syntax: 'Open [AppName] app info | Open [wifi/bluetooth/nfc/battery/etc] settings' },
  { category: 'Connectivity', syntax: 'Turn on/off wifi | Turn on/off bluetooth' },
  { category: 'Hardware & Phone', syntax: 'Turn on/off the flash | Open camera | Check battery level' },
  { category: 'Calls & SMS', syntax: 'Call [Name/Number] | Message [Number] [Text] | Send [Text] to [Name] via whatsapp' },
  { category: 'App Launch', syntax: 'Open [AppName]' },
  { category: 'Arduino Hardware', syntax: 'Move forward/backward | Turn left/right | Stop | LED on/off | Buzzer ping' },
  { category: 'AI Questions', syntax: 'What is a [definition]? (Local) | What is today\'s [live data]? (Cloud)' },
];

export const TestScreen: React.FC = () => {
  const [customCmd, setCustomCmd] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const { testLogs, addTestLog, sendMessage, themeColors } = useApp();

  const handleRunCommand = (cmd: string) => {
    if (!cmd.trim()) return;
    addTestLog(cmd.trim());
    sendMessage(cmd.trim());
    setCustomCmd('');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerTitles}>
          <Text style={[typography.headlineMd, { color: themeColors.primaryContainer }]}>
            TEST INTERFACE (DEBUG)
          </Text>
          <Text style={[typography.bodyMd, styles.subtitle, { color: themeColors.onSurfaceVariant }]}>
            Raw Command Execution & Payload Inspector
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.guideToggleBtn, { backgroundColor: themeColors.surfaceContainerHigh, borderColor: themeColors.outlineVariant }]}
          onPress={() => setShowGuide((prev) => !prev)}
        >
          <Text style={[typography.labelCaps, { color: themeColors.primaryContainer }]}>
            {showGuide ? 'HIDE SYNTAX' : 'SYNTAX GUIDE'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Command Syntax Guide Reference */}
      {showGuide && (
        <View style={[styles.guideBox, { backgroundColor: themeColors.surfaceContainerLow, borderColor: themeColors.outlineVariant }]}>
          <Text style={[typography.labelCaps, styles.guideTitle, { color: themeColors.primaryContainer }]}>
            COMMAND SYNTAX REFERENCE
          </Text>
          <ScrollView style={styles.guideScroll} nestedScrollEnabled>
            {commandSyntaxes.map((item) => (
              <View key={item.category} style={styles.guideRow}>
                <Text style={[typography.labelCaps, { color: themeColors.secondary }]}>{item.category}:</Text>
                <Text style={[typography.codeSm, { color: themeColors.onSurface }]}>{item.syntax}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Preset Command Chips */}
      <View style={styles.chipContainer}>
        <Text style={[typography.labelCaps, styles.sectionHeader, { color: themeColors.onSurfaceVariant }]}>
          PRESET TEST COMMANDS
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {presetCommands.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.chip,
                {
                  backgroundColor: themeColors.surfaceContainerHigh,
                  borderColor: themeColors.outlineVariant,
                },
              ]}
              onPress={() => handleRunCommand(item.cmd)}
              activeOpacity={0.7}
            >
              <Text style={[typography.codeSm, { color: themeColors.primaryContainer }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Custom Direct Command Input Box */}
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
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitles: {
    flex: 1,
  },
  subtitle: {
    marginTop: -spacing.xs,
  },
  guideToggleBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  guideBox: {
    maxHeight: 140,
    padding: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  guideTitle: {
    marginBottom: spacing.xs,
  },
  guideScroll: {
    flex: 1,
  },
  guideRow: {
    marginBottom: spacing.xs,
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
