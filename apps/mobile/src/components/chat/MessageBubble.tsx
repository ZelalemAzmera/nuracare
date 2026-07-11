import { View, Text, StyleSheet } from 'react-native';

export default function MessageBubble({ message }: { message: any }) {
  const isUser = message.role === 'user';
  
  return (
    <View style={[styles.bubbleWrap, isUser ? styles.bubbleWrapUser : styles.bubbleWrapAi]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAi]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleWrap: { width: '100%', marginBottom: 12 },
  bubbleWrapUser: { alignItems: 'flex-end' },
  bubbleWrapAi: { alignItems: 'flex-start' },
  bubble: { maxWidth: '85%', padding: 14, borderRadius: 20 },
  bubbleUser: { backgroundColor: '#16a34a', borderBottomRightRadius: 4 },
  bubbleAi: { backgroundColor: '#ffffff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#e2e8f0' },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  bubbleTextUser: { color: '#ffffff' },
  bubbleTextAi: { color: '#1e293b' },
});
