import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { Colors, Radii, Spacing, Fonts } from '../../constants';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  variant = 'primary', 
  loading = false, 
  style, 
  disabled,
  ...props 
}) => {
  const isOutlineOrGhost = variant === 'outline' || variant === 'ghost';
  const textColor = isOutlineOrGhost ? Colors[variant === 'ghost' ? 'text' : 'primary'] : Colors.surface;

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        styles[variant], 
        disabled && styles.disabled,
        style
      ]} 
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.text,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
  }
});
