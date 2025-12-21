// Design Tokens - Monochrome + Pop
// Almost black/white with devil red as the only accent

export const colors = {
  // Base - True blacks and whites
  black: '#000000',
  white: '#FFFFFF',

  // Grays - Neutral, no warmth
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },

  // The Pop - One color, used sparingly
  pop: {
    DEFAULT: '#FF3B30', // iOS red - clean, modern
    light: '#FF6961',
    dark: '#D32F2F',
    muted: 'rgba(255, 59, 48, 0.15)',
  },

  // Semantic
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',

  // Transparent overlays
  overlay: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.1)',
    heavy: 'rgba(255, 255, 255, 0.15)',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  // Font weights
  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },

  // Font sizes with line heights
  size: {
    xs: { fontSize: 11, lineHeight: 14 },
    sm: { fontSize: 13, lineHeight: 18 },
    base: { fontSize: 15, lineHeight: 22 },
    lg: { fontSize: 17, lineHeight: 24 },
    xl: { fontSize: 20, lineHeight: 28 },
    '2xl': { fontSize: 24, lineHeight: 32 },
    '3xl': { fontSize: 30, lineHeight: 38 },
    '4xl': { fontSize: 36, lineHeight: 44 },
    '5xl': { fontSize: 48, lineHeight: 56 },
  },

  // Letter spacing
  tracking: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

// Animation configs for Moti
export const animation = {
  spring: {
    type: 'spring' as const,
    damping: 20,
    stiffness: 300,
  },
  springBouncy: {
    type: 'spring' as const,
    damping: 10,
    stiffness: 200,
  },
  springSmooth: {
    type: 'spring' as const,
    damping: 30,
    stiffness: 400,
  },
  timing: {
    type: 'timing' as const,
    duration: 200,
  },
  timingSlow: {
    type: 'timing' as const,
    duration: 400,
  },
} as const;

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  pop: {
    shadowColor: colors.pop.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;
