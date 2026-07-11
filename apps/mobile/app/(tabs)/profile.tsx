import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { getProfile, saveProfile, clearProfile } from '../../src/storage/profileStorage';
import { useAuthStore, useWellnessStore } from '../../src/store';
import { User, Activity, Pill, Settings, LogOut, ChevronRight, X, Plus, Star } from 'lucide-react-native';

export default function ProfileScreen() {
  const { setUser } = useAuthStore();
  const { setScore } = useWellnessStore();
  const [profile, setLocalProfile] = useState<any>({});
  
  // Meds form
  const [newMed, setNewMed] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const p = getProfile();
    if (p) setLocalProfile(p);
  };

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

  const addMed = () => {
    if (newMed.trim()) {
      const meds = profile.medications || [];
      if (!meds.includes(newMed.trim())) {
        const updated = { ...profile, medications: [...meds, newMed.trim()] };
        saveProfile(updated);
        setLocalProfile(updated);
      }
      setNewMed('');
    }
  };

  const removeMed = (med: string) => {
    const meds = profile.medications || [];
    const updated = { ...profile, medications: meds.filter((m: string) => m !== med) };
    saveProfile(updated);
    setLocalProfile(updated);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.name ? profile.name[0].toUpperCase() : 'U'}</Text>
        </View>
        <Text style={styles.name}>{profile.name || 'User Profile'}</Text>
        <Text style={styles.details}>{profile.age ? `${profile.age} yrs • ` : ''}{profile.location?.country || ''}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medications</Text>
        <View style={styles.medsCard}>
          <View style={styles.medsInputRow}>
            <TextInput style={styles.medInput} value={newMed} onChangeText={setNewMed} placeholder="Add new medication..." />
            <TouchableOpacity style={styles.addBtn} onPress={addMed}>
              <Plus size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <View style={styles.medsList}>
            {(profile.medications || []).map((med: string) => (
              <View key={med} style={styles.medTag}>
                <Text style={styles.medText}>{med}</Text>
                <TouchableOpacity onPress={() => removeMed(med)}>
                  <X size={16} color="#64748b" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Profile</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Conditions</Text>
          <View style={styles.infoTags}>
            {(profile.conditions || []).map((c: string) => (
              <View key={c} style={styles.infoTag}><Text style={styles.infoTagText}>{c}</Text></View>
            ))}
            {(!profile.conditions || profile.conditions.length === 0) && <Text style={styles.emptyText}>None reported</Text>}
          </View>
        </View>
        <View style={styles.divider} />
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Fasting Mode</Text>
          <Text style={styles.infoValue}>{profile.fastingMode || 'Standard'}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Language</Text>
          <Text style={styles.infoValue}>{profile.language || 'English'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/subscription')}>
          <Star size={20} color="#f59e0b" />
          <Text style={styles.settingText}>Nura Premium</Text>
          <ChevronRight size={20} color="#cbd5e1" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.settingRow}>
          <Settings size={20} color="#64748b" />
          <Text style={styles.settingText}>Account Settings</Text>
          <ChevronRight size={20} color="#cbd5e1" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
          <LogOut size={20} color="#ef4444" />
          <Text style={[styles.settingText, { color: '#ef4444' }]}>Sign Out</Text>
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
  medsCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  medsInputRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  medInput: { flex: 1, backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12, fontSize: 16 },
  addBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center' },
  medsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  medTag: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f1f5f9', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  medText: { fontSize: 15, color: '#1e293b', fontWeight: '500' },
  infoRow: { paddingVertical: 12, backgroundColor: '#ffffff', paddingHorizontal: 16, borderRadius: 16, marginBottom: 8 },
  infoLabel: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  infoValue: { fontSize: 16, color: '#0f172a', fontWeight: '500' },
  infoTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  infoTag: { backgroundColor: '#f0fdf4', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: '#bbf7d0' },
  infoTagText: { color: '#16a34a', fontSize: 14, fontWeight: '600' },
  emptyText: { color: '#94a3b8', fontStyle: 'italic', fontSize: 15 },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 8 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, paddingHorizontal: 16, backgroundColor: '#ffffff', borderRadius: 16 },
  settingText: { fontSize: 16, color: '#1e293b', fontWeight: '500' }
});
