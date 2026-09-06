import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useWellnessStore } from '../src/store';
import { useProfile } from '../src/context/ProfileContext';
import { compute5CoreWellness } from '../src/lib/wellnessEngine';
import { ChevronRight, ChevronLeft, CheckCircle, Smartphone } from 'lucide-react-native';

const TOTAL_STEPS = 5;

export default function CheckInModal() {
  const { setScore, addCheckIn, checkIns } = useWellnessStore();
  const { profile } = useProfile();
  const [step, setStep] = useState(1);
  
  // State for Step 1: Physical
  const [painLevel, setPainLevel] = useState(0);
  const [stiffness, setStiffness] = useState(0);
  const [activity, setActivity] = useState(30);

  // State for Step 2: Mental
  const [stress, setStress] = useState(5);
  const [mood, setMood] = useState(5);
  const [sleep, setSleep] = useState(7);

  // State for Step 3: Nutrition
  const [meals, setMeals] = useState(3);
  const [portion, setPortion] = useState('Moderate');
  const [hydration, setHydration] = useState(5);

  // State for Step 4: Context, Digital Wellness & Burnout Quick Check
  const [wearableSynced, setWearableSynced] = useState(false);
  const [phoneStrain, setPhoneStrain] = useState<'Draining' | 'Neutral' | 'Restorative'>('Neutral');
  const [workDrain, setWorkDrain] = useState(5); // 0-10
  const [canDisconnect, setCanDisconnect] = useState<'Easily' | 'With effort' | 'Cannot'>('With effort');
  const [screenTimeEstHours, setScreenTimeEstHours] = useState(4);

  const handleSyncWearable = async () => {
    try {
      // simulate sync
      setTimeout(() => {
        setWearableSynced(true);
        Alert.alert("Success", "Wearable data synced successfully.");
      }, 1000);
    } catch (err) {
      Alert.alert("Error", "Could not sync wearables.");
    }
  };

  const handleSubmit = () => {
    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      painLevel,
      stiffness,
      activity,
      energy: Math.round(activity / 12), // convert 0-120 mins to 0-10 energy
      stress,
      mood,
      sleep,
      meals,
      portion,
      hydration,
      wearableSynced,
      phoneStrain,
      workDrain,
      canDisconnect,
      screenTimeEstHours,
      tension: stiffness > 5 ? 'High' : 'None',
      urgency: painLevel > 7 ? 'high' : 'low',
      tags: []
    } as any;

    addCheckIn(entry);
    
    // Calculate new overall score
    const newScore = compute5CoreWellness(entry, profile || {});
    setScore(newScore.total);

    router.back();
  };

  const renderSlider = (label: string, value: number, setValue: (val: number) => void, max: number = 10, min: number = 0) => (
    <View style={styles.inputGroup} key={label}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valueText}>{value} / {max}</Text>
      </View>
      <View style={styles.stepperRow}>
        <TouchableOpacity style={styles.stepperBtn} onPress={() => setValue(Math.max(min, value - 1))}>
          <Text style={styles.stepperIcon}>-</Text>
        </TouchableOpacity>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${(value / max) * 100}%` }]} />
        </View>
        <TouchableOpacity style={styles.stepperBtn} onPress={() => setValue(Math.min(max, value + 1))}>
          <Text style={styles.stepperIcon}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Physical Well-being</Text>
      <Text style={styles.stepSubtitle}>How is your body feeling?</Text>
      {renderSlider('Pain Level', painLevel, setPainLevel, 10)}
      {renderSlider('Joint Stiffness', stiffness, setStiffness, 10)}
      {renderSlider('Activity (Minutes)', activity, setActivity, 120, 0)}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Mental State</Text>
      <Text style={styles.stepSubtitle}>Check in with your mind.</Text>
      {renderSlider('Stress Level', stress, setStress, 10)}
      {renderSlider('Overall Mood', mood, setMood, 10)}
      {renderSlider('Sleep (Hours)', sleep, setSleep, 12)}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Nutrition & Hydration</Text>
      <Text style={styles.stepSubtitle}>Fueling your body.</Text>
      {renderSlider('Meals Eaten', meals, setMeals, 6)}
      {renderSlider('Glasses of Water', hydration, setHydration, 15)}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Portion Size</Text>
        <View style={styles.chipsRow}>
          {['Light', 'Moderate', 'Heavy (Overate)'].map(p => (
            <TouchableOpacity key={p} style={[styles.chip, portion === p && styles.chipActive]} onPress={() => setPortion(p)}>
              <Text style={[styles.chipText, portion === p && styles.chipTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Context & Digital Wellness</Text>
      <Text style={styles.stepSubtitle}>Check your workload strain and screen relationship.</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Today's Phone Use Feeling</Text>
        <View style={styles.chipsRow}>
          {(['Restorative', 'Neutral', 'Draining'] as const).map(item => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, phoneStrain === item && styles.chipActive]}
              onPress={() => setPhoneStrain(item)}
            >
              <Text style={[styles.chipText, phoneStrain === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {renderSlider('Work / Study Strain', workDrain, setWorkDrain, 10)}
      {renderSlider('Estimated Screen Time (Hours)', screenTimeEstHours, setScreenTimeEstHours, 14, 0)}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ability to Disconnect This Evening</Text>
        <View style={styles.chipsRow}>
          {(['Easily', 'With effort', 'Cannot'] as const).map(item => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, canDisconnect === item && styles.chipActive]}
              onPress={() => setCanDisconnect(item)}
            >
              <Text style={[styles.chipText, canDisconnect === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.syncCard}>
        <Smartphone size={24} color="#64748b" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.syncTitle}>Wearable & Digital Sensor</Text>
          <Text style={styles.syncDesc}>Sync heart rate variability, steps & background focus logs.</Text>
        </View>
        <TouchableOpacity style={[styles.syncBtn, wearableSynced && styles.syncBtnActive]} onPress={handleSyncWearable}>
          <Text style={[styles.syncBtnText, wearableSynced && styles.syncBtnTextActive]}>
            {wearableSynced ? 'Synced' : 'Sync'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep5 = () => {
    const digitalBalanceEstimate = Math.max(20, Math.min(98, 100 - (screenTimeEstHours * 8) - (phoneStrain === 'Draining' ? 15 : 0)));
    const recoveryReadinessEstimate = Math.max(25, Math.min(96, Math.round((sleep * 7) + ((10 - stress) * 3) - (workDrain * 2))));

    return (
      <View style={styles.stepContainer}>
        <View style={styles.successIcon}>
          <CheckCircle size={48} color="#16a34a" />
        </View>
        <Text style={[styles.stepTitle, { textAlign: 'center' }]}>You're all set!</Text>
        <Text style={[styles.stepSubtitle, { textAlign: 'center', marginBottom: 20 }]}>
          Your daily check-in is complete. Nura has updated your 5-dimensional wellness balance.
        </Text>

        {/* 5-Dimensional Multi-Score Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Physical</Text>
            <Text style={styles.summaryItemVal}>{Math.max(10, 100 - (painLevel * 8))}%</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Mental</Text>
            <Text style={styles.summaryItemVal}>{Math.max(10, (mood * 10))}%</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Sleep</Text>
            <Text style={styles.summaryItemVal}>{Math.min(100, Math.round(sleep * 12.5))}%</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Digital Balance</Text>
            <Text style={[styles.summaryItemVal, { color: digitalBalanceEstimate > 70 ? '#16a34a' : '#f59e0b' }]}>
              {digitalBalanceEstimate}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Recovery</Text>
            <Text style={[styles.summaryItemVal, { color: recoveryReadinessEstimate > 70 ? '#16a34a' : '#6366f1' }]}>
              {recoveryReadinessEstimate}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {step > 1 ? (
          <TouchableOpacity onPress={() => setStep(s => s - 1)} style={styles.iconBtn}>
            <ChevronLeft size={24} color="#0f172a" />
          </TouchableOpacity>
        ) : <View style={styles.iconBtnSpacer} />}
        
        <View style={styles.progressWrap}>
          {[1,2,3,4,5].map(i => (
            <View key={i} style={[styles.progressDot, step >= i && styles.progressDotActive]} />
          ))}
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Text style={styles.cancelText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </ScrollView>

      <View style={styles.footer}>
        {step < TOTAL_STEPS ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(s => s + 1)}>
            <Text style={styles.primaryBtnText}>Continue</Text>
            <ChevronRight size={20} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit}>
            <Text style={styles.primaryBtnText}>Finish</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  iconBtn: { padding: 8 },
  iconBtnSpacer: { width: 40 },
  cancelText: { color: '#64748b', fontSize: 16, fontWeight: '500' },
  progressWrap: { flexDirection: 'row', gap: 6 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e2e8f0' },
  progressDotActive: { backgroundColor: '#16a34a', width: 24 },
  content: { flex: 1 },
  contentInner: { padding: 24 },
  stepContainer: { flex: 1 },
  stepTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  stepSubtitle: { fontSize: 16, color: '#64748b', marginBottom: 32 },
  inputGroup: { marginBottom: 28 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  valueText: { fontSize: 16, color: '#16a34a', fontWeight: '700' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepperBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  stepperIcon: { fontSize: 24, color: '#475569', fontWeight: '500' },
  track: { flex: 1, height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#16a34a' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  chipActive: { backgroundColor: '#dcfce7', borderColor: '#4ade80' },
  chipText: { color: '#475569', fontWeight: '500' },
  chipTextActive: { color: '#16a34a', fontWeight: '700' },
  syncCard: { backgroundColor: '#f8fafc', padding: 24, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  syncTitle: { fontSize: 18, fontWeight: '600', color: '#0f172a', marginTop: 16, marginBottom: 8 },
  syncDesc: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 },
  syncBtn: { backgroundColor: '#e2e8f0', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  syncBtnActive: { backgroundColor: '#dcfce7' },
  syncBtnText: { color: '#475569', fontWeight: '600' },
  syncBtnTextActive: { color: '#16a34a' },
  successIcon: { alignItems: 'center', marginBottom: 24, marginTop: 40 },
  summaryBox: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', gap: 10, marginTop: 12 },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  summaryItemLabel: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  summaryItemVal: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  footer: { padding: 24, borderTopWidth: 1, borderColor: '#f1f5f9', backgroundColor: '#ffffff' },
  primaryBtn: { backgroundColor: '#16a34a', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryBtnText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});
