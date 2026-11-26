import { MD3LightTheme } from 'react-native-paper';

export const palette = {
  navy: '#172B4D',
  primary: '#2367E8',
  background: '#F4F7FC',
  surface: '#FFFFFF',
  muted: '#62738D',
  border: '#E1E8F3',
  success: '#068D6E',
};

export const appTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.primary,
    secondary: palette.success,
    background: palette.background,
    surface: palette.surface,
  },
};