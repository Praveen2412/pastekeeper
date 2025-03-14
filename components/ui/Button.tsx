import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  mode?: 'contained' | 'outlined' | 'text';
  disabled?: boolean;
  loading?: boolean;
  style?: object;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  mode = 'contained',
  disabled = false,
  loading = false,
  style,
}) => {
  const { colors } = useTheme();

  const getButtonStyle = () => {
    switch (mode) {
      case 'contained':
        return {
          backgroundColor: disabled ? colors.border : colors.primary,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? colors.border : colors.primary,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
        };
    }
  };

  const getTextStyle = () => {
    switch (mode) {
      case 'contained':
        return {
          color: '#FFFFFF',
        };
      case 'outlined':
      case 'text':
        return {
          color: disabled ? colors.border : colors.primary,
        };
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={mode === 'contained' ? '#FFFFFF' : colors.primary} />
      ) : (
        <Text style={[styles.text, getTextStyle()]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 64,
    minHeight: 36,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default Button; 