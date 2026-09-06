import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sparkles, ArrowRight, MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface AIInsightCardProps {
  title?: string;
  subtitle?: string;
  insightText?: string;
  source?: string;
  actionRoute?: string;
  payload?: Record<string, any>;
}

export default function AIInsightCard({
  title = "Today's Focus",
  subtitle = 'Nura AI Analysis',
  insightText = "You recovered well last night (Recovery 84%). Today's biometric profile supports a moderate workout or an outdoor run before sunset.",
  source = 'Verified biometric context',
  actionRoute = '/chat'
}: AIInsightCardProps) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Sparkles size={20} color="#16a34a" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>AI Guidance</Text>
        </View>
      </View>

      <Text style={styles.insightBody}>
        "{insightText}"
      </Text>

      <View style={styles.footerRow}>
        <Text style={styles.sourceText}>{source}</Text>
        <TouchableOpacity 
          style={styles.chatActionBtn} 
          onPress={() => router.push(actionRoute as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.chatActionText}>Ask Nura</Text>
          <ArrowRight size={14} color="#16a34a" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#dcfce7', shadowColor: '#16a34a', shadowOpacity: 0.05, shadowRadius: 10, elevation: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  cardSubtitle: { fontSize: 12, color: '#64748b', marginTop: 1 },
  aiBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  aiBadgeText: { fontSize: 10, fontWeight: '700', color: '#16a34a' },
  insightBody: { fontSize: 14, color: '#334155', lineHeight: 22, fontStyle: 'italic', marginBottom: 14 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  sourceText: { fontSize: 11, color: '#94a3b8' },
  chatActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chatActionText: { fontSize: 13, fontWeight: '700', color: '#16a34a' }
});
