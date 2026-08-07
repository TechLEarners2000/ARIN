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
import { ArinLogo } from '../components/ArinLogo';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const OnboardingScreen: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const { settings, updateSettings, completeOnboarding } = useApp();

  return (
    <View style={styles.container}>
      {/* Header Progress indicator */}
      <View style={styles.progressBarContainer}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.progressSegment,
              i <= step ? styles.progressSegmentActive : styles.progressSegmentInactive,
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <View style={styles.stepBox}>
            <ArinLogo size="md" />
            <Text style={[typography.headlineLgMobile, styles.title]}>WELCOME TO ARIN</Text>
            <Text style={[typography.bodyMd, styles.subtitle]}>
              Next-generation intelligence launcher transforming your device into a high-performance command center.
            </Text>

            <View style={styles.featureGrid}>
              <View style={styles.featureCard}>
                <Text style={[typography.labelCaps, styles.featureTitle]}>⚡ LOCAL AI FIRST</Text>
                <Text style={[typography.bodyMd, styles.featureDesc]}>
                  Connect directly to your local LLM server for low-latency offline intelligence.
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={[typography.labelCaps, styles.featureTitle]}>🌐 CLOUD ASSIST</Text>
                <Text style={[typography.bodyMd, styles.featureDesc]}>
                  Secondary cloud provider routing for complex reasoning tasks.
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={[typography.labelCaps, styles.featureTitle]}>🔌 ARDUINO BRIDGE</Text>
                <Text style={[typography.bodyMd, styles.featureDesc]}>
                  Direct hardware control via USB serial connection.
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
              <Text style={[typography.labelCaps, styles.nextBtnText]}>INITIALIZE SETUP ❯</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepBox}>
            <Text style={[typography.labelCaps, styles.stepTag]}>STEP 02 // NETWORKING</Text>
            <Text style={[typography.headlineMd, styles.title]}>CONNECT INTELLIGENCE</Text>

            <View style={styles.card}>
              <Text style={[typography.labelCaps, styles.cardHeader]}>LOCAL AI SERVER</Text>
              <TextInput
                style={[typography.codeSm, styles.input]}
                value={settings.localAiHost}
                onChangeText={(val) => updateSettings({ localAiHost: val })}
                placeholder="192.168.1.100:8000"
                placeholderTextColor="rgba(185, 202, 203, 0.5)"
              />
              <View style={styles.switchRow}>
                <Text style={[typography.bodyMd, styles.switchLabel]}>Enable Local AI Link</Text>
                <Switch
                  value={settings.localAiEnabled}
                  onValueChange={(val) =>
                    updateSettings({
                      localAiEnabled: val,
                      localAiStatus: val ? 'connected' : 'disconnected',
                    })
                  }
                  trackColor={{ false: colors.surfaceContainerHighest, true: colors.primaryContainer }}
                  thumbColor={colors.onPrimary}
                />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={[typography.labelCaps, styles.cardHeader]}>HARDWARE LINK</Text>
              <View style={styles.switchRow}>
                <Text style={[typography.bodyMd, styles.switchLabel]}>Arduino USB Connection</Text>
                <Switch
                  value={settings.arduinoConnected}
                  onValueChange={(val) =>
                    updateSettings({
                      arduinoConnected: val,
                      arduinoStatus: val ? 'connected' : 'disconnected',
                    })
                  }
                  trackColor={{ false: colors.surfaceContainerHighest, true: colors.primaryContainer }}
                  thumbColor={colors.onPrimary}
                />
              </View>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                <Text style={[typography.labelCaps, styles.backBtnText]}>❮ BACK</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextBtnFlex} onPress={() => setStep(3)}>
                <Text style={[typography.labelCaps, styles.nextBtnText]}>CONTINUE ❯</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepBox}>
            <Text style={[typography.labelCaps, styles.stepTag]}>STEP 03 // AGENCY</Text>
            <Text style={[typography.headlineMd, styles.title]}>GRANT PERMISSIONS</Text>
            <Text style={[typography.bodyMd, styles.subtitle]}>
              Select operational execution mode for system control.
            </Text>

            <TouchableOpacity
              style={[
                styles.modeCard,
                settings.permissionMode === 'compatible' && styles.modeCardActive,
              ]}
              onPress={() => updateSettings({ permissionMode: 'compatible' })}
            >
              <Text style={[typography.labelCaps, styles.modeTitle]}>COMPATIBLE MODE (MODERN PHONES)</Text>
              <Text style={[typography.bodyMd, styles.modeDesc]}>
                Standard Android launcher experience with on-demand permissions for Camera, Torch, Calls & SMS.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeCard,
                settings.permissionMode === 'full_control' && styles.modeCardActive,
              ]}
              onPress={() => updateSettings({ permissionMode: 'full_control' })}
            >
              <Text style={[typography.labelCaps, styles.modeTitle]}>FULL CONTROL MODE (LEGACY HARDWARE)</Text>
              <Text style={[typography.bodyMd, styles.modeDesc]}>
                Maximum power mode for dedicated device deployment. Requests full root/device permissions and optimizes RAM.
              </Text>
            </TouchableOpacity>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
                <Text style={[typography.labelCaps, styles.backBtnText]}>❮ BACK</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextBtnFlex} onPress={() => setStep(4)}>
                <Text style={[typography.labelCaps, styles.nextBtnText]}>CONTINUE ❯</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 4 && (
          <View style={styles.stepBox}>
            <ArinLogo size="lg" />
            <Text style={[typography.labelCaps, styles.stepTag]}>SYSTEM CHECK COMPLETE</Text>
            <Text style={[typography.headlineLgMobile, styles.title]}>SYSTEM READY</Text>
            <Text style={[typography.bodyMd, styles.subtitle]}>
              Neural core initialized. Operational link online.
            </Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={[typography.labelCaps, styles.summaryKey]}>LOCAL AI:</Text>
                <Text style={[typography.codeSm, styles.summaryVal]}>{settings.localAiHost}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[typography.labelCaps, styles.summaryKey]}>EXECUTION MODE:</Text>
                <Text style={[typography.codeSm, styles.summaryVal]}>{settings.permissionMode}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={completeOnboarding}>
              <Text style={[typography.labelCaps, styles.nextBtnText]}>LAUNCH ARIN HUB 🚀</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressBarContainer: {
    flexDirection: 'row',
    height: 4,
    backgroundColor: colors.surfaceContainerLow,
  },
  progressSegment: {
    flex: 1,
    height: '100%',
  },
  progressSegmentActive: {
    backgroundColor: colors.primaryContainer,
  },
  progressSegmentInactive: {
    backgroundColor: 'transparent',
  },
  scrollContent: {
    padding: spacing.containerMargin,
  },
  stepBox: {
    gap: spacing.md,
    alignItems: 'center',
  },
  stepTag: {
    color: colors.primaryContainer,
  },
  title: {
    color: colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  featureGrid: {
    width: '100%',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  featureCard: {
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    gap: spacing.xs,
  },
  featureTitle: {
    color: colors.primaryContainer,
  },
  featureDesc: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    gap: spacing.sm,
  },
  cardHeader: {
    color: colors.secondary,
  },
  input: {
    backgroundColor: colors.surfaceContainerHigh,
    color: colors.onSurface,
    borderRadius: spacing.borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  switchLabel: {
    color: colors.onSurface,
  },
  modeCard: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    gap: spacing.xs,
  },
  modeCardActive: {
    borderColor: colors.primaryContainer,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  modeTitle: {
    color: colors.primaryContainer,
  },
  modeDesc: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    gap: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryKey: {
    color: colors.outline,
  },
  summaryVal: {
    color: colors.tertiaryFixedDim,
  },
  nextBtn: {
    width: '100%',
    height: 52,
    backgroundColor: colors.primaryContainer,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  nextBtnText: {
    color: colors.onPrimary,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.md,
  },
  backBtn: {
    height: 52,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  backBtnText: {
    color: colors.onSurface,
  },
  nextBtnFlex: {
    flex: 1,
    height: 52,
    backgroundColor: colors.primaryContainer,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
