import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useWellnessStore } from '../../src/store';
import { Leaf } from 'lucide-react-native';

export default function HomeScreen() {
  const { score } = useWellnessStore();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Leaf size={32} color="#16a34a" />
        <Text style={styles.title}>NuraCare</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Wellness Score</Text>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.subtitle}>Your real-time health pulse</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily Insight</Text>
        <Text style={styles.insight}>
          Based on your activity, hydration looks low. Try a glass of water now.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  score: {
    fontSize: 48,
    fontWeight: '800',
    color: '#16a34a',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  insight: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
  }
});
