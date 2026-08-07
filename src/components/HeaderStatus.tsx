import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { StatusBadge } from './StatusBadge';

export const HeaderStatus: React.FC = () => {
  const { settings, themeMode, toggleThemeMode, themeColors } = useApp();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: themeColors.background,
          borderBottomColor: themeColors.outlineVariant,
        },
      ]}
    >
      <View style={styles.badges}>
        <StatusBadge label="LOCAL AI" status={settings.localAiStatus} />
        <StatusBadge label="CLOUD" status={settings.cloudStatus} />
        <StatusBadge label="ARDUINO" status={settings.arduinoStatus} />
      </View>
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={[styles.themeBtn, { backgroundColor: themeColors.surfaceContainerHigh }]}
          onPress={toggleThemeMode}
          activeOpacity={0.7}
        >
          <Text style={{ color: themeColors.onSurface }}>
            {themeMode === 'dark' ? '☀️' : '🌙'}
          </Text>
        </TouchableOpacity>
        <View style={[styles.profileAvatar, { backgroundColor: themeColors.primaryContainer }]}>
          <Text style={[styles.avatarText, { color: themeColors.onPrimary }]}>OP</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 48,
    paddingHorizontal: spacing.containerMargin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  themeBtn: {
    width: 28,
    height: 28,
    borderRadius: spacing.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatar: {
    width: 28,
    height: 28,
    borderRadius: spacing.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.labelCaps,
    fontSize: 10,
    fontWeight: '700',
  },
});
