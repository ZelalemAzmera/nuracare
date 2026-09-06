import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Sliders, ShieldCheck } from 'lucide-react-native';
import { useConsentStore } from '../src/store/consentStore';
import { CONSENT_PURPOSES } from '../src/privacy/consent/consentTypes';

export default function ConsentSettingsScreen() {
  const router = useRouter();
  const { consent, loadConsent, updateConsent, revokeAllOptional } = useConsentStore();

  useEffect(() => {
    loadConsent();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Top Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>Consent Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerText}>
          In accordance with Ethiopia's Data Protection Proclamation No. 1321/2024, you have the right to withdraw optional consent at any time without affecting your core account access.
        </Text>
      </View>

      {/* Purpose Toggles */}
      <View style={styles.cardGroup}>
        {CONSENT_PURPOSES.map((purpose, index) => {
          const isChecked = Boolean(consent[purpose.key]);

          return (
            <View key={purpose.key} style={styles.purposeItem}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Text style={styles.purposeTitle}>{purpose.title}</Text>
                  {purpose.isMandatory && (
                    <View style={styles.requiredPill}><Text style={styles.requiredText}>Core</Text></View>
                  )}
                </View>
                <Text style={styles.purposeDesc}>{purpose.description}</Text>
                <Text style={styles.lawRef}>{purpose.ethiopianLawRef}</Text>
              </View>

              <Switch
                value={isChecked}
                onValueChange={(val) => {
                  if (!purpose.isMandatory) {
                    updateConsent(purpose.key, val);
                  }
                }}
                disabled={purpose.isMandatory}
                trackColor={{ false: '#e2e8f0', true: '#86efac' }}
                thumbColor={isChecked ? '#16a34a' : '#94a3b8'}
              />
            </View>
          );
        })}
      </View>

      {/* Revoke All Optional Button */}
      <TouchableOpacity style={styles.revokeAllBtn} onPress={revokeAllOptional} activeOpacity={0.8}>
        <Text style={styles.revokeAllText}>Withdraw All Optional Consents</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  contentContainer: { paddingBottom: 40 },
  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  topNavTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  infoBanner: { margin: 16, padding: 14, backgroundColor: '#f0fdf4', borderRadius: 14, borderWidth: 1, borderColor: '#dcfce7' },
  infoBannerText: { fontSize: 13, color: '#166534', lineHeight: 18 },
  cardGroup: { backgroundColor: '#ffffff', marginHorizontal: 16, borderRadius: 18, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 16 },
  purposeItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  purposeTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  requiredPill: { backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  requiredText: { fontSize: 10, fontWeight: '700', color: '#64748b' },
  purposeDesc: { fontSize: 13, color: '#475569', lineHeight: 18, marginBottom: 4 },
  lawRef: { fontSize: 11, color: '#16a34a', fontWeight: '600' },
  revokeAllBtn: { marginHorizontal: 16, marginTop: 20, paddingVertical: 14, borderRadius: 14, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  revokeAllText: { fontSize: 14, fontWeight: '700', color: '#64748b' }
});
