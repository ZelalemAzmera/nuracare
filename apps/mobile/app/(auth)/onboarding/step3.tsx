import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useProfile } from '../../../src/context/ProfileContext';
import { ArrowLeft, Upload, FileText } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';

export default function OnboardingStep3() {
  const { profile, setProfile } = useProfile();
  const [medicalNotes, setMedicalNotes] = useState(profile?.medicalNotes || '');
  const [loading, setLoading] = useState(false);
  const [fileAttached, setFileAttached] = useState<string | null>(null);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        setFileAttached(result.assets[0].name);
        // Note: Real upload logic to Supabase Storage would go here
      }
    } catch (err) {
      console.log('Document picker error:', err);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    // Include any attached files in the notes for now
    const finalNotes = fileAttached 
      ? `[Attached: ${fileAttached}]\n${medicalNotes}` 
      : medicalNotes;

    await setProfile({ medicalNotes: finalNotes });
    setLoading(false);
    
    // Mark onboarding as completed (handled by RootLayout automatically navigating if conditions/age exist)
    // But we manually push to tabs just to be sure
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>3 of 3</Text>
        </View>

        <Text style={styles.title}>Medical Records</Text>
        <Text style={styles.subtitle}>Upload any recent medical reports or test results to give Nura better context. (Optional)</Text>

        <View style={styles.form}>
          <TouchableOpacity style={styles.uploadBox} onPress={handleUpload}>
            <View style={styles.uploadIconContainer}>
              <Upload size={24} color="#16a34a" />
            </View>
            <Text style={styles.uploadTitle}>
              {fileAttached ? 'File Selected' : 'Tap to upload a document'}
            </Text>
            <Text style={styles.uploadSubtitle}>
              {fileAttached ? fileAttached : 'PDF, JPG, PNG up to 10MB'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.label}>Paste or type notes manually</Text>
          <View style={styles.textAreaContainer}>
            <FileText size={20} color="#94a3b8" style={styles.textAreaIcon} />
            <TextInput
              style={styles.textArea}
              value={medicalNotes}
              onChangeText={setMedicalNotes}
              placeholder="E.g., Diagnosed with hypertension 2 years ago, allergic to penicillin..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.nextBtn} 
          onPress={handleComplete}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextText}>Complete Setup</Text>}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.skipBtn} 
          onPress={handleComplete}
          disabled={loading}
        >
          <Text style={styles.skipText}>Skip for Now</Text>
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
  uploadBox: { 
    borderWidth: 2, 
    borderColor: '#e2e8f0', 
    borderStyle: 'dashed', 
    borderRadius: 16, 
    padding: 24, 
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  uploadIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  uploadTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  uploadSubtitle: { fontSize: 14, color: '#64748b' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 32 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { color: '#94a3b8', paddingHorizontal: 16, fontWeight: '500' },
  label: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  textAreaContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
  },
  textAreaIcon: { marginRight: 12, marginTop: 2 },
  textArea: { flex: 1, fontSize: 16, color: '#0f172a', minHeight: 120 },
  nextBtn: { backgroundColor: '#16a34a', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 40 },
  nextText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  skipBtn: { padding: 16, alignItems: 'center', marginTop: 8 },
  skipText: { color: '#64748b', fontSize: 16, fontWeight: '600' }
});
