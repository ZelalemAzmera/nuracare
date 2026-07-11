import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function SessionSelector({ sessions, currentSessionId, onSelect, onNew }: any) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.newBtn} onPress={onNew}>
          <Text style={styles.newBtnText}>+ New Chat</Text>
        </TouchableOpacity>
        {sessions.map((s: any) => (
          <TouchableOpacity 
            key={s.id} 
            style={[styles.sessionBtn, currentSessionId === s.id && styles.sessionBtnActive]}
            onPress={() => onSelect(s.id)}
          >
            <Text style={[styles.sessionText, currentSessionId === s.id && styles.sessionTextActive]}>
              {s.title || 'New Conversation'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#e2e8f0', paddingVertical: 10 },
  scroll: { paddingHorizontal: 16, gap: 10 },
  newBtn: { backgroundColor: '#16a34a', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16, justifyContent: 'center' },
  newBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  sessionBtn: { backgroundColor: '#f1f5f9', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16, justifyContent: 'center' },
  sessionBtnActive: { backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#4ade80' },
  sessionText: { color: '#475569', fontSize: 14, fontWeight: '500' },
  sessionTextActive: { color: '#16a34a', fontWeight: '600' }
});
