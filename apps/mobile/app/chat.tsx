import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Send, Bot } from 'lucide-react-native';
import { useChatStore } from '../src/store';
import { useProfile } from '../src/context/ProfileContext';
import { ChatEngine } from '../src/services/ai';

import MessageBubble from '../src/components/chat/MessageBubble';
import UrgencyCard from '../src/components/chat/UrgencyCard';
import SessionSelector from '../src/components/chat/SessionSelector';

function parseUrgencyFromContent(content: string) {
  try {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
  } catch (e) {
    return null;
  }
  return null;
}

function stripJsonBlock(content: string) {
  return content.replace(/```json\s*[\s\S]*?\s*```/, '').trim();
}

export default function ChatScreen() {
  const { messages, addMessage, sessions, addSession } = useChatStore() as any;
  const { profile, setProfile } = useProfile();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (sessions?.length > 0 && !currentSessionId) {
      setCurrentSessionId(sessions[0].id);
    }
  }, [sessions, currentSessionId]);

  const currentMessages = messages.filter((m: any) => m.session_id === currentSessionId) || [];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = `session_${Date.now()}`;
      addSession({ id: sessionId, title: input.trim().substring(0, 30) + '...', created_at: new Date().toISOString() });
      setCurrentSessionId(sessionId);
    }

    const userMessage = {
      id: `msg_${Date.now()}`,
      session_id: sessionId,
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    addMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const messagesForAi = currentMessages.concat(userMessage).map((m: any) => ({
        role: m.role,
        content: m.content
      }));

      const rawResponse = await ChatEngine.processMessage(messagesForAi, profile);
      const urgencyData = parseUrgencyFromContent(rawResponse);
      const cleanResponse = stripJsonBlock(rawResponse);
      
      const aiMessage = {
        id: `msg_${Date.now() + 1}`,
        session_id: sessionId,
        role: 'assistant',
        content: cleanResponse,
        metadata: {
          urgency_assessment: urgencyData,
        },
        created_at: new Date().toISOString(),
      };
      
      addMessage(aiMessage);

      if (urgencyData?.urgency) {
        // Save checkin record if there is an urgency assessment
        const newRecord = {
          id: Date.now(),
          dateStr: new Date().toISOString().split('T')[0],
          summary: urgencyData.summary || 'Health check',
          urgency: urgencyData.urgency,
          action: urgencyData.action || '',
          natural: urgencyData.naturalRemedies || []
        };
        const currentRecords = profile?.records || [];
        setProfile({ records: [...currentRecords, newRecord] });
      }

    } catch (err: any) {
      console.error(err);
      addMessage({
        id: `msg_${Date.now() + 1}`,
        session_id: sessionId,
        role: 'assistant',
        content: 'I am sorry, I am having trouble connecting to my servers right now.',
        created_at: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleNewSession = () => {
    setCurrentSessionId(null);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Bot size={24} color="#16a34a" />
        <View>
          <Text style={styles.headerTitle}>Nura AI Assistant</Text>
          <Text style={styles.headerSubtitle}>Medical guidance & triage</Text>
        </View>
      </View>

      <SessionSelector 
        sessions={sessions || []} 
        currentSessionId={currentSessionId} 
        onSelect={setCurrentSessionId} 
        onNew={handleNewSession} 
      />

      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatArea} 
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {currentMessages.length === 0 && (
          <View style={styles.emptyState}>
            <Bot size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>How can I help you today?</Text>
            <Text style={styles.emptyDesc}>Describe your symptoms, ask about your medications, or get wellness advice.</Text>
          </View>
        )}
        
        {currentMessages.map((msg: any) => (
          <View key={msg.id}>
            <MessageBubble message={msg} />
            {msg.metadata?.urgency_assessment?.urgency && (
              <UrgencyCard {...msg.metadata.urgency_assessment} />
            )}
          </View>
        ))}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#16a34a" />
            <Text style={styles.loadingText}>Nura is thinking...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Describe how you're feeling..."
          placeholderTextColor="#94a3b8"
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} 
          onPress={handleSend}
          disabled={!input.trim() || isLoading}
        >
          <Send size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, paddingTop: 60, backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  headerSubtitle: { fontSize: 13, color: '#64748b' },
  chatArea: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 24 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 12 },
  loadingText: { color: '#64748b', fontSize: 14, fontStyle: 'italic' },
  inputArea: { flexDirection: 'row', alignItems: 'flex-end', padding: 16, backgroundColor: '#ffffff', borderTopWidth: 1, borderColor: '#e2e8f0', gap: 12 },
  input: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 16, minHeight: 48, maxHeight: 120, color: '#0f172a' },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#94a3b8' }
});
