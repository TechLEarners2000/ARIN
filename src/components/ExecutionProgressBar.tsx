import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { ExecutionStage } from '../types';

const stageLabels: Record<ExecutionStage, string> = {
  idle: 'Idle',
  request_sent: 'Request Sent',
  local_processing: 'Local AI',
  cloud_processing: 'Cloud AI',
  arduino_executing: 'Arduino',
  device_executing: 'Device',
  speaking: 'Speaking',
  pipeline_executing: 'Pipeline',
  response_received: 'Response',
  done: 'Done',
  error: 'Error',
};

export const ExecutionProgressBar: React.FC = () => {
  const { currentStage, pipelinePath, stageErrorMsg, themeColors } = useApp();

  if (currentStage === 'idle') {
    return null;
  }

  const isError = currentStage === 'error';
  const currentIdx = pipelinePath.indexOf(currentStage);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.surfaceContainerLow, borderColor: themeColors.outlineVariant }]}>
      <Text style={[typography.labelCaps, { color: isError ? themeColors.error : themeColors.primaryContainer }]}>
        {isError ? '⚠️ EXECUTION ERROR' : '⚡ PIPELINE PROGRESS'}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.milestoneRow}>
        {pipelinePath.map((stage, idx) => {
          let state: 'completed' | 'active' | 'pending' | 'error' = 'pending';
          if (isError) {
            state = idx <= currentIdx ? 'error' : 'pending';
          } else if (idx < currentIdx) {
            state = 'completed';
          } else if (idx === currentIdx) {
            state = 'active';
          }

          const dotBg =
            state === 'completed' || state === 'active'
              ? themeColors.primaryContainer
              : state === 'error'
              ? themeColors.error
              : themeColors.outline;

          const labelColor =
            state === 'completed' || state === 'active'
              ? themeColors.onSurface
              : state === 'error'
              ? themeColors.error
              : themeColors.onSurfaceVariant;

          return (
            <View key={stage} style={styles.milestoneItem}>
              <View style={[styles.dot, { backgroundColor: dotBg }]} />
              <Text style={[typography.codeSm, styles.milestoneText, { color: labelColor }]}>
                {`${idx + 1}. ${stageLabels[stage]}`}
              </Text>
              {idx < pipelinePath.length - 1 && (
                <Text style={[typography.codeSm, { color: themeColors.outline }]}>➔</Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      {isError && stageErrorMsg && (
        <Text style={[typography.codeSm, styles.errorBox, { color: themeColors.error, backgroundColor: themeColors.errorContainer }]}>
          {stageErrorMsg}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    marginVertical: spacing.sm,
    gap: spacing.sm,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  milestoneText: {
    fontSize: 12,
  },
  errorBox: {
    padding: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
    marginTop: spacing.xs,
  },
});
