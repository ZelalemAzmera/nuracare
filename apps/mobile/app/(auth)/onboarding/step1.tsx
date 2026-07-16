import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useProfile } from '../../../src/context/ProfileContext';
import { ArrowLeft, MapPin } from 'lucide-react-native';

const COUNTRIES = ['Ethiopia', 'Kenya', 'Nigeria', 'South Africa', 'United States', 'United Kingdom', 'Other'];
const LANGUAGES = ['English', 'Amharic', 'Oromiffa'];

export default function OnboardingStep1() {
  const { profile, setProfile } = useProfile();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('');
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
      name,
      age: parseInt(age, 10) || null,
      culturalHeritage: country,
      langPref: language,
    });
    setLoading(false);
    router.push('/(auth)/onboarding/step2');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>1 of 3</Text>
        </View>
        
        <Text style={styles.title}>Let's get acquainted</Text>
        <Text style={styles.subtitle}>Tell us a bit about yourself so we can personalize your experience.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>What's your name?</Text>
          <TextInput 
            style={styles.input} 
            value={name} 
            onChangeText={setName} 
            placeholder="e.g. Sarah" 
            autoCapitalize="words"
          />

          <Text style={styles.label}>How old are you?</Text>
          <TextInput 
            style={styles.input} 
            value={age} 
            onChangeText={setAge} 
            placeholder="e.g. 28" 
            keyboardType="numeric" 
          />

          <Text style={styles.label}>Location Born (Cultural Heritage)</Text>
          <View style={styles.chipContainer}>
            {COUNTRIES.map(c => (
              <TouchableOpacity key={c} style={[styles.chip, country === c && styles.chipActive]} onPress={() => setCountry(c)}>
                <Text style={[styles.chipText, country === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {country === 'Other' && (
             <TextInput 
               style={[styles.input, { marginTop: 12 }]} 
               placeholder="Please specify" 
               onChangeText={setCountry}
             />
          )}

          <Text style={styles.label}>Language & Presentation</Text>
          <View style={styles.chipContainer}>
            {LANGUAGES.map(l => (
              <TouchableOpacity key={l} style={[styles.chip, language === l && styles.chipActive]} onPress={() => setLanguage(l)}>
                <Text style={[styles.chipText, language === l && styles.chipTextActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.label}>Location Right Now (Optional)</Text>
          <TouchableOpacity style={styles.locationBtn}>
            <MapPin size={20} color="#16a34a" />
            <Text style={styles.locationText}>Pin My Location</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.nextBtn, (!name || !age) && styles.disabledBtn]} 
          onPress={handleNext}
          disabled={!name || !age || loading}
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
  label: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 12, marginTop: 24 },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16 },
  chipActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  chipText: { color: '#475569', fontWeight: '500' },
  chipTextActive: { color: '#ffffff', fontWeight: '600' },
  locationBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', padding: 16, borderRadius: 12, gap: 8 },
  locationText: { color: '#16a34a', fontWeight: '600', fontSize: 16 },
  nextBtn: { backgroundColor: '#16a34a', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 40 },
  disabledBtn: { opacity: 0.5 },
  nextText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});
