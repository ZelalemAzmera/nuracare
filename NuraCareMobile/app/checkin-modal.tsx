import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useWellnessStore } from '../src/store';
import { TriageEngine } from '../src/services/ai';
import { calculateWellnessScore } from '../src/services/wellness/wellnessEngine';

export default function CheckInModal() {
  const { addCheckIn, score, setScore, checkIns } = useWellnessStore();
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [sleep, setSleep] = useState(7);
  const [stress, setStress] = useState(5);
  const [tension, setTension] = useState('None');

  const handleSubmit = () => {
    // Determine urgency using our Mock AI Triage Engine
    const urgency = TriageEngine.analyzeUrgency(stress, energy, sleep);
    
    const newCheckIn = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      mood,
      energy,
      sleep,
      stress,
      tension,
      urgency,
      tags: [],
    };

    // Save to store
    addCheckIn(newCheckIn);

    // Calculate new Wellness Score based on the new checkin
    // We pass the new checkIn and the previous score to wellnessEngine
    const newScoreObj = calculateWellnessScore(score, newCheckIn);
    setScore(newScoreObj.score);

    // Close modal
    router.back();
  };

  const renderSlider = (label: string, value: number, setValue: (val: number) => void, max: number = 10) => (
    <View style={styles.sliderContainer}>
      <Text style={styles.label}>{label} ({value}/{max})</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity style={styles.stepperBtn} onPress={() => setValue(Math.max(0, value - 1))}>
          <Text style={styles.stepperText}>-</Text>
        </TouchableOpacity>
        <TextInput 
          style={styles.numberInput} 
          value={value.toString()} 
          onChangeText={(val) => setValue(Number(val) || 0)} 
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.stepperBtn} onPress={() => setValue(Math.min(max, value + 1))}>
          <Text style={styles.stepperText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Check-in</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.closeBtn}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>How are you feeling today?</Text>

      {renderSlider('Mood', mood, setMood)}
      {renderSlider('Energy Level', energy, setEnergy)}
      {renderSlider('Sleep (Hours)', sleep, setSleep, 12)}
      {renderSlider('Stress Level', stress, setStress)}

      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Physical Tension</Text>
        <View style={styles.tensionRow}>
          {['None', 'Neck', 'Back', 'Joints'].map(area => (
            <TouchableOpacity 
              key={area}
              style={[styles.tensionBtn, tension === area && styles.tensionBtnActive]}
              onPress={() => setTension(area)}
            >
              <Text style={[styles.tensionText, tension === area && styles.tensionTextActive]}>{area}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Save Check-in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  closeBtn: { fontSize: 16, color: '#64748b' },
  subtitle: { fontSize: 16, color: '#475569', marginBottom: 24 },
  sliderContainer: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 8 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepperBtn: { width: 40, height: 40, backgroundColor: '#f1f5f9', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  stepperText: { fontSize: 20, fontWeight: '600', color: '#1e293b' },
  numberInput: { flex: 1, height: 40, backgroundColor: '#f8fafc', borderRadius: 8, textAlign: 'center', fontSize: 16, fontWeight: '500' },
  tensionRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tensionBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#f1f5f9' },
  tensionBtnActive: { backgroundColor: '#16a34a' },
  tensionText: { color: '#475569', fontWeight: '500' },
  tensionTextActive: { color: '#ffffff' },
  submitBtn: { backgroundColor: '#16a34a', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12, marginBottom: 40 },
  submitText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});
