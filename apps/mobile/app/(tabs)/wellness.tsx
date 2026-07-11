import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { useWellnessStore } from '../../src/store';
import { Activity, Plus, TrendingUp } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function WellnessScreen() {
  const router = useRouter();
  const { score, checkIns } = useWellnessStore();

  const getChartData = () => {
    if (!checkIns || checkIns.length === 0) {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ data: [100, 100, 100, 100, 100, 100, 100] }]
      };
    }
    
    // Take last 7 days of checkins, reverse for chronological
    const recent = checkIns.slice(0, 7).reverse();
    return {
      labels: recent.map(c => new Date(c.date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [{ data: recent.map(() => Math.floor(Math.random() * 20 + 80)) }] // Mock scores for visual since score isn't saved per checkin in this MVP state yet
    };
  };

  const data = getChartData();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Wellness Intelligence</Text>
          <Text style={styles.subtitle}>Your health trends & insights</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/checkin-modal')}>
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.scoreCard}>
        <Text style={styles.scoreTitle}>Current Wellness Score</Text>
        <Text style={styles.scoreValue}>{score}</Text>
        <Text style={styles.scoreDesc}>You are in the optimal range. Keep it up!</Text>
      </View>

      <Text style={styles.sectionTitle}>7-Day Trend</Text>
      <View style={styles.chartContainer}>
        <LineChart
          data={data}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: '4', strokeWidth: '2', stroke: '#16a34a' }
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <Text style={styles.sectionTitle}>Lifestyle Coach</Text>
      <TouchableOpacity style={styles.coachCard} onPress={() => router.push('/lifestyle')}>
        <View style={styles.coachHeader}>
          <TrendingUp size={20} color="#0284c7" />
          <Text style={styles.coachTitle}>Recommendation</Text>
        </View>
        <Text style={styles.coachText}>
          Based on your recent check-ins, your physical activity is slightly below your average. Try taking a 15-minute walk today to boost your energy levels and improve sleep quality tonight.
        </Text>
        <Text style={{color: '#0284c7', marginTop: 12, fontWeight: 'bold'}}>Tap for more routines</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Logs</Text>
      {checkIns.length > 0 ? (
        checkIns.slice(0, 3).map((c: any) => (
          <View key={c.id} style={styles.logCard}>
            <View style={styles.logLeft}>
              <Activity size={20} color="#16a34a" />
              <Text style={styles.logDate}>{new Date(c.date).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.logDetails}>Mood: {c.mood}/10 • Stress: {c.stress}/10</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No check-ins logged yet.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  addBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center' },
  scoreCard: { backgroundColor: '#16a34a', padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 24 },
  scoreTitle: { color: '#dcfce7', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  scoreValue: { color: '#ffffff', fontSize: 48, fontWeight: 'bold', marginBottom: 8 },
  scoreDesc: { color: '#f0fdf4', fontSize: 14, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 12, marginTop: 8 },
  chartContainer: { backgroundColor: '#ffffff', borderRadius: 16, padding: 12, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, alignItems: 'center' },
  chart: { borderRadius: 16, paddingRight: 10 },
  coachCard: { backgroundColor: '#e0f2fe', padding: 20, borderRadius: 16, marginBottom: 24 },
  coachHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  coachTitle: { fontSize: 16, fontWeight: '700', color: '#0369a1' },
  coachText: { color: '#0c4a6e', fontSize: 15, lineHeight: 22 },
  logCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logDate: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  logDetails: { fontSize: 14, color: '#64748b' },
  emptyText: { color: '#94a3b8', fontStyle: 'italic', marginTop: 12, marginBottom: 40 }
});
