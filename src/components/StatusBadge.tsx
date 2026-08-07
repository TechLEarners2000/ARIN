import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { ConnectionState } from '../types';

interface StatusBadgeProps {
  label: string;
  status: ConnectionState;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, status }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const dotColor =
    status === 'connected'
      ? colors.tertiaryFixedDim
      : status === 'connecting'
      ? colors.primaryContainer
      : colors.outline;

  const textColor =
    status === 'connected'
      ? colors.tertiaryFixedDim
      : status === 'connecting'
      ? colors.primaryContainer
      : colors.onSurfaceVariant;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.dot, { backgroundColor: dotColor, opacity: pulseAnim }]}
      />
      <Text style={[typography.labelCaps, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
