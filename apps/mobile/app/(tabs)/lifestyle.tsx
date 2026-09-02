import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { X, PlayCircle, Dumbbell, Coffee, Clock, HeartPulse } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { getProfile } from '../../src/storage/profileStorage';

const EXERCISES = [
  { title: "Eskesta Cardio", duration: "15 min", desc: "Traditional Ethiopian shoulder dance for upper body mobility.", icon: <HeartPulse size={24} color="#ef4444" />, url: "https://youtube.com/results?search_query=Eskesta+workout" },
  { title: "Morning Stretch", duration: "10 min", desc: "Gentle full-body stretch to start the day.", icon: <Dumbbell size={24} color="#3b82f6" />, url: "https://youtube.com/results?search_query=10+min+morning+stretch" }
];

const NUTRITION = [
  { title: "Shiro Wot (Healthy)", cals: 250, desc: "High protein, low fat. Use less oil.", icon: <Coffee size={24} color="#f59e0b" /> },
  { title: "Atkilt Wot", cals: 150, desc: "Cabbage, carrots, potatoes. Rich in fiber.", icon: <Coffee size={24} color="#f59e0b" /> }
];

export default function LifestyleCoachScreen() {
  const profile = getProfile() || {};
  const fastingMode = profile.fastingMode || 'Standard';

  const [activeTab, setActiveTab] = useState('workout');

  const openVideo = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lifestyle Coach</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'workout' && styles.tabActive]} onPress={() => setActiveTab('workout')}>
          <Text style={[styles.tabText, activeTab === 'workout' && styles.tabTextActive]}>Workouts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'nutrition' && styles.tabActive]} onPress={() => setActiveTab('nutrition')}>
          <Text style={[styles.tabText, activeTab === 'nutrition' && styles.tabTextActive]}>Nutrition</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'fasting' && styles.tabActive]} onPress={() => setActiveTab('fasting')}>
          <Text style={[styles.tabText, activeTab === 'fasting' && styles.tabTextActive]}>Fasting</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'workout' && (
          <View>
            <Text style={styles.sectionHeader}>Recommended for you</Text>
            {EXERCISES.map((ex, i) => (
              <TouchableOpacity key={i} style={styles.card} onPress={() => openVideo(ex.url)}>
                <View style={styles.cardIcon}>{ex.icon}</View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{ex.title}</Text>
                  <Text style={styles.cardSubtitle}>{ex.duration} • {ex.desc}</Text>
                </View>
                <PlayCircle size={24} color="#16a34a" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'nutrition' && (
          <View>
            <Text style={styles.sectionHeader}>Healthy Local Meals</Text>
            {NUTRITION.map((meal, i) => (
              <View key={i} style={styles.card}>
                <View style={styles.cardIcon}>{meal.icon}</View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{meal.title}</Text>
                  <Text style={styles.cardSubtitle}>{meal.cals} Calories • {meal.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'fasting' && (
          <View>
            <View style={styles.heroCard}>
              <Clock size={40} color="#16a34a" />
              <Text style={styles.heroTitle}>{fastingMode} Fasting</Text>
              <Text style={styles.heroDesc}>
                {fastingMode === 'Orthodox Christian (Tsom)' 
                  ? 'During fasting seasons, ensure you eat enough lentils (Misir) and beans (Baqela) for protein since animal products are avoided.'
                  : fastingMode === 'Islamic (Ramadan)'
                  ? 'Ensure you hydrate well during Suhoor and Iftar. Break your fast gently with dates and avoid overly greasy foods.'
                  : 'Consider a 16:8 intermittent fasting schedule to improve insulin sensitivity.'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  closeBtn: { padding: 4, backgroundColor: '#f1f5f9', borderRadius: 20 },
  tabs: { flexDirection: 'row', padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#e2e8f0', gap: 12 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 20, backgroundColor: '#f1f5f9' },
  tabActive: { backgroundColor: '#16a34a' },
  tabText: { color: '#64748b', fontWeight: '600' },
  tabTextActive: { color: '#ffffff' },
  content: { padding: 20 },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  cardIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#64748b', lineHeight: 18 },
  heroCard: { backgroundColor: '#f0fdf4', borderWidth: 2, borderColor: '#4ade80', borderRadius: 16, padding: 24, alignItems: 'center' },
  heroTitle: { fontSize: 20, fontWeight: 'bold', color: '#16a34a', marginTop: 12, marginBottom: 8 },
  heroDesc: { fontSize: 15, color: '#0f172a', textAlign: 'center', lineHeight: 22 }
});
