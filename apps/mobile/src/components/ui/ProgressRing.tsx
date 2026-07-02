import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../constants';

// A simple simulated progress ring since SVG isn't installed natively here.
// In a full build, react-native-svg or expo-progress would be used.
interface ProgressRingProps {
  progress: number;
  size?: number;
  color?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ 
  progress, 
  size = 120, 
  color = Colors.primary 
}) => {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{Math.round(progress)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  text: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '800',
  }
});
