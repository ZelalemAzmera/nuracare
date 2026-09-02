import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Sparkles, Info, Navigation, Dumbbell, Utensils, Flower2, Heart, Footprints, Flame, Droplets, Activity, Plus, Minus, Check, Moon, Zap, Wind } from 'lucide-react-native';
import { useWellnessStore } from '../../src/store';
import { useProfile } from '../../src/context/ProfileContext';
import { TSOM_TYPES, isFastingToday, getCurrentFastName } from '../../src/lib/ethiopianCalendar';

export default function DiscoveryScreen() {
  const { checkIns } = useWellnessStore();
  const { profile } = useProfile();
  const [analysis, setAnalysis] = useState<any>(null);
  
  // Vitals State
  const [vitals, setVitals] = useState({ steps: 0, hr: 0, weight: 0.0, water: 0 });

  useEffect(() => {
    const recent = checkIns.length > 0 ? checkIns[checkIns.length - 1] : null;
    generateAnalysis(recent);
  }, [checkIns, profile]);

  const generateAnalysis = (recent: any) => {
    if (!recent) {
      setAnalysis({
        title: "Waiting for Data",
        desc: "Complete your Daily Check-in to receive personalized AI lifestyle and nutrition recommendations.",
        foods: ["Drink plenty of water", "Eat whole foods"],
        exercise: "Light stretching or a short walk",
        focus: "balance"
      });
      return;
    }

    const isTsomProfile = profile && profile.fastingMode === TSOM_TYPES.ORTHODOX;
    const isFastingDay = isTsomProfile && isFastingToday(profile.fastingMode);

    let title, desc, foods, exercise, focus;

    if (recent.stress >= 7 || recent.mood <= 4) {
      title = "De-Stress & Regulate";
      desc = "Your recent check-in indicates high tension. Focus on nervous system regulation and calming nutrition.";
      foods = isFastingDay ? ["Chamomile Tea", "Spinach Salad", "Telba (Flaxseed)"] : ["Chamomile Tea", "Gomen (Collard Greens)", "Ethiopian Coffee w/ Cinnamon"];
      exercise = "Restorative Yoga (15-30 mins)";
      focus = "calm";
    } else if (recent.energy >= 7 && recent.sleep >= 6) {
      title = "High Energy Flow";
      desc = "You are well-rested and energized. This is a great time to push your cardiovascular fitness or hit the gym.";
      foods = isFastingDay ? ["Red Teff (Iron)", "Misir Wot (Lentil Protein)", "Beso (Roasted Barley)"] : ["Teff Injera", "Shiro (Chickpeas)", "Telba (Flaxseed)"];
      exercise = "Running or Heavy Gym Session";
      focus = "energy";
    } else if (recent.sleep <= 5 || recent.energy <= 4) {
      title = "Active Recovery & Rest";
      desc = "Your energy is low. Avoid intense workouts. Focus on gentle movement and deep nutrition for recovery.";
      foods = isFastingDay ? ["Shiro (Chickpeas)", "Moringa (Shiferaw)", "Warm Ginger Tea"] : ["Telba (Flaxseed Drink)", "Tibsi Broth", "Moringa Tea"];
      exercise = "Light Yoga or simple breathing exercises";
      focus = "sleep";
    } else {
      title = "Balanced Maintenance";
      desc = "You are in a stable state. Maintain your routine with a mix of cardio, flexibility, and balanced meals.";
      foods = isFastingDay ? ["Kik Alicha (Split Peas)", "Avocado", "Telba"] : ["Mixed nuts", "Gomen (Leafy Greens)", "Lake Tana Tilapia"];
      exercise = "Gym or a Moderate Run";
      focus = "balance";
    }

    setAnalysis({ title, desc, foods, exercise, focus });
  };

  const handleUpdateVital = (key: keyof typeof vitals, value: number) => {
    setVitals(prev => ({ ...prev, [key]: Math.max(0, value) }));
  };

  const handleSaveVitals = () => {
    Alert.alert("Vitals Saved", "Your vitals have been logged successfully.");
  };

  const renderIcon = (focus: string) => {
    switch(focus) {
      case 'calm': return <Wind size={28} color="#16a34a" />;
      case 'energy': return <Zap size={28} color="#16a34a" />;
      case 'sleep': return <Moon size={28} color="#16a34a" />;
      default: return <Activity size={28} color="#16a34a" />;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Network</Text>
        <Text style={styles.subtitle}>AI-driven habits, workouts, and natural remedies</Text>
      </View>

      {profile && profile.fastingMode === TSOM_TYPES.ORTHODOX && isFastingToday(profile.fastingMode) && (
        <View style={styles.fastingBanner}>
          <Info size={24} color="#d97706" />
          <View style={{ flex: 1 }}>
            <Text style={styles.fastingTitle}>{getCurrentFastName(profile.fastingMode)} Active</Text>
            <Text style={styles.fastingDesc}>Nutrition recommendations have been adapted to high-protein vegan alternatives.</Text>
          </View>
        </View>
      )}

      {analysis && (
        <View style={styles.analysisCard}>
          <View style={styles.analysisHeader}>
            <View style={styles.analysisIconBg}>
              {renderIcon(analysis.focus)}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.analysisTitle}>{analysis.title}</Text>
              <Text style={styles.analysisDesc}>{analysis.desc}</Text>
            </View>
          </View>

          <View style={styles.recommendationBox}>
            <View style={styles.recItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Utensils size={18} color="#16a34a" />
                <Text style={styles.recLabel}>Natural Nutrition</Text>
              </View>
              {analysis.foods.map((food: string, i: number) => (
                <Text key={i} style={styles.bulletText}>• {food}</Text>
              ))}
            </View>
            
            <View style={styles.recItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Activity size={18} color="#16a34a" />
                <Text style={styles.recLabel}>Recommended Movement</Text>
              </View>
              <Text style={styles.bulletText}>{analysis.exercise}</Text>
            </View>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Tools & Trackers</Text>
      <View style={styles.toolsGrid}>
        <ToolCard title="Running Tracker" desc="Track outdoor runs & treadmill." icon={<Navigation size={28} color="#16a34a" />} />
        <ToolCard title="Gym & Strength" desc="Log sets, reps, get suggestions." icon={<Dumbbell size={28} color="#16a34a" />} />
        <ToolCard title="Nutrition & Fasting" desc="Log meals, macros & fasting." icon={<Utensils size={28} color="#16a34a" />} />
        <ToolCard title="Yoga Flow" desc="Guided sessions based on tension." icon={<Flower2 size={28} color="#16a34a" />} />
      </View>

      <Text style={styles.sectionTitle}>Vitals & Hydration</Text>
      <View style={styles.vitalsCard}>
        <View style={styles.vitalRow}>
          <View style={styles.vitalLabelWrap}>
            <Footprints size={18} color="#16a34a" />
            <Text style={styles.vitalLabel}>Steps</Text>
          </View>
          <View style={styles.vitalControls}>
            <TouchableOpacity onPress={() => handleUpdateVital('steps', vitals.steps - 500)} style={styles.vitalBtn}><Minus size={16} color="#475569" /></TouchableOpacity>
            <Text style={styles.vitalValue}>{vitals.steps}</Text>
            <TouchableOpacity onPress={() => handleUpdateVital('steps', vitals.steps + 500)} style={styles.vitalBtn}><Plus size={16} color="#475569" /></TouchableOpacity>
          </View>
        </View>

        <View style={styles.vitalRow}>
          <View style={styles.vitalLabelWrap}>
            <Flame size={18} color="#ef4444" />
            <Text style={styles.vitalLabel}>HR (bpm)</Text>
          </View>
          <View style={styles.vitalControls}>
            <TouchableOpacity onPress={() => handleUpdateVital('hr', vitals.hr - 1)} style={styles.vitalBtn}><Minus size={16} color="#475569" /></TouchableOpacity>
            <Text style={styles.vitalValue}>{vitals.hr}</Text>
            <TouchableOpacity onPress={() => handleUpdateVital('hr', vitals.hr + 1)} style={styles.vitalBtn}><Plus size={16} color="#475569" /></TouchableOpacity>
          </View>
        </View>

        <View style={styles.vitalRow}>
          <View style={styles.vitalLabelWrap}>
            <Droplets size={18} color="#0ea5e9" />
            <Text style={styles.vitalLabel}>Water (glasses)</Text>
          </View>
          <View style={styles.vitalControls}>
            <TouchableOpacity onPress={() => handleUpdateVital('water', vitals.water - 1)} style={styles.vitalBtn}><Minus size={16} color="#475569" /></TouchableOpacity>
            <Text style={styles.vitalValue}>{vitals.water}/8</Text>
            <TouchableOpacity onPress={() => handleUpdateVital('water', vitals.water + 1)} style={styles.vitalBtn}><Plus size={16} color="#475569" /></TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.saveVitalsBtn} onPress={handleSaveVitals}>
          <Check size={20} color="#ffffff" />
          <Text style={styles.saveVitalsText}>Save Vitals</Text>
        </TouchableOpacity>
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function ToolCard({ title, desc, icon }: { title: string, desc: string, icon: any }) {
  return (
    <TouchableOpacity style={styles.toolCard} onPress={() => Alert.alert('Coming Soon', `${title} will be available in the next update.`)}>
      <View style={styles.toolIconBg}>{icon}</View>
      <Text style={styles.toolTitle}>{title}</Text>
      <Text style={styles.toolDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 20 },
  header: { marginBottom: 24, marginTop: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  
  fastingBanner: { flexDirection: 'row', backgroundColor: '#fef3c7', padding: 16, borderRadius: 16, marginBottom: 24, borderColor: '#fcd34d', borderWidth: 1, gap: 12, alignItems: 'center' },
  fastingTitle: { fontSize: 15, fontWeight: '700', color: '#92400e' },
  fastingDesc: { fontSize: 13, color: '#b45309', marginTop: 4, lineHeight: 18 },
  
  analysisCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, marginBottom: 32, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  analysisHeader: { flexDirection: 'row', gap: 16, marginBottom: 20, alignItems: 'center' },
  analysisIconBg: { backgroundColor: '#f0fdf4', padding: 16, borderRadius: 16 },
  analysisTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  analysisDesc: { fontSize: 14, color: '#64748b', marginTop: 4, lineHeight: 20 },
  
  recommendationBox: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  recItem: { flex: 1, minWidth: '45%', backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  recLabel: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  bulletText: { fontSize: 13, color: '#475569', lineHeight: 20 },
  
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  
  toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  toolCard: { flex: 1, minWidth: '45%', backgroundColor: '#ffffff', padding: 16, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  toolIconBg: { alignSelf: 'flex-start', marginBottom: 12 },
  toolTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  toolDesc: { fontSize: 13, color: '#64748b', lineHeight: 18 },
  
  vitalsCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  vitalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  vitalLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  vitalLabel: { fontSize: 15, fontWeight: '600', color: '#334155' },
  vitalControls: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#f8fafc', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  vitalBtn: { padding: 8 },
  vitalValue: { fontSize: 16, fontWeight: '700', color: '#0f172a', minWidth: 40, textAlign: 'center' },
  
  saveVitalsBtn: { backgroundColor: '#16a34a', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, marginTop: 8, gap: 8 },
  saveVitalsText: { color: '#ffffff', fontSize: 16, fontWeight: '700' }
});
