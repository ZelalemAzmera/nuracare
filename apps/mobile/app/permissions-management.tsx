import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Mic, MapPin, Bell, Activity, Bluetooth, CheckCircle2, XCircle } from 'lucide-react-native';
import { PermissionType, PERMISSION_RATIONALES } from '../src/permissions/permissionTypes';
import { permissionService } from '../src/permissions/permissionService';
import PermissionExplanationModal from '../src/permissions/components/PermissionExplanationModal';

export default function PermissionsManagementScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<PermissionType | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const permissionsList: PermissionType[] = [
    'camera',
    'microphone',
    'location',
    'notifications',
    'health_connect',
    'bluetooth'
  ];

  const getIcon = (type: PermissionType) => {
    switch (type) {
      case 'camera': return <Camera size={20} color="#16a34a" />;
      case 'microphone': return <Mic size={20} color="#16a34a" />;
      case 'location': return <MapPin size={20} color="#16a34a" />;
      case 'notifications': return <Bell size={20} color="#16a34a" />;
      case 'health_connect': return <Activity size={20} color="#16a34a" />;
      case 'bluetooth': return <Bluetooth size={20} color="#16a34a" />;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Top Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>Device Permissions</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.introBanner}>
        <Text style={styles.introText}>
          NuraCare follows the principle of data minimization. We only request permissions contextually when you choose to use an active feature.
        </Text>
      </View>

      <View style={styles.cardGroup}>
        {permissionsList.map((type) => {
          const rationale = PERMISSION_RATIONALES[type];
          const status = permissionService.getStatus(type);
          const isGranted = status === 'granted';

          return (
            <TouchableOpacity 
              key={type} 
              style={styles.permissionRow}
              onPress={() => setSelectedType(type)}
              activeOpacity={0.7}
            >
              <View style={styles.iconCircle}>{getIcon(type)}</View>
              <View style={{ flex: 1, marginLeft: 12, paddingRight: 8 }}>
                <Text style={styles.permissionTitle}>{rationale.title}</Text>
                <Text style={styles.permissionFeature}>{rationale.featureUsingIt}</Text>
                <Text style={styles.permissionDesc} numberOfLines={2}>{rationale.explanation}</Text>
              </View>

              <View style={[styles.statusBadge, isGranted ? styles.statusGranted : styles.statusDenied]}>
                {isGranted ? (
                  <CheckCircle2 size={14} color="#16a34a" />
                ) : (
                  <XCircle size={14} color="#94a3b8" />
                )}
                <Text style={[styles.statusText, isGranted ? styles.textGranted : styles.textDenied]}>
                  {isGranted ? 'Active' : 'Off'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Explanation Dialog */}
      {selectedType && (
        <PermissionExplanationModal
          visible={Boolean(selectedType)}
          type={selectedType}
          onCancel={() => setSelectedType(null)}
          onContinue={async () => {
            await permissionService.requestPermission(selectedType);
            setSelectedType(null);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  contentContainer: { paddingBottom: 40 },
  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  topNavTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  introBanner: { margin: 16, padding: 14, backgroundColor: '#ffffff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  introText: { fontSize: 13, color: '#475569', lineHeight: 18 },
  cardGroup: { backgroundColor: '#ffffff', marginHorizontal: 16, borderRadius: 18, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 16 },
  permissionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  permissionTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  permissionFeature: { fontSize: 12, color: '#16a34a', fontWeight: '600', marginBottom: 2 },
  permissionDesc: { fontSize: 12, color: '#64748b', lineHeight: 16 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  statusGranted: { backgroundColor: '#dcfce7' },
  statusDenied: { backgroundColor: '#f1f5f9' },
  statusText: { fontSize: 11, fontWeight: '700' },
  textGranted: { color: '#16a34a' },
  textDenied: { color: '#64748b' }
});
