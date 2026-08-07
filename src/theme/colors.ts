export const darkColors = {
  background: '#111318',
  surface: '#111318',
  surfaceContainerLowest: '#0c0e12',
  surfaceContainerLow: '#1a1c20',
  surfaceContainer: '#1e2024',
  surfaceContainerHigh: '#282a2e',
  surfaceContainerHighest: '#333539',
  surfaceVariant: '#333539',
  surfaceBright: '#37393e',

  primary: '#dbfcff',
  primaryContainer: '#00f0ff',
  onPrimary: '#00363a',
  onPrimaryContainer: '#006970',

  secondary: '#d1bcff',
  secondaryContainer: '#7000ff',
  onSecondary: '#3c0090',

  tertiary: '#dcffe2',
  tertiaryContainer: '#00f990',
  tertiaryFixedDim: '#00e383',
  onTertiary: '#00391d',

  onSurface: '#e2e2e8',
  onSurfaceVariant: '#b9cacb',
  outline: '#849495',
  outlineVariant: '#3b494b',

  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
};

export const lightColors = {
  background: '#f4f6f8',
  surface: '#ffffff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#e8ecef',
  surfaceContainer: '#dee3e7',
  surfaceContainerHigh: '#d2d8de',
  surfaceContainerHighest: '#c5ccd4',
  surfaceVariant: '#c5ccd4',
  surfaceBright: '#ffffff',

  primary: '#00363a',
  primaryContainer: '#00838f',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#00363a',

  secondary: '#5a00c8',
  secondaryContainer: '#7000ff',
  onSecondary: '#ffffff',

  tertiary: '#006d3c',
  tertiaryContainer: '#00a859',
  tertiaryFixedDim: '#008f4c',
  onTertiary: '#ffffff',

  onSurface: '#111318',
  onSurfaceVariant: '#43494a',
  outline: '#6f797a',
  outlineVariant: '#b9cacb',

  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
};

export type ThemeColors = typeof darkColors;

export const colors = darkColors;
