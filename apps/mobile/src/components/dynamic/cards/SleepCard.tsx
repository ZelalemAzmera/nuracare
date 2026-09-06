import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Moon, Clock, Sparkles } from 'lucide-react-native';

interface SleepCardProps {
  title?: string;
  subtitle?: string;
  duration?: string;
  quality?: string;
  deepSleep?: string;
  payload?: Record<string, any>;
}

export default function SleepCard({
  title = 'Sleep Performance',
  subtitle = 'Last night restorative sleep',
  duration = '7h 42m',
  quality = '88%',
  deepSleep = '1h 55m'
}: SleepCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Moon size={22} color="#6366f1" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Restorative</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Sleep</Text>
          <Text style={styles.statValue}>{duration}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Efficiency</Text>
          <Text style={[styles.statValue, { color: '#6366f1' }]}>{quality}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Deep Sleep</Text>
          <Text style={styles.statValue}>{deepSleep}</Text>
        </View>
      </View>

      <View style={styles.timelineBar}>
        <View style={[styles.timelineSegment, { flex: 2, backgroundColor: '#c7d2fe' }]} />
        <View style={[styles.timelineSegment, { flex: 4, backgroundColor: '#818cf8' }]} />
        <View style={[styles.timelineSegment, { flex: 3, backgroundColor: '#4338ca' }]} />
        <View style={[styles.timelineSegment, { flex: 1, backgroundColor: '#c7d2fe' }]} />
      </View>
      <View style={styles.timelineLegend}>
        <Text style={styles.legendText}>Light (25%)</Text>
        <Text style={styles.legendText}>REM (45%)</Text>
        <Text style={styles.legendText}>Deep (30%)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  iconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  cardSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  badge: { backgroundColor: '#eef2ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#6366f1' },
  statsGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 12, borderRadius: 14, marginBottom: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 11, color: '#64748b', fontWeight: '500', marginBottom: 3 },
  statValue: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  statDivider: { width: 1, height: 26, backgroundColor: '#e2e8f0' },
  timelineBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2, marginBottom: 6 },
  timelineSegment: { height: '100%' },
  timelineLegend: { flexDirection: 'row', justifyContent: 'space-between' },
  legendText: { fontSize: 10, color: '#94a3b8', fontWeight: '500' }
});
