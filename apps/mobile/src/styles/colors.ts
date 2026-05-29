// Léognan official brand colors
export const colors = {
  primary: '#2d93c4', // Léognan blue
  primaryDark: '#1e6a95',
  primaryLight: '#5fb3e5',
  secondary: '#f5a623',
  background: '#ffffff',
  surface: '#f8f9fa',
  text: '#212121',
  textSecondary: '#757575',
  border: '#e0e0e0',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  disabled: '#bdbdbd',

  // Category colors
  category: {
    CULTURE: '#9c27b0',
    SPORT: '#e91e63',
    ANIMATION: '#ff9800',
    COMMERCE: '#2196f3',
    AUTRE: '#757575',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const },
  h2: { fontSize: 24, fontWeight: '700' as const },
  h3: { fontSize: 20, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodySmall: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
};
