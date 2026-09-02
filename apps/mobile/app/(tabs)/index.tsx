import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfile } from '../../src/context/ProfileContext';
import { getDailyTip } from '../../src/shared';
import { Leaf, Activity, Pill, HeartPulse, Calendar, MessageCircle, Play, User, Zap, Sparkles, ChevronRight, Users } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';

export default function HomeScreen() {
  const { profile } = useProfile();
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

  const medsList = Array.isArray(profile?.medications) 
    ? profile.medications 
    : (profile?.medications ? profile.medications.split(',').map((m: string) => m.trim()).filter(Boolean) : []);
  
  const records = profile?.records || [];
  const lastRec = records.length > 0 ? records[records.length - 1] : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Profile Button */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{greeting()}{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}</Text>
          <Text style={styles.subtitle}>Your Nura health overview</Text>
          {profile?.culturalHeritage && (
            <Text style={styles.location}>{profile.culturalHeritage}</Text>
          )}
        </View>
        <TouchableOpacity 
          style={styles.profileHeaderBtn} 
          onPress={() => router.push('/profile')}
          activeOpacity={0.8}
        >
          <View style={styles.avatarCircle}>
            {profile?.name ? (
              <Text style={styles.avatarText}>{profile.name[0].toUpperCase()}</Text>
            ) : (
              <User size={22} color="#ffffff" />
            )}
          </View>
          <Text style={styles.profileBtnLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Nura AI Chat Card */}
      <TouchableOpacity 
        style={styles.chatCard} 
        onPress={() => router.push('/chat')}
        activeOpacity={0.88}
      >
        <View style={styles.chatCardHeader}>
          <View style={styles.chatIconBadge}>
            <MessageCircle size={22} color="#ffffff" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.chatCardTitle}>Ask Nura AI</Text>
              <View style={styles.aiPill}><Text style={styles.aiPillText}>Instant AI</Text></View>
            </View>
            <Text style={styles.chatCardSub}>Medical triage & symptoms in English & Amharic</Text>
          </View>
          <ChevronRight size={20} color="#16a34a" />
        </View>
        <View style={styles.chatPromptBar}>
          <Text style={styles.chatPromptPlaceholder}>Describe symptoms or ask health advice...</Text>
          <View style={styles.chatPromptSendBtn}>
            <Sparkles size={16} color="#ffffff" />
          </View>
        </View>
      </TouchableOpacity>

      {/* Daily Checkup Banner */}
      <TouchableOpacity 
        style={styles.checkupBanner}
        onPress={() => router.push('/(tabs)/checkups')}
        activeOpacity={0.85}
      >
        <View style={styles.checkupIconBadge}>
          <Calendar size={20} color="#16a34a" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.checkupBannerTitle}>Daily Health Checkup</Text>
          <Text style={styles.checkupBannerSub}>
            {lastRec ? `Last logged: ${lastRec.dateStr || 'Recent'}` : 'Log today\'s symptoms & vitals'}
          </Text>
        </View>
        <ChevronRight size={18} color="#94a3b8" />
      </TouchableOpacity>

      {tip && (
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Leaf size={20} color="#16a34a" />
            <Text style={styles.tipTitle}>TODAY'S INSIGHT</Text>
          </View>
          <Text style={styles.tipName}>{tip.name}</Text>
          <Text style={styles.tipDesc}>{tip.benefit || tip.description}</Text>
          {tip.youtubeLink && (
            <TouchableOpacity style={styles.videoBtn} onPress={() => handleVideo(tip.youtubeLink)}>
              <Play size={16} color="#ffffff" />
              <Text style={styles.videoText}>Watch How</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Text style={styles.sectionTitle}>Dashboard</Text>
      <View style={styles.grid}>
        <View style={[styles.dashCard, styles.cardLarge]}>
          <View style={styles.dashIconContainer}><HeartPulse size={24} color="#16a34a" /></View>
          <View>
            <Text style={styles.dashLabel}>Overall Status</Text>
            <Text style={styles.dashValue}>
              {lastRec
                ? lastRec.urgency === 'high' ? 'Needs Attention'
                : lastRec.urgency === 'mid' ? 'Monitoring'
                : 'Feeling Good'
                : 'Feeling Good'}
            </Text>
          </View>
        </View>
        
        <View style={styles.dashCardSmallContainer}>
          <View style={styles.dashCardSmall}>
            <Calendar size={20} color="#16a34a" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.dashLabel}>Last Checkup</Text>
              <Text style={styles.dashValueSmall}>{lastRec ? lastRec.dateStr || 'Recent' : 'None yet'}</Text>
            </View>
          </View>
          <View style={styles.dashCardSmall}>
            <Zap size={20} color="#16a34a" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.dashLabel}>Urgency</Text>
              <Text style={styles.dashValueSmall}>{lastRec ? lastRec.urgency.toUpperCase() : '—'}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Pill size={18} color="#0f172a" />
        <Text style={[styles.sectionTitle, { marginTop: 0, marginLeft: 8 }]}>Medication Reminders</Text>
      </View>
      
      {medsList.length > 0 ? (
        <View style={styles.medsCard}>
          {medsList.map((med: string, i: number) => (
            <View key={i} style={styles.medItem}>
              <Pill size={18} color="#16a34a" />
              <Text style={styles.medName}>{med}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>No medications added yet. Add in Profile →</Text>
      )}

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/chat')}>
          <MessageCircle size={20} color="#16a34a" />
          <Text style={styles.actionText}>Nura Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/profile')}>
          <User size={20} color="#16a34a" />
          <Text style={styles.actionText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/checkups')}>
          <Calendar size={20} color="#16a34a" />
          <Text style={styles.actionText}>Daily Checkup</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/community')}>
          <Users size={20} color="#16a34a" />
          <Text style={styles.actionText}>Community</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 40 },
  greeting: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 4 },
  location: { fontSize: 13, color: '#94a3b8', marginTop: 4 },
  scoreCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#16a34a', justifyContent: 'center', alignItems: 'center' },
  scoreText: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  tipCard: { backgroundColor: '#ffffff', padding: 20, borderRadius: 16, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  tipTitle: { fontSize: 12, fontWeight: '800', color: '#16a34a', letterSpacing: 1 },
  tipName: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  tipDesc: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 16 },
  videoBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e2e8f0', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6 },
  videoText: { color: '#16a34a', fontWeight: '700', fontSize: 13 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 12, marginTop: 8 },
  grid: { marginBottom: 24 },
  dashCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  cardLarge: { padding: 20 },
  dashIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  dashLabel: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  dashValue: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  dashCardSmallContainer: { flexDirection: 'row', gap: 12 },
  dashCardSmall: { flex: 1, backgroundColor: '#ffffff', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center' },
  dashValueSmall: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  medsCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 24 },
  medItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  medName: { fontSize: 16, color: '#1e293b', fontWeight: '500' },
  emptyText: { color: '#64748b', fontStyle: 'italic', marginBottom: 24 },
  actionsGrid: { flexDirection: 'row', gap: 12, marginBottom: 40, flexWrap: 'wrap' },
  actionBtn: { flexGrow: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', padding: 16, borderRadius: 16, alignItems: 'center', gap: 8, minWidth: '45%' },
  actionText: { color: '#334155', fontWeight: '600', fontSize: 14 },
  profileHeaderBtn: { alignItems: 'center', justifyContent: 'center' },
  avatarCircle: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#16a34a', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  avatarText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  profileBtnLabel: { fontSize: 11, color: '#64748b', fontWeight: '600', marginTop: 3 },
  chatCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#dcfce7', elevation: 2, shadowColor: '#16a34a', shadowOpacity: 0.08, shadowRadius: 10 },
  chatCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  chatIconBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center' },
  chatCardTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  chatCardSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  aiPill: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  aiPillText: { color: '#16a34a', fontSize: 10, fontWeight: '700' },
  chatPromptBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, justifyContent: 'space-between' },
  chatPromptPlaceholder: { fontSize: 13, color: '#94a3b8' },
  chatPromptSendBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center' },
  checkupBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 14, marginBottom: 20 },
  checkupIconBadge: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  checkupBannerTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  checkupBannerSub: { fontSize: 12, color: '#64748b', marginTop: 2 }
});
