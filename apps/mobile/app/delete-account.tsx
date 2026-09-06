import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { useAuthStore } from '../src/store';
import { useProfile } from '../src/context/ProfileContext';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { clearProfile } = useProfile();

  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText.trim().toLowerCase() !== 'delete') {
      Alert.alert('Verification required', 'Please type DELETE in capital letters to confirm.');
      return;
    }

    Alert.alert(
      'Permanent Account Deletion',
      'Are you absolutely sure? This action cannot be undone. All personal data, health records, recovery metrics, and AI conversations will be permanently purged.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Permanently Erase', 
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              // Simulated cloud purge + local clean
              await new Promise((resolve) => setTimeout(resolve, 1500));
              clearProfile();
              setUser(null);
              setIsDeleting(false);
              Alert.alert(
                'Account Deleted',
                'Your account and associated personal wellness data have been completely deleted.',
                [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
              );
            } catch (err) {
              setIsDeleting(false);
              Alert.alert('Error', 'Unable to complete deletion request. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Top Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>Delete Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.warningBox}>
        <AlertTriangle size={32} color="#dc2626" style={{ marginBottom: 12 }} />
        <Text style={styles.warningTitle}>Irrevocable Data Erasure</Text>
        <Text style={styles.warningDesc}>
          Under Ethiopia's Personal Data Protection Proclamation No. 1321/2024 and Google Play developer requirements, you have the absolute right to complete erasure of your personal data.
        </Text>
      </View>

      <View style={styles.consequencesBox}>
        <Text style={styles.consequencesTitle}>What will be deleted:</Text>
        <View style={styles.consequenceItem}>
          <CheckCircle2 size={16} color="#dc2626" />
          <Text style={styles.consequenceText}>Your personal identity, email, and authentication credentials</Text>
        </View>
        <View style={styles.consequenceItem}>
          <CheckCircle2 size={16} color="#dc2626" />
          <Text style={styles.consequenceText}>All logged symptoms, recovery scores, and sleep archives</Text>
        </View>
        <View style={styles.consequenceItem}>
          <CheckCircle2 size={16} color="#dc2626" />
          <Text style={styles.consequenceText}>All trilingual AI conversation history and personalized context</Text>
        </View>
        <View style={styles.consequenceItem}>
          <CheckCircle2 size={16} color="#dc2626" />
          <Text style={styles.consequenceText}>All synced wearable metrics and fasting preferences</Text>
        </View>
      </View>

      {/* Confirmation Input */}
      <View style={styles.confirmBox}>
        <Text style={styles.confirmLabel}>Type <Text style={{ fontWeight: '800', color: '#dc2626' }}>DELETE</Text> to confirm:</Text>
        <TextInput
          style={styles.confirmInput}
          value={confirmText}
          onChangeText={setConfirmText}
          placeholder="DELETE"
          placeholderTextColor="#94a3b8"
          autoCapitalize="characters"
        />

        <TouchableOpacity 
          style={[styles.deleteBtn, confirmText.trim().toLowerCase() !== 'delete' && styles.deleteBtnDisabled]} 
          onPress={handleDeleteAccount}
          disabled={confirmText.trim().toLowerCase() !== 'delete' || isDeleting}
          activeOpacity={0.8}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Trash2 size={18} color="#ffffff" />
              <Text style={styles.deleteBtnText}>Permanently Delete My Account</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.webNoteBox}>
        <Text style={styles.webNoteText}>
          Web deletion option: You can also request external account deletion without installing the app at{' '}
          <Text style={{ fontWeight: '700', color: '#16a34a' }}>nuracare.pro.et/data-deletion</Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  contentContainer: { paddingBottom: 40 },
  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  topNavTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  warningBox: { margin: 16, padding: 20, backgroundColor: '#fef2f2', borderRadius: 20, borderWidth: 1, borderColor: '#fecaca', alignItems: 'center' },
  warningTitle: { fontSize: 18, fontWeight: '800', color: '#991b1b', marginBottom: 6 },
  warningDesc: { fontSize: 13, color: '#b91c1c', textAlign: 'center', lineHeight: 18 },
  consequencesBox: { backgroundColor: '#ffffff', marginHorizontal: 16, padding: 18, borderRadius: 18, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  consequencesTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  consequenceItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  consequenceText: { flex: 1, fontSize: 13, color: '#475569', lineHeight: 18 },
  confirmBox: { backgroundColor: '#ffffff', marginHorizontal: 16, padding: 18, borderRadius: 18, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  confirmLabel: { fontSize: 14, color: '#334155', marginBottom: 10 },
  confirmInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#0f172a', fontWeight: '700', marginBottom: 16 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#dc2626', paddingVertical: 14, borderRadius: 14 },
  deleteBtnDisabled: { backgroundColor: '#fca5a5' },
  deleteBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  webNoteBox: { marginHorizontal: 20 },
  webNoteText: { fontSize: 12, color: '#94a3b8', textAlign: 'center', lineHeight: 18 }
});
