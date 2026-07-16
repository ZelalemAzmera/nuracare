import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Activity, Link as LinkIcon, Unlink, PlayCircle, PauseCircle, Loader2, Footprints, HeartPulse, Moon, Flame, Circle } from 'lucide-react-native';

export default function DevicesScreen() {
  const [isFitbitConnected, setIsFitbitConnected] = useState(false);
  const [isOuraConnected, setIsOuraConnected] = useState(false);
  
  const [isFitbitSyncActive, setIsFitbitSyncActive] = useState(false);
  const [isOuraSyncActive, setIsOuraSyncActive] = useState(false);
  
  const [readings, setReadings] = useState<any>({});

  const handleFitbitConnect = () => {
    setIsFitbitConnected(true);
    setReadings({ ...readings, steps: 8432, heart_rate: 68 });
    Alert.alert('Success', 'Fitbit connected successfully.');
  };

  const handleFitbitDisconnect = () => {
    setIsFitbitConnected(false);
    setIsFitbitSyncActive(false);
    const { steps, heart_rate, ...rest } = readings;
    setReadings(rest);
    Alert.alert('Disconnected', 'Fitbit disconnected successfully.');
  };

  const handleFitbitToggleSync = () => {
    setIsFitbitSyncActive(!isFitbitSyncActive);
  };

  const handleOuraConnect = () => {
    setIsOuraConnected(true);
    setReadings({ ...readings, sleep_min: 435, calories: 2450 });
    Alert.alert('Success', 'Oura Ring connected successfully.');
  };

  const handleOuraDisconnect = () => {
    setIsOuraConnected(false);
    setIsOuraSyncActive(false);
    const { sleep_min, calories, ...rest } = readings;
    setReadings(rest);
    Alert.alert('Disconnected', 'Oura Ring disconnected successfully.');
  };

  const handleOuraToggleSync = () => {
    setIsOuraSyncActive(!isOuraSyncActive);
  };

  const hasData = Object.keys(readings).length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#64748b" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Connected Devices</Text>
          <Text style={styles.subtitle}>Sync your health data automatically</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        
        {/* Fitbit Card */}
        <View style={[styles.deviceCard, { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }]}>
          <View style={styles.deviceHeaderRow}>
            <View style={[styles.deviceIconBox, { backgroundColor: '#e0f2fe' }]}>
              <Activity size={28} color="#0ea5e9" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={styles.deviceTitle}>Fitbit / Google Health</Text>
                {isFitbitConnected && <View style={styles.connectedBadge}><Text style={styles.connectedText}>Connected</Text></View>}
              </View>
              <Text style={styles.deviceDesc}>Sync your daily steps, heart rate, and sleep data.</Text>
            </View>
          </View>
          
          <View style={styles.actionsRow}>
            {!isFitbitConnected ? (
              <TouchableOpacity style={styles.btnPrimary} onPress={handleFitbitConnect}>
                <LinkIcon size={18} color="#ffffff" />
                <Text style={styles.btnPrimaryText}>Connect</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={styles.btnDanger} onPress={handleFitbitDisconnect}>
                  <Unlink size={18} color="#ef4444" />
                  <Text style={styles.btnDangerText}>Disconnect</Text>
                </TouchableOpacity>
                <TouchableOpacity style={isFitbitSyncActive ? styles.btnSecondary : styles.btnPrimary} onPress={handleFitbitToggleSync}>
                  {isFitbitSyncActive ? <PauseCircle size={18} color="#475569" /> : <PlayCircle size={18} color="#ffffff" />}
                  <Text style={isFitbitSyncActive ? styles.btnSecondaryText : styles.btnPrimaryText}>{isFitbitSyncActive ? 'Stop Sync' : 'Start Sync'}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Oura Card */}
        <View style={[styles.deviceCard, { backgroundColor: '#faf5ff', borderColor: '#e9d5ff' }]}>
          <View style={styles.deviceHeaderRow}>
            <View style={[styles.deviceIconBox, { backgroundColor: '#f3e8ff' }]}>
              <Circle size={28} color="#8b5cf6" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={styles.deviceTitle}>Oura Ring</Text>
                {isOuraConnected && <View style={styles.connectedBadge}><Text style={styles.connectedText}>Connected</Text></View>}
              </View>
              <Text style={styles.deviceDesc}>Connect your ring for detailed sleep and readiness tracking.</Text>
            </View>
          </View>
          
          <View style={styles.actionsRow}>
            {!isOuraConnected ? (
              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: '#8b5cf6' }]} onPress={handleOuraConnect}>
                <LinkIcon size={18} color="#ffffff" />
                <Text style={styles.btnPrimaryText}>Connect</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={styles.btnDanger} onPress={handleOuraDisconnect}>
                  <Unlink size={18} color="#ef4444" />
                  <Text style={styles.btnDangerText}>Disconnect</Text>
                </TouchableOpacity>
                <TouchableOpacity style={isOuraSyncActive ? styles.btnSecondary : [styles.btnPrimary, { backgroundColor: '#10b981' }]} onPress={handleOuraToggleSync}>
                  {isOuraSyncActive ? <PauseCircle size={18} color="#475569" /> : <PlayCircle size={18} color="#ffffff" />}
                  <Text style={isOuraSyncActive ? styles.btnSecondaryText : styles.btnPrimaryText}>{isOuraSyncActive ? 'Stop Sync' : 'Start Sync'}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {hasData && (
          <View style={{ marginTop: 32 }}>
            <Text style={styles.sectionTitle}>Latest Synced Data</Text>
            <View style={styles.grid}>
              
              {readings.steps && (
                <View style={styles.dataCard}>
                  <View style={styles.dataHeader}>
                    <Footprints size={16} color="#16a34a" />
                    <Text style={styles.dataLabel}>Steps</Text>
                  </View>
                  <Text style={styles.dataValue}>{readings.steps.toLocaleString()}</Text>
                </View>
              )}

              {readings.heart_rate && (
                <View style={styles.dataCard}>
                  <View style={styles.dataHeader}>
                    <HeartPulse size={16} color="#ef4444" />
                    <Text style={styles.dataLabel}>Resting HR</Text>
                  </View>
                  <Text style={styles.dataValue}>{readings.heart_rate} <Text style={styles.dataUnit}>bpm</Text></Text>
                </View>
              )}

              {readings.sleep_min && (
                <View style={styles.dataCard}>
                  <View style={styles.dataHeader}>
                    <Moon size={16} color="#6366f1" />
                    <Text style={styles.dataLabel}>Sleep</Text>
                  </View>
                  <Text style={styles.dataValue}>{Math.floor(readings.sleep_min / 60)}h {readings.sleep_min % 60}m</Text>
                </View>
              )}

              {readings.calories && (
                <View style={styles.dataCard}>
                  <View style={styles.dataHeader}>
                    <Flame size={16} color="#f59e0b" />
                    <Text style={styles.dataLabel}>Calories</Text>
                  </View>
                  <Text style={styles.dataValue}>{readings.calories.toLocaleString()} <Text style={styles.dataUnit}>kcal</Text></Text>
                </View>
              )}

            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  backBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 20 },
  headerTextWrap: { flex: 1, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  content: { flex: 1 },
  contentInner: { padding: 20 },
  
  deviceCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  deviceHeaderRow: { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 16 },
  deviceIconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  deviceTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  connectedBadge: { backgroundColor: '#10b981', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 12 },
  connectedText: { fontSize: 12, fontWeight: '700', color: '#ffffff' },
  deviceDesc: { fontSize: 14, color: '#64748b', lineHeight: 20 },
  
  actionsRow: { flexDirection: 'row', gap: 12 },
  btnPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0ea5e9', padding: 14, borderRadius: 12 },
  btnPrimaryText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  btnDanger: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fef2f2', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#fee2e2' },
  btnDangerText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
  btnSecondary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#f8fafc', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  btnSecondaryText: { color: '#475569', fontSize: 16, fontWeight: '600' },
  
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  dataCard: { flex: 1, minWidth: '45%', backgroundColor: '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  dataHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  dataLabel: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  dataValue: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  dataUnit: { fontSize: 14, fontWeight: '600', color: '#64748b' }
});
