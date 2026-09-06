import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfile } from '../../src/context/ProfileContext';
import { useWellnessStore } from '../../src/store';
import { useRemoteConfigStore } from '../../src/store/remoteConfigStore';
import DynamicSectionRenderer from '../../src/components/dynamic/DynamicSectionRenderer';
import FloatingNatureBackground from '../../src/components/ambient/FloatingNatureBackground';
import { User, MessageCircle, Sparkles, ChevronRight, RefreshCw } from 'lucide-react-native';

export default function AdaptiveHomeScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { checkIns } = useWellnessStore();
  
  const { 
    config, 
    isLoading: isConfigLoading, 
    initialize, 
    syncRemoteConfig, 
    getSortedSections 
  } = useRemoteConfigStore();

  const [refreshing, setRefreshing] = useState(false);

  // Initialize config on mount
  useEffect(() => {
    initialize();
    syncRemoteConfig();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await syncRemoteConfig();
    setRefreshing(false);
  };

  // Determine current Time of Day deterministically
  const timeOfDay = useMemo((): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }, []);

  const greeting = useMemo(() => {
    switch (timeOfDay) {
      case 'morning': return 'Good Morning';
      case 'afternoon': return 'Good Afternoon';
      case 'evening': return 'Good Evening';
      case 'night': return 'Rest Well';
    }
  }, [timeOfDay]);

  // Derive active biometrics from local records & store
  const biometrics = useMemo(() => {
    const recentCheckin = checkIns.length > 0 ? checkIns[0] : null;
    return {
      recoveryScore: recentCheckin?.energy ? Math.min(100, recentCheckin.energy * 10 + 15) : 84,
      steps: 6240,
      hydrationLiters: 1.4,
      sleepDuration: '7h 42m'
    };
  }, [checkIns]);

  // Retrieve dynamically filtered and sorted sections via SDUI engine
  const activeSections = useMemo(() => {
    return getSortedSections(timeOfDay, biometrics.recoveryScore);
  }, [getSortedSections, timeOfDay, biometrics.recoveryScore, config]);

  return (
    <FloatingNatureBackground showSoundToggle={true}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          colors={['#16a34a']} 
          tintColor="#16a34a"
        />
      }
    >
      {/* Native Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greetingText}>
            {greeting}{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}
          </Text>
          <Text style={styles.subtitleText}>Your living wellness dashboard</Text>
          {profile?.culturalHeritage && (
            <Text style={styles.heritageBadge}>{profile.culturalHeritage}</Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.profileBtn} 
          onPress={() => router.push('/profile')}
          activeOpacity={0.8}
          accessibilityLabel="Open Profile"
        >
          <View style={styles.avatarCircle}>
            {profile?.name ? (
              <Text style={styles.avatarText}>{profile.name[0].toUpperCase()}</Text>
            ) : (
              <User size={20} color="#ffffff" />
            )}
          </View>
          <Text style={styles.profileBtnLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Nura AI Companion Teaser */}
      <TouchableOpacity 
        style={styles.aiHeroCard} 
        onPress={() => router.push('/chat')}
        activeOpacity={0.88}
      >
        <View style={styles.aiHeroHeader}>
          <View style={styles.aiIconBadge}>
            <MessageCircle size={22} color="#ffffff" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.aiHeroTitle}>Nura AI Companion</Text>
              <View style={styles.trilingualPill}>
                <Text style={styles.trilingualText}>EN / አማ / OM</Text>
              </View>
            </View>
            <Text style={styles.aiHeroSub}>Context-aware wellness & cultural nutrition guidance</Text>
          </View>
          <ChevronRight size={18} color="#16a34a" />
        </View>
        <View style={styles.aiPromptBar}>
          <Text style={styles.aiPromptText}>Ask about your recovery, sleep, or Ethiopian fasting...</Text>
          <View style={styles.aiSparkleIcon}>
            <Sparkles size={14} color="#ffffff" />
          </View>
        </View>
      </TouchableOpacity>

      {/* Server-Driven UI Dynamic Section Stack */}
      <DynamicSectionRenderer 
        sections={activeSections} 
        biometrics={biometrics}
      />
      </ScrollView>
    </FloatingNatureBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5
  },
  subtitleText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2
  },
  heritageBadge: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
    marginTop: 4
  },
  profileBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16a34a',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  profileBtnLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 3
  },
  aiHeroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dcfce7',
    shadowColor: '#16a34a',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2
  },
  aiHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  aiIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center'
  },
  aiHeroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a'
  },
  aiHeroSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  trilingualPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8
  },
  trilingualText: {
    color: '#16a34a',
    fontSize: 10,
    fontWeight: '700'
  },
  aiPromptBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'space-between'
  },
  aiPromptText: {
    fontSize: 12,
    color: '#94a3b8',
    flex: 1
  },
  aiSparkleIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  }
});
