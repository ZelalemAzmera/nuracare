import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { saveProfile, getProfile } from '../../../src/storage/profileStorage';

const CONDITIONS = ['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Arthritis', 'Thyroid Issue', 'None'];
const FASTING_MODES = ['Standard', 'Orthodox Christian (Tsom)', 'Islamic (Ramadan)'];

export default function OnboardingStep2() {
  const existingProfile = getProfile() || {};
  const [conditions, setConditions] = useState<string[]>(existingProfile.conditions || []);
  const [fastingMode, setFastingMode] = useState(existingProfile.fastingMode || 'Standard');

  const toggleCondition = (c: string) => {
    if (c === 'None') {
      setConditions(['None']);
      return;
    }
    const filtered = conditions.filter(x => x !== 'None');
    if (filtered.includes(c)) {
      setConditions(filtered.filter(x => x !== c));
    } else {
      setConditions([...filtered, c]);
    }
  };

  const handleNext = () => {
    saveProfile({ ...existingProfile, conditions, fastingMode });
    router.push('/(auth)/onboarding/step3');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepIndicator}>Step 2 of 4</Text>
        <Text style={styles.title}>Your Health Profile</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Do you have any of these conditions?</Text>
        <Text style={styles.subtitle}>Select all that apply</Text>
        <View style={styles.chipContainer}>
          {CONDITIONS.map(c => (
            <TouchableOpacity key={c} style={[styles.chip, conditions.includes(c) && styles.chipActive]} onPress={() => toggleCondition(c)}>
              <Text style={[styles.chipText, conditions.includes(c) && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Fasting Routine</Text>
        <Text style={styles.subtitle}>Helps Nura tailor your nutrition advice</Text>
        <View style={styles.verticalOptions}>
          {FASTING_MODES.map(mode => (
            <TouchableOpacity key={mode} style={[styles.optionCard, fastingMode === mode && styles.optionCardActive]} onPress={() => setFastingMode(mode)}>
              <View style={[styles.radio, fastingMode === mode && styles.radioActive]} />
              <Text style={[styles.optionText, fastingMode === mode && styles.optionTextActive]}>{mode}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.nextBtn, conditions.length === 0 && styles.disabledBtn]} 
        onPress={handleNext}
        disabled={conditions.length === 0}
      >
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24 },
  header: { marginTop: 60, marginBottom: 40 },
  stepIndicator: { color: '#16a34a', fontWeight: '700', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a' },
  form: { flex: 1 },
  label: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 4, marginTop: 24 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 },
  chipActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  chipText: { color: '#475569', fontWeight: '600' },
  chipTextActive: { color: '#ffffff' },
  verticalOptions: { gap: 12 },
  optionCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionCardActive: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#cbd5e1' },
  radioActive: { borderColor: '#16a34a', backgroundColor: '#16a34a' },
  optionText: { fontSize: 16, color: '#475569', fontWeight: '500' },
  optionTextActive: { color: '#0f172a', fontWeight: '600' },
  nextBtn: { backgroundColor: '#16a34a', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 40, marginBottom: 40 },
  disabledBtn: { opacity: 0.5 },
  nextText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});
