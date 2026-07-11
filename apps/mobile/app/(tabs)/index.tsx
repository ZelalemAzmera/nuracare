import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useWellnessStore } from '../../src/store';
import { getProfile } from '../../src/storage/profileStorage';
import { getTodayCheckin } from '../../src/storage/checkinStorage';
import { getDailyTip } from '@nuracare/shared';
import { Leaf, Activity, Pill, AlertTriangle, Calendar, MessageCircle, Play } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';

export default function HomeScreen() {
  const { score } = useWellnessStore();
  const profile = getProfile() || {};
  const todayCheckin = getTodayCheckin();
  const tip = getDailyTip();
  const router = useRouter();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleVideo = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()}, {profile.name?.split(' ')[0] || 'Guest'}</Text>
          <Text style={styles.location}>{profile.location?.country || 'Earth'}</Text>
        </View>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      {tip && (
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Leaf size={20} color="#16a34a" />
            <Text style={styles.tipTitle}>Daily Insight</Text>
          </View>
          <Text style={styles.tipName}>{tip.name}</Text>
          <Text style={styles.tipDesc}>{tip.benefits?.[0] || tip.description}</Text>
          {tip.youtubeLink && (
            <TouchableOpacity style={styles.videoBtn} onPress={() => handleVideo(tip.youtubeLink)}>
              <Play size={16} color="#ffffff" />
              <Text style={styles.videoText}>Watch Video</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Text style={styles.sectionTitle}>Dashboard</Text>
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Activity size={24} color="#64748b" />
          <Text style={styles.gridLabel}>Urgency</Text>
          <Text style={styles.gridValue}>{todayCheckin?.urgency || 'None'}</Text>
        </View>
        <View style={styles.gridItem}>
          <Calendar size={24} color="#64748b" />
          <Text style={styles.gridLabel}>Last Log</Text>
          <Text style={styles.gridValue}>{todayCheckin ? 'Today' : 'None'}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Medications</Text>
      {profile.medications && profile.medications.length > 0 ? (
        <View style={styles.medsCard}>
          {profile.medications.map((med: string) => (
            <View key={med} style={styles.medItem}>
              <Pill size={20} color="#16a34a" />
              <Text style={styles.medName}>{med}</Text>
            </View>
          ))}
        </View>
      ) : (
        <TouchableOpacity style={styles.addMedsBtn} onPress={() => router.push('/(tabs)/profile')}>
          <Text style={styles.addMedsText}>+ Add Medications in Profile</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/chat')}>
          <MessageCircle size={24} color="#16a34a" />
          <Text style={styles.actionText}>Chat with Nura</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/wellness')}>
          <Activity size={24} color="#16a34a" />
          <Text style={styles.actionText}>Log Wellness</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 40 },
  greeting: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  location: { fontSize: 14, color: '#64748b', marginTop: 4 },
  scoreCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#16a34a', justifyContent: 'center', alignItems: 'center' },
  scoreText: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  tipCard: { backgroundColor: '#ffffff', padding: 20, borderRadius: 16, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  tipTitle: { fontSize: 14, fontWeight: '700', color: '#16a34a' },
  tipName: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  tipDesc: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 16 },
  videoBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ef4444', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6 },
  videoText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 12, marginTop: 8 },
  grid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  gridItem: { flex: 1, backgroundColor: '#ffffff', padding: 16, borderRadius: 16, alignItems: 'center' },
  gridLabel: { fontSize: 13, color: '#64748b', marginTop: 8, marginBottom: 4 },
  gridValue: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  medsCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 24 },
  medItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  medName: { fontSize: 16, color: '#1e293b', fontWeight: '500' },
  addMedsBtn: { backgroundColor: '#e2e8f0', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  addMedsText: { color: '#475569', fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  actionBtn: { flex: 1, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', padding: 16, borderRadius: 16, alignItems: 'center', gap: 8 },
  actionText: { color: '#16a34a', fontWeight: '600' }
});
