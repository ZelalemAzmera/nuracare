import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Droplets, Plus } from 'lucide-react-native';

interface HydrationCardProps {
  title?: string;
  subtitle?: string;
  targetLiters?: number;
  currentLiters?: number;
  payload?: Record<string, any>;
}

export default function HydrationCard({
  title = 'Hydration Tracker',
  subtitle = 'Daily hydration goal',
  targetLiters = 2.5,
  currentLiters = 1.4
}: HydrationCardProps) {
  const [liters, setLiters] = useState(currentLiters);

  const handleAdd = () => {
    setLiters((prev) => Math.min(targetLiters + 1.0, +(prev + 0.25).toFixed(2)));
  };

  const percentage = Math.min(100, Math.round((liters / targetLiters) * 100));

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Droplets size={22} color="#0284c7" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.7}>
          <Plus size={16} color="#ffffff" />
          <Text style={styles.addBtnText}>+250ml</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bodyRow}>
        <View>
          <Text style={styles.currentValue}>{liters}L</Text>
          <Text style={styles.targetLabel}>Goal: {targetLiters}L ({percentage}%)</Text>
        </View>
        <View style={styles.cupRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((cupIndex) => {
            const filled = (cupIndex * 0.25) <= liters;
            return (
              <View 
                key={cupIndex} 
                style={[
                  styles.cupIndicator, 
                  filled ? styles.cupFilled : styles.cupEmpty
                ]} 
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  iconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#f0f9ff', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  cardSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0284c7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 4 },
  addBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  bodyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 14, borderRadius: 14 },
  currentValue: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  targetLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  cupRow: { flexDirection: 'row', gap: 6 },
  cupIndicator: { width: 14, height: 26, borderRadius: 4 },
  cupFilled: { backgroundColor: '#0284c7' },
  cupEmpty: { backgroundColor: '#e2e8f0' }
});
