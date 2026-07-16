import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { Calendar, Trash2, User, Stethoscope, FileText, Plus, ShieldCheck, Activity, Smile, Eye, Sun, Shield } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getCheckups, saveCheckup, deleteCheckup } from '../../src/storage/checkupsStorage';

export default function CheckupsScreen() {
  const [checkups, setCheckups] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('planner'); // 'planner' or 'history'
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');
  const [nextVisit, setNextVisit] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [historyFilter, setHistoryFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCheckups(getCheckups());
  };

  const handleSaveVisit = () => {
    if (!activeItem) return;
    
    const newVisit = { 
      name: activeItem.name, 
      doctor: doctorName,
      date_logged: new Date().toISOString().split('T')[0],
      notes,
      next_visit: nextVisit.toISOString().split('T')[0],
      source: 'manual'
    };
    
    saveCheckup(newVisit);
    
    setModalOpen(false);
    setDoctorName('');
    setNotes('');
    setNextVisit(new Date());
    setActiveTab('history');
    loadData();
  };

  const setModalOpen = (open: boolean) => {
    setShowModal(open);
  }

  const openModal = (item: any) => {
    setActiveItem(item);
    setDoctorName('');
    setNotes('');
    setNextVisit(new Date());
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Record', 'Are you sure you want to delete this checkup?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        deleteCheckup(id);
        loadData();
      }}
    ]);
  };

  const plannerItems = [
    { name: 'Annual Physical Check', freq: 'Yearly', desc: 'Comprehensive metabolic panel, blood pressure, and general health review.', icon: <Activity size={24} color="#0f172a" /> },
    { name: 'Dental Cleaning', freq: 'Every 6 months', desc: 'Preventive cleaning and exam.', icon: <Smile size={24} color="#0f172a" /> },
    { name: 'Eye Exam', freq: 'Every 1-2 years', desc: 'Vision check and eye health screening.', icon: <Eye size={24} color="#0f172a" /> },
    { name: 'Skin Cancer Screening', freq: 'Yearly', desc: 'Full body dermatology check.', icon: <Sun size={24} color="#0f172a" /> },
    { name: 'Vaccination Review', freq: 'Yearly', desc: 'Flu shot and other recommended boosters.', icon: <Shield size={24} color="#0f172a" /> },
  ];

  const filteredHistory = checkups.filter(c => {
    if (historyFilter === 'upcoming') return c.next_visit && new Date(c.next_visit) >= new Date(new Date().setHours(0,0,0,0));
    if (historyFilter === 'manual') return c.source === 'manual';
    if (historyFilter === 'ai') return c.source !== 'manual';
    return true;
  }).sort((a, b) => new Date(b.date_logged).getTime() - new Date(a.date_logged).getTime());

  const getDueStatus = (dateStr: string) => {
    if (!dateStr) return null;
    const days = Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: `Overdue by ${Math.abs(days)} days`, color: '#ef4444', bg: '#fef2f2' };
    if (days <= 14) return { text: `Due in ${days} days`, color: '#d97706', bg: '#fffbeb' };
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Checkups</Text>
          <Text style={styles.subtitle}>Your routine checkup planner & log</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'planner' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('planner')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'planner' && styles.tabBtnTextActive]}>Planner</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'history' && styles.tabBtnTextActive]}>History Log</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'planner' && (
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.promoCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ShieldCheck size={20} color="#16a34a" />
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#16a34a' }}>Stay Ahead of Illness</Text>
            </View>
            <Text style={{ color: '#334155', lineHeight: 22 }}>
              Preventive care helps catch problems early when they are most treatable. Use this planner to track your routine visits.
            </Text>
          </View>

          {plannerItems.map((item, i) => (
            <View key={i} style={styles.plannerCard}>
              <View style={styles.plannerIconBg}>{item.icon}</View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={styles.plannerTitle}>{item.name}</Text>
                  <View style={styles.freqBadge}>
                    <Text style={styles.freqBadgeText}>{item.freq}</Text>
                  </View>
                </View>
                <Text style={styles.plannerDesc}>{item.desc}</Text>
                <TouchableOpacity style={styles.logBtn} onPress={() => openModal(item)}>
                  <Text style={styles.logBtnText}>Log Visit</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {activeTab === 'history' && (
        <View style={{ flex: 1 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingRight: 20 }}>
            {['all', 'upcoming', 'manual', 'ai'].map(f => (
              <TouchableOpacity 
                key={f}
                style={[styles.filterBtn, historyFilter === f && styles.filterBtnActive]}
                onPress={() => setHistoryFilter(f)}
              >
                <Text style={[styles.filterBtnText, historyFilter === f && styles.filterBtnTextActive]}>
                  {f === 'ai' ? 'AI-Suggested' : f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={{ flex: 1 }}>
            {filteredHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Stethoscope size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
                <Text style={{ color: '#64748b' }}>No records found in this category.</Text>
              </View>
            ) : (
              filteredHistory.map(visit => {
                const status = getDueStatus(visit.next_visit);
                return (
                  <View key={visit.id} style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, flex: 1 }}>
                        <Text style={styles.historyTitle}>{visit.name}</Text>
                        {status && (
                          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                            <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.text}</Text>
                          </View>
                        )}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Text style={styles.historyDate}>{visit.date_logged}</Text>
                        <TouchableOpacity onPress={() => handleDelete(visit.id)}>
                          <Trash2 size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    {visit.doctor && (
                      <View style={styles.historyRow}>
                        <User size={14} color="#64748b" />
                        <Text style={styles.historyText}>{visit.doctor}</Text>
                      </View>
                    )}
                    
                    {visit.notes && (
                      <View style={styles.historyRow}>
                        <FileText size={14} color="#64748b" />
                        <Text style={styles.historyText}><Text style={{fontWeight: '600'}}>Findings:</Text> {visit.notes}</Text>
                      </View>
                    )}
                    
                    {visit.next_visit && (
                      <View style={styles.historyNext}>
                        <Calendar size={14} color="#16a34a" />
                        <Text style={{ fontSize: 13, color: '#16a34a', fontWeight: '600', marginLeft: 4 }}>Next: {visit.next_visit}</Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      )}

      {showModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log {activeItem?.name}</Text>
            
            <Text style={styles.label}>Doctor or Clinic Name</Text>
            <TextInput 
              style={styles.input}
              value={doctorName}
              onChangeText={setDoctorName}
              placeholder="e.g. Dr. Abebe"
            />
            
            <Text style={styles.label}>Doctor's Findings</Text>
            <TextInput 
              style={[styles.input, { height: 80 }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes, prescriptions, advice..."
              multiline
            />
            
            <Text style={styles.label}>Schedule Next Visit</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
              <Text style={{ fontSize: 16 }}>{nextVisit.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={nextVisit}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setNextVisit(selectedDate);
                }}
              />
            )}
            
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveVisit}>
                <Text style={styles.saveBtnText}>Save Record</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  
  tabContainer: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 12, padding: 4, marginBottom: 24 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabBtnActive: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tabBtnText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  tabBtnTextActive: { color: '#0f172a' },
  
  promoCard: { backgroundColor: '#f0fdf4', padding: 20, borderRadius: 16, marginBottom: 24 },
  
  plannerCard: { backgroundColor: '#ffffff', padding: 20, borderRadius: 16, marginBottom: 16, flexDirection: 'row', gap: 16, borderColor: '#e2e8f0', borderWidth: 1 },
  plannerIconBg: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12, alignSelf: 'flex-start' },
  plannerTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  freqBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  freqBadgeText: { fontSize: 11, fontWeight: '700', color: '#16a34a' },
  plannerDesc: { fontSize: 13, color: '#64748b', marginBottom: 12, lineHeight: 18 },
  logBtn: { alignSelf: 'flex-start', borderColor: '#e2e8f0', borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  logBtnText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  
  filterScroll: { maxHeight: 40, marginBottom: 16 },
  filterBtn: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', borderWidth: 1, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginRight: 8, alignSelf: 'flex-start' },
  filterBtnActive: { backgroundColor: '#f0fdf4', borderColor: '#16a34a' },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  filterBtnTextActive: { color: '#16a34a' },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', borderRadius: 16, padding: 40, marginTop: 20 },
  
  historyCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, borderColor: '#e2e8f0', borderWidth: 1, marginBottom: 16 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  historyTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  historyDate: { fontSize: 13, color: '#94a3b8' },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  historyText: { fontSize: 14, color: '#475569' },
  historyNext: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#ffffff', width: '90%', borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 16, marginBottom: 16 },
  dateBtn: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 24 },
  cancelBtn: { flex: 1, padding: 14, backgroundColor: '#f1f5f9', borderRadius: 12, alignItems: 'center' },
  cancelBtnText: { fontWeight: '600', color: '#334155' },
  saveBtn: { flex: 1, padding: 14, backgroundColor: '#16a34a', borderRadius: 12, alignItems: 'center' },
  saveBtnText: { fontWeight: '600', color: '#ffffff' }
});
