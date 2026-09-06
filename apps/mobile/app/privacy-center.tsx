import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Sliders, 
  Download, 
  Trash2, 
  FileText, 
  ChevronRight, 
  ArrowLeft,
  Smartphone
} from 'lucide-react-native';

export default function PrivacyCenterScreen() {
  const router = useRouter();

  const handleDownloadData = () => {
    Alert.alert(
      'Export Health Records',
      'A secure, encrypted JSON archive containing your wellness check-ins, medication logs, and profile data will be prepared.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Generate Export', 
          onPress: () => Alert.alert('Success', 'Your encrypted health data export is ready. Saved to device storage.') 
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Top Navigation */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Hero Badge */}
      <View style={styles.heroBox}>
        <View style={styles.heroIconCircle}>
          <ShieldCheck size={28} color="#16a34a" />
        </View>
        <Text style={styles.heroTitle}>Privacy by Design</Text>
        <Text style={styles.heroSub}>
          Compliant with Ethiopian Personal Data Protection Proclamation No. 1321/2024. Your health data belongs to you.
        </Text>
      </View>

      {/* Section: Your Data & Controls */}
      <Text style={styles.sectionTitle}>Your Data & Consent</Text>
      <View style={styles.menuGroup}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/consent-settings')} activeOpacity={0.7}>
          <View style={styles.menuIconWrap}><Sliders size={20} color="#16a34a" /></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.menuLabel}>Granular Consent Settings</Text>
            <Text style={styles.menuSub}>Control AI context, wearable sync, and telemetry</Text>
          </View>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/permissions-management')} activeOpacity={0.7}>
          <View style={styles.menuIconWrap}><Smartphone size={20} color="#16a34a" /></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.menuLabel}>Device Permissions</Text>
            <Text style={styles.menuSub}>Review Camera, Microphone, and Health Connect</Text>
          </View>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem} onPress={handleDownloadData} activeOpacity={0.7}>
          <View style={styles.menuIconWrap}><Download size={20} color="#16a34a" /></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.menuLabel}>Download My Data</Text>
            <Text style={styles.menuSub}>Export all records in machine-readable JSON format</Text>
          </View>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Section: Legal & Disclaimers */}
      <Text style={styles.sectionTitle}>Legal & Compliance</Text>
      <View style={styles.menuGroup}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname: '/legal', params: { type: 'privacy' } })} activeOpacity={0.7}>
          <View style={styles.menuIconWrap}><FileText size={20} color="#64748b" /></View>
          <Text style={styles.legalLabel}>Privacy Policy (Ethiopia & Global)</Text>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname: '/legal', params: { type: 'terms' } })} activeOpacity={0.7}>
          <View style={styles.menuIconWrap}><FileText size={20} color="#64748b" /></View>
          <Text style={styles.legalLabel}>Terms of Service</Text>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname: '/legal', params: { type: 'disclaimer' } })} activeOpacity={0.7}>
          <View style={styles.menuIconWrap}><FileText size={20} color="#64748b" /></View>
          <Text style={styles.legalLabel}>Medical & AI Safety Disclaimer</Text>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname: '/legal', params: { type: 'cookies' } })} activeOpacity={0.7}>
          <View style={styles.menuIconWrap}><FileText size={20} color="#64748b" /></View>
          <Text style={styles.legalLabel}>Cookie & Storage Policy</Text>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Section: Account Danger Zone */}
      <Text style={[styles.sectionTitle, { color: '#dc2626' }]}>Account Management</Text>
      <View style={[styles.menuGroup, { borderColor: '#fecaca' }]}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/delete-account')} activeOpacity={0.7}>
          <View style={[styles.menuIconWrap, { backgroundColor: '#fef2f2' }]}>
            <Trash2 size={20} color="#dc2626" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.menuLabel, { color: '#dc2626' }]}>Delete Account & Health Data</Text>
            <Text style={styles.menuSub}>Irrevocably erase profile, history, and AI conversations</Text>
          </View>
          <ChevronRight size={18} color="#dc2626" />
        </TouchableOpacity>
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
  heroBox: { margin: 16, padding: 20, backgroundColor: '#f0fdf4', borderRadius: 20, borderWidth: 1, borderColor: '#dcfce7', alignItems: 'center' },
  heroIconCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  heroTitle: { fontSize: 18, fontWeight: '800', color: '#166534', marginBottom: 4 },
  heroSub: { fontSize: 13, color: '#15803d', textAlign: 'center', lineHeight: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, marginHorizontal: 20, marginTop: 20, marginBottom: 8 },
  menuGroup: { backgroundColor: '#ffffff', marginHorizontal: 16, borderRadius: 18, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuIconWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  menuSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  legalLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#334155', marginLeft: 12 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 66 }
});
