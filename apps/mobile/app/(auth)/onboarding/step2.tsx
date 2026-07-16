import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useProfile } from '../../../src/context/ProfileContext';
import { ArrowLeft, Activity, Heart, Wind, Bone, Brain, Sparkles, PenLine } from 'lucide-react-native';

const CONDITIONS = [
  { id: 'diabetes', label: 'Diabetes', icon: Activity },
  { id: 'hypertension', label: 'Hypertension', icon: Heart },
  { id: 'asthma', label: 'Asthma', icon: Wind },
  { id: 'arthritis', label: 'Arthritis', icon: Bone },
  { id: 'anxiety', label: 'Anxiety', icon: Brain },
  { id: 'none', label: 'None', icon: Sparkles },
];

export default function OnboardingStep2() {
  const { profile, setProfile } = useProfile();
  const [conditions, setConditions] = useState<string[]>([]);
  const [otherCondition, setOtherCondition] = useState('');
  const [fastingMode, setFastingMode] = useState('none');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      if (Array.isArray(profile.conditions)) {
        const standard = CONDITIONS.map(c => c.id);
        const hasOther = profile.conditions.find((c: string) => !standard.includes(c));
        const matched = profile.conditions.filter((c: string) => standard.includes(c));
        
        const newConds = [...matched];
        if (hasOther) {
          newConds.push('other');
          setOtherCondition(hasOther);
        }
        setConditions(newConds);
      }
      if (profile.fastingMode) {
        setFastingMode(profile.fastingMode);
      }
    }
  }, [profile]);

  const toggleCondition = (c: string) => {
    if (c === 'none') {
      setConditions(['none']);
      setOtherCondition('');
      return;
    }
    const filtered = conditions.filter(x => x !== 'none');
    if (filtered.includes(c)) {
      setConditions(filtered.filter(x => x !== c));
    } else {
      setConditions([...filtered, c]);
    }
  };

  const handleNext = async () => {
    setLoading(true);
    const baseConditions = conditions.filter(c => c !== 'none' && c !== 'other');
    const allConditions = conditions.includes('other') && otherCondition.trim()
      ? [...baseConditions, otherCondition.trim()]
      : baseConditions;

    await setProfile({ 
      conditions: allConditions, 
      fastingMode: profile?.culturalHeritage === 'Ethiopia' ? fastingMode : 'none' 
    });
    setLoading(false);
    router.push('/(auth)/onboarding/step3');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>2 of 3</Text>
        </View>

        <Text style={styles.title}>Your health baseline</Text>
        <Text style={styles.subtitle}>Do you have any of these common conditions? (Optional)</Text>

        <View style={styles.form}>
          <View style={styles.chipContainer}>
            {CONDITIONS.map(c => (
              <TouchableOpacity 
                key={c.id} 
                style={[styles.chip, conditions.includes(c.id) && styles.chipActive]} 
                onPress={() => toggleCondition(c.id)}
              >
                <c.icon size={18} color={conditions.includes(c.id) ? '#ffffff' : '#16a34a'} />
                <Text style={[styles.chipText, conditions.includes(c.id) && styles.chipTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={[styles.chip, conditions.includes('other') && styles.chipActive, { flexBasis: '100%' }]} 
              onPress={() => toggleCondition('other')}
            >
              <PenLine size={18} color={conditions.includes('other') ? '#ffffff' : '#16a34a'} />
              <Text style={[styles.chipText, conditions.includes('other') && styles.chipTextActive]}>Other</Text>
            </TouchableOpacity>
          </View>

          {conditions.includes('other') && (
            <TextInput 
              style={[styles.input, { marginTop: 16 }]} 
              value={otherCondition}
              onChangeText={setOtherCondition}
              placeholder="e.g. Celiac disease, PCOS..." 
              autoFocus
            />
          )}

          {profile?.culturalHeritage === 'Ethiopia' && (
            <View style={{ marginTop: 32 }}>
              <Text style={styles.label}>Track Religious Fasting Calendars?</Text>
              <View style={styles.verticalOptions}>
                <TouchableOpacity style={[styles.optionCard, fastingMode === 'none' && styles.optionCardActive]} onPress={() => setFastingMode('none')}>
                  <View style={[styles.radio, fastingMode === 'none' && styles.radioActive]} />
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionText, fastingMode === 'none' && styles.optionTextActive]}>None</Text>
                    <Text style={styles.optionSubtext}>Track balanced global nutrition macros.</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.optionCard, fastingMode === 'orthodox' && styles.optionCardActive]} onPress={() => setFastingMode('orthodox')}>
                  <View style={[styles.radio, fastingMode === 'orthodox' && styles.radioActive]} />
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionText, fastingMode === 'orthodox' && styles.optionTextActive]}>Orthodox Christian</Text>
                    <Text style={styles.optionSubtext}>Adjusts for Wednesday/Friday and major Tsom periods.</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.optionCard, fastingMode === 'islamic' && styles.optionCardActive]} onPress={() => setFastingMode('islamic')}>
                  <View style={[styles.radio, fastingMode === 'islamic' && styles.radioActive]} />
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionText, fastingMode === 'islamic' && styles.optionTextActive]}>Islamic (Ramadan)</Text>
                    <Text style={styles.optionSubtext}>Adjusts for daily fasting windows and macros.</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.nextBtn} 
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextText}>Continue</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 24 },
  backBtn: { padding: 8, marginLeft: -8 },
  stepIndicator: { color: '#64748b', fontWeight: '600', fontSize: 16 },
  title: { fontSize: 32, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 8, marginBottom: 32 },
  form: { flex: 1 },
  label: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    backgroundColor: '#ffffff', 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    borderRadius: 12, 
    paddingVertical: 12, 
    paddingHorizontal: 16,
    flexGrow: 1
  },
  chipActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  chipText: { color: '#475569', fontWeight: '600', fontSize: 15 },
  chipTextActive: { color: '#ffffff' },
  verticalOptions: { gap: 12 },
  optionCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 },
  optionCardActive: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#cbd5e1' },
  radioActive: { borderColor: '#16a34a', backgroundColor: '#16a34a' },
  optionTextContainer: { flex: 1 },
  optionText: { fontSize: 16, color: '#1e293b', fontWeight: '600', marginBottom: 4 },
  optionTextActive: { color: '#16a34a' },
  optionSubtext: { fontSize: 13, color: '#64748b' },
  nextBtn: { backgroundColor: '#16a34a', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 40 },
  nextText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});
