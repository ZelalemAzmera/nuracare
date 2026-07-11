import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { saveProfile, getProfile } from '../../../src/storage/profileStorage';
import { X, Plus } from 'lucide-react-native';

export default function OnboardingStep3() {
  const existingProfile = getProfile() || {};
  const [medications, setMedications] = useState<string[]>(existingProfile.medications || []);
  const [currentMed, setCurrentMed] = useState('');

  const addMedication = () => {
    if (currentMed.trim() && !medications.includes(currentMed.trim())) {
      setMedications([...medications, currentMed.trim()]);
      setCurrentMed('');
    }
  };

  const removeMedication = (med: string) => {
    setMedications(medications.filter(m => m !== med));
  };

  const handleNext = () => {
    saveProfile({ ...existingProfile, medications });
    router.push('/(auth)/onboarding/step4');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepIndicator}>Step 3 of 4</Text>
        <Text style={styles.title}>Medications</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Are you taking any regular medications?</Text>
        <Text style={styles.subtitle}>This helps us provide safe AI recommendations.</Text>
        
        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.input} 
            value={currentMed} 
            onChangeText={setCurrentMed} 
            placeholder="e.g. Metformin 500mg" 
            onSubmitEditing={addMedication}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addMedication}>
            <Plus size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.medsContainer}>
          {medications.map(med => (
            <View key={med} style={styles.medTag}>
              <Text style={styles.medText}>{med}</Text>
              <TouchableOpacity onPress={() => removeMedication(med)}>
                <X size={16} color="#475569" />
              </TouchableOpacity>
            </View>
          ))}
          {medications.length === 0 && (
            <Text style={styles.emptyText}>No medications added yet.</Text>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
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
  label: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  inputContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  input: { flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16 },
  addBtn: { backgroundColor: '#16a34a', borderRadius: 12, width: 54, alignItems: 'center', justifyContent: 'center' },
  medsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  medTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e2e8f0', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, gap: 8 },
  medText: { color: '#0f172a', fontWeight: '500' },
  emptyText: { color: '#94a3b8', fontStyle: 'italic', marginTop: 12 },
  nextBtn: { backgroundColor: '#16a34a', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 40, marginBottom: 40 },
  nextText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});
