import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface ArinLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const ArinLogo: React.FC<ArinLogoProps> = ({ size = 'md' }) => {
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  const iconDim = isLg ? 80 : isSm ? 36 : 56;
  const innerDim = isLg ? 40 : isSm ? 18 : 28;
  const fontSize = isLg ? 32 : isSm ? 16 : 22;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.outerFrame,
          { width: iconDim, height: iconDim, borderRadius: iconDim / 4 },
        ]}
      >
        <View
          style={[
            styles.innerCore,
            { width: innerDim, height: innerDim, borderRadius: innerDim / 4 },
          ]}
        />
        <View style={styles.accentDotTop} />
        <View style={styles.accentDotBottom} />
      </View>
      <Text style={[typography.displayLg, styles.logoText, { fontSize }]}>
        ARIN
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  outerFrame: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderWidth: 2,
    borderColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  innerCore: {
    backgroundColor: colors.primaryContainer,
    transform: [{ rotate: '45deg' }],
  },
  accentDotTop: {
    position: 'absolute',
    top: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.tertiaryFixedDim,
  },
  accentDotBottom: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.secondary,
  },
  logoText: {
    color: colors.primary,
    letterSpacing: 4,
  },
});
