import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Spacing, Fonts } from '../../src/constants';
import { Card, Button } from '../../src/components/ui';
import { BookOpen } from 'lucide-react-native';

export default function DiscoveryScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Health & Wellness Discovery</Text>
      
      <Card variant="elevated">
        <View style={styles.iconContainer}>
          <BookOpen size={32} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Daily Health Tip</Text>
        <Text style={styles.description}>
          Staying hydrated is crucial for maintaining energy levels throughout the day. Aim for at least 8 glasses of water.
        </Text>
      </Card>

      <Text style={styles.sectionTitle}>Recommended Articles</Text>
      
      <Card variant="outline">
        <Text style={styles.title}>Understanding Your Sleep</Text>
        <Text style={styles.description}>Learn how different sleep stages affect your recovery and daily energy.</Text>
        <Button title="Read More" variant="ghost" style={styles.readMoreBtn} />
      </Card>

      <Card variant="outline">
        <Text style={styles.title}>Nutrition for Energy</Text>
        <Text style={styles.description}>Discover foods that provide sustained energy without the crash.</Text>
        <Button title="Read More" variant="ghost" style={styles.readMoreBtn} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Fonts.sizes.md,
    color: Colors.textMuted,
    lineHeight: 22,
  },
  readMoreBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
    marginTop: Spacing.sm,
  }
});
