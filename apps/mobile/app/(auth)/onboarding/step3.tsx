import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useProfile } from '../../../src/context/ProfileContext';
import { ArrowLeft, ArrowRight, Upload, FileText, Pill } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import FloatingNatureBackground from '../../../src/components/ambient/FloatingNatureBackground';

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
      }
    } catch (err) {
      console.log('Document picker error:', err);
    }
  };

  const handleNext = async () => {
    setLoading(true);
    const finalNotes = fileAttached
      ? `[Attached: ${fileAttached}]\n${medicalNotes}`
      : medicalNotes;

    await setProfile({ medicalNotes: finalNotes });
    setLoading(false);
    router.push('/(auth)/onboarding/step4');
  };

  return (
    <FloatingNatureBackground showSoundToggle={true}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color="#0f172a" />
            </TouchableOpacity>
            <View style={styles.stepPill}>
              <Text style={styles.stepText}>Step 3 of 4</Text>
            </View>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.title}>Health Records & Lab Tests</Text>
            <Text style={styles.subtitle}>
              Optionally upload recent medical reports, blood work, or doctor recommendations.
            </Text>
          </View>

          <View style={styles.card}>
            <TouchableOpacity style={styles.uploadBox} onPress={handleUpload}>
              <View style={styles.uploadIconContainer}>
                <Upload size={24} color="#16a34a" />
              </View>
              <Text style={styles.uploadTitle}>
                {fileAttached ? 'File Attached ✓' : 'Tap to Upload Document'}
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

            <Text style={styles.label}>Notes, Allergies or Current Supplements</Text>
            <View style={styles.textAreaContainer}>
              <FileText size={18} color="#94a3b8" style={styles.textAreaIcon} />
              <TextInput
                style={styles.textArea}
                value={medicalNotes}
                onChangeText={setMedicalNotes}
                placeholder="e.g. Taking Vitamin D3 daily, mild seasonal allergies..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={handleNext} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={styles.btnRow}>
                  <Text style={styles.nextBtnText}>Continue to Final Step</Text>
                  <ArrowRight size={18} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => router.push('/(auth)/onboarding/step4')}
            >
              <Text style={styles.skipBtnText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </FloatingNatureBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  stepText: { fontSize: 12, fontWeight: '700', color: '#16a34a' },
  titleSection: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 19 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  uploadIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  uploadTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  uploadSubtitle: { fontSize: 11, color: '#64748b', marginTop: 3 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  label: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 8 },
  textAreaContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
  },
  textAreaIcon: { marginRight: 8, marginTop: 2 },
  textArea: { flex: 1, fontSize: 13, color: '#0f172a', minHeight: 80 },
  nextBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nextBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  skipBtn: { alignItems: 'center', marginTop: 14 },
  skipBtnText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
});
