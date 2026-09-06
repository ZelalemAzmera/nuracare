import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Sparkles, CheckCircle2, Heart, ShieldCheck, Users, Pill, ArrowRight } from 'lucide-react-native';
import { saveProfile, getProfile } from '../../../src/storage/profileStorage';
import { useAuthStore } from '../../../src/store';
import FloatingNatureBackground from '../../../src/components/ambient/FloatingNatureBackground';

export default function OnboardingStep4() {
  const existingProfile = getProfile() || {};
  const { setUser } = useAuthStore();

  const handleComplete = () => {
    saveProfile({ ...existingProfile, onboardingCompleted: true });
    setUser({
      id: existingProfile.id || 'user_' + Date.now(),
      name: existingProfile.name || 'Wellness Friend',
      fastingMode: existingProfile.fastingMode || 'Orthodox Christian (Tsom)',
    });
    router.replace('/(tabs)');
  };

  const highlights = [
    {
      icon: <Heart size={20} color="#16a34a" />,
      title: 'Adaptive Living Home',
      desc: 'Time-of-day circadian insights and 5-core resilience tracking.',
    },
    {
      icon: <Pill size={20} color="#16a34a" />,
      title: 'Medication Adherence',
      desc: 'Chronological dosage schedule with strict medical safety guarantees.',
    },
    {
      icon: <Users size={20} color="#16a34a" />,
      title: 'Privacy-Protected Community',
      desc: 'Habit accountability where private health metrics never leak.',
    },
  ];

  return (
    <FloatingNatureBackground showSoundToggle={true}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.stepPill}>
            <Text style={styles.stepText}>Final Step</Text>
          </View>
        </View>

        <View style={styles.titleSection}>
          <View style={styles.sparkleCircle}>
            <Sparkles size={32} color="#16a34a" />
          </View>
          <Text style={styles.title}>You are all set</Text>
          <Text style={styles.subtitle}>
            Your personalized natural health sanctuary is ready.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeading}>What awaits you:</Text>

          {highlights.map((h, i) => (
            <View key={i} style={styles.highlightRow}>
              <View style={styles.iconCircle}>{h.icon}</View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.highlightTitle}>{h.title}</Text>
                <Text style={styles.highlightDesc}>{h.desc}</Text>
              </View>
            </View>
          ))}

          <View style={styles.privacyNote}>
            <ShieldCheck size={16} color="#16a34a" />
            <Text style={styles.privacyNoteText}>
              All checkups, biometric inputs, and medications remain private by design on your device.
            </Text>
          </View>

          <TouchableOpacity style={styles.enterBtn} onPress={handleComplete} activeOpacity={0.85}>
            <Text style={styles.enterBtnText}>Enter NuraCare Sanctuary</Text>
            <ArrowRight size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </FloatingNatureBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  stepPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  stepText: { fontSize: 12, fontWeight: '700', color: '#16a34a' },
  titleSection: { alignItems: 'center', marginBottom: 24 },
  sparkleCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 12,
    shadowColor: '#16a34a',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 2,
  },
  title: { fontSize: 28, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 4 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeading: { fontSize: 14, fontWeight: '800', color: '#0f172a', marginBottom: 14 },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  highlightTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  highlightDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  privacyNoteText: { flex: 1, fontSize: 11, color: '#166534', lineHeight: 15 },
  enterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#16a34a',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  enterBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
});
