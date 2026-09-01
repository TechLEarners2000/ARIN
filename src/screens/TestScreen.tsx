import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { deleteRule, readRules, saveRule, toggleRuleEnabled } from '../services/ruleStorage';
import { executeRuleManually } from '../services/triggerMonitors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Rule, RuleAction, RuleTrigger } from '../types';

type TestCommandType =
  | 'TORCH_ON'
  | 'TORCH_OFF'
  | 'WIFI_ON'
  | 'WIFI_OFF'
  | 'BLUETOOTH_ON'
  | 'BLUETOOTH_OFF'
  | 'CAMERA_OPEN'
  | 'CALL'
  | 'SMS'
  | 'WHATSAPP'
  | 'OPEN_APP'
  | 'OPEN_SETTINGS'
  | 'VOLUME_UP'
  | 'VOLUME_DOWN'
  | 'SET_VOLUME'
  | 'MUTE_SOUND'
  | 'UNMUTE_SOUND'
  | 'GET_BATTERY'
  | 'GET_WEATHER'
  | 'MOVE_FORWARD'
  | 'MOVE_BACKWARD'
  | 'TURN_LEFT'
  | 'TURN_RIGHT'
  | 'STOP'
  | 'LED_ON'
  | 'LED_OFF'
  | 'BUZZER_PING';

export const TestScreen: React.FC = () => {
  const { sendMessage, settings, themeColors, addTestLog } = useApp();

  // Command Tester State
  const [selectedCommand, setSelectedCommand] = useState<TestCommandType>('TORCH_ON');
  const [targetVal, setTargetVal] = useState('1345');
  const [messageVal, setMessageVal] = useState('hi');
  const [volumeLevel, setVolumeLevel] = useState('100');
  const [weatherCity, setWeatherCity] = useState('Tokyo');

  // Live Rules State
  const [rules, setRules] = useState<Rule[]>([]);
  const [showRuleModal, setShowRuleModal] = useState(false);

  // Rule Builder Form State
  const [ruleName, setRuleName] = useState('');
  const [ruleTriggerType, setRuleTriggerType] = useState<'battery' | 'time' | 'device_state' | 'manual'>('battery');
  const [ruleBatteryThresh, setRuleBatteryThresh] = useState('56');
  const [ruleHour, setRuleHour] = useState('08');
  const [ruleMinute, setRuleMinute] = useState('00');
  const [ruleDeviceFeature, setRuleDeviceFeature] = useState<'torch' | 'wifi' | 'bluetooth'>('torch');
  const [ruleDeviceStateVal, setRuleDeviceStateVal] = useState<'on' | 'off'>('on');
  const [ruleActionType, setRuleActionType] = useState<'sms' | 'wifi_toggle' | 'robot_command' | 'notification'>('sms');
  const [ruleSmsTo, setRuleSmsTo] = useState('26543');
  const [ruleSmsBody, setRuleSmsBody] = useState('Time: {{time}} | Buzzer: {{buzzerStatus}} | Bat: {{battery}}');
  const [ruleWifiState, setRuleWifiState] = useState<'on' | 'off'>('on');
  const [ruleRobotCmd, setRuleRobotCmd] = useState('GET_STATUS');

  // Permissions
  const [smsPerm, setSmsPerm] = useState(false);

  const loadRules = async () => {
    const list = await readRules();
    setRules(list);
  };

  useEffect(() => {
    loadRules();
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS !== 'android') return;
    try {
      const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.SEND_SMS);
      setSmsPerm(granted);
    } catch {
      // ignore
    }
  };

  const requestSmsPermission = async () => {
    if (Platform.OS !== 'android') return;
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.SEND_SMS);
      setSmsPerm(granted === PermissionsAndroid.RESULTS.GRANTED);
    } catch {
      // ignore
    }
  };

  // Run direct command from tester
  const handleExecuteCommand = () => {
    let commandString = '';
    switch (selectedCommand) {
      case 'TORCH_ON':
        commandString = 'Turn on the flash';
        break;
      case 'TORCH_OFF':
        commandString = 'Turn off the flash';
        break;
      case 'WIFI_ON':
        commandString = 'Turn on wifi';
        break;
      case 'WIFI_OFF':
        commandString = 'Turn off wifi';
        break;
      case 'BLUETOOTH_ON':
        commandString = 'Turn on bluetooth';
        break;
      case 'BLUETOOTH_OFF':
        commandString = 'Turn off bluetooth';
        break;
      case 'CAMERA_OPEN':
        commandString = 'Open camera';
        break;
      case 'CALL':
        commandString = `Call ${targetVal.trim() || '1345'}`;
        break;
      case 'SMS':
        commandString = `Message ${targetVal.trim() || '2343'} ${messageVal.trim() || 'hi'}`;
        break;
      case 'WHATSAPP':
        commandString = `Send WhatsApp message to ${targetVal.trim() || '1234567890'} ${messageVal.trim() || 'hi'}`;
        break;
      case 'OPEN_APP':
        commandString = `Open ${targetVal.trim() || 'Spotify'}`;
        break;
      case 'OPEN_SETTINGS':
        commandString = `Open ${targetVal.trim() || 'Spotify'} app info`;
        break;
      case 'VOLUME_UP':
        commandString = 'Turn volume up';
        break;
      case 'VOLUME_DOWN':
        commandString = 'Turn volume down';
        break;
      case 'SET_VOLUME':
        commandString = `Set volume to ${volumeLevel}%`;
        break;
      case 'MUTE_SOUND':
        commandString = 'Mute phone';
        break;
      case 'UNMUTE_SOUND':
        commandString = 'Unmute phone';
        break;
      case 'GET_BATTERY':
        commandString = 'Check battery level';
        break;
      case 'GET_WEATHER':
        commandString = `What is the weather in ${weatherCity.trim() || 'Tokyo'}?`;
        break;
      case 'MOVE_FORWARD':
        commandString = 'Move forward';
        break;
      case 'MOVE_BACKWARD':
        commandString = 'Move backward';
        break;
      case 'TURN_LEFT':
        commandString = 'Turn left';
        break;
      case 'TURN_RIGHT':
        commandString = 'Turn right';
        break;
      case 'STOP':
        commandString = 'Stop';
        break;
      case 'LED_ON':
        commandString = 'Turn on robot led';
        break;
      case 'LED_OFF':
        commandString = 'Turn off robot led';
        break;
      case 'BUZZER_PING':
        commandString = 'Sound the buzzer';
        break;
    }

    if (commandString) {
      addTestLog(commandString);
      sendMessage(commandString);
    }
  };

  // Live Rules Actions
  const handleRunRuleNow = async (id: string) => {
    addTestLog(`[RULE] Executing rule ${id}`);
    await executeRuleManually(id, {
      isArduinoConnected: settings.arduinoConnected,
      onLog: (msg) => addTestLog(msg),
    });
    await loadRules();
  };

  const handleDeleteRule = async (id: string) => {
    const updated = await deleteRule(id);
    setRules(updated);
  };

  const handleToggleRule = async (id: string, enabled: boolean) => {
    const updated = await toggleRuleEnabled(id, enabled);
    setRules(updated);
  };

  const addReferencePresetRule = async () => {
    const refRule: Rule = {
      id: `rule_${Date.now()}`,
      name: 'Battery 56% → SMS to 26543 with Buzzer Status',
      trigger: {
        type: 'battery',
        threshold: 56,
        direction: 'below',
      },
      actions: [
        { type: 'robot_command', command: 'GET_STATUS' },
        {
          type: 'sms',
          to: '26543',
          bodyTemplate: 'Time: {{time}} | Buzzer: {{buzzerStatus}}',
        },
      ],
      enabled: true,
      lastTriggeredAt: null,
      cooldownMs: 300000,
    };
    const updated = await saveRule(refRule);
    setRules(updated);
    Alert.alert('Preset Added', 'Reference rule (Battery 56% → SMS 26543) added.');
  };

  const handleSaveCustomRule = async () => {
    if (!ruleName.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for the rule.');
      return;
    }

    let trig: RuleTrigger;
    if (ruleTriggerType === 'battery') {
      trig = {
        type: 'battery',
        threshold: parseInt(ruleBatteryThresh, 10) || 50,
        direction: 'below',
      };
    } else if (ruleTriggerType === 'time') {
      trig = {
        type: 'time',
        hour: parseInt(ruleHour, 10) || 8,
        minute: parseInt(ruleMinute, 10) || 0,
        repeat: 'daily',
      };
    } else if (ruleTriggerType === 'device_state') {
      trig = {
        type: 'device_state',
        deviceFeature: ruleDeviceFeature,
        state: ruleDeviceStateVal,
      };
    } else {
      trig = { type: 'manual' };
    }

    let act: RuleAction;
    if (ruleActionType === 'sms') {
      act = {
        type: 'sms',
        to: ruleSmsTo.trim() || '26543',
        bodyTemplate: ruleSmsBody.trim() || 'Time: {{time}} | Buzzer: {{buzzerStatus}}',
      };
    } else if (ruleActionType === 'wifi_toggle') {
      act = { type: 'wifi_toggle', state: ruleWifiState };
    } else if (ruleActionType === 'robot_command') {
      act = { type: 'robot_command', command: ruleRobotCmd.trim() || 'GET_STATUS' };
    } else {
      act = {
        type: 'notification',
        title: 'ARIN Automation',
        body: 'Automation rule executed.',
      };
    }

    const newRule: Rule = {
      id: `rule_${Date.now()}`,
      name: ruleName.trim(),
      trigger: trig,
      actions: [act],
      enabled: true,
      lastTriggeredAt: null,
      cooldownMs: 60000,
    };

    const updated = await saveRule(newRule);
    setRules(updated);
    setShowRuleModal(false);
    setRuleName('');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[typography.headlineMd, { color: themeColors.primaryContainer }]}>
        COMMAND TESTER & LIVE RULES
      </Text>

      {/* Permission Status */}
      {!smsPerm && Platform.OS === 'android' && (
        <View style={[styles.permBanner, { backgroundColor: themeColors.surfaceContainerLow, borderColor: themeColors.outlineVariant }]}>
          <Text style={[typography.bodyMd, { color: themeColors.onSurface }]}>
            SMS Permission is required for rule SMS actions.
          </Text>
          <TouchableOpacity onPress={requestSmsPermission}>
            <Text style={[typography.labelCaps, { color: themeColors.primaryContainer }]}>GRANT PERMISSION</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SECTION 1: COMMAND DROP DOWN / SELECTOR */}
      <View style={[styles.card, { backgroundColor: themeColors.surfaceContainerLow, borderColor: themeColors.outlineVariant }]}>
        <Text style={[typography.labelCaps, { color: themeColors.primaryContainer }]}>
          SELECT TEST COMMAND
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {(
            [
              'TORCH_ON',
              'TORCH_OFF',
              'WIFI_ON',
              'WIFI_OFF',
              'BLUETOOTH_ON',
              'BLUETOOTH_OFF',
              'CAMERA_OPEN',
              'CALL',
              'SMS',
              'WHATSAPP',
              'OPEN_APP',
              'OPEN_SETTINGS',
              'VOLUME_UP',
              'VOLUME_DOWN',
              'SET_VOLUME',
              'MUTE_SOUND',
              'UNMUTE_SOUND',
              'GET_BATTERY',
              'GET_WEATHER',
              'MOVE_FORWARD',
              'MOVE_BACKWARD',
              'TURN_LEFT',
              'TURN_RIGHT',
              'STOP',
              'LED_ON',
              'LED_OFF',
              'BUZZER_PING',
            ] as const
          ).map((cmd) => (
            <TouchableOpacity
              key={cmd}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    selectedCommand === cmd
                      ? themeColors.primaryContainer
                      : themeColors.surfaceContainerHigh,
                },
              ]}
              onPress={() => setSelectedCommand(cmd)}
            >
              <Text
                style={[
                  typography.labelCaps,
                  { color: selectedCommand === cmd ? themeColors.onPrimary : themeColors.onSurface },
                ]}
              >
                {cmd}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* DYNAMIC PARAMETER CONTROLS BASED ON SELECTED COMMAND */}
        <View style={styles.paramBox}>
          {(selectedCommand === 'CALL' || selectedCommand === 'OPEN_APP' || selectedCommand === 'OPEN_SETTINGS') && (
            <View style={styles.inputGroup}>
              <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant }]}>
                TARGET ({selectedCommand === 'CALL' ? 'PHONE NUMBER / CONTACT' : 'APP OR SETTING NAME'})
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                value={targetVal}
                onChangeText={setTargetVal}
              />
            </View>
          )}

          {(selectedCommand === 'SMS' || selectedCommand === 'WHATSAPP') && (
            <View style={styles.inputGroup}>
              <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant }]}>TARGET NUMBER / CONTACT</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                value={targetVal}
                onChangeText={setTargetVal}
                keyboardType="phone-pad"
              />
              <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.xs }]}>MESSAGE TEXT</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                value={messageVal}
                onChangeText={setMessageVal}
              />
            </View>
          )}

          {selectedCommand === 'SET_VOLUME' && (
            <View style={styles.inputGroup}>
              <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant }]}>VOLUME PERCENTAGE (0-100)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                value={volumeLevel}
                onChangeText={setVolumeLevel}
                keyboardType="number-pad"
              />
            </View>
          )}

          {selectedCommand === 'GET_WEATHER' && (
            <View style={styles.inputGroup}>
              <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant }]}>CITY NAME</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                value={weatherCity}
                onChangeText={setWeatherCity}
              />
            </View>
          )}

          {[
            'TORCH_ON',
            'TORCH_OFF',
            'WIFI_ON',
            'WIFI_OFF',
            'BLUETOOTH_ON',
            'BLUETOOTH_OFF',
            'CAMERA_OPEN',
            'VOLUME_UP',
            'VOLUME_DOWN',
            'MUTE_SOUND',
            'UNMUTE_SOUND',
            'GET_BATTERY',
            'MOVE_FORWARD',
            'MOVE_BACKWARD',
            'TURN_LEFT',
            'TURN_RIGHT',
            'STOP',
            'LED_ON',
            'LED_OFF',
            'BUZZER_PING',
          ].includes(selectedCommand) && (
            <Text style={[typography.bodyMd, { color: themeColors.onSurfaceVariant }]}>
              Executes direct command <Text style={{ color: themeColors.primaryContainer, fontWeight: 'bold' }}>{selectedCommand}</Text> instantly.
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.execBtn, { backgroundColor: themeColors.primaryContainer }]}
          onPress={handleExecuteCommand}
        >
          <Text style={[typography.labelCaps, { color: themeColors.onPrimary }]}>
            ⚡ RUN TEST COMMAND ({selectedCommand})
          </Text>
        </TouchableOpacity>
      </View>

      {/* SECTION 2: LIVE RULES MANAGEMENT */}
      <View style={styles.rulesSectionHeader}>
        <Text style={[typography.labelCaps, { color: themeColors.primaryContainer }]}>
          LIVE AUTOMATION RULES ({rules.length})
        </Text>
        <TouchableOpacity
          style={[styles.createRuleBtn, { backgroundColor: themeColors.surfaceContainerHigh, borderColor: themeColors.outlineVariant }]}
          onPress={() => setShowRuleModal(true)}
        >
          <Text style={[typography.labelCaps, { color: themeColors.primaryContainer }]}>+ NEW RULE</Text>
        </TouchableOpacity>
      </View>

      {/* PRESET QUICK ADD */}
      <TouchableOpacity
        style={[styles.presetBtn, { backgroundColor: themeColors.surfaceContainerLow, borderColor: themeColors.primaryContainer }]}
        onPress={addReferencePresetRule}
      >
        <Text style={[typography.labelCaps, { color: themeColors.primaryContainer }]}>
          ⚡ QUICK ADD PRESET: Battery 56% → SMS 26543 (with Buzzer Status)
        </Text>
      </TouchableOpacity>

      {/* LIVE RULES LIST */}
      {rules.length === 0 ? (
        <View style={[styles.card, { backgroundColor: themeColors.surfaceContainerLow, borderColor: themeColors.outlineVariant }]}>
          <Text style={[typography.bodyMd, { color: themeColors.onSurfaceVariant }]}>
            No live rules active. Tap "+ NEW RULE" or "QUICK ADD PRESET" to add one.
          </Text>
        </View>
      ) : (
        rules.map((rule) => (
          <View
            key={rule.id}
            style={[
              styles.card,
              {
                backgroundColor: themeColors.surfaceContainerLow,
                borderColor: rule.enabled ? themeColors.primaryContainer : themeColors.outlineVariant,
              },
            ]}
          >
            <View style={styles.ruleTopRow}>
              <Text style={[typography.headlineMd, styles.ruleTitle, { color: themeColors.onSurface }]}>
                {rule.name}
              </Text>
              <Switch
                value={rule.enabled}
                onValueChange={(val) => handleToggleRule(rule.id, val)}
                trackColor={{
                  false: themeColors.surfaceContainerHighest,
                  true: themeColors.primaryContainer,
                }}
                thumbColor={themeColors.onPrimary}
              />
            </View>

            <Text style={[typography.codeSm, { color: themeColors.onSurfaceVariant }]}>
              Trigger: {rule.trigger.type.toUpperCase()} | Actions: {rule.actions.map((a) => a.type.toUpperCase()).join(', ')}
            </Text>

            <Text style={[typography.codeSm, { color: themeColors.onSurfaceVariant }]}>
              Last Fired: {rule.lastTriggeredAt ? new Date(rule.lastTriggeredAt).toLocaleTimeString() : 'Never'}
            </Text>

            {/* LIVE RULE ACTION BUTTONS: RUN NOW & DELETE */}
            <View style={styles.ruleBtnRow}>
              <TouchableOpacity
                style={[styles.ruleActionBtn, { backgroundColor: themeColors.primaryContainer }]}
                onPress={() => handleRunRuleNow(rule.id)}
              >
                <Text style={[typography.labelCaps, { color: themeColors.onPrimary }]}>RUN NOW</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ruleDeleteBtn, { backgroundColor: themeColors.surfaceContainerHigh, borderColor: themeColors.outlineVariant }]}
                onPress={() => handleDeleteRule(rule.id)}
              >
                <Text style={[typography.labelCaps, { color: themeColors.error }]}>DELETE</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* RULE CREATION MODAL */}
      <Modal visible={showRuleModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.surfaceContainerLow }]}>
            <Text style={[typography.headlineMd, { color: themeColors.primaryContainer }]}>
              CREATE AUTOMATION RULE
            </Text>

            <ScrollView contentContainerStyle={styles.formScroll}>
              <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant }]}>RULE NAME</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                value={ruleName}
                onChangeText={setRuleName}
                placeholder="e.g. Battery 50% SMS Alert"
                placeholderTextColor={themeColors.onSurfaceVariant}
              />

              <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.sm }]}>TRIGGER TYPE</Text>
              <View style={styles.chipRow}>
                {(['battery', 'time', 'device_state', 'manual'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, { backgroundColor: ruleTriggerType === t ? themeColors.primaryContainer : themeColors.surfaceContainerHigh }]}
                    onPress={() => setRuleTriggerType(t)}
                  >
                    <Text style={[typography.labelCaps, { color: ruleTriggerType === t ? themeColors.onPrimary : themeColors.onSurface }]}>
                      {t.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {ruleTriggerType === 'device_state' && (
                <>
                  <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.xs }]}>FEATURE & STATE</Text>
                  <View style={styles.chipRow}>
                    {(['torch', 'wifi', 'bluetooth'] as const).map((f) => (
                      <TouchableOpacity
                        key={f}
                        style={[styles.chip, { backgroundColor: ruleDeviceFeature === f ? themeColors.primaryContainer : themeColors.surfaceContainerHigh }]}
                        onPress={() => setRuleDeviceFeature(f)}
                      >
                        <Text style={[typography.labelCaps, { color: ruleDeviceFeature === f ? themeColors.onPrimary : themeColors.onSurface }]}>
                          {f.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.chipRow}>
                    {(['on', 'off'] as const).map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.chip, { backgroundColor: ruleDeviceStateVal === s ? themeColors.primaryContainer : themeColors.surfaceContainerHigh }]}
                        onPress={() => setRuleDeviceStateVal(s)}
                      >
                        <Text style={[typography.labelCaps, { color: ruleDeviceStateVal === s ? themeColors.onPrimary : themeColors.onSurface }]}>
                          {s.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {ruleTriggerType === 'battery' && (
                <>
                  <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.xs }]}>THRESHOLD (%)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                    value={ruleBatteryThresh}
                    onChangeText={setRuleBatteryThresh}
                    keyboardType="number-pad"
                  />
                </>
              )}

              {ruleTriggerType === 'time' && (
                <View style={styles.timeRow}>
                  <View style={styles.flexOne}>
                    <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant }]}>HOUR</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                      value={ruleHour}
                      onChangeText={setRuleHour}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={styles.flexOne}>
                    <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant }]}>MINUTE</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                      value={ruleMinute}
                      onChangeText={setRuleMinute}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              )}

              <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.sm }]}>ACTION TYPE</Text>
              <View style={styles.chipRow}>
                {(['sms', 'wifi_toggle', 'robot_command', 'notification'] as const).map((a) => (
                  <TouchableOpacity
                    key={a}
                    style={[styles.chip, { backgroundColor: ruleActionType === a ? themeColors.primaryContainer : themeColors.surfaceContainerHigh }]}
                    onPress={() => setRuleActionType(a)}
                  >
                    <Text style={[typography.labelCaps, { color: ruleActionType === a ? themeColors.onPrimary : themeColors.onSurface }]}>
                      {a.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {ruleActionType === 'sms' && (
                <>
                  <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.xs }]}>SMS TARGET NUMBER</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                    value={ruleSmsTo}
                    onChangeText={setRuleSmsTo}
                    keyboardType="phone-pad"
                  />
                  <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.xs }]}>BODY TEMPLATE</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                    value={ruleSmsBody}
                    onChangeText={setRuleSmsBody}
                  />
                </>
              )}

              {ruleActionType === 'wifi_toggle' && (
                <View style={styles.chipRow}>
                  {(['on', 'off'] as const).map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.chip, { backgroundColor: ruleWifiState === s ? themeColors.primaryContainer : themeColors.surfaceContainerHigh }]}
                      onPress={() => setRuleWifiState(s)}
                    >
                      <Text style={[typography.labelCaps, { color: ruleWifiState === s ? themeColors.onPrimary : themeColors.onSurface }]}>
                        WIFI {s.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {ruleActionType === 'robot_command' && (
                <>
                  <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.xs }]}>ROBOT COMMAND</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                    value={ruleRobotCmd}
                    onChangeText={setRuleRobotCmd}
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: themeColors.surfaceContainerHigh }]}
                onPress={() => setShowRuleModal(false)}
              >
                <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant }]}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: themeColors.primaryContainer }]}
                onPress={handleSaveCustomRule}
              >
                <Text style={[typography.labelCaps, { color: themeColors.onPrimary }]}>SAVE RULE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    gap: spacing.xs,
  },
  permBanner: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
  },
  paramBox: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  toggleBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  input: {
    borderRadius: spacing.borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  execBtn: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  rulesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  createRuleBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  presetBtn: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  ruleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ruleTitle: {
    fontSize: 16,
    flex: 1,
  },
  ruleBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  ruleActionBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
  },
  ruleDeleteBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalContent: {
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    maxHeight: '85%',
    gap: spacing.md,
  },
  formScroll: {
    gap: spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flexOne: {
    flex: 1,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  modalBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
  },
});
