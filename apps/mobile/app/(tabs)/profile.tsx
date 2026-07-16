import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router, useRouter } from 'expo-router';
import { useAuthStore, useWellnessStore } from '../../src/store';
import { useProfile } from '../../src/context/ProfileContext';
import { User, ClipboardList, Watch, LogOut, ChevronRight, X, Plus, CheckCircle2, Circle } from 'lucide-react-native';
import { TSOM_TYPES } from '../../src/lib/ethiopianCalendar';

export default function ProfileScreen() {
  const { setUser } = useAuthStore();
  const { setScore } = useWellnessStore();
  const { profile, setProfile, clearProfile } = useProfile();
  const localRouter = useRouter();
  
  // Meds form
  const [newMed, setNewMed] = useState('');

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => {
        clearProfile();
        setUser(null);
        setScore(100);
        router.replace('/(auth)/login');
      }}
    ]);
  };

  const addMed = async () => {
    if (newMed.trim() && profile) {
      const meds = profile.medications ? profile.medications.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
      if (!meds.includes(newMed.trim())) {
        const updatedMeds = [...meds, newMed.trim()].join(', ');
        await setProfile({ medications: updatedMeds });
      }
      setNewMed('');
    }
  };

  const removeMed = async (med: string) => {
    if (profile) {
      const meds = profile.medications ? profile.medications.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
      const updatedMeds = meds.filter((m: string) => m !== med).join(', ');
      await setProfile({ medications: updatedMeds });
    }
  };

  const setFastingMode = async (mode: string) => {
    if (profile) {
      await setProfile({ fastingMode: mode });
    }
  };

  if (!profile) return null;

  const medsList = profile.medications ? profile.medications.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.name ? profile.name[0].toUpperCase() : 'U'}</Text>
        </View>
        <Text style={styles.name}>{profile.name || 'User'}</Text>
        <Text style={styles.details}>{profile.age ? `${profile.age} yrs old` : ''}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conditions</Text>
        <View style={styles.infoTags}>
          {profile.conditions && profile.conditions.length > 0 ? (
            profile.conditions.map((c: string) => (
              <View key={c} style={styles.infoTag}><Text style={styles.infoTagText}>{c}</Text></View>
            ))
          ) : (
            <Text style={styles.emptyText}>None reported</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Records</Text>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/records')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 12 }}>
              <ClipboardList size={24} color="#16a34a" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Your Historical Vault</Text>
              <Text style={styles.cardDesc}>Symptom logs and files.</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#cbd5e1" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medications</Text>
        <View style={styles.medsCard}>
          <View style={styles.medsInputRow}>
            <TextInput 
              style={styles.medInput} 
              value={newMed} 
              onChangeText={setNewMed} 
              placeholder="e.g. Metformin 500mg..." 
            />
            <TouchableOpacity style={styles.addBtn} onPress={addMed}>
              <Plus size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <View style={styles.medsList}>
            {medsList.map((med: string) => (
              <View key={med} style={styles.medTag}>
                <Text style={styles.medText}>{med}</Text>
                <TouchableOpacity onPress={() => removeMed(med)}>
                  <X size={16} color="#64748b" />
                </TouchableOpacity>
              </View>
            ))}
            {medsList.length === 0 && <Text style={styles.emptyText}>None reported</Text>}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connected Devices</Text>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/devices')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 12 }}>
              <Watch size={24} color="#16a34a" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Wearables & Health Apps</Text>
              <Text style={styles.cardDesc}>Sync Apple Health, Google Fit, Fitbit...</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#cbd5e1" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diet & Fasting Preferences</Text>
        <View style={styles.prefsCard}>
          <TouchableOpacity style={styles.radioRow} onPress={() => setFastingMode(TSOM_TYPES.NONE)}>
            {profile.fastingMode === TSOM_TYPES.NONE ? <CheckCircle2 size={24} color="#16a34a" /> : <Circle size={24} color="#cbd5e1" />}
            <Text style={styles.radioText}>Standard Diet (No Restrictions)</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.radioRow} onPress={() => setFastingMode(TSOM_TYPES.ORTHODOX)}>
            {profile.fastingMode === TSOM_TYPES.ORTHODOX ? <CheckCircle2 size={24} color="#16a34a" /> : <Circle size={24} color="#cbd5e1" />}
            <Text style={styles.radioText}>Orthodox Christian Fasting (Tsom)</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.radioRow} onPress={() => setFastingMode(TSOM_TYPES.ISLAMIC)}>
            {profile.fastingMode === TSOM_TYPES.ISLAMIC ? <CheckCircle2 size={24} color="#16a34a" /> : <Circle size={24} color="#cbd5e1" />}
            <Text style={styles.radioText}>Islamic Fasting (Ramadan)</Text>
          </TouchableOpacity>
          <Text style={styles.prefsHint}>NuraCare will adjust nutritional recommendations and athletic tracking based on your active fasting cycle.</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medical Notes</Text>
        <View style={styles.notesCard}>
          <Text style={styles.notesText}>{profile.medicalNotes || 'No notes uploaded yet. Use the web app to upload PDFs or images.'}</Text>
        </View>
      </View>

      <View style={[styles.section, { marginBottom: 40 }]}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#e2e8f0', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#ffffff' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  details: { fontSize: 16, color: '#64748b', marginTop: 4 },
  
  section: { marginBottom: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  
  infoTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  infoTag: { backgroundColor: '#f0fdf4', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#bbf7d0' },
  infoTagText: { color: '#16a34a', fontSize: 14, fontWeight: '600' },
  emptyText: { color: '#94a3b8', fontStyle: 'italic', fontSize: 15 },
  
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  cardDesc: { fontSize: 13, color: '#64748b', marginTop: 2 },
  
  medsCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  medsInputRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  medInput: { flex: 1, backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12, fontSize: 16 },
  addBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center' },
  medsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  medTag: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f1f5f9', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  medText: { fontSize: 15, color: '#1e293b', fontWeight: '500' },
  
  prefsCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  radioText: { fontSize: 15, fontWeight: '600', color: '#334155' },
  divider: { height: 1, backgroundColor: '#f1f5f9' },
  prefsHint: { fontSize: 13, color: '#64748b', marginTop: 12, lineHeight: 20 },
  
  notesCard: { backgroundColor: '#f1f5f9', padding: 16, borderRadius: 16 },
  notesText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#fecaca' },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#ef4444' }
});
