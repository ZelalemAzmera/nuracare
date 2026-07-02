import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { Colors, Radii, Spacing, Fonts } from '../../constants';

interface BadgeProps extends ViewProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', style, ...props }) => {
  let bgColor = Colors.border;
  let textColor = Colors.textMuted;

  switch (variant) {
    case 'success':
      bgColor = Colors.successBackground;
      textColor = Colors.success;
      break;
    case 'warning':
      bgColor = Colors.warningBackground;
      textColor = Colors.warning;
      break;
    case 'error':
      bgColor = Colors.errorBackground;
      textColor = Colors.error;
      break;
    case 'info':
      bgColor = '#e0f2fe'; // Light sky blue
      textColor = Colors.secondary;
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, style]} {...props}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: Radii.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
});
