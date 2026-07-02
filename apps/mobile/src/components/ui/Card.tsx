import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Colors, Radii, Spacing } from '../../constants';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outline' | 'flat';
}

export const Card: React.FC<CardProps> = ({ children, variant = 'elevated', style, ...props }) => {
  return (
    <View style={[styles.card, styles[variant], style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  outline: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  flat: {
    backgroundColor: Colors.background,
  }
});
