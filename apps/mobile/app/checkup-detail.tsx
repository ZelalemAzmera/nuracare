import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Fonts } from '../src/constants';
import { Button } from '../src/components/ui';
import { useLocalSearchParams, router } from 'expo-router';

export default function CheckupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkup Details</Text>
      <Text style={styles.description}>Details for checkup ID: {id}</Text>
      
      <Button 
        title="Close" 
        onPress={() => router.back()} 
        style={styles.closeBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Fonts.sizes.md,
    color: Colors.textMuted,
    marginBottom: Spacing.xl,
  },
  closeBtn: {
    width: '100%',
  }
});
