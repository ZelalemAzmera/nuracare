import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Pill,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Bot,
  Calendar,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  ChevronRight,
} from 'lucide-react-native';
import {
  getMedications,
  saveMedication,
  deleteMedication,
  getTodaySchedule,
  logDoseAction,
  getAdherenceStats,
  MedicationItem,
  ScheduledDose,
} from '../../src/storage/medicationStorage';

export default function MedicationScreen() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<ScheduledDose[]>([]);
  const [allMeds, setAllMeds] = useState<MedicationItem[]>([]);
  const [stats, setStats] = useState({ percentage: 100, taken: 0, total: 0, streak: 0 });
  const [activeTab, setActiveTab] = useState<'today' | 'manage'>('today');

  // Add Medication Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [timeInput, setTimeInput] = useState('08:00');
  const [category, setCategory] = useState<'Prescription' | 'Supplement' | 'OTC' | 'Vitamin'>('Supplement');
  const [withFood, setWithFood] = useState(false);
  const [instructions, setInstructions] = useState('');

  const refreshData = useCallback(() => {
    setSchedule(getTodaySchedule());
    setAllMeds(getMedications());
    setStats(getAdherenceStats(7));
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleMarkTaken = (dose: ScheduledDose) => {
    const today = new Date().toISOString().split('T')[0];
    logDoseAction(dose.medication.id, today, dose.time, 'taken');
    refreshData();
  };

  const handleMarkSkipped = (dose: ScheduledDose) => {
    Alert.alert('Skip Dose', `Are you sure you want to skip ${dose.medication.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Skip Dose',
        style: 'destructive',
        onPress: () => {
          const today = new Date().toISOString().split('T')[0];
          logDoseAction(dose.medication.id, today, dose.time, 'skipped');
          refreshData();
        },
      },
    ]);
  };

  const handleSaveNewMed = () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter a medication or supplement name.');
      return;
    }
    const cleanTimes = timeInput.split(',').map(t => t.trim()).filter(Boolean);
    const times = cleanTimes.length > 0 ? cleanTimes : ['08:00'];

    saveMedication({
      name: name.trim(),
      dosage: dosage.trim() || '1 dose',
      frequency,
      times,
      withFood,
      category,
      instructions: instructions.trim(),
      reminderEnabled: true,
      startDate: new Date().toISOString().split('T')[0],
    });

    setShowAddModal(false);
    setName('');
    setDosage('');
    setTimeInput('08:00');
    setInstructions('');
    setWithFood(false);
    refreshData();
  };

  const handleDeleteMed = (id: string, medName: string) => {
    Alert.alert('Remove Medication', `Remove "${medName}" from your schedule?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          deleteMedication(id);
          refreshData();
        },
      },
    ]);
  };

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case 'Morning':
        return <Sun size={18} color="#f59e0b" />;
      case 'Afternoon':
        return <Sun size={18} color="#ea580c" />;
      case 'Evening':
        return <Sunset size={18} color="#8b5cf6" />;
      default:
        return <Moon size={18} color="#3b82f6" />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Medication & Care</Text>
          <Text style={styles.subtitle}>Daily schedule & adherence tracking</Text>
        </View>
        <TouchableOpacity
          style={styles.addHeaderBtn}
          onPress={() => setShowAddModal(true)}
          accessibilityLabel="Add Medication"
        >
          <Plus size={20} color="#ffffff" />
          <Text style={styles.addHeaderBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Sub navigation segmented buttons */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'today' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('today')}
        >
          <Clock size={16} color={activeTab === 'today' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.segmentText, activeTab === 'today' && styles.segmentTextActive]}>
            Today's Doses ({schedule.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'manage' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('manage')}
        >
          <Pill size={16} color={activeTab === 'manage' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.segmentText, activeTab === 'manage' && styles.segmentTextActive]}>
            Cabinet ({allMeds.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Adherence Score Summary Card */}
        <View style={styles.adherenceCard}>
          <View style={styles.adherenceLeft}>
            <Text style={styles.adherenceLabel}>7-DAY ADHERENCE</Text>
            <Text style={styles.adherenceScore}>{stats.percentage}%</Text>
            <Text style={styles.adherenceSub}>
              {stats.taken} of {stats.total} doses taken • {stats.streak} day streak 🔥
            </Text>
          </View>
          <View style={styles.adherenceBadge}>
            <ShieldCheck size={28} color="#16a34a" />
            <Text style={styles.adherenceBadgeText}>
              {stats.percentage >= 85 ? 'On Track' : 'Needs Attention'}
            </Text>
          </View>
        </View>

        {/* AI Contextual Assistant Chip */}
        <TouchableOpacity
          style={styles.aiChip}
          onPress={() => router.push('/chat')}
        >
          <Bot size={20} color="#16a34a" />
          <View style={{ flex: 1, marginHorizontal: 8 }}>
            <Text style={styles.aiChipTitle}>Medication & Fasting Consultation</Text>
            <Text style={styles.aiChipSubtitle}>Ask Nura AI how your doses align with Tsom fasting</Text>
          </View>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>

        {/* Clinical Safety Disclaimer Banner */}
        <View style={styles.disclaimerBanner}>
          <AlertTriangle size={18} color="#b45309" />
          <Text style={styles.disclaimerText}>
            NuraCare provides adherence reminders and wellness guidance. It never independently prescribes, alters, or discontinues prescribed medication. Consult your physician before modifying your treatment.
          </Text>
        </View>

        {activeTab === 'today' ? (
          <View>
            <Text style={styles.sectionHeading}>Today's Schedule</Text>

            {schedule.length === 0 ? (
              <View style={styles.emptyState}>
                <Pill size={40} color="#cbd5e1" />
                <Text style={styles.emptyTitle}>No scheduled doses today</Text>
                <Text style={styles.emptySubtitle}>
                  Add your daily medications, vitamins, or supplements to track them here.
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => setShowAddModal(true)}
                >
                  <Text style={styles.emptyActionBtnText}>Add First Medication</Text>
                </TouchableOpacity>
              </View>
            ) : (
              schedule.map((dose) => (
                <View
                  key={dose.doseId}
                  style={[
                    styles.doseCard,
                    dose.status === 'taken' && styles.doseCardTaken,
                    dose.status === 'skipped' && styles.doseCardSkipped,
                  ]}
                >
                  <View style={styles.doseTimeCol}>
                    <View style={styles.periodRow}>
                      {getPeriodIcon(dose.period)}
                      <Text style={styles.doseTimeText}>{dose.time}</Text>
                    </View>
                    <Text style={styles.periodText}>{dose.period}</Text>
                  </View>

                  <View style={styles.doseMainCol}>
                    <View style={styles.doseTitleRow}>
                      <Text
                        style={[
                          styles.doseMedName,
                          dose.status === 'taken' && styles.strikeText,
                        ]}
                      >
                        {dose.medication.name}
                      </Text>
                      <View
                        style={[
                          styles.categoryTag,
                          {
                            backgroundColor:
                              dose.medication.category === 'Prescription'
                                ? '#fee2e2'
                                : dose.medication.category === 'Vitamin'
                                ? '#fef3c7'
                                : '#dcfce7',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryTagText,
                            {
                              color:
                                dose.medication.category === 'Prescription'
                                  ? '#b91c1c'
                                  : dose.medication.category === 'Vitamin'
                                  ? '#b45309'
                                  : '#15803d',
                            },
                          ]}
                        >
                          {dose.medication.category}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.doseDosageText}>
                      {dose.medication.dosage}
                      {dose.medication.withFood ? ' • Take with meal' : ''}
                    </Text>

                    {dose.medication.instructions ? (
                      <Text style={styles.instructionsText}>
                        ℹ️ {dose.medication.instructions}
                      </Text>
                    ) : null}

                    {/* Action buttons */}
                    <View style={styles.actionRow}>
                      {dose.status === 'taken' ? (
                        <View style={styles.takenBadge}>
                          <CheckCircle2 size={16} color="#16a34a" />
                          <Text style={styles.takenBadgeText}>Taken</Text>
                        </View>
                      ) : dose.status === 'skipped' ? (
                        <View style={styles.skippedBadge}>
                          <XCircle size={16} color="#ef4444" />
                          <Text style={styles.skippedBadgeText}>Skipped</Text>
                        </View>
                      ) : (
                        <>
                          <TouchableOpacity
                            style={styles.takeBtn}
                            onPress={() => handleMarkTaken(dose)}
                          >
                            <CheckCircle2 size={16} color="#ffffff" />
                            <Text style={styles.takeBtnText}>Mark as Taken</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.skipBtn}
                            onPress={() => handleMarkSkipped(dose)}
                          >
                            <Text style={styles.skipBtnText}>Skip</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (
          <View>
            <Text style={styles.sectionHeading}>Active Medications ({allMeds.length})</Text>

            {allMeds.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptySubtitle}>No items saved in cabinet.</Text>
              </View>
            ) : (
              allMeds.map((med) => (
                <View key={med.id} style={styles.medItemCard}>
                  <View style={styles.medItemLeft}>
                    <Text style={styles.medItemName}>{med.name}</Text>
                    <Text style={styles.medItemDetail}>
                      {med.dosage} • {med.frequency} • {med.times.join(', ')}
                    </Text>
                    {med.instructions ? (
                      <Text style={styles.medItemInstructions}>{med.instructions}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteMed(med.id, med.name)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Medication Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Medication / Supplement</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <XCircle size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Metformin, Vitamin D, Zinc"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.inputLabel}>Dosage</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 500mg, 1 tablet, 10ml"
                value={dosage}
                onChangeText={setDosage}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.chipsRow}>
                {(['Prescription', 'Supplement', 'Vitamin', 'OTC'] as const).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, category === cat && styles.chipActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Scheduled Time(s) (24h format, comma separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 08:00 or 08:00, 20:00"
                value={timeInput}
                onChangeText={setTimeInput}
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Take with Food / Meal</Text>
                <Switch
                  value={withFood}
                  onValueChange={setWithFood}
                  trackColor={{ false: '#cbd5e1', true: '#86efac' }}
                  thumbColor={withFood ? '#16a34a' : '#f1f5f9'}
                />
              </View>

              <Text style={styles.inputLabel}>Special Instructions</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g. Take with full glass of water, avoid dairy 2h before"
                value={instructions}
                onChangeText={setInstructions}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity style={styles.saveModalBtn} onPress={handleSaveNewMed}>
                <Text style={styles.saveModalBtnText}>Save Medication</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  addHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 4,
  },
  addHeaderBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
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
  segmentBtnActive: {
    backgroundColor: '#dcfce7',
  },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  segmentTextActive: { color: '#16a34a' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  adherenceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  adherenceLeft: { flex: 1 },
  adherenceLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', letterSpacing: 0.8 },
  adherenceScore: { fontSize: 32, fontWeight: '900', color: '#0f172a', marginVertical: 2 },
  adherenceSub: { fontSize: 12, color: '#64748b' },
  adherenceBadge: {
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  adherenceBadgeText: { fontSize: 11, fontWeight: '700', color: '#16a34a', marginTop: 4 },
  aiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 12,
  },
  aiChipTitle: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  aiChipSubtitle: { fontSize: 12, color: '#64748b', marginTop: 1 },
  disclaimerBanner: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fef3c7',
    marginBottom: 16,
    gap: 8,
  },
  disclaimerText: { flex: 1, fontSize: 11, color: '#92400e', lineHeight: 16 },
  sectionHeading: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 4, marginBottom: 16 },
  emptyActionBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  emptyActionBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  doseCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  doseCardTaken: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    opacity: 0.85,
  },
  doseCardSkipped: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  doseTimeCol: {
    width: 80,
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
    paddingRight: 10,
    justifyContent: 'center',
  },
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  doseTimeText: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  periodText: { fontSize: 11, color: '#64748b', marginTop: 2 },
  doseMainCol: { flex: 1, paddingLeft: 12 },
  doseTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  doseMedName: { fontSize: 15, fontWeight: '700', color: '#0f172a', flex: 1 },
  strikeText: { textDecorationLine: 'line-through', color: '#94a3b8' },
  categoryTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryTagText: { fontSize: 10, fontWeight: '700' },
  doseDosageText: { fontSize: 13, color: '#475569', marginTop: 2 },
  instructionsText: { fontSize: 11, color: '#64748b', marginTop: 4, fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', marginTop: 10, gap: 8, alignItems: 'center' },
  takeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  takeBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  skipBtnText: { color: '#64748b', fontSize: 12, fontWeight: '600' },
  takenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  takenBadgeText: { fontSize: 12, fontWeight: '700', color: '#16a34a' },
  skippedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fee2e2',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  skippedBadgeText: { fontSize: 12, fontWeight: '700', color: '#ef4444' },
  medItemCard: {
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
  medItemLeft: { flex: 1 },
  medItemName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  medItemDetail: { fontSize: 12, color: '#64748b', marginTop: 2 },
  medItemInstructions: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  deleteBtn: { padding: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  modalBody: { marginBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  textArea: { height: 70, textAlignVertical: 'top' },
  chipsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  chipText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  chipTextActive: { color: '#16a34a' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  switchLabel: { fontSize: 13, fontWeight: '600', color: '#334155' },
  saveModalBtn: {
    backgroundColor: '#16a34a',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  saveModalBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
});
