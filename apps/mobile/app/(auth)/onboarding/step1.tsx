import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { saveProfile, getProfile } from '../../../src/storage/profileStorage';

const COUNTRIES = ['Ethiopia', 'Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Nigeria', 'Ghana', 'South Africa', 'Other'];
const LANGUAGES = ['English', 'Amharic', 'Oromo', 'Tigrinya', 'Swahili', 'Other'];

export default function OnboardingStep1() {
  const existingProfile = getProfile() || {};
  const [name, setName] = useState(existingProfile.name || '');
  const [age, setAge] = useState(existingProfile.age?.toString() || '');
  const [country, setCountry] = useState(existingProfile.location?.country || '');
  const [language, setLanguage] = useState(existingProfile.language || 'English');

  const handleNext = () => {
    saveProfile({
      ...existingProfile,
      name,
      age: parseInt(age, 10),
      location: { country },
      language
    });
    router.push('/(auth)/onboarding/step2');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepIndicator}>Step 1 of 4</Text>
        <Text style={styles.title}>Let's get to know you</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>What should we call you?</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" />

        <Text style={styles.label}>Your Age</Text>
        <TextInput style={styles.input} value={age} onChangeText={setAge} placeholder="e.g. 35" keyboardType="numeric" />

        <Text style={styles.label}>Where are you located?</Text>
        <View style={styles.chipContainer}>
          {COUNTRIES.map(c => (
            <TouchableOpacity key={c} style={[styles.chip, country === c && styles.chipActive]} onPress={() => setCountry(c)}>
              <Text style={[styles.chipText, country === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Preferred Language</Text>
        <View style={styles.chipContainer}>
          {LANGUAGES.map(l => (
            <TouchableOpacity key={l} style={[styles.chip, language === l && styles.chipActive]} onPress={() => setLanguage(l)}>
              <Text style={[styles.chipText, language === l && styles.chipTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.nextBtn, (!name || !age || !country || !language) && styles.disabledBtn]} 
        onPress={handleNext}
        disabled={!name || !age || !country || !language}
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
  label: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 12, marginTop: 24 },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16 },
  chipActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  chipText: { color: '#475569', fontWeight: '500' },
  chipTextActive: { color: '#ffffff' },
  nextBtn: { backgroundColor: '#16a34a', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 40, marginBottom: 40 },
  disabledBtn: { opacity: 0.5 },
  nextText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});
