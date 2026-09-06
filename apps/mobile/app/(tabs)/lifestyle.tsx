import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
  Utensils,
  Dumbbell,
  Moon,
  Droplets,
  Heart,
  Wind,
  Flame,
  Activity,
  PlayCircle,
  Plus,
  ShieldCheck,
  Bot,
  Sparkles,
  ChevronRight,
  Info,
  Clock,
  Calendar,
} from 'lucide-react-native';
import { useWellnessStore } from '../../src/store';
import { getProfile } from '../../src/storage/profileStorage';
import { computeBurnoutRisk, compute5CoreWellness } from '../../src/lib/wellnessEngine';

const NUTRITION_ITEMS = [
  {
    name: 'Teff Injera',
    category: 'Whole Grain / Staple',
    cals: 165,
    tag: 'Iron & Prebiotic',
    desc: 'Ancient iron-rich staple grain, fermented and gluten-free. Provides sustained complex carbs.',
  },
  {
    name: 'Shiro Wot',
    category: 'Plant Protein',
    cals: 210,
    tag: 'High Fiber',
    desc: 'Spiced chickpea and broad bean stew. Cook with moderate olive or seed oil for optimal macros.',
  },
  {
    name: 'Gomen (Collard Greens)',
    category: 'Micronutrient',
    cals: 85,
    tag: 'Vitamins A, C, K',
    desc: 'Steamed greens sauteed with ginger and garlic. Essential for bone density and digestion.',
  },
  {
    name: 'Telba Drink (Flaxseed)',
    category: 'Superfood',
    cals: 140,
    tag: 'Omega-3 ALA',
    desc: 'Toasted ground flaxseed infusion. Natural anti-inflammatory drink for heart and gut wellness.',
  },
];

const WORKOUTS = [
  {
    title: 'Eskesta Cardio Dance',
    duration: '15 min',
    intensity: 'Cardio & Mobility',
    desc: 'Traditional Ethiopian rhythmic shoulder and neck dance for upper body mobility and aerobic endurance.',
    url: 'https://youtube.com/results?search_query=Eskesta+workout+cardio',
  },
  {
    title: 'Morning Core & Posture',
    duration: '12 min',
    intensity: 'Low-Impact',
    desc: 'Planks, bird-dogs, and pelvic tilts to reinforce spinal stability after waking up.',
    url: 'https://youtube.com/results?search_query=morning+core+and+posture+routine',
  },
  {
    title: 'Lower Body Strength',
    duration: '20 min',
    intensity: 'Moderate',
    desc: 'Bodyweight squats, lunges, and calf raises to support joint mobility and endurance.',
    url: 'https://youtube.com/results?search_query=20+min+bodyweight+leg+workout',
  },
  {
    title: 'Restorative Hip & Back Release',
    duration: '10 min',
    intensity: 'Recovery',
    desc: 'Gentle yoga stretches to decompress lower back after desk work.',
    url: 'https://youtube.com/results?search_query=hip+and+back+stretch+routine',
  },
];

export default function LifestyleScreen() {
  const router = useRouter();
  const profile = getProfile() || {};
  const { checkIns } = useWellnessStore();

  const [activeSubTab, setActiveSubTab] = useState<'nutrition' | 'movement' | 'recovery' | 'hydration' | 'mindfulness'>('nutrition');

  // Hydration local tracker
  const [waterCups, setWaterCups] = useState(5);
  const targetCups = 8;

  // Breathwork state
  const [breathPhase, setBreathPhase] = useState<'Ready' | 'Inhale (4s)' | 'Hold (7s)' | 'Exhale (8s)'>('Ready');
  const [isBreathing, setIsBreathing] = useState(false);

  const latestCheckin = checkIns.length > 0 ? checkIns[0] : null;
  const burnout = computeBurnoutRisk(latestCheckin);
  const wellness = compute5CoreWellness(latestCheckin, profile);

  const handleOpenVideo = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      Alert.alert('Browser', 'Unable to open workout video.');
    }
  };

  const handleAddWater = () => {
    setWaterCups(prev => Math.min(prev + 1, 16));
  };

  const handleResetWater = () => {
    setWaterCups(0);
  };

  const startBreathwork = () => {
    if (isBreathing) return;
    setIsBreathing(true);
    setBreathPhase('Inhale (4s)');

    setTimeout(() => {
      setBreathPhase('Hold (7s)');
      setTimeout(() => {
        setBreathPhase('Exhale (8s)');
        setTimeout(() => {
          setBreathPhase('Ready');
          setIsBreathing(false);
          Alert.alert('Session Complete', 'Wonderful job taking a mindful pause.');
        }, 8000);
      }, 7000);
    }, 4000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Lifestyle & Habits</Text>
          <Text style={styles.subtitle}>Nutrition, movement, recovery & mindfulness</Text>
        </View>
        <TouchableOpacity style={styles.aiHeaderBtn} onPress={() => router.push('/chat')}>
          <Bot size={18} color="#16a34a" />
          <Text style={styles.aiHeaderBtnText}>Ask Nura</Text>
        </TouchableOpacity>
      </View>

      {/* 5-Sub-Hub Segmented Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabsScroll} contentContainerStyle={styles.subTabsContent}>
        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'nutrition' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('nutrition')}
        >
          <Utensils size={15} color={activeSubTab === 'nutrition' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.subTabText, activeSubTab === 'nutrition' && styles.subTabTextActive]}>Nutrition & Tsom</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'movement' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('movement')}
        >
          <Dumbbell size={15} color={activeSubTab === 'movement' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.subTabText, activeSubTab === 'movement' && styles.subTabTextActive]}>Movement</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'recovery' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('recovery')}
        >
          <Moon size={15} color={activeSubTab === 'recovery' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.subTabText, activeSubTab === 'recovery' && styles.subTabTextActive]}>Recovery & 5-Core</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'hydration' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('hydration')}
        >
          <Droplets size={15} color={activeSubTab === 'hydration' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.subTabText, activeSubTab === 'hydration' && styles.subTabTextActive]}>Hydration</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'mindfulness' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('mindfulness')}
        >
          <Wind size={15} color={activeSubTab === 'mindfulness' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.subTabText, activeSubTab === 'mindfulness' && styles.subTabTextActive]}>Mindfulness</Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* SUB-HUB 1: NUTRITION & FASTING */}
        {activeSubTab === 'nutrition' && (
          <View>
            {/* Fasting Calendar Card */}
            <View style={styles.fastingHero}>
              <View style={styles.fastingHeader}>
                <Clock size={20} color="#16a34a" />
                <Text style={styles.fastingTitle}>Ethiopian Fasting (Tsom) Guidance</Text>
              </View>
              <Text style={styles.fastingDesc}>
                {profile.fastingMode === 'Orthodox Christian (Tsom)'
                  ? 'Orthodox Christian fasting season active. Prioritize plant-based proteins like Misir (lentils), Shimbra (chickpeas), and Telba (flaxseed) to meet your protein target without animal products.'
                  : profile.fastingMode === 'Islamic (Ramadan)'
                  ? 'Islamic fasting guide: Prioritize hydration with electrolytes during Suhoor and break your fast with dates and water before entering Iftar.'
                  : 'Balanced traditional nutrition: Incorporating Wednesday and Friday vegan meals provides natural digestive reset and high dietary fiber.'}
              </Text>
            </View>

            <Text style={styles.sectionHeading}>Ethiopian Nutrient-Dense Foods</Text>
            {NUTRITION_ITEMS.map((item, idx) => (
              <View key={idx} style={styles.nutritionCard}>
                <View style={styles.nutritionTopRow}>
                  <Text style={styles.nutritionName}>{item.name}</Text>
                  <View style={styles.tagPill}>
                    <Text style={styles.tagPillText}>{item.tag}</Text>
                  </View>
                </View>
                <Text style={styles.nutritionCategory}>{item.category} • ~{item.cals} kcal</Text>
                <Text style={styles.nutritionDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        )}

        {/* SUB-HUB 2: MOVEMENT */}
        {activeSubTab === 'movement' && (
          <View>
            {/* Eskesta Spotlight Card */}
            <View style={styles.spotlightCard}>
              <Sparkles size={24} color="#f59e0b" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.spotlightTitle}>Cultural Movement: Eskesta Cardio</Text>
                <Text style={styles.spotlightDesc}>
                  Ethiopian traditional shoulder dancing elevates heart rate, strengthens upper back posture, and burns up to 180 kcal in 15 minutes.
                </Text>
              </View>
            </View>

            <Text style={styles.sectionHeading}>Workout & Mobility Library</Text>
            {WORKOUTS.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.workoutCard}
                onPress={() => handleOpenVideo(item.url)}
              >
                <View style={styles.workoutIconCol}>
                  <PlayCircle size={28} color="#16a34a" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.workoutTitle}>{item.title}</Text>
                  <Text style={styles.workoutMeta}>{item.duration} • {item.intensity}</Text>
                  <Text style={styles.workoutDesc}>{item.desc}</Text>
                </View>
                <ChevronRight size={18} color="#94a3b8" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* SUB-HUB 3: RECOVERY & 5-CORE WELLNESS */}
        {activeSubTab === 'recovery' && (
          <View>
            {/* 5-Core Score & Burnout Risk Summary */}
            <View style={styles.scoreRow}>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreCardLabel}>5-CORE WELLNESS</Text>
                <Text style={[styles.scoreCardVal, { color: wellness.color }]}>{wellness.total}</Text>
                <Text style={[styles.scoreCardStatus, { color: wellness.color }]}>{wellness.label}</Text>
              </View>

              <View style={[styles.scoreCard, { backgroundColor: burnout.score > 60 ? '#fef2f2' : '#ffffff' }]}>
                <Text style={styles.scoreCardLabel}>BURNOUT RISK</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 4 }}>
                  <Flame size={24} color={burnout.color} />
                  <Text style={[styles.scoreCardVal, { color: burnout.color, marginVertical: 0 }]}>
                    {burnout.score}%
                  </Text>
                </View>
                <Text style={[styles.scoreCardStatus, { color: burnout.color }]}>{burnout.label}</Text>
              </View>
            </View>

            {/* 5-Core Dimension Breakdown */}
            <Text style={styles.sectionHeading}>5-Core Resilience Dimensions</Text>
            <View style={styles.breakdownBox}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Physical Vitality</Text>
                <Text style={styles.breakdownVal}>{wellness.cores.physical}%</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Mental Resilience</Text>
                <Text style={styles.breakdownVal}>{wellness.cores.mental}%</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Recovery & Rest</Text>
                <Text style={styles.breakdownVal}>{wellness.cores.recovery}%</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Nutrition & Balance</Text>
                <Text style={styles.breakdownVal}>{wellness.cores.nutrition}%</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Preventive Maintenance</Text>
                <Text style={styles.breakdownVal}>{wellness.cores.preventive}%</Text>
              </View>
            </View>

            {/* Restorative Sleep Routine */}
            <Text style={styles.sectionHeading}>Restorative Sleep Hygiene</Text>
            <View style={styles.sleepCard}>
              <Moon size={22} color="#6366f1" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.sleepTitle}>Wind-Down Protocol</Text>
                <Text style={styles.sleepDesc}>
                  • Dim artificial lights 45 minutes before sleep.{'\n'}
                  • Avoid heavy or high-sodium meals after 8:00 PM.{'\n'}
                  • Keep room temperature slightly cool for deep stage N3 sleep.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* SUB-HUB 4: HYDRATION */}
        {activeSubTab === 'hydration' && (
          <View>
            <View style={styles.hydrationHero}>
              <Droplets size={36} color="#0284c7" />
              <Text style={styles.hydrationHeroAmount}>{waterCups * 250} ml</Text>
              <Text style={styles.hydrationHeroSub}>
                Goal: {targetCups * 250} ml ({waterCups} of {targetCups} glasses logged)
              </Text>

              {/* Visual Cup Progress */}
              <View style={styles.cupRow}>
                {Array.from({ length: targetCups }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.cupPill,
                      i < waterCups ? styles.cupPillFilled : styles.cupPillEmpty,
                    ]}
                  />
                ))}
              </View>

              <View style={styles.hydrationBtnRow}>
                <TouchableOpacity style={styles.waterAddBtn} onPress={handleAddWater}>
                  <Plus size={18} color="#ffffff" />
                  <Text style={styles.waterAddBtnText}>+250 ml Glass</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.waterResetBtn} onPress={handleResetWater}>
                  <Text style={styles.waterResetBtnText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.hydrationTipBox}>
              <Info size={18} color="#0284c7" />
              <Text style={styles.hydrationTipText}>
                Drinking water consistently during high-altitude activity in Addis Ababa and central Ethiopia prevents dehydration headaches and preserves cellular recovery.
              </Text>
            </View>
          </View>
        )}

        {/* SUB-HUB 5: MINDFULNESS */}
        {activeSubTab === 'mindfulness' && (
          <View>
            <View style={styles.breathCard}>
              <Wind size={40} color="#16a34a" />
              <Text style={styles.breathTitle}>4-7-8 Parasympathetic Reset</Text>
              <Text style={styles.breathSubtitle}>
                Calms central nervous tension and reduces sympathetic heart rate elevation.
              </Text>

              <View style={styles.breathCircle}>
                <Text style={styles.breathPhaseText}>{breathPhase}</Text>
              </View>

              <TouchableOpacity
                style={[styles.breathActionBtn, isBreathing && { backgroundColor: '#64748b' }]}
                onPress={startBreathwork}
                disabled={isBreathing}
              >
                <Text style={styles.breathActionBtnText}>
                  {isBreathing ? 'Session in Progress...' : 'Start 1-Cycle Reset'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  aiHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    gap: 4,
  },
  aiHeaderBtnText: { color: '#16a34a', fontWeight: '700', fontSize: 12 },
  subTabsScroll: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  subTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  subTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    gap: 6,
  },
  subTabBtnActive: { backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#16a34a' },
  subTabText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  subTabTextActive: { color: '#16a34a', fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  sectionHeading: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginVertical: 12 },
  fastingHero: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 12,
  },
  fastingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  fastingTitle: { fontSize: 15, fontWeight: '800', color: '#166534' },
  fastingDesc: { fontSize: 13, color: '#14532d', lineHeight: 19 },
  nutritionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  nutritionTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nutritionName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  tagPill: { backgroundColor: '#f1f5f9', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 },
  tagPillText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  nutritionCategory: { fontSize: 12, color: '#16a34a', fontWeight: '600', marginTop: 2 },
  nutritionDesc: { fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 17 },
  spotlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fef3c7',
    marginBottom: 12,
  },
  spotlightTitle: { fontSize: 14, fontWeight: '800', color: '#92400e' },
  spotlightDesc: { fontSize: 12, color: '#b45309', marginTop: 2, lineHeight: 17 },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  workoutIconCol: { justifyContent: 'center', alignItems: 'center' },
  workoutTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  workoutMeta: { fontSize: 12, color: '#16a34a', fontWeight: '600', marginTop: 2 },
  workoutDesc: { fontSize: 12, color: '#64748b', marginTop: 3 },
  scoreRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  scoreCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  scoreCardLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', letterSpacing: 0.5 },
  scoreCardVal: { fontSize: 32, fontWeight: '900', marginVertical: 4 },
  scoreCardStatus: { fontSize: 12, fontWeight: '700' },
  breakdownBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  breakdownLabel: { fontSize: 13, color: '#334155' },
  breakdownVal: { fontSize: 13, fontWeight: '700', color: '#16a34a' },
  sleepCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sleepTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  sleepDesc: { fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 18 },
  hydrationHero: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  hydrationHeroAmount: { fontSize: 36, fontWeight: '900', color: '#0284c7', marginTop: 6 },
  hydrationHeroSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  cupRow: { flexDirection: 'row', gap: 6, marginVertical: 18 },
  cupPill: { width: 24, height: 36, borderRadius: 6 },
  cupPillFilled: { backgroundColor: '#0284c7' },
  cupPillEmpty: { backgroundColor: '#e0f2fe' },
  hydrationBtnRow: { flexDirection: 'row', gap: 12 },
  waterAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: 6,
  },
  waterAddBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  waterResetBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  waterResetBtnText: { color: '#64748b', fontWeight: '600', fontSize: 13 },
  hydrationTipBox: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
    gap: 8,
  },
  hydrationTipText: { flex: 1, fontSize: 12, color: '#0369a1', lineHeight: 17 },
  breathCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  breathTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginTop: 10 },
  breathSubtitle: { fontSize: 12, color: '#64748b', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  breathCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#f0fdf4',
    borderWidth: 3,
    borderColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  breathPhaseText: { fontSize: 16, fontWeight: '800', color: '#16a34a' },
  breathActionBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
    marginTop: 20,
  },
  breathActionBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
});
