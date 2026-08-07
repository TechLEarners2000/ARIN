import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  displayLg: {
    fontFamily: 'Hanken Grotesk',
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  headlineLgMobile: {
    fontFamily: 'Hanken Grotesk',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
  },
  headlineMd: {
    fontFamily: 'Hanken Grotesk',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
  },
  bodyMd: {
    fontFamily: 'Inter',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  codeSm: {
    fontFamily: 'JetBrains Mono',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  labelCaps: {
    fontFamily: 'JetBrains Mono',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.88,
    textTransform: 'uppercase',
  },
};
