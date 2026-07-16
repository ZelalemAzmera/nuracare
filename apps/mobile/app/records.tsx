import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useProfile } from '../src/context/ProfileContext';
import { ChevronLeft, ClipboardList, Calendar, TrendingUp, Activity, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react-native';

export default function RecordsScreen() {
  const { profile } = useProfile();
  const records = profile?.records || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#64748b" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Medical Records</Text>
          <Text style={styles.subtitle}>Your historical health vault</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {(!records || records.length === 0) ? (
          <View style={styles.emptyState}>
            <ClipboardList size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No records yet.</Text>
            <Text style={styles.emptyDesc}>Complete a symptom check in the chat to see your history here.</Text>
          </View>
        ) : (
          <View style={styles.recordsList}>
            {[...records].reverse().map(r => (
              <ExpandableRecordCard key={r.id} r={r} />
            ))}
          </View>
        )}

        {profile?.medicalNotes && (
          <View style={styles.notesCard}>
            <Text style={styles.notesTitle}>Extracted Medical Notes</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{profile.medicalNotes}</Text>
            </View>
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function ExpandableRecordCard({ r }: { r: any }) {
  const [expanded, setExpanded] = useState(false);
  
  const statusMap: Record<string, string> = { low: 'Improving', mid: 'Monitoring', high: 'Needs Attention' };
  
  const renderIcon = (urgency: string) => {
    switch (urgency) {
      case 'low': return <TrendingUp size={14} color="#16a34a" />;
      case 'mid': return <Activity size={14} color="#d97706" />;
      case 'high': return <AlertTriangle size={14} color="#dc2626" />;
      default: return <Activity size={14} color="#64748b" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch(urgency) {
      case 'low': return { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' };
      case 'mid': return { bg: '#fef3c7', text: '#d97706', border: '#fde68a' };
      case 'high': return { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' };
      default: return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
    }
  };

  const uColors = getUrgencyColor(r.urgency);

  return (
    <TouchableOpacity style={styles.card} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.dateRow}>
          <Calendar size={14} color="#64748b" />
          <Text style={styles.dateText}>{r.dateStr}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: uColors.bg, borderColor: uColors.border }]}>
          <Text style={[styles.badgeText, { color: uColors.text }]}>{r.urgency ? r.urgency.toUpperCase() : 'UNKNOWN'}</Text>
        </View>
      </View>
      
      <Text style={styles.symptomText}>{r.summary}</Text>
      
      <View style={styles.metaRow}>
        <View style={styles.statusPill}>
          {renderIcon(r.urgency)}
          <Text style={styles.statusText}>{statusMap[r.urgency] || 'Logged'}</Text>
        </View>
        
        <View style={styles.actionHintWrap}>
          {!expanded && r.action && (
            <Text style={styles.actionHint} numberOfLines={1}>
              {r.action.slice(0, 30)}...
            </Text>
          )}
          {expanded ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </View>
      </View>

      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.expandedSection}>
            <Text style={styles.expandedLabel}>Action Plan:</Text>
            <Text style={styles.expandedText}>{r.action}</Text>
          </View>
          
          {r.natural && r.natural.length > 0 && (
            <View style={styles.expandedSection}>
              <Text style={styles.expandedLabel}>Natural Remedies:</Text>
              <Text style={styles.expandedText}>{r.natural.join(', ')}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
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
  
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22 },
  
  recordsList: { gap: 16 },
  
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  
  symptomText: { fontSize: 16, color: '#1e293b', fontWeight: '600', marginBottom: 16, lineHeight: 22 },
  
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  statusText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  
  actionHintWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'flex-end', marginLeft: 16 },
  actionHint: { fontSize: 13, color: '#64748b', flexShrink: 1 },
  
  expandedContent: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: '#f1f5f9' },
  expandedSection: { marginBottom: 12 },
  expandedLabel: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  expandedText: { fontSize: 14, color: '#475569', lineHeight: 20 },
  
  notesCard: { marginTop: 32, backgroundColor: '#ffffff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  notesTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  notesBox: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  notesText: { fontSize: 14, color: '#475569', lineHeight: 22 }
});
