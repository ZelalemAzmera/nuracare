import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { Activity, Brain, Moon, Droplets, Shield, Flame, Sparkles } from 'lucide-react-native';
import { useWellnessStore } from '../../src/store';
import { useProfile } from '../../src/context/ProfileContext';
import { computeBurnoutRisk, compute5CoreWellness, getRecoveryRecommendations } from '../../src/lib/wellnessEngine';

const screenWidth = Dimensions.get('window').width;

export default function WellnessScreen() {
  const router = useRouter();
  const { checkIns } = useWellnessStore();
  const { profile } = useProfile();
  
  const recentCheckins = checkIns.slice(0, 7).reverse();
  const latest = recentCheckins.length > 0 ? recentCheckins[recentCheckins.length - 1] : null;

  const burnout = computeBurnoutRisk(latest);
  const wellness = compute5CoreWellness(latest, profile);
  const recommendations = getRecoveryRecommendations(recentCheckins);

  const getChartData = (metric: 'mood' | 'energy' | 'sleep' | 'stress') => {
    if (recentCheckins.length < 2) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }]
      };
    }
    
    return {
      labels: recentCheckins.map(c => new Date(c.date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [{ data: recentCheckins.map(c => c[metric] || 0) }]
    };
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Wellness Intelligence</Text>
          <Text style={styles.subtitle}>Your AI-powered health & burnout tracker</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/checkin-modal')}>
          <Text style={{color: 'white', fontWeight: 'bold', fontSize: 18}}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gridContainer}>
        {/* 5-Core Wellness */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>5-CORE WELLNESS SCORE</Text>
          <View style={styles.circleContainer}>
            <Text style={[styles.circleText, {color: wellness.color}]}>{wellness.total}</Text>
          </View>
          <Text style={[styles.cardLabel, {color: wellness.color}]}>{wellness.label}</Text>
        </View>

        {/* Burnout Risk */}
        <View style={[styles.card, { backgroundColor: burnout.score > 65 ? '#fee2e2' : '#ffffff' }]}>
          <Text style={styles.cardHeader}>BURNOUT RISK</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <Flame size={48} color={burnout.color} />
            <View>
              <Text style={{ fontSize: 24, fontWeight: '800', color: burnout.color }}>{burnout.score}%</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: burnout.color }}>{burnout.label}</Text>
            </View>
          </View>
        </View>
      </View>

      {latest && (
        <View style={styles.insightSummary}>
          <Activity size={28} color="#16a34a" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#16a34a', marginBottom: 4 }}>Weekly Insight Summary</Text>
            <Text style={{ fontSize: 14, color: '#0f172a', lineHeight: 20 }}>
              {burnout.score > 65 
                ? "Your burnout risk is elevated. High stress and lower energy levels are impacting your overall resilience. Focus heavily on active recovery and prioritize sleep."
                : wellness.total > 70 
                ? "Your overall wellness is very strong right now. You have good mental resilience and solid physical vitality. Maintain this balance to keep burnout low."
                : "You are in a balanced state but there's room for improvement. Small enhancements in sleep and hydration will bring up your baseline wellness."}
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>5-Core Breakdown</Text>
      <View style={styles.breakdownCard}>
        <CoreStat label="Physical Vitality" score={wellness.cores.physical} icon={<Activity size={18} color="#16a34a" />} />
        <CoreStat label="Mental Resilience" score={wellness.cores.mental} icon={<Brain size={18} color="#16a34a" />} />
        <CoreStat label="Recovery & Sleep" score={wellness.cores.recovery} icon={<Moon size={18} color="#16a34a" />} />
        <CoreStat label="Nutrition & Hydration" score={wellness.cores.nutrition} icon={<Droplets size={18} color="#16a34a" />} />
        <CoreStat label="Preventive Maintenance" score={wellness.cores.preventive} icon={<Shield size={18} color="#16a34a" />} />
      </View>

      <Text style={styles.sectionTitle}>7-Day Trends</Text>
      {recentCheckins.length < 2 ? (
        <Text style={styles.emptyState}>Need at least 2 days of check-ins to show trends.</Text>
      ) : (
        <View>
          <ChartCard title="Energy" data={getChartData('energy')} color="#f59e0b" />
          <ChartCard title="Stress" data={getChartData('stress')} color="#ef4444" />
        </View>
      )}

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>AI Recommendations</Text>
      {recommendations.map((rec, i) => (
        <View key={i} style={styles.recCard}>
          <Sparkles size={20} color="#16a34a" />
          <Text style={styles.recText}>{rec}</Text>
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function CoreStat({ label, score, icon }: { label: string, score: number, icon: any }) {
  return (
    <View style={styles.coreStatContainer}>
      <View style={styles.coreStatIconBg}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>{label}</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#16a34a' }}>{score}</Text>
        </View>
        <View style={{ width: '100%', height: 8, backgroundColor: '#e2e8f0', borderRadius: 4 }}>
          <View style={{ width: `${score}%`, height: '100%', backgroundColor: score < 40 ? '#ef4444' : score < 70 ? '#f59e0b' : '#16a34a', borderRadius: 4 }} />
        </View>
      </View>
    </View>
  );
}

function ChartCard({ title, data, color }: { title: string, data: any, color: string }) {
  return (
    <View style={styles.chartCard}>
      <Text style={[styles.cardHeader, { marginBottom: 12, fontSize: 14, color: '#64748b' }]}>{title}</Text>
      <LineChart
        data={data}
        width={screenWidth - 72}
        height={160}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => color,
          labelColor: (opacity = 1) => '#94a3b8',
          style: { borderRadius: 16 },
          propsForDots: { r: '4', strokeWidth: '2', stroke: color }
        }}
        bezier
        style={{ borderRadius: 16 }}
        withVerticalLines={false}
        withHorizontalLines={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center' },
  
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  card: { flex: 1, minWidth: '45%', backgroundColor: '#ffffff', padding: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { fontSize: 11, fontWeight: '700', color: '#64748b', letterSpacing: 1, marginBottom: 12, textAlign: 'center' },
  circleContainer: { width: 80, height: 80, borderRadius: 40, borderWidth: 8, borderColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  circleText: { fontSize: 22, fontWeight: '800' },
  cardLabel: { fontSize: 14, fontWeight: '600' },
  
  insightSummary: { backgroundColor: '#f0fdf4', borderColor: '#16a34a', borderWidth: 1, borderRadius: 16, padding: 20, flexDirection: 'row', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 12, marginTop: 8 },
  
  breakdownCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 24 },
  coreStatContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  coreStatIconBg: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  
  chartCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, alignItems: 'center' },
  
  recCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderLeftWidth: 4, borderLeftColor: '#16a34a' },
  recText: { fontSize: 14, color: '#334155', flex: 1, lineHeight: 20 },
  
  emptyState: { textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', marginBottom: 24 }
});
