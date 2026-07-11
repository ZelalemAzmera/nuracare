import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

interface UrgencyCardProps {
  urgency: string;
  summary: string;
  action_steps: string[];
}

export default function UrgencyCard({ urgency, summary, action_steps }: UrgencyCardProps) {
  const getColors = () => {
    switch(urgency) {
      case 'High': return { bg: '#fef2f2', border: '#f87171', icon: '#ef4444' };
      case 'Medium': return { bg: '#fffbeb', border: '#fbbf24', icon: '#f59e0b' };
      default: return { bg: '#f0fdf4', border: '#4ade80', icon: '#22c55e' };
    }
  };
  
  const colors = getColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={styles.header}>
        <AlertTriangle size={20} color={colors.icon} />
        <Text style={[styles.title, { color: colors.icon }]}>{urgency} Urgency Alert</Text>
      </View>
      <Text style={styles.summary}>{summary}</Text>
      <View style={styles.steps}>
        {action_steps?.map((step, idx) => (
          <View key={idx} style={styles.stepItem}>
            <View style={[styles.dot, { backgroundColor: colors.icon }]} />
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 16, marginVertical: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '700' },
  summary: { fontSize: 14, color: '#334155', marginBottom: 12 },
  steps: { gap: 6 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  stepText: { fontSize: 14, color: '#475569', flex: 1, lineHeight: 20 }
});
