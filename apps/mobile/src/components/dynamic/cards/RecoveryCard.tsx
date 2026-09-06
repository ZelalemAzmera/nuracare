import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HeartPulse, TrendingUp, AlertCircle } from 'lucide-react-native';

interface RecoveryCardProps {
  title?: string;
  subtitle?: string;
  score?: number;
  payload?: Record<string, any>;
}

export default function RecoveryCard({ title = 'Recovery Score', subtitle = 'Based on sleep & resting heart rate', score = 84 }: RecoveryCardProps) {
  const getStatus = (val: number) => {
    if (val >= 80) return { label: 'Optimal Recovery', color: '#16a34a', bg: '#f0fdf4', desc: 'Your nervous system is well rested. Great day for active movement.' };
    if (val >= 60) return { label: 'Moderate Recovery', color: '#d97706', bg: '#fffbeb', desc: 'Maintain balance. Steady cardio or light stretching recommended.' };
    return { label: 'Rest Needed', color: '#dc2626', bg: '#fef2f2', desc: 'High physiological strain detected. Prioritize early sleep and hydration.' };
  };

  const status = getStatus(score);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: status.bg }]}>
          <HeartPulse size={22} color={status.color} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.scoreNumberWrap}>
          <Text style={[styles.scoreValue, { color: status.color }]}>{score}</Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>
        <View style={styles.insightWrap}>
          <Text style={styles.descText}>{status.desc}</Text>
        </View>
      </View>

      {/* Visual meter bar */}
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: `${Math.min(100, Math.max(0, score))}%`, backgroundColor: status.color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconWrap: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  cardSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  scoreNumberWrap: { flexDirection: 'row', alignItems: 'baseline', minWidth: 80 },
  scoreValue: { fontSize: 34, fontWeight: '800' },
  scoreMax: { fontSize: 14, color: '#94a3b8', fontWeight: '600', marginLeft: 2 },
  insightWrap: { flex: 1, marginLeft: 16, borderLeftWidth: 1, borderLeftColor: '#f1f5f9', paddingLeft: 12 },
  descText: { fontSize: 13, color: '#475569', lineHeight: 18 },
  meterTrack: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
  meterFill: { height: '100%', borderRadius: 3 }
});
