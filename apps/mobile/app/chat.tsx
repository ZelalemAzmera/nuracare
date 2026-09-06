import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Send, Bot, ArrowLeft, Mic, MicOff, AlertTriangle, Globe, Sparkles } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useChatStore } from '../src/store';
import { useProfile } from '../src/context/ProfileContext';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../src/ai/aiTypes';
import { TRILINGUAL_PROMPTS } from '../src/ai/trilingualPrompts';
import { classifyHealthQuery } from '../src/ai/safetyClassifier';
import { buildMinimizedContext } from '../src/ai/contextMinimizer';
import PermissionExplanationModal from '../src/permissions/components/PermissionExplanationModal';
import { permissionService } from '../src/permissions/permissionService';

export default function ChatScreen() {
  const { prompt: paramPrompt } = useLocalSearchParams<{ prompt?: string }>();
  const { messages, addMessage } = useChatStore() as any;
  const { profile } = useProfile();
  
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const [input, setInput] = useState(paramPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState<string | null>(null);
  const [showMicModal, setShowMicModal] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const prompts = TRILINGUAL_PROMPTS[selectedLanguage];

  useEffect(() => {
    if (paramPrompt && !input) {
      setInput(paramPrompt);
    }
  }, [paramPrompt]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setEmergencyAlert(null);

    // 1. Safety Classification
    const safety = classifyHealthQuery(userText);
    if (!safety.safeToProceed && safety.emergencyGuidance) {
      setEmergencyAlert(safety.emergencyGuidance);
      // Still log user message and post emergency guidance directly
      addMessage({
        id: `msg_${Date.now()}`,
        role: 'user',
        content: userText,
        created_at: new Date().toISOString()
      });
      addMessage({
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: safety.emergencyGuidance,
        created_at: new Date().toISOString()
      });
      return;
    }

    // 2. Add user message
    const userMsg = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userText,
      created_at: new Date().toISOString()
    };
    addMessage(userMsg);
    setIsLoading(true);

    // 3. Build Minimized Context (Consent-aware)
    const context = buildMinimizedContext(profile, [], userText);

    // 4. Generate context-aware response
    setTimeout(() => {
      let aiResponseText = '';
      if (selectedLanguage === 'am') {
        aiResponseText = `ጤና ይስጥልኝ! መልዕክትዎን ተመልክቻለሁ። እንደ እርስዎ የሰውነት ዕረፍት ሁኔታ (Recovery ${context?.recoveryScore ?? 84}%)፣ ዛሬ የተመጣጠነ ምግብ (ሽሮ፣ ጤፍና ተልባ) መመገብና በቂ ውኃ መጠጣት ይመከራል።`;
      } else if (selectedLanguage === 'om') {
        aiResponseText = `Akkam jirtu! Ergaa keessan argeera. Haala boqonnaa keessan irratti hundaa'uun (Recovery ${context?.recoveryScore ?? 84}%), har'a bishaan gahaa dhuguu fi soorata madaalawaa soorachuun baay'ee gaariidha.`;
      } else {
        aiResponseText = `Based on your recovery level (${context?.recoveryScore ?? 84}%), your energy is in a good range. If you are observing Ethiopian fasting (Tsom), ensure you get sufficient plant proteins like lentils, chickpeas, and flaxseed.`;
      }

      addMessage({
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: aiResponseText,
        created_at: new Date().toISOString()
      });
      setIsLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }, 800);
  };

  const handleVoicePress = () => {
    if (permissionService.getStatus('microphone') !== 'granted') {
      setShowMicModal(true);
      return;
    }
    toggleRecording();
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulated transcription
      if (selectedLanguage === 'am') {
        setInput('ዛሬ የጾም ምግብ ምን ብመገብ ይሻላል?');
      } else if (selectedLanguage === 'om') {
        setInput('Har’a soorata soomaa akkamiin nyaadha?');
      } else {
        setInput('What should I eat for optimal recovery today?');
      }
    } else {
      setIsRecording(true);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Native Top Navigation */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.botBadge}>
          <Bot size={22} color="#ffffff" />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerTitle}>Nura AI Companion</Text>
          <Text style={styles.headerSubtitle}>Trilingual Wellness & Lifestyle</Text>
        </View>
      </View>

      {/* Language Switcher Bar */}
      <View style={styles.languageBar}>
        <Globe size={16} color="#64748b" style={{ marginRight: 6 }} />
        {SUPPORTED_LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[styles.langChip, selectedLanguage === lang.code && styles.langChipActive]}
            onPress={() => setSelectedLanguage(lang.code)}
            activeOpacity={0.7}
          >
            <Text style={[styles.langText, selectedLanguage === lang.code && styles.langTextActive]}>
              {lang.nativeLabel}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Emergency Alert Banner */}
      {emergencyAlert && (
        <View style={styles.emergencyBanner}>
          <AlertTriangle size={20} color="#dc2626" />
          <Text style={styles.emergencyText}>{emergencyAlert}</Text>
        </View>
      )}

      {/* Chat Area */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatArea} 
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Sparkles size={36} color="#16a34a" />
            </View>
            <Text style={styles.emptyTitle}>{prompts.greeting}</Text>
            <Text style={styles.emptyDesc}>
              Ask in English, Amharic (አማርኛ), or Afaan Oromo. Nura provides personalized lifestyle guidance.
            </Text>
            <View style={styles.disclaimerPill}>
              <Text style={styles.disclaimerText}>{prompts.disclaimers}</Text>
            </View>
          </View>
        ) : (
          messages.map((msg: any) => (
            <View 
              key={msg.id} 
              style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}
            >
              <Text style={[styles.messageText, msg.role === 'user' ? styles.userText : styles.aiText]}>
                {msg.content}
              </Text>
            </View>
          ))
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#16a34a" />
            <Text style={styles.loadingText}>Nura is thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Voice Recording Waveform Indicator */}
      {isRecording && (
        <View style={styles.recordingBar}>
          <Text style={styles.recordingText}>Listening in {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.nativeLabel}...</Text>
          <TouchableOpacity style={styles.stopRecordBtn} onPress={toggleRecording}>
            <Text style={styles.stopRecordText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputArea}>
        <TouchableOpacity 
          style={[styles.micBtn, isRecording && styles.micBtnActive]} 
          onPress={handleVoicePress}
          activeOpacity={0.7}
        >
          {isRecording ? <MicOff size={20} color="#ffffff" /> : <Mic size={20} color="#16a34a" />}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={prompts.placeholder}
          placeholderTextColor="#94a3b8"
          multiline
          maxLength={400}
        />

        <TouchableOpacity 
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} 
          onPress={handleSend}
          disabled={!input.trim() || isLoading}
          activeOpacity={0.8}
        >
          <Send size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Microphone Permission Explanation Modal */}
      <PermissionExplanationModal
        visible={showMicModal}
        type="microphone"
        onCancel={() => setShowMicModal(false)}
        onContinue={async () => {
          setShowMicModal(false);
          await permissionService.requestPermission('microphone');
          toggleRecording();
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, paddingTop: 52, backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  botBadge: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  headerSubtitle: { fontSize: 12, color: '#64748b' },
  languageBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#f1f5f9', gap: 8 },
  langChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, backgroundColor: '#f1f5f9' },
  langChipActive: { backgroundColor: '#dcfce7' },
  langText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  langTextActive: { color: '#16a34a', fontWeight: '700' },
  emergencyBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fef2f2', padding: 14, marginHorizontal: 16, marginTop: 12, borderRadius: 14, borderWidth: 1, borderColor: '#fecaca' },
  emergencyText: { flex: 1, fontSize: 12, color: '#991b1b', lineHeight: 18, fontWeight: '600' },
  chatArea: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 24 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, marginTop: 60 },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  disclaimerPill: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  disclaimerText: { fontSize: 11, color: '#94a3b8', textAlign: 'center' },
  messageBubble: { maxWidth: '82%', borderRadius: 18, padding: 14, marginBottom: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#16a34a', borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#ffffff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#e2e8f0' },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#ffffff', fontWeight: '500' },
  aiText: { color: '#0f172a' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 12 },
  loadingText: { color: '#64748b', fontSize: 13, fontStyle: 'italic' },
  recordingBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fee2e2', paddingHorizontal: 16, paddingVertical: 10 },
  recordingText: { color: '#dc2626', fontWeight: '700', fontSize: 13 },
  stopRecordBtn: { backgroundColor: '#dc2626', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  stopRecordText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
  inputArea: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#ffffff', borderTopWidth: 1, borderColor: '#e2e8f0', gap: 10 },
  micBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  micBtnActive: { backgroundColor: '#dc2626' },
  input: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, color: '#0f172a' },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#cbd5e1' }
});
