import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  colors: {
    background: string;
    text: string;
    textSecondary: string;
    primary: string;
    secondary: string;
    border: string;
    error: string;
    cardBackground: string;
  };
}

const lightColors = {
  background: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  primary: '#2196F3',
  secondary: '#03DAC6',
  border: '#E0E0E0',
  error: '#F44336',
  cardBackground: '#F5F5F5',
};

const darkColors = {
  background: '#121212',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  primary: '#BB86FC',
  secondary: '#03DAC6',
  border: '#333333',
  error: '#CF6679',
  cardBackground: '#1E1E1E',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>('system');
  
  const isDark = theme === 'dark' || (theme === 'system' && colorScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;
  
  const toggleTheme = () => {
    setTheme(prevTheme => {
      if (prevTheme === 'light') return 'dark';
      if (prevTheme === 'dark') return 'system';
      return 'light';
    });
  };
  
  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        setTheme,
        toggleTheme,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 