export const Colors = {
  // Base
  background: '#04040A',
  surface: 'rgba(20, 20, 32, 0.4)', // For glassmorphism
  surfaceElevated: 'rgba(30, 30, 48, 0.65)',
  surfaceHover: 'rgba(40, 40, 60, 0.8)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.15)',

  // Primary (Cyberpunk / Premium accents)
  primary: '#00F0FF',      // Neon Cyan
  primaryLight: '#7000FF', // Deep Neon Purple
  primaryDark: '#FF0055',  // Neon Pink/Red
  primaryGlow: 'rgba(0, 240, 255, 0.25)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textMuted: '#606075',
  textInverse: '#04040A',

  // Status
  success: '#00FFAA',
  successGlow: 'rgba(0, 255, 170, 0.2)',
  error: '#FF3366',
  errorGlow: 'rgba(255, 51, 102, 0.2)',
  warning: '#FFCC00',
  warningGlow: 'rgba(255, 204, 0, 0.2)',

  // Platform gradients
  tiktok: {
    start: '#FF0050',
    end: '#00F2EA',
    glow: 'rgba(255, 0, 80, 0.3)',
  },
  instagram: {
    start: '#F58529',
    mid: '#DD2A7B',
    end: '#8134AF',
    glow: 'rgba(221, 42, 123, 0.3)',
  },
  facebook: {
    start: '#1877F2',
    end: '#42A5F5',
    glow: 'rgba(24, 119, 242, 0.3)',
  },

  // Glass
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassHighlight: 'rgba(255, 255, 255, 0.1)',
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  glow: (color) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  }),
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};
