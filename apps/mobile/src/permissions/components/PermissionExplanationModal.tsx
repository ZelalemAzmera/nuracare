import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { PermissionType, PERMISSION_RATIONALES } from '../permissionTypes';
import { ShieldCheck, X } from 'lucide-react-native';

interface PermissionExplanationModalProps {
  visible: boolean;
  type: PermissionType;
  onContinue: () => void;
  onCancel: () => void;
}

export default function PermissionExplanationModal({
  visible,
  type,
  onContinue,
  onCancel
}: PermissionExplanationModalProps) {
  const rationale = PERMISSION_RATIONALES[type];

  if (!rationale) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header icon */}
          <View style={styles.iconCircle}>
            <ShieldCheck size={28} color="#16a34a" />
          </View>

          <Text style={styles.title}>{rationale.title}</Text>
          <Text style={styles.featureText}>Required for: {rationale.featureUsingIt}</Text>

          <View style={styles.explanationBox}>
            <Text style={styles.explanationText}>{rationale.explanation}</Text>
          </View>

          <View style={styles.privacyBox}>
            <Text style={styles.privacyTitle}>🔒 Privacy Guarantee</Text>
            <Text style={styles.privacyText}>{rationale.privacyGuarantee}</Text>
          </View>

          {/* Action buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Not Now</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.continueBtn} onPress={onContinue} activeOpacity={0.8}>
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  dialog: { width: '100%', maxWidth: 380, backgroundColor: '#ffffff', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 5 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  featureText: { fontSize: 13, color: '#16a34a', fontWeight: '600', marginTop: 4, marginBottom: 16 },
  explanationBox: { backgroundColor: '#f8fafc', padding: 14, borderRadius: 14, width: '100%', marginBottom: 12 },
  explanationText: { fontSize: 13, color: '#334155', lineHeight: 20, textAlign: 'center' },
  privacyBox: { backgroundColor: '#f0fdf4', padding: 12, borderRadius: 12, width: '100%', borderWidth: 1, borderColor: '#dcfce7', marginBottom: 20 },
  privacyTitle: { fontSize: 12, fontWeight: '700', color: '#166534', marginBottom: 2 },
  privacyText: { fontSize: 12, color: '#15803d', lineHeight: 18 },
  buttonRow: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: '#f1f5f9', alignItems: 'center' },
  cancelBtnText: { color: '#64748b', fontSize: 14, fontWeight: '600' },
  continueBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: '#16a34a', alignItems: 'center' },
  continueBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' }
});
