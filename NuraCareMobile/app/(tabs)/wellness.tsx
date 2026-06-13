import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useWellnessStore } from '../../src/store';
import { Activity, Thermometer, Wind, Zap } from 'lucide-react-native';

export default function WellnessScreen() {
  const { checkIns } = useWellnessStore();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Daily Check-ins</Text>
      
      {checkIns.length === 0 ? (
        <View style={styles.emptyState}>
          <Activity size={32} color="#94a3b8" />
          <Text style={styles.emptyText}>No check-ins yet today.</Text>
        </View>
      ) : (
        checkIns.map((ci) => (
          <View key={ci.id} style={styles.logCard}>
            <View style={styles.logHeader}>
              <Text style={styles.logDate}>{ci.date}</Text>
              <View style={[styles.urgencyBadge, ci.urgency === 'high' ? styles.badgeHigh : styles.badgeLow]}>
                <Text style={styles.badgeText}>{ci.urgency.toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Zap size={16} color="#64748b" />
                <Text style={styles.metricText}>Energy: {ci.energy}/10</Text>
              </View>
              <View style={styles.metric}>
                <Wind size={16} color="#64748b" />
                <Text style={styles.metricText}>Stress: {ci.stress}/10</Text>
              </View>
            </View>
          </View>
        ))
      )}

      <Link href="/checkin-modal" asChild>
        <TouchableOpacity style={styles.checkInButton}>
          <Thermometer size={20} color="#ffffff" />
          <Text style={styles.checkInButtonText}>Log New Vitals</Text>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  emptyText: {
    color: '#64748b',
    marginTop: 12,
    fontSize: 16,
  },
  logCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logDate: {
    fontWeight: '600',
    color: '#1e293b',
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeHigh: {
    backgroundColor: '#fee2e2',
  },
  badgeLow: {
    backgroundColor: '#dcfce7',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f172a',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 14,
    color: '#475569',
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    gap: 8,
  },
  checkInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  }
});
