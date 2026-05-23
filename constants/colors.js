export const Colors = {
  // Base
  background: '#0A0A0F',
  surface: '#13131A',
  surfaceElevated: '#1C1C28',
  surfaceHover: '#242436',
  border: 'rgba(255, 255, 255, 0.06)',
  borderLight: 'rgba(255, 255, 255, 0.12)',

  // Primary
  primary: '#7C5CFC',
  primaryLight: '#9B7FFF',
  primaryDark: '#5A3DD6',
  primaryGlow: 'rgba(124, 92, 252, 0.25)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8EA0',
  textMuted: '#5A5A6E',
  textInverse: '#0A0A0F',

  // Status
  success: '#00D68F',
  successGlow: 'rgba(0, 214, 143, 0.2)',
  error: '#FF4757',
  errorGlow: 'rgba(255, 71, 87, 0.2)',
  warning: '#FFA502',
  warningGlow: 'rgba(255, 165, 2, 0.2)',

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
