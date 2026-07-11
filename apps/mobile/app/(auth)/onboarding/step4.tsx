import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { saveProfile, getProfile } from '../../../src/storage/profileStorage';

export default function OnboardingStep4() {
  const existingProfile = getProfile() || {};
  const [medicalNotes, setMedicalNotes] = useState(existingProfile.medicalNotes || '');

  const handleComplete = () => {
    saveProfile({ ...existingProfile, medicalNotes, onboardingCompleted: true });
    // In a real app we would sync this to Supabase here
    router.replace('/(tabs)');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepIndicator}>Step 4 of 4</Text>
        <Text style={styles.title}>Medical Notes</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Anything else Nura should know?</Text>
        <Text style={styles.subtitle}>Allergies, family history, or general health goals.</Text>
        
        <TextInput
          style={styles.textArea}
          value={medicalNotes}
          onChangeText={setMedicalNotes}
          placeholder="I have a slight allergy to peanuts..."
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleComplete}>
        <Text style={styles.submitText}>Complete Setup</Text>
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
  label: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  textArea: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, minHeight: 150 },
  submitBtn: { backgroundColor: '#16a34a', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 40, marginBottom: 40 },
  submitText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});
