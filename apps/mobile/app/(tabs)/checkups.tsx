import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  CalendarCheck,
  CheckCircle2,
  Smile,
  Activity,
  Moon,
  Flame,
  Droplets,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Bot,
  Plus,
  Trash2,
  User,
  ShieldCheck,
  Eye,
  Sun,
  Shield,
  Clock,
  ChevronRight,
} from 'lucide-react-native';
import { useWellnessStore } from '../../src/store';
import { saveCheckin, getCheckins } from '../../src/storage/checkinStorage';
import { getCheckups, saveCheckup, deleteCheckup } from '../../src/storage/checkupsStorage';

const MOODS = [
  { label: 'Stressed', emoji: '😢', val: 1 },
  { label: 'Neutral', emoji: '😐', val: 2 },
  { label: 'Good', emoji: '🙂', val: 3 },
  { label: 'Great', emoji: '😄', val: 4 },
];

const ENERGIES = [
  { label: 'Low', emoji: '😴', val: 1 },
  { label: 'Okay', emoji: '😐', val: 2 },
  { label: 'Good', emoji: '🙂', val: 3 },
  { label: 'High', emoji: '🔥', val: 4 },
];

const SLEEP_OPTS = [
  { label: '< 5 hrs', hours: 4 },
  { label: '5-6 hrs', hours: 6 },
  { label: '7-8 hrs', hours: 7.5 },
  { label: '8+ hrs', hours: 9 },
];

const PAIN_LEVELS = ['None', 'Mild', 'Moderate', 'Severe'];
const HYDRATION_LEVELS = ['Behind', 'On Track', 'Optimal'];

export default function CheckupsScreen() {
  const router = useRouter();
  const { checkIns, addCheckIn, loadWellnessData } = useWellnessStore();

  // Top Section: 'daily' vs 'clinical'
  const [section, setSection] = useState<'daily' | 'clinical'>('daily');

  // Daily Form State
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [stress, setStress] = useState(3);
  const [pain, setPain] = useState('None');
  const [hydration, setHydration] = useState('On Track');
  const [savedToday, setSavedToday] = useState(false);

  // Clinical Planner State
  const [clinicalCheckups, setClinicalCheckups] = useState<any[]>([]);
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [visitName, setVisitName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [nextVisitDate, setNextVisitDate] = useState('');

  useEffect(() => {
    loadWellnessData();
    loadClinicalData();

    // Check if user logged today
    const today = new Date().toISOString().split('T')[0];
    const todayLog = getCheckins().find(c => c.date === today);
    if (todayLog) {
      setMood(todayLog.mood || 3);
      setEnergy(todayLog.energy || 3);
      setSleepHours(todayLog.sleep || 7.5);
      setStress(todayLog.stress || 3);
      setSavedToday(true);
    }
  }, []);

  const loadClinicalData = () => {
    setClinicalCheckups(getCheckups());
  };

  const handleSaveDailyCheckup = () => {
    const today = new Date().toISOString().split('T')[0];
    const checkinEntry: any = {
      id: 'chk_' + Date.now(),
      date: today,
      mood,
      energy,
      sleep: sleepHours,
      stress,
      tension: stress > 6 ? 'high' : stress > 3 ? 'medium' : 'low',
      urgency: stress > 7 || pain === 'Severe' ? 'high' : 'low',
      tags: [pain !== 'None' ? `Pain: ${pain}` : '', `Hydration: ${hydration}`].filter(Boolean),
    };

    saveCheckin(checkinEntry);
    addCheckIn(checkinEntry);
    setSavedToday(true);
    Alert.alert('Checkup Logged', 'Great job! Your daily wellness signals have updated your health baseline.');
  };

  const handleSaveClinicalVisit = () => {
    if (!visitName.trim()) {
      Alert.alert('Required Field', 'Please enter a visit or checkup title.');
      return;
    }
    const newVisit = {
      name: visitName.trim(),
      doctor: doctorName.trim(),
      date_logged: new Date().toISOString().split('T')[0],
      notes: visitNotes.trim(),
      next_visit: nextVisitDate.trim() || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      source: 'manual',
    };
    saveCheckup(newVisit);
    setShowAddVisit(false);
    setVisitName('');
    setDoctorName('');
    setVisitNotes('');
    setNextVisitDate('');
    loadClinicalData();
  };

  const handleDeleteClinical = (id: string) => {
    Alert.alert('Delete Record', 'Are you sure you want to remove this visit record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteCheckup(id);
          loadClinicalData();
        },
      },
    ]);
  };

  // 7-day trend calculations
  const allLogs = getCheckins();
  const recentLogs = allLogs.slice(0, 7);
  const avgMood = recentLogs.length > 0 ? (recentLogs.reduce((a, b) => a + (b.mood || 0), 0) / recentLogs.length).toFixed(1) : '3.0';
  const avgEnergy = recentLogs.length > 0 ? (recentLogs.reduce((a, b) => a + (b.energy || 0), 0) / recentLogs.length).toFixed(1) : '3.0';
  const avgSleep = recentLogs.length > 0 ? (recentLogs.reduce((a, b) => a + (b.sleep || 0), 0) / recentLogs.length).toFixed(1) : '7.0';
  const avgStress = recentLogs.length > 0 ? (recentLogs.reduce((a, b) => a + (b.stress || 0), 0) / recentLogs.length).toFixed(1) : '3.0';

  const defaultPlannerItems = [
    { name: 'Annual Physical Exam', freq: 'Yearly', desc: 'Blood pressure, metabolic panel, and doctor consultation.' },
    { name: 'Dental Check & Cleaning', freq: 'Every 6 months', desc: 'Preventive plaque cleaning and oral screening.' },
    { name: 'Vision & Eye Exam', freq: 'Every 1-2 years', desc: 'Visual acuity and ocular pressure check.' },
    { name: 'Cardiovascular Review', freq: 'Yearly', desc: 'Resting ECG and lipid profile checkup.' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Daily Checkups</Text>
          <Text style={styles.subtitle}>Self-reported wellness & preventive health</Text>
        </View>
        <TouchableOpacity
          style={styles.aiHeaderBtn}
          onPress={() => router.push('/chat')}
        >
          <Bot size={18} color="#16a34a" />
          <Text style={styles.aiHeaderBtnText}>AI Doctor</Text>
        </TouchableOpacity>
      </View>

      {/* Segmented control: Daily Check-in vs Clinical Records */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.segmentBtn, section === 'daily' && styles.segmentBtnActive]}
          onPress={() => setSection('daily')}
        >
          <Smile size={16} color={section === 'daily' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.segmentText, section === 'daily' && styles.segmentTextActive]}>
            Daily Self-Check
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, section === 'clinical' && styles.segmentBtnActive]}
          onPress={() => setSection('clinical')}
        >
          <CalendarCheck size={16} color={section === 'clinical' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.segmentText, section === 'clinical' && styles.segmentTextActive]}>
            Clinical Planner ({clinicalCheckups.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 50 }}>
        {section === 'daily' ? (
          <View>
            {/* 7-Day Trend Summary Strip */}
            <View style={styles.trendCard}>
              <Text style={styles.trendTitle}>7-DAY WELLNESS TRENDS</Text>
              <View style={styles.trendGrid}>
                <View style={styles.trendItem}>
                  <Text style={styles.trendLabel}>Mood</Text>
                  <View style={styles.trendValRow}>
                    <Text style={styles.trendVal}>{avgMood}</Text>
                    <TrendingUp size={16} color="#16a34a" />
                  </View>
                </View>

                <View style={styles.trendItem}>
                  <Text style={styles.trendLabel}>Energy</Text>
                  <View style={styles.trendValRow}>
                    <Text style={styles.trendVal}>{avgEnergy}</Text>
                    <TrendingUp size={16} color="#16a34a" />
                  </View>
                </View>

                <View style={styles.trendItem}>
                  <Text style={styles.trendLabel}>Sleep</Text>
                  <View style={styles.trendValRow}>
                    <Text style={styles.trendVal}>{avgSleep}h</Text>
                    <Minus size={16} color="#64748b" />
                  </View>
                </View>

                <View style={styles.trendItem}>
                  <Text style={styles.trendLabel}>Stress</Text>
                  <View style={styles.trendValRow}>
                    <Text style={styles.trendVal}>{avgStress}</Text>
                    <TrendingDown size={16} color="#16a34a" />
                  </View>
                </View>
              </View>
            </View>

            {/* Checkup Form */}
            <View style={styles.formCard}>
              <View style={styles.formCardHeader}>
                <Text style={styles.formCardTitle}>How are you feeling today?</Text>
                {savedToday && (
                  <View style={styles.savedPill}>
                    <CheckCircle2 size={14} color="#16a34a" />
                    <Text style={styles.savedPillText}>Logged Today</Text>
                  </View>
                )}
              </View>

              {/* 1. Energy */}
              <Text style={styles.inputHeading}>⚡ Energy Level</Text>
              <View style={styles.tapGrid}>
                {ENERGIES.map((opt) => (
                  <TouchableOpacity
                    key={opt.val}
                    style={[styles.tapBtn, energy === opt.val && styles.tapBtnActive]}
                    onPress={() => setEnergy(opt.val)}
                  >
                    <Text style={styles.tapEmoji}>{opt.emoji}</Text>
                    <Text style={[styles.tapLabel, energy === opt.val && styles.tapLabelActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 2. Mood */}
              <Text style={styles.inputHeading}>😊 Mood</Text>
              <View style={styles.tapGrid}>
                {MOODS.map((opt) => (
                  <TouchableOpacity
                    key={opt.val}
                    style={[styles.tapBtn, mood === opt.val && styles.tapBtnActive]}
                    onPress={() => setMood(opt.val)}
                  >
                    <Text style={styles.tapEmoji}>{opt.emoji}</Text>
                    <Text style={[styles.tapLabel, mood === opt.val && styles.tapLabelActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 3. Sleep Duration */}
              <Text style={styles.inputHeading}>🌙 Sleep Last Night</Text>
              <View style={styles.tapGrid}>
                {SLEEP_OPTS.map((opt) => (
                  <TouchableOpacity
                    key={opt.hours}
                    style={[styles.tapBtn, sleepHours === opt.hours && styles.tapBtnActive]}
                    onPress={() => setSleepHours(opt.hours)}
                  >
                    <Text style={[styles.tapLabel, sleepHours === opt.hours && styles.tapLabelActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 4. Stress Scale (1-10) */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.inputHeading}>🧠 Stress Level</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: stress > 6 ? '#ef4444' : '#16a34a' }}>
                  {stress} / 10 ({stress <= 3 ? 'Calm' : stress <= 6 ? 'Moderate' : 'High'})
                </Text>
              </View>
              <View style={styles.stressRow}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.stressBtn,
                      stress === num && styles.stressBtnActive,
                      stress === num && num > 6 && { backgroundColor: '#ef4444' },
                    ]}
                    onPress={() => setStress(num)}
                  >
                    <Text
                      style={[
                        styles.stressBtnText,
                        stress === num && styles.stressBtnTextActive,
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 5. Pain / Discomfort */}
              <Text style={styles.inputHeading}>🩹 Physical Discomfort / Pain</Text>
              <View style={styles.chipsRow}>
                {PAIN_LEVELS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.choiceChip, pain === p && styles.choiceChipActive]}
                    onPress={() => setPain(p)}
                  >
                    <Text style={[styles.choiceChipText, pain === p && styles.choiceChipTextActive]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 6. Hydration */}
              <Text style={styles.inputHeading}>💧 Hydration Pace</Text>
              <View style={styles.chipsRow}>
                {HYDRATION_LEVELS.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.choiceChip, hydration === h && styles.choiceChipActive]}
                    onPress={() => setHydration(h)}
                  >
                    <Text style={[styles.choiceChipText, hydration === h && styles.choiceChipTextActive]}>
                      {h}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.saveCheckinBtn}
                onPress={handleSaveDailyCheckup}
              >
                <Text style={styles.saveCheckinBtnText}>
                  {savedToday ? 'Update Today’s Checkup' : 'Submit Daily Checkup'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Instant AI Daily Wellness Summary */}
            <View style={styles.aiSummaryCard}>
              <View style={styles.aiSummaryHeader}>
                <Sparkles size={20} color="#16a34a" />
                <Text style={styles.aiSummaryTitle}>Today's Nura AI Wellness Synthesis</Text>
              </View>
              <Text style={styles.aiSummaryText}>
                {stress > 6
                  ? 'Your stress indicator is elevated today. We recommend scheduling 10 minutes of 4-7-8 breathwork and hydrating generously before your evening meal.'
                  : sleepHours < 6
                  ? 'You logged short sleep last night. Try a gentle 15-minute walk and reduce caffeine after 2:00 PM to support restorative recovery tonight.'
                  : 'Your physiological markers are well-balanced today! Physical energy and mood are prime for a productive day. Keep up your hydration momentum.'}
              </Text>
            </View>
          </View>
        ) : (
          <View>
            {/* Clinical Section */}
            <View style={styles.clinicalHeaderRow}>
              <Text style={styles.sectionHeading}>Preventive Health Schedule</Text>
              <TouchableOpacity
                style={styles.addVisitBtn}
                onPress={() => setShowAddVisit(true)}
              >
                <Plus size={16} color="#ffffff" />
                <Text style={styles.addVisitBtnText}>Log Visit</Text>
              </TouchableOpacity>
            </View>

            {/* Standard Preventive Protocols */}
            <Text style={styles.subHeading}>Recommended Clinical Screenings</Text>
            {defaultPlannerItems.map((item, i) => (
              <View key={i} style={styles.screeningCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.screeningTitle}>{item.name}</Text>
                  <Text style={styles.screeningDesc}>{item.desc}</Text>
                  <Text style={styles.screeningFreq}>Frequency: {item.freq}</Text>
                </View>
                <TouchableOpacity
                  style={styles.planBtn}
                  onPress={() => {
                    setVisitName(item.name);
                    setShowAddVisit(true);
                  }}
                >
                  <Text style={styles.planBtnText}>Record</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Logged Past Visits */}
            <Text style={[styles.subHeading, { marginTop: 20 }]}>
              Logged Visits & Records ({clinicalCheckups.length})
            </Text>

            {clinicalCheckups.length === 0 ? (
              <View style={styles.emptyClinical}>
                <CalendarCheck size={36} color="#cbd5e1" />
                <Text style={styles.emptyClinicalText}>No clinical records logged yet.</Text>
              </View>
            ) : (
              clinicalCheckups.map((c) => (
                <View key={c.id} style={styles.historyCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyTitle}>{c.name}</Text>
                    {c.doctor ? <Text style={styles.historyDoctor}>Dr. {c.doctor}</Text> : null}
                    <Text style={styles.historyDate}>Logged on: {c.date_logged}</Text>
                    {c.next_visit ? (
                      <Text style={styles.historyNext}>Next due: {c.next_visit}</Text>
                    ) : null}
                    {c.notes ? <Text style={styles.historyNotes}>Notes: {c.notes}</Text> : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteClinical(c.id)}
                    style={styles.deleteVisitBtn}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Visit Modal */}
      {showAddVisit && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Record Clinical Visit</Text>
            <Text style={styles.inputLabel}>Checkup / Exam Name *</Text>
            <TextInput
              style={styles.modalInput}
              value={visitName}
              onChangeText={setVisitName}
              placeholder="e.g. Annual Blood Work, Dentist"
            />
            <Text style={styles.inputLabel}>Doctor or Clinic</Text>
            <TextInput
              style={styles.modalInput}
              value={doctorName}
              onChangeText={setDoctorName}
              placeholder="e.g. Dr. Abebe, Bethel Clinic"
            />
            <Text style={styles.inputLabel}>Next Target Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.modalInput}
              value={nextVisitDate}
              onChangeText={setNextVisitDate}
              placeholder="2026-12-01"
            />
            <Text style={styles.inputLabel}>Doctor's Advice / Notes</Text>
            <TextInput
              style={[styles.modalInput, { height: 70, textAlignVertical: 'top' }]}
              value={visitNotes}
              onChangeText={setVisitNotes}
              multiline
              placeholder="Key notes, blood pressure reading, follow-ups"
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity
                style={[styles.modalActionBtn, { backgroundColor: '#f1f5f9' }]}
                onPress={() => setShowAddVisit(false)}
              >
                <Text style={{ color: '#64748b', fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionBtn, { backgroundColor: '#16a34a', flex: 1 }]}
                onPress={handleSaveClinicalVisit}
              >
                <Text style={{ color: '#ffffff', fontWeight: '700' }}>Save Record</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  aiHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    gap: 4,
  },
  aiHeaderBtnText: { color: '#16a34a', fontWeight: '700', fontSize: 12 },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    gap: 6,
  },
  segmentBtnActive: { backgroundColor: '#dcfce7' },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  segmentTextActive: { color: '#16a34a' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  trendCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  trendTitle: { fontSize: 11, fontWeight: '700', color: '#64748b', letterSpacing: 0.8, marginBottom: 10 },
  trendGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  trendItem: { alignItems: 'center' },
  trendLabel: { fontSize: 12, color: '#64748b' },
  trendValRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  trendVal: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  formCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  formCardTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  savedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  savedPillText: { fontSize: 11, fontWeight: '700', color: '#16a34a' },
  inputHeading: { fontSize: 13, fontWeight: '700', color: '#334155', marginTop: 12, marginBottom: 8 },
  tapGrid: { flexDirection: 'row', gap: 8 },
  tapBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tapBtnActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  tapEmoji: { fontSize: 20, marginBottom: 2 },
  tapLabel: { fontSize: 11, fontWeight: '600', color: '#64748b' },
  tapLabelActive: { color: '#16a34a', fontWeight: '800' },
  stressRow: { flexDirection: 'row', gap: 4, marginTop: 8 },
  stressBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
  },
  stressBtnActive: { backgroundColor: '#16a34a' },
  stressBtnText: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  stressBtnTextActive: { color: '#ffffff' },
  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  choiceChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  choiceChipActive: { backgroundColor: '#dcfce7', borderColor: '#16a34a' },
  choiceChipText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  choiceChipTextActive: { color: '#16a34a', fontWeight: '700' },
  saveCheckinBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveCheckinBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  aiSummaryCard: {
    backgroundColor: '#f0fdf4',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 20,
  },
  aiSummaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  aiSummaryTitle: { fontSize: 13, fontWeight: '800', color: '#166534' },
  aiSummaryText: { fontSize: 12, color: '#14532d', lineHeight: 18 },
  clinicalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionHeading: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  addVisitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  addVisitBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  subHeading: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 10 },
  screeningCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  screeningTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  screeningDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  screeningFreq: { fontSize: 11, color: '#16a34a', fontWeight: '600', marginTop: 4 },
  planBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  planBtnText: { fontSize: 12, fontWeight: '700', color: '#334155' },
  emptyClinical: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyClinicalText: { fontSize: 13, color: '#94a3b8', marginTop: 8 },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  historyTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  historyDoctor: { fontSize: 12, color: '#16a34a', fontWeight: '600', marginTop: 2 },
  historyDate: { fontSize: 11, color: '#64748b', marginTop: 2 },
  historyNext: { fontSize: 11, color: '#d97706', fontWeight: '600', marginTop: 2 },
  historyNotes: { fontSize: 11, color: '#475569', fontStyle: 'italic', marginTop: 4 },
  deleteVisitBtn: { padding: 8 },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#475569', marginTop: 8, marginBottom: 4 },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#0f172a',
  },
  modalActionBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
