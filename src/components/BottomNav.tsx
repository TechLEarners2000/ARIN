import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { ScreenTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, themeColors } = useApp();

  const tabs: { id: ScreenTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'ARIN', icon: '⊞' },
    { id: 'test-interface', label: 'TEST', icon: '❯_' },
    { id: 'settings', label: 'SETUP', icon: '⚙' },
  ];

  return (
    <View
      style={[
        styles.navBar,
        {
          backgroundColor: themeColors.surfaceContainer,
          borderTopColor: themeColors.outlineVariant,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabButton}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.iconText,
                { color: isActive ? themeColors.primaryContainer : themeColors.onSurfaceVariant },
              ]}
            >
              {tab.icon}
            </Text>
            <Text
              style={[
                typography.labelCaps,
                { color: isActive ? themeColors.primaryContainer : themeColors.onSurfaceVariant },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: spacing.xs,
  },
  iconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
