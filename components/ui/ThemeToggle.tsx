import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  style?: object;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ style }) => {
  const { theme, toggleTheme, colors } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'system':
        return '⚙️';
    }
  };

  const getThemeText = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.border + '40' }, style]}
      onPress={toggleTheme}
    >
      <Text style={styles.icon}>{getThemeIcon()}</Text>
      <Text style={[styles.text, { color: colors.text }]}>{getThemeText()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
  },
  icon: {
    fontSize: 16,
    marginRight: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ThemeToggle; 