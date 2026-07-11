import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { Calendar, Plus, X, Stethoscope, Clock, MapPin } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as CalendarAPI from 'expo-calendar';
import { getCheckups, saveCheckup, deleteCheckup } from '../../src/storage/checkupsStorage';

export default function CheckupsScreen() {
  const [checkups, setCheckups] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [doctor, setDoctor] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadData();
    requestCalendarPermissions();
  }, []);

  const loadData = () => {
    setCheckups(getCheckups());
  };

  const requestCalendarPermissions = async () => {
    const { status } = await CalendarAPI.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      console.log('Calendar permission denied');
    }
  };

  const handleAdd = async () => {
    if (!title || !doctor || !location) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const newCheckup = {
      id: Date.now().toString(),
      title,
      doctor,
      location,
      date: date.toISOString(),
      status: 'upcoming'
    };

    saveCheckup(newCheckup);
    
    // Optional: Add to native calendar
    try {
      const { status } = await CalendarAPI.getCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await CalendarAPI.getCalendarsAsync(CalendarAPI.EntityTypes.EVENT);
        const defaultCalendar = calendars.find(c => c.isPrimary) || calendars[0];
        
        if (defaultCalendar) {
          await CalendarAPI.createEventAsync(defaultCalendar.id, {
            title: `Checkup: ${title} w/ ${doctor}`,
            startDate: date,
            endDate: new Date(date.getTime() + 60 * 60 * 1000), // 1 hour duration
            location,
            notes: 'Scheduled via NuraCare',
          });
        }
      }
    } catch (e) {
      console.log('Error adding to native calendar', e);
    }

    // Reset Form
    setTitle('');
    setDoctor('');
    setLocation('');
    setDate(new Date());
    setShowModal(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    Alert.alert('Cancel Checkup', 'Are you sure you want to cancel this checkup?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => {
        deleteCheckup(id);
        loadData();
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Checkups</Text>
          <Text style={styles.subtitle}>Manage your upcoming appointments</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {showModal ? (
        <ScrollView style={styles.modalForm}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Checkup</Text>
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeBtn}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reason for Visit</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Annual Physical" />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Doctor / Specialist</Text>
            <TextInput style={styles.input} value={doctor} onChangeText={setDoctor} placeholder="e.g. Dr. Abebe" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Clinic Location</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="e.g. Black Lion Hospital" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date & Time</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateBtnText}>{date.toLocaleString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
            <Text style={styles.saveBtnText}>Save Appointment</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView style={styles.list}>
          {checkups.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No upcoming checkups</Text>
              <Text style={styles.emptyDesc}>Keep on top of your health by scheduling your routine visits.</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowModal(true)}>
                <Text style={styles.emptyBtnText}>Schedule One Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            checkups.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(c => (
              <View key={c.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{c.title}</Text>
                  <TouchableOpacity onPress={() => handleDelete(c.id)}>
                    <X size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardRow}>
                  <Stethoscope size={16} color="#64748b" />
                  <Text style={styles.cardText}>{c.doctor}</Text>
                </View>
                
                <View style={styles.cardRow}>
                  <Clock size={16} color="#64748b" />
                  <Text style={styles.cardText}>
                    {new Date(c.date).toLocaleDateString()} at {new Date(c.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </Text>
                </View>

                <View style={styles.cardRow}>
                  <MapPin size={16} color="#64748b" />
                  <Text style={styles.cardText}>{c.location}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 40 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  addBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center' },
  list: { flex: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22, paddingHorizontal: 20, marginBottom: 24 },
  emptyBtn: { backgroundColor: '#e2e8f0', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  emptyBtnText: { color: '#0f172a', fontWeight: '600' },
  card: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardText: { fontSize: 15, color: '#475569' },
  modalForm: { flex: 1, backgroundColor: '#ffffff', borderRadius: 24, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  closeBtn: { padding: 4 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: { backgroundColor: '#f1f5f9', padding: 16, borderRadius: 12, fontSize: 16, color: '#0f172a' },
  dateBtn: { backgroundColor: '#f1f5f9', padding: 16, borderRadius: 12 },
  dateBtnText: { fontSize: 16, color: '#0f172a' },
  saveBtn: { backgroundColor: '#16a34a', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});
