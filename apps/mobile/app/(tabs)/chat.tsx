import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useChatStore } from '../../src/store';
import { ChatEngine } from '../../src/services/ai';
import { Send } from 'lucide-react-native';

export default function ChatScreen() {
  const { messages, addMessage } = useChatStore();
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: input, timestamp: new Date().toISOString() };
    addMessage(userMsg);
    setInput('');

    // Simulate AI response
    const { response } = await ChatEngine.processMessage(input);
    const aiMsg = { id: (Date.now() + 1).toString(), role: 'assistant' as const, content: response, timestamp: new Date().toISOString() };
    addMessage(aiMsg);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatArea} contentContainerStyle={{ padding: 16 }}>
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.bubbleWrap, msg.role === 'user' ? styles.bubbleWrapUser : styles.bubbleWrapAi]}>
            <View style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
              <Text style={[styles.bubbleText, msg.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAi]}>
                {msg.content}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Ask Nura..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Send size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  chatArea: {
    flex: 1,
  },
  bubbleWrap: {
    width: '100%',
    marginBottom: 12,
  },
  bubbleWrapUser: {
    alignItems: 'flex-end',
  },
  bubbleWrapAi: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 20,
  },
  bubbleUser: {
    backgroundColor: '#16a34a',
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: '#ffffff',
  },
  bubbleTextAi: {
    color: '#1e293b',
  },
  inputArea: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#16a34a',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
