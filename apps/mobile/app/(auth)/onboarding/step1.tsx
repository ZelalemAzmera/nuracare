import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useProfile } from '../../../src/context/ProfileContext';
import { ArrowLeft, MapPin, ArrowRight } from 'lucide-react-native';
import FloatingNatureBackground from '../../../src/components/ambient/FloatingNatureBackground';

const COUNTRIES = ['Ethiopia', 'Kenya', 'Nigeria', 'South Africa', 'United States', 'United Kingdom', 'Other'];
const LANGUAGES = ['English', 'Amharic', 'Oromiffa'];

export default function OnboardingStep1() {
  const { profile, setProfile } = useProfile();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('Ethiopia');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.name) setName(profile.name);
      if (profile.age) setAge(profile.age.toString());
      if (profile.culturalHeritage) setCountry(profile.culturalHeritage);
      if (profile.langPref) setLanguage(profile.langPref);
    }
  }, [profile]);

  const handleNext = async () => {
    setLoading(true);
    await setProfile({
      name: name.trim() || 'Wellness Friend',
      age: parseInt(age, 10) || null,
      culturalHeritage: country,
      langPref: language,
    });
    setLoading(false);
    router.push('/(auth)/onboarding/step2');
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
              <Text style={styles.stepText}>Step 1 of 4</Text>
            </View>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.title}>Let's get acquainted</Text>
            <Text style={styles.subtitle}>
              Personalize your natural health companion with your language and cultural preferences.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>What should we call you?</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Sarah or Abebe"
              placeholderTextColor="#94a3b8"
              autoCapitalize="words"
            />

            <Text style={styles.label}>How old are you?</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="e.g. 28"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Cultural Heritage & Wellness Background</Text>
            <View style={styles.chipContainer}>
              {COUNTRIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, country === c && styles.chipActive]}
                  onPress={() => setCountry(c)}
                >
                  <Text style={[styles.chipText, country === c && styles.chipTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Preferred Language</Text>
            <View style={styles.chipContainer}>
              {LANGUAGES.map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.chip, language === l && styles.chipActive]}
                  onPress={() => setLanguage(l)}
                >
                  <Text style={[styles.chipText, language === l && styles.chipTextActive]}>
                    {l}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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
  label: { fontSize: 12, fontWeight: '700', color: '#334155', marginTop: 12, marginBottom: 8 },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  chipText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  chipTextActive: { color: '#16a34a', fontWeight: '800' },
  nextBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nextBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
});
