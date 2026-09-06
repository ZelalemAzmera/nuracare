import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Wind, Play, Pause, RefreshCw } from 'lucide-react-native';

interface MentalWellnessCardProps {
  title?: string;
  subtitle?: string;
  payload?: Record<string, any>;
}

export default function MentalWellnessCard({
  title = 'Mindful Reset',
  subtitle = '4-7-8 Breathwork for stress regulation'
}: MentalWellnessCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'Inhale (4s)' | 'Hold (7s)' | 'Exhale (8s)'>('Inhale (4s)');

  const toggleExercise = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Wind size={22} color="#0d9488" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <TouchableOpacity style={styles.playBtn} onPress={toggleExercise} activeOpacity={0.7}>
          {isPlaying ? <Pause size={16} color="#ffffff" /> : <Play size={16} color="#ffffff" />}
          <Text style={styles.playBtnText}>{isPlaying ? 'Pause' : 'Start 2 min'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.exerciseBody}>
        <View style={styles.phaseIndicator}>
          <Text style={styles.phaseText}>{isPlaying ? phase : 'Ready to begin'}</Text>
          <Text style={styles.phaseSub}>Lowers heart rate & relieves nervous tension</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#f0fdfa', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  cardSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  playBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d9488', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 6 },
  playBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  exerciseBody: { backgroundColor: '#f8fafc', padding: 14, borderRadius: 14, alignItems: 'center' },
  phaseIndicator: { alignItems: 'center' },
  phaseText: { fontSize: 15, fontWeight: '700', color: '#0d9488', marginBottom: 2 },
  phaseSub: { fontSize: 12, color: '#64748b' }
});
