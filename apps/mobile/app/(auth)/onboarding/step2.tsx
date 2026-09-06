import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useProfile } from '../../../src/context/ProfileContext';
import { ArrowLeft, ArrowRight, Activity, Heart, Wind, Bone, Brain, Sparkles, Clock } from 'lucide-react-native';
import FloatingNatureBackground from '../../../src/components/ambient/FloatingNatureBackground';

const CONDITIONS = [
  { id: 'diabetes', label: 'Diabetes', icon: Activity },
  { id: 'hypertension', label: 'Blood Pressure', icon: Heart },
  { id: 'asthma', label: 'Respiratory / Asthma', icon: Wind },
  { id: 'joint', label: 'Joint & Bone Mobility', icon: Bone },
  { id: 'stress', label: 'High Stress / Burnout', icon: Brain },
  { id: 'none', label: 'General Vitality', icon: Sparkles },
];

const FASTING_OPTIONS = [
  { id: 'Orthodox Christian (Tsom)', label: 'Orthodox Christian (Tsom)', desc: 'Wed/Fri and fasting seasons without animal products' },
  { id: 'Islamic (Ramadan)', label: 'Islamic (Ramadan / Sunnah)', desc: 'Dawn to sunset fasting with Suhoor and Iftar meals' },
  { id: 'Intermittent Fasting (16:8)', label: 'Intermittent Fasting (16:8)', desc: '16 hours fasting, 8 hours eating window' },
  { id: 'none', label: 'Standard Nutrition', desc: 'No structured fasting routine' },
];

export default function OnboardingStep2() {
  const { profile, setProfile } = useProfile();
  const [conditions, setConditions] = useState<string[]>(['none']);
  const [fastingMode, setFastingMode] = useState('Orthodox Christian (Tsom)');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      if (Array.isArray(profile.conditions) && profile.conditions.length > 0) {
        setConditions(profile.conditions);
      }
      if (profile.fastingMode) {
        setFastingMode(profile.fastingMode);
      }
    }
  }, [profile]);

  const toggleCondition = (c: string) => {
    if (c === 'none') {
      setConditions(['none']);
      return;
    }
    const filtered = conditions.filter(x => x !== 'none');
    if (filtered.includes(c)) {
      setConditions(filtered.length === 1 ? ['none'] : filtered.filter(x => x !== c));
    } else {
      setConditions([...filtered, c]);
    }
  };

  const handleNext = async () => {
    setLoading(true);
    await setProfile({
      conditions,
      fastingMode,
    });
    setLoading(false);
    router.push('/(auth)/onboarding/step3');
  };

  return (
    <FloatingNatureBackground showSoundToggle={true}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color="#0f172a" />
            </TouchableOpacity>
            <View style={styles.stepPill}>
              <Text style={styles.stepText}>Step 2 of 4</Text>
            </View>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.title}>Health Focus & Fasting</Text>
            <Text style={styles.subtitle}>
              Customize AI nutrition and checkup advice to your biological rhythms.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Health Focus Areas</Text>
            <View style={styles.conditionsGrid}>
              {CONDITIONS.map((item) => {
                const Icon = item.icon;
                const active = conditions.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.conditionBtn, active && styles.conditionBtnActive]}
                    onPress={() => toggleCondition(item.id)}
                  >
                    <Icon size={18} color={active ? '#16a34a' : '#64748b'} />
                    <Text style={[styles.conditionBtnText, active && styles.conditionBtnTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.label, { marginTop: 18 }]}>Fasting Schedule (Tsom / Routine)</Text>
            {FASTING_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.fastingCard, fastingMode === opt.id && styles.fastingCardActive]}
                onPress={() => setFastingMode(opt.id)}
              >
                <View style={styles.fastingRadio}>
                  {fastingMode === opt.id && <View style={styles.fastingRadioDot} />}
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.fastingName, fastingMode === opt.id && styles.fastingNameActive]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.fastingDesc}>{opt.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.nextBtn} onPress={handleNext} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={styles.btnRow}>
                  <Text style={styles.nextBtnText}>Continue</Text>
                  <ArrowRight size={18} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </FloatingNatureBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  stepText: { fontSize: 12, fontWeight: '700', color: '#16a34a' },
  titleSection: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 19 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  label: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 10 },
  conditionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  conditionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  conditionBtnActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  conditionBtnText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  conditionBtnTextActive: { color: '#16a34a', fontWeight: '800' },
  fastingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fastingCardActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#16a34a',
  },
  fastingRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fastingRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  fastingName: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  fastingNameActive: { color: '#16a34a' },
  fastingDesc: { fontSize: 11, color: '#64748b', marginTop: 2 },
  nextBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nextBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
});
