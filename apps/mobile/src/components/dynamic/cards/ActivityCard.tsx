import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Activity, Flame, Navigation } from 'lucide-react-native';

interface ActivityCardProps {
  title?: string;
  subtitle?: string;
  steps?: number;
  goalSteps?: number;
  caloriesBurned?: number;
  payload?: Record<string, any>;
}

export default function ActivityCard({
  title = 'Daily Movement',
  subtitle = 'Steps & active burn',
  steps = 6240,
  goalSteps = 10000,
  caloriesBurned = 420
}: ActivityCardProps) {
  const percentage = Math.min(100, Math.round((steps / goalSteps) * 100));

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Activity size={22} color="#ea580c" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{percentage}%</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View>
          <Text style={styles.stepValue}>{steps.toLocaleString()}</Text>
          <Text style={styles.stepGoal}>Target: {goalSteps.toLocaleString()} steps</Text>
        </View>
        <View style={styles.calorieBadge}>
          <Flame size={16} color="#ea580c" />
          <Text style={styles.calorieText}>{caloriesBurned} kcal</Text>
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  iconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff7ed', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  cardSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  badge: { backgroundColor: '#fff7ed', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#ea580c' },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  stepValue: { fontSize: 26, fontWeight: '800', color: '#0f172a' },
  stepGoal: { fontSize: 12, color: '#64748b', marginTop: 2 },
  calorieBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  calorieText: { fontSize: 13, fontWeight: '700', color: '#334155' },
  progressTrack: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#ea580c', borderRadius: 4 }
});
