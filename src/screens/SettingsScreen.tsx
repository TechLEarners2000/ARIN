import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBadge } from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetOnboarding,
    connectLocalAi,
    connectCloudAi,
    themeMode,
    toggleThemeMode,
    themeColors,
  } = useApp();

  const isConnecting = settings.localAiStatus === 'connecting';
  const isCloudConnecting = settings.cloudStatus === 'connecting';
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[typography.headlineMd, { color: themeColors.primaryContainer }]}>
        SYSTEM CONFIGURATION
      </Text>

      {/* Theme Selection Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColors.surfaceContainerLow,
            borderColor: themeColors.outlineVariant,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[typography.headlineMd, styles.cardTitle, { color: themeColors.onSurface }]}>
            Interface Theme
          </Text>
          <Text style={[typography.labelCaps, { color: themeColors.primaryContainer }]}>
            {themeMode.toUpperCase()} MODE
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[typography.bodyMd, { color: themeColors.onSurface }]}>
            Enable Light Theme
          </Text>
          <Switch
            value={themeMode === 'light'}
            onValueChange={toggleThemeMode}
            trackColor={{
              false: themeColors.surfaceContainerHighest,
              true: themeColors.primaryContainer,
            }}
            thumbColor={themeColors.onPrimary}
          />
        </View>
      </View>

      {/* Local AI Section */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColors.surfaceContainerLow,
            borderColor: themeColors.outlineVariant,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[typography.headlineMd, styles.cardTitle, { color: themeColors.onSurface }]}>
            Local AI Server
          </Text>
          <StatusBadge label={settings.localAiStatus} status={settings.localAiStatus} />
        </View>

        <View style={styles.row}>
          <Text style={[typography.bodyMd, { color: themeColors.onSurface }]}>
            Enable Local AI
          </Text>
          <Switch
            value={settings.localAiEnabled}
            onValueChange={(val) =>
              updateSettings({
                localAiEnabled: val,
                localAiStatus: val ? 'disconnected' : 'disconnected',
              })
            }
            trackColor={{
              false: themeColors.surfaceContainerHighest,
              true: themeColors.primaryContainer,
            }}
            thumbColor={themeColors.onPrimary}
          />
        </View>

        <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.xs }]}>
          SERVER HOST & PORT
        </Text>
        <TextInput
          style={[
            typography.codeSm,
            styles.input,
            {
              backgroundColor: themeColors.surfaceContainerHigh,
              color: themeColors.onSurface,
              borderColor: themeColors.outlineVariant,
            },
          ]}
          value={settings.localAiHost}
          onChangeText={(val) => updateSettings({ localAiHost: val })}
          placeholder="e.g. 192.168.1.100:8000"
          placeholderTextColor={themeColors.onSurfaceVariant}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Test Connection Button */}
        <TouchableOpacity
          style={[
            styles.connectBtn,
            {
              backgroundColor: isConnecting
                ? themeColors.surfaceContainerHighest
                : themeColors.primaryContainer,
            },
          ]}
          onPress={connectLocalAi}
          disabled={isConnecting}
          activeOpacity={0.8}
        >
          <Text
            style={[
              typography.labelCaps,
              { color: isConnecting ? themeColors.onSurfaceVariant : themeColors.onPrimary },
            ]}
          >
            {isConnecting ? '⚡ SCANNING...' : '⚡ TEST CONNECTION'}
          </Text>
        </TouchableOpacity>

        {/* Model Selector */}
        {settings.localAiModels.length > 0 && (
          <>
            <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.sm }]}>
              SELECTED MODEL ({settings.localAiModels.length} AVAILABLE)
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.modelScroll}
            >
              {settings.localAiModels.map((model) => (
                <TouchableOpacity
                  key={model}
                  style={[
                    styles.modelChip,
                    {
                      backgroundColor:
                        settings.selectedModel === model
                          ? themeColors.primaryContainer
                          : themeColors.surfaceContainerHigh,
                      borderColor:
                        settings.selectedModel === model
                          ? themeColors.primaryContainer
                          : themeColors.outlineVariant,
                    },
                  ]}
                  onPress={() => updateSettings({ selectedModel: model })}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      typography.codeSm,
                      {
                        color:
                          settings.selectedModel === model
                            ? themeColors.onPrimary
                            : themeColors.onSurface,
                      },
                    ]}
                  >
                    {model}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* No models message */}
        {settings.localAiStatus === 'connected' && settings.localAiModels.length === 0 && (
          <Text style={[typography.bodyMd, { color: themeColors.onSurfaceVariant }]}>
            No models discovered. Server may not expose /v1/models.
          </Text>
        )}
      </View>

      {/* Cloud Provider Section */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColors.surfaceContainerLow,
            borderColor: themeColors.outlineVariant,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[typography.headlineMd, styles.cardTitle, { color: themeColors.onSurface }]}>
            Cloud AI Provider
          </Text>
          <StatusBadge label={settings.cloudStatus} status={settings.cloudStatus} />
        </View>

        <View style={styles.row}>
          <Text style={[typography.bodyMd, { color: themeColors.onSurface }]}>Enable Cloud AI</Text>
          <Switch
            value={settings.cloudEnabled}
            onValueChange={(val) =>
              updateSettings({
                cloudEnabled: val,
                cloudStatus: val ? settings.cloudStatus : 'disconnected',
              })
            }
            trackColor={{
              false: themeColors.surfaceContainerHighest,
              true: themeColors.primaryContainer,
            }}
            thumbColor={themeColors.onPrimary}
          />
        </View>

        <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.xs }]}>
          PROVIDER LABEL
        </Text>
        <TextInput
          style={[
            typography.codeSm,
            styles.input,
            {
              backgroundColor: themeColors.surfaceContainerHigh,
              color: themeColors.onSurface,
              borderColor: themeColors.outlineVariant,
            },
          ]}
          value={settings.cloudProvider}
          onChangeText={(val) => updateSettings({ cloudProvider: val })}
          placeholder="e.g. OpenRouter, Groq, OpenAI"
          placeholderTextColor={themeColors.onSurfaceVariant}
          autoCapitalize="none"
        />

        <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.xs }]}>
          PROVIDER BASE URL
        </Text>
        <TextInput
          style={[
            typography.codeSm,
            styles.input,
            {
              backgroundColor: themeColors.surfaceContainerHigh,
              color: themeColors.onSurface,
              borderColor: themeColors.outlineVariant,
            },
          ]}
          value={settings.cloudBaseUrl}
          onChangeText={(val) => updateSettings({ cloudBaseUrl: val })}
          placeholder="e.g. https://openrouter.ai/api"
          placeholderTextColor={themeColors.onSurfaceVariant}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />

        <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.xs }]}>
          API KEY
        </Text>
        <View style={styles.apiKeyRow}>
          <TextInput
            style={[
              typography.codeSm,
              styles.input,
              styles.apiKeyInput,
              {
                backgroundColor: themeColors.surfaceContainerHigh,
                color: themeColors.onSurface,
                borderColor: themeColors.outlineVariant,
              },
            ]}
            value={settings.cloudApiKey}
            onChangeText={(val) => updateSettings({ cloudApiKey: val })}
            placeholder="sk-..."
            placeholderTextColor={themeColors.onSurfaceVariant}
            secureTextEntry={!showApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[
              styles.apiKeyToggle,
              {
                backgroundColor: themeColors.surfaceContainerHigh,
                borderColor: themeColors.outlineVariant,
              },
            ]}
            onPress={() => setShowApiKey((prev) => !prev)}
          >
            <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant }]}>
              {showApiKey ? 'HIDE' : 'SHOW'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Test Connection / Fetch Models Button */}
        <TouchableOpacity
          style={[
            styles.connectBtn,
            {
              backgroundColor: isCloudConnecting
                ? themeColors.surfaceContainerHighest
                : themeColors.primaryContainer,
            },
          ]}
          onPress={connectCloudAi}
          disabled={isCloudConnecting || !settings.cloudBaseUrl.trim()}
          activeOpacity={0.8}
        >
          <Text
            style={[
              typography.labelCaps,
              { color: isCloudConnecting ? themeColors.onSurfaceVariant : themeColors.onPrimary },
            ]}
          >
            {isCloudConnecting ? '⚡ FETCHING MODELS...' : '⚡ TEST & FETCH MODELS'}
          </Text>
        </TouchableOpacity>

        {/* Model Selector */}
        {settings.cloudModels.length > 0 && (
          <>
            <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.sm }]}>
              SELECTED MODEL ({settings.cloudModels.length} AVAILABLE)
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.modelScroll}
            >
              {settings.cloudModels.map((model) => (
                <TouchableOpacity
                  key={model}
                  style={[
                    styles.modelChip,
                    {
                      backgroundColor:
                        settings.selectedCloudModel === model
                          ? themeColors.primaryContainer
                          : themeColors.surfaceContainerHigh,
                      borderColor:
                        settings.selectedCloudModel === model
                          ? themeColors.primaryContainer
                          : themeColors.outlineVariant,
                    },
                  ]}
                  onPress={() => updateSettings({ selectedCloudModel: model })}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      typography.codeSm,
                      {
                        color:
                          settings.selectedCloudModel === model
                            ? themeColors.onPrimary
                            : themeColors.onSurface,
                      },
                    ]}
                  >
                    {model}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {settings.cloudStatus === 'connected' && settings.cloudModels.length === 0 && (
          <Text style={[typography.bodyMd, { color: themeColors.onSurfaceVariant }]}>
            No models discovered. Provider may not expose /v1/models.
          </Text>
        )}
      </View>

      {/* Arduino Section */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColors.surfaceContainerLow,
            borderColor: themeColors.outlineVariant,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[typography.headlineMd, styles.cardTitle, { color: themeColors.onSurface }]}>
            Arduino Serial Link
          </Text>
          <StatusBadge label={settings.arduinoStatus} status={settings.arduinoStatus} />
        </View>
        <View style={styles.row}>
          <Text style={[typography.bodyMd, { color: themeColors.onSurface }]}>Arduino Connected</Text>
          <Switch
            value={settings.arduinoConnected}
            onValueChange={(val) =>
              updateSettings({
                arduinoConnected: val,
                arduinoStatus: val ? 'connected' : 'disconnected',
              })
            }
            trackColor={{
              false: themeColors.surfaceContainerHighest,
              true: themeColors.primaryContainer,
            }}
            thumbColor={themeColors.onPrimary}
          />
        </View>
      </View>

      {/* Device Permission Mode */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColors.surfaceContainerLow,
            borderColor: themeColors.outlineVariant,
          },
        ]}
      >
        <Text style={[typography.headlineMd, styles.cardTitle, { color: themeColors.onSurface }]}>
          Device Permission Mode
        </Text>
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              {
                backgroundColor: themeColors.surfaceContainerHigh,
                borderColor:
                  settings.permissionMode === 'compatible'
                    ? themeColors.primaryContainer
                    : themeColors.outlineVariant,
              },
            ]}
            onPress={() => updateSettings({ permissionMode: 'compatible' })}
          >
            <Text
              style={[
                typography.labelCaps,
                {
                  color:
                    settings.permissionMode === 'compatible'
                      ? themeColors.primaryContainer
                      : themeColors.onSurfaceVariant,
                },
              ]}
            >
              Compatible Mode (Modern Phones)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeBtn,
              {
                backgroundColor: themeColors.surfaceContainerHigh,
                borderColor:
                  settings.permissionMode === 'full_control'
                    ? themeColors.primaryContainer
                    : themeColors.outlineVariant,
              },
            ]}
            onPress={() => updateSettings({ permissionMode: 'full_control' })}
          >
            <Text
              style={[
                typography.labelCaps,
                {
                  color:
                    settings.permissionMode === 'full_control'
                      ? themeColors.primaryContainer
                      : themeColors.onSurfaceVariant,
                },
              ]}
            >
              Full Control Mode (Legacy Hardware)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reset Onboarding Option */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColors.surfaceContainerLow,
            borderColor: themeColors.outlineVariant,
          },
        ]}
      >
        <Text style={[typography.headlineMd, styles.cardTitle, { color: themeColors.onSurface }]}>
          Onboarding Wizard
        </Text>
        <TouchableOpacity
          style={[
            styles.resetBtn,
            {
              backgroundColor: themeColors.surfaceContainerHigh,
              borderColor: themeColors.outlineVariant,
            },
          ]}
          onPress={resetOnboarding}
        >
          <Text style={[typography.labelCaps, { color: themeColors.secondary }]}>
            RE-RUN ONBOARDING WIZARD
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.containerMargin,
    gap: spacing.md,
  },
  card: {
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    borderRadius: spacing.borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  apiKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  apiKeyInput: {
    flex: 1,
  },
  apiKeyToggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  connectBtn: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  modelScroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  modelChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  modeContainer: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  modeBtn: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  resetBtn: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
