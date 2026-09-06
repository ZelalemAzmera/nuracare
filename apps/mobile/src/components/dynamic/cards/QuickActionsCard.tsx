import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MessageCircle, Calendar, Heart, Users, User, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface QuickActionsCardProps {
  title?: string;
  payload?: Record<string, any>;
}

export default function QuickActionsCard({ title = 'Quick Actions' }: QuickActionsCardProps) {
  const router = useRouter();

  const actions = [
    { label: 'Nura Chat', icon: <MessageCircle size={20} color="#16a34a" />, route: '/chat' },
    { label: 'Checkup', icon: <Calendar size={20} color="#16a34a" />, route: '/(tabs)/checkups' },
    { label: 'Lifestyle', icon: <Heart size={20} color="#16a34a" />, route: '/(tabs)/lifestyle' },
    { label: 'Community', icon: <Users size={20} color="#16a34a" />, route: '/(tabs)/community' },
    { label: 'Profile', icon: <User size={20} color="#16a34a" />, route: '/profile' },
    { label: 'Privacy Hub', icon: <ShieldCheck size={20} color="#16a34a" />, route: '/privacy-center' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.grid}>
        {actions.map((act, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.actionBtn} 
            onPress={() => router.push(act.route as any)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrap}>{act.icon}</View>
            <Text style={styles.actionLabel}>{act.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn: { width: '31%', backgroundColor: '#ffffff', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  iconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#334155', textAlign: 'center' }
});
