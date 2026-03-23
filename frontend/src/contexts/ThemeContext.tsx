import React, { createContext, useContext, ReactNode } from 'react';
import { useApp } from './AppContext';

interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  success: string;
  warning: string;
  danger: string;
}

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
}

const lightColors: ThemeColors = {
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#6C757D',
  border: '#E5E5EA',
  primary: '#007AFF',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
};

const darkColors: ThemeColors = {
  background: '#1C1C1E',
  card: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#3A3A3C',
  primary: '#0A84FF',
  success: '#30D158',
  warning: '#FF9F0A',
  danger: '#FF453A',
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightColors,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useApp();
  const isDark = settings.darkMode;
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
