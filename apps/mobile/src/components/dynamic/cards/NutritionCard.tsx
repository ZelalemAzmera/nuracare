import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Utensils, Sparkles, Leaf } from 'lucide-react-native';
import { useProfile } from '../../../context/ProfileContext';
import { TSOM_TYPES, isFastingToday, getCurrentFastName } from '../../../lib/ethiopianCalendar';

interface NutritionCardProps {
  title?: string;
  subtitle?: string;
  payload?: Record<string, any>;
}

export default function NutritionCard({
  title = 'Cultural Nutrition',
  subtitle = 'Balanced Ethiopian whole foods'
}: NutritionCardProps) {
  const { profile } = useProfile();
  const fastingMode = profile?.fastingMode || TSOM_TYPES.NONE;
  const isFasting = isFastingToday(fastingMode);
  const fastName = getCurrentFastName(fastingMode);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Utensils size={22} color="#16a34a" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        {isFasting && (
          <View style={styles.fastingBadge}>
            <Leaf size={12} color="#92400e" />
            <Text style={styles.fastingBadgeText}>Tsom Active</Text>
          </View>
        )}
      </View>

      {isFasting ? (
        <View style={styles.fastingContainer}>
          <Text style={styles.fastingHeader}>{fastName} Focus</Text>
          <Text style={styles.fastingDesc}>
            Prioritize high-protein plant staples today: Misir Wot (Lentils), Shiro (Chickpeas), and Telba (Flaxseed drink) for sustained vitality.
          </Text>
        </View>
      ) : (
        <View style={styles.normalMealContainer}>
          <Text style={styles.mealTitle}>Recommended Midday Fuel</Text>
          <Text style={styles.mealDesc}>
            Teff Injera with Gomen (Collard greens) & Ayib or Tibs broth for complex carbohydrates and iron replenishment.
          </Text>
        </View>
      )}

      <View style={styles.macroRow}>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>65g</Text>
          <Text style={styles.macroLabel}>Protein</Text>
        </View>
        <View style={styles.macroDivider} />
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>180g</Text>
          <Text style={styles.macroLabel}>Complex Carbs</Text>
        </View>
        <View style={styles.macroDivider} />
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>32g</Text>
          <Text style={styles.macroLabel}>Fiber</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  iconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  cardSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  fastingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  fastingBadgeText: { fontSize: 11, fontWeight: '700', color: '#92400e' },
  fastingContainer: { backgroundColor: '#fffbeb', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#fef3c7' },
  fastingHeader: { fontSize: 13, fontWeight: '700', color: '#92400e', marginBottom: 4 },
  fastingDesc: { fontSize: 13, color: '#b45309', lineHeight: 18 },
  normalMealContainer: { backgroundColor: '#f8fafc', borderRadius: 14, padding: 14, marginBottom: 14 },
  mealTitle: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  mealDesc: { fontSize: 13, color: '#475569', lineHeight: 18 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 6 },
  macroItem: { alignItems: 'center' },
  macroValue: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  macroLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
  macroDivider: { width: 1, height: 20, backgroundColor: '#e2e8f0' }
});
