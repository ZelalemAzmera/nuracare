import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import {
  Smartphone,
  Sliders,
  Target,
  Globe,
  TrendingUp,
  Sparkles,
  Shield,
  Moon,
  AlertCircle,
  Play,
  Square,
  Lock,
  Info
} from 'lucide-react-native';
import {
  getDigitalUsage,
  getAppLimits,
  updateAppLimit,
  getWebLimits,
  getDigitalSettings,
  updateDigitalSettings
} from '../../storage/digitalWellnessStorage';
import {
  computeDigitalBalanceScore,
  FOCUS_PRESETS,
  hashStrictPin,
  AppLimitItem,
  WebsiteLimitItem
} from '../../lib/digitalWellnessEngine';
import { digitalWellnessService } from '../../services/digital/digitalWellnessService';

export default function DigitalWellnessHub() {
  const [subTab, setSubTab] = useState<'today' | 'limits' | 'focus' | 'web' | 'insights'>('today');
  
  const [usage, setUsage] = useState(getDigitalUsage());
  const [limits, setLimits] = useState(getAppLimits());
  const [webLimits, setWebLimits] = useState(getWebLimits());
  const [settings, setSettings] = useState(getDigitalSettings());

  // Focus state
  const [focusState, setFocusState] = useState(digitalWellnessService.getFocusStatus());

  // Strict Mode Modal
  const [showStrictModal, setShowStrictModal] = useState(false);
  const [pinInput, setPinInput] = useState('');

  // "Pause Before Opening" Modal preview
  const [showPausePreview, setShowPausePreview] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFocusState(digitalWellnessService.getFocusStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const balance = computeDigitalBalanceScore(usage, limits);

  const handleToggleLimit = (item: AppLimitItem) => {
    const updated = { ...item, isEnabled: !item.isEnabled };
    updateAppLimit(updated);
    setLimits(getAppLimits());
  };

  const handleTogglePause = (item: AppLimitItem) => {
    const updated = { ...item, pauseBeforeOpen: !item.pauseBeforeOpen };
    updateAppLimit(updated);
    setLimits(getAppLimits());
  };

  const handleStartFocus = (presetId: string) => {
    const preset = FOCUS_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    digitalWellnessService.startFocusSession(preset.name, preset.durationMinutes);
    setFocusState(digitalWellnessService.getFocusStatus());
    Alert.alert('Focus Started', `${preset.name} active for ${preset.durationMinutes} minutes.`);
  };

  const handleStopFocus = () => {
    digitalWellnessService.stopFocusSession();
    setFocusState(digitalWellnessService.getFocusStatus());
  };

  const handleToggleSafeBrowsing = () => {
    const updated = updateDigitalSettings({ safeBrowsingEnabled: !settings.safeBrowsingEnabled });
    setSettings(updated);
  };

  const handleSavePin = async () => {
    if (pinInput.length !== 4) {
      Alert.alert('Invalid PIN', 'Please enter a 4-digit PIN.');
      return;
    }
    const salt = 'nura_' + Date.now();
    const hash = await hashStrictPin(pinInput, salt);
    const updated = updateDigitalSettings({
      strictModeEnabled: true,
      strictPinHash: hash,
      strictPinSalt: salt
    });
    setSettings(updated);
    setShowStrictModal(false);
    setPinInput('');
    Alert.alert('Strict Mode Enabled', 'Limits now require your PIN or emergency recovery to modify.');
  };

  return (
    <View style={styles.container}>
      {/* 5 Sub-Areas Navigation */}
      <View style={styles.subNav}>
        <TouchableOpacity
          style={[styles.navItem, subTab === 'today' && styles.navItemActive]}
          onPress={() => setSubTab('today')}
        >
          <Smartphone size={13} color={subTab === 'today' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.navText, subTab === 'today' && styles.navTextActive]}>Today</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, subTab === 'limits' && styles.navItemActive]}
          onPress={() => setSubTab('limits')}
        >
          <Sliders size={13} color={subTab === 'limits' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.navText, subTab === 'limits' && styles.navTextActive]}>Limits</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, subTab === 'focus' && styles.navItemActive]}
          onPress={() => setSubTab('focus')}
        >
          <Target size={13} color={subTab === 'focus' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.navText, subTab === 'focus' && styles.navTextActive]}>Focus</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, subTab === 'web' && styles.navItemActive]}
          onPress={() => setSubTab('web')}
        >
          <Globe size={13} color={subTab === 'web' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.navText, subTab === 'web' && styles.navTextActive]}>Web</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, subTab === 'insights' && styles.navItemActive]}
          onPress={() => setSubTab('insights')}
        >
          <TrendingUp size={13} color={subTab === 'insights' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.navText, subTab === 'insights' && styles.navTextActive]}>Insights</Text>
        </TouchableOpacity>
      </View>

      {/* 1. TODAY */}
      {subTab === 'today' && (
        <View style={styles.tabContent}>
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View>
                <Text style={styles.heroLabel}>TODAY'S SCREEN TIME</Text>
                <Text style={styles.heroTime}>
                  {Math.floor(usage.totalScreenMinutes / 60)}h {usage.totalScreenMinutes % 60}m
                </Text>
              </View>
              <View style={styles.trendBadge}>
                <Text style={styles.trendText}>
                  ↓ {Math.abs(usage.yesterdayScreenMinutes - usage.totalScreenMinutes)} min
                </Text>
              </View>
            </View>

            <View style={styles.heroMetricsRow}>
              <View style={styles.heroMetric}>
                <Text style={styles.metricSub}>Social Media</Text>
                <Text style={styles.metricVal}>
                  {Math.floor(usage.socialMediaMinutes / 60)}h {usage.socialMediaMinutes % 60}m
                </Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.heroMetric}>
                <Text style={styles.metricSub}>Attention Score</Text>
                <Text style={[styles.metricVal, { color: balance.color }]}>{balance.score} / 100</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.heroMetric}>
                <Text style={styles.metricSub}>Sleep Risk</Text>
                <Text style={[styles.metricVal, { color: usage.lateNightMinutes > 30 ? '#f59e0b' : '#16a34a' }]}>
                  {usage.lateNightMinutes > 30 ? 'Moderate' : 'Low'}
                </Text>
              </View>
            </View>

            <View style={styles.quickActionRow}>
              <TouchableOpacity style={styles.quickPrimaryBtn} onPress={() => setSubTab('focus')}>
                <Play size={15} color="#ffffff" fill="#ffffff" />
                <Text style={styles.quickPrimaryText}>Start Focus</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickSecondaryBtn} onPress={() => setSubTab('insights')}>
                <Sparkles size={15} color="#16a34a" />
                <Text style={styles.quickSecondaryText}>View Insights</Text>
              </TouchableOpacity>
            </View>
          </View>

          {focusState.active && (
            <View style={styles.activeFocusBanner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.activeFocusTitle}>Focus Active: {focusState.name}</Text>
                <Text style={styles.activeFocusTimer}>
                  {Math.floor(focusState.remainingSeconds / 60)}:
                  {(focusState.remainingSeconds % 60).toString().padStart(2, '0')} remaining
                </Text>
              </View>
              <TouchableOpacity style={styles.endFocusBtn} onPress={handleStopFocus}>
                <Square size={13} color="#ffffff" fill="#ffffff" />
                <Text style={styles.endFocusText}>End</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          <View style={styles.categoryCard}>
            <View style={styles.categoryRow}><Text style={styles.catName}>Social</Text><Text style={styles.catTime}>1h 42m</Text></View>
            <View style={styles.barTrack}><View style={[styles.barFill, { width: '55%', backgroundColor: '#f43f5e' }]} /></View>
            <View style={styles.categoryRow}><Text style={styles.catName}>Entertainment</Text><Text style={styles.catTime}>58m</Text></View>
            <View style={styles.barTrack}><View style={[styles.barFill, { width: '32%', backgroundColor: '#8b5cf6' }]} /></View>
            <View style={styles.categoryRow}><Text style={styles.catName}>Work</Text><Text style={styles.catTime}>1h 12m</Text></View>
            <View style={styles.barTrack}><View style={[styles.barFill, { width: '40%', backgroundColor: '#0ea5e9' }]} /></View>
            <View style={styles.categoryRow}><Text style={styles.catName}>Education</Text><Text style={styles.catTime}>26m</Text></View>
            <View style={styles.barTrack}><View style={[styles.barFill, { width: '15%', backgroundColor: '#10b981' }]} /></View>
          </View>

          <Text style={styles.sectionTitle}>Most Used Apps</Text>
          {usage.topApps.map((app, idx) => (
            <View key={idx} style={styles.appRow}>
              <View style={styles.appIconCircle}><Smartphone size={16} color="#16a34a" /></View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.appName}>{app.name}</Text>
                <Text style={styles.appCat}>{app.category}</Text>
              </View>
              <Text style={styles.appMinutes}>{app.minutes} min</Text>
            </View>
          ))}
        </View>
      )}

      {/* 2. LIMITS */}
      {subTab === 'limits' && (
        <View style={styles.tabContent}>
          <View style={styles.strictCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Lock size={18} color="#0f172a" />
              <View style={{ flex: 1 }}>
                <Text style={styles.strictTitle}>Strict Self-Control Mode</Text>
                <Text style={styles.strictSub}>
                  {settings.strictModeEnabled ? 'Protected with 4-digit PIN.' : 'Lock limits to prevent impulsive changes.'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.strictBtn, settings.strictModeEnabled && { backgroundColor: '#f1f5f9' }]}
              onPress={() => {
                if (settings.strictModeEnabled) {
                  updateDigitalSettings({ strictModeEnabled: false });
                  setSettings(getDigitalSettings());
                  Alert.alert('Strict Mode Off', 'PIN protection removed.');
                } else {
                  setShowStrictModal(true);
                }
              }}
            >
              <Text style={[styles.strictBtnText, settings.strictModeEnabled && { color: '#64748b' }]}>
                {settings.strictModeEnabled ? 'Disable PIN' : 'Enable PIN Protection'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Your Limits</Text>
          {limits.map((item) => (
            <View key={item.id} style={styles.limitCard}>
              <View style={styles.limitHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.limitName}>{item.name}</Text>
                  <Text style={styles.limitMeta}>{item.dailyLimitMinutes}m/day • Used {item.usedMinutesToday}m</Text>
                </View>
                <Switch
                  value={item.isEnabled}
                  onValueChange={() => handleToggleLimit(item)}
                  trackColor={{ false: '#cbd5e1', true: '#86efac' }}
                  thumbColor={item.isEnabled ? '#16a34a' : '#f8fafc'}
                />
              </View>

              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.min(100, (item.usedMinutesToday / item.dailyLimitMinutes) * 100)}%`,
                      backgroundColor: item.usedMinutesToday >= item.dailyLimitMinutes ? '#ef4444' : '#16a34a'
                    }
                  ]}
                />
              </View>

              <View style={styles.pauseRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pauseLabel}>Pause Before Opening</Text>
                  <Text style={styles.pauseDesc}>Intentional pause before opening distracting app</Text>
                </View>
                <Switch
                  value={item.pauseBeforeOpen}
                  onValueChange={() => handleTogglePause(item)}
                  trackColor={{ false: '#e2e8f0', true: '#bbf7d0' }}
                  thumbColor={item.pauseBeforeOpen ? '#16a34a' : '#f8fafc'}
                />
              </View>

              {item.usedMinutesToday >= item.dailyLimitMinutes && (
                <View style={styles.overLimitBadge}>
                  <AlertCircle size={13} color="#dc2626" />
                  <Text style={styles.overLimitText}>Daily limit reached. Take a break!</Text>
                </View>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.previewPauseBtn} onPress={() => setShowPausePreview(true)}>
            <Sparkles size={15} color="#16a34a" />
            <Text style={styles.previewPauseText}>Preview "Pause Before Opening"</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 3. FOCUS */}
      {subTab === 'focus' && (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Focus Presets</Text>
          {FOCUS_PRESETS.map((preset) => (
            <View key={preset.id} style={styles.presetCard}>
              <View style={styles.presetTop}>
                <View style={styles.presetIconWrap}><Target size={20} color="#16a34a" /></View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.presetName}>{preset.name}</Text>
                  <Text style={styles.presetDuration}>{preset.durationMinutes} Minutes</Text>
                </View>
                <TouchableOpacity style={styles.startPresetBtn} onPress={() => handleStartFocus(preset.id)}>
                  <Text style={styles.startPresetText}>Start</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.presetDesc}>{preset.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 4. WEB */}
      {subTab === 'web' && (
        <View style={styles.tabContent}>
          <View style={styles.safeBrowsingCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Shield size={22} color="#16a34a" />
              <View style={{ flex: 1 }}>
                <Text style={styles.safeTitle}>Safe Browsing</Text>
                <Text style={styles.safeDesc}>User-controlled adult & explicit content shield.</Text>
              </View>
              <Switch
                value={settings.safeBrowsingEnabled}
                onValueChange={handleToggleSafeBrowsing}
                trackColor={{ false: '#cbd5e1', true: '#86efac' }}
                thumbColor={settings.safeBrowsingEnabled ? '#16a34a' : '#f8fafc'}
              />
            </View>
            <View style={styles.disclaimerPill}>
              <Info size={13} color="#64748b" />
              <Text style={styles.disclaimerText}>
                No private messages or keystrokes are ever inspected. Filtering has limitations.
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Website Time Limits</Text>
          {webLimits.map((w) => (
            <View key={w.id} style={styles.webRow}>
              <Globe size={16} color="#64748b" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.webDomain}>{w.domain}</Text>
                <Text style={styles.webMeta}>{w.dailyLimitMinutes}m limit • {w.usedMinutesToday}m used</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: '#dcfce7' }]}>
                <Text style={[styles.statusBadgeText, { color: '#16a34a' }]}>Active</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 5. INSIGHTS */}
      {subTab === 'insights' && (
        <View style={styles.tabContent}>
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Moon size={18} color="#6366f1" />
              <Text style={styles.insightTitle}>Screen Time & Sleep Synergy</Text>
            </View>
            <Text style={styles.insightText}>
              Screen time after 10 PM increased for 4 days. Average sleep duration also shifted later by 38 minutes.
            </Text>
            <View style={styles.recommendBox}>
              <Text style={styles.recommendTitle}>Nura Suggestion:</Text>
              <Text style={styles.recommendText}>Enable Sleep Mode at 10:30 PM to protect deep restorative sleep.</Text>
            </View>
          </View>

          <View style={styles.experimentCard}>
            <View style={styles.insightHeader}>
              <Sparkles size={18} color="#16a34a" />
              <Text style={styles.insightTitle}>Weekly Experiment: 30-Min Digital Sunset</Text>
            </View>
            <Text style={styles.insightText}>
              Keep your phone away from the bedside table 30 minutes before sleep.
            </Text>
            <View style={styles.expStatsRow}>
              <View style={styles.expStat}><Text style={styles.expVal}>+28m</Text><Text style={styles.expSub}>Est. Sleep</Text></View>
              <View style={styles.expStat}><Text style={styles.expVal}>-18%</Text><Text style={styles.expSub}>Stress</Text></View>
              <View style={styles.expStat}><Text style={styles.expVal}>🔥 3</Text><Text style={styles.expSub}>Days Done</Text></View>
            </View>
          </View>
        </View>
      )}

      {/* Modals */}
      <Modal visible={showStrictModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Lock size={28} color="#16a34a" style={{ alignSelf: 'center', marginBottom: 10 }} />
            <Text style={styles.modalTitle}>Set Strict PIN</Text>
            <Text style={styles.modalDesc}>4-digit PIN required to edit or disable limits.</Text>
            <TextInput
              style={styles.pinInput}
              value={pinInput}
              onChangeText={setPinInput}
              placeholder="••••"
              placeholderTextColor="#94a3b8"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowStrictModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleSavePin}>
                <Text style={styles.modalConfirmText}>Save PIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showPausePreview} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.pauseModalBox}>
            <Text style={styles.pauseModalEmoji}>🌿</Text>
            <Text style={styles.pauseModalTitle}>Before you open TikTok...</Text>
            <Text style={styles.pauseModalSub}>Why are you opening it right now?</Text>

            <TouchableOpacity style={styles.pauseChoiceBtn} onPress={() => setShowPausePreview(false)}>
              <Text style={styles.pauseChoiceText}>○ I need a quick mental break</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pauseChoiceBtn} onPress={() => setShowPausePreview(false)}>
              <Text style={styles.pauseChoiceText}>○ I have something specific to check</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pauseChoiceBtn} onPress={() => setShowPausePreview(false)}>
              <Text style={styles.pauseChoiceText}>○ I caught myself scrolling out of habit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pauseProceedBtn} onPress={() => setShowPausePreview(false)}>
              <Text style={styles.pauseProceedText}>Continue to App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  subNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 6
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f8fafc'
  },
  navItemActive: { backgroundColor: '#dcfce7' },
  navText: { fontSize: 11.5, fontWeight: '600', color: '#64748b' },
  navTextActive: { color: '#15803d', fontWeight: '700' },
  tabContent: { padding: 14 },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14
  },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  heroLabel: { fontSize: 11, fontWeight: '800', color: '#64748b' },
  heroTime: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginTop: 2 },
  trendBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: '#bbf7d0' },
  trendText: { fontSize: 11, fontWeight: '700', color: '#16a34a' },
  heroMetricsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f1f5f9', marginBottom: 14 },
  heroMetric: { alignItems: 'center' },
  metricSub: { fontSize: 11, color: '#64748b', marginBottom: 2 },
  metricVal: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  metricDivider: { width: 1, height: 20, backgroundColor: '#e2e8f0' },
  quickActionRow: { flexDirection: 'row', gap: 8 },
  quickPrimaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#16a34a', paddingVertical: 10, borderRadius: 12 },
  quickPrimaryText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
  quickSecondaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', paddingVertical: 10, borderRadius: 12 },
  quickSecondaryText: { color: '#15803d', fontWeight: '700', fontSize: 12 },
  activeFocusBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 14, borderRadius: 14, marginBottom: 14 },
  activeFocusTitle: { fontSize: 13, fontWeight: '700', color: '#ffffff' },
  activeFocusTimer: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  endFocusBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  endFocusText: { color: '#ffffff', fontWeight: '700', fontSize: 11 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 8, marginTop: 4 },
  categoryCard: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 14 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  catName: { fontSize: 12, fontWeight: '600', color: '#334155' },
  catTime: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  barTrack: { height: 5, backgroundColor: '#f1f5f9', borderRadius: 3, marginBottom: 10, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  appRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 6 },
  appIconCircle: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  appName: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  appCat: { fontSize: 10.5, color: '#64748b' },
  appMinutes: { fontSize: 12, fontWeight: '700', color: '#16a34a' },
  strictCard: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 14 },
  strictTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  strictSub: { fontSize: 11.5, color: '#64748b', marginTop: 1 },
  strictBtn: { marginTop: 10, backgroundColor: '#0f172a', paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  strictBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
  limitCard: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  limitHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  limitName: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  limitMeta: { fontSize: 11, color: '#64748b', marginTop: 1 },
  pauseRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderColor: '#f1f5f9' },
  pauseLabel: { fontSize: 12, fontWeight: '600', color: '#1e293b' },
  pauseDesc: { fontSize: 10.5, color: '#64748b' },
  overLimitBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef2f2', padding: 6, borderRadius: 6, marginTop: 8 },
  overLimitText: { fontSize: 11, color: '#dc2626', fontWeight: '600' },
  previewPauseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', padding: 10, borderRadius: 12, marginTop: 4 },
  previewPauseText: { fontSize: 12, fontWeight: '700', color: '#15803d' },
  presetCard: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  presetTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  presetIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  presetName: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  presetDuration: { fontSize: 11, color: '#16a34a', fontWeight: '600' },
  startPresetBtn: { backgroundColor: '#16a34a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  startPresetText: { color: '#ffffff', fontWeight: '700', fontSize: 11 },
  presetDesc: { fontSize: 11.5, color: '#64748b', lineHeight: 16 },
  safeBrowsingCard: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 14 },
  safeTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  safeDesc: { fontSize: 11.5, color: '#64748b', marginTop: 1 },
  disclaimerPill: { flexDirection: 'row', gap: 6, backgroundColor: '#f8fafc', padding: 8, borderRadius: 8, marginTop: 10 },
  disclaimerText: { flex: 1, fontSize: 10.5, color: '#64748b', lineHeight: 15 },
  webRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 6 },
  webDomain: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  webMeta: { fontSize: 11, color: '#64748b' },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  insightCard: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  insightTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  insightText: { fontSize: 12, color: '#475569', lineHeight: 18 },
  recommendBox: { backgroundColor: '#f0fdf4', padding: 8, borderRadius: 8, marginTop: 8 },
  recommendTitle: { fontSize: 11, fontWeight: '700', color: '#15803d' },
  recommendText: { fontSize: 11, color: '#166534', marginTop: 1 },
  experimentCard: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 },
  expStatsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, borderTopWidth: 1, borderColor: '#f1f5f9', paddingTop: 8 },
  expStat: { alignItems: 'center' },
  expVal: { fontSize: 15, fontWeight: '800', color: '#16a34a' },
  expSub: { fontSize: 10, color: '#64748b', marginTop: 1 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: 4 },
  modalDesc: { fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 12 },
  pinInput: { backgroundColor: '#f1f5f9', borderRadius: 12, textAlign: 'center', fontSize: 20, fontWeight: '800', letterSpacing: 8, paddingVertical: 10, marginBottom: 12, color: '#0f172a' },
  modalBtnRow: { flexDirection: 'row', gap: 8 },
  modalCancelBtn: { flex: 1, backgroundColor: '#f1f5f9', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  modalCancelText: { fontWeight: '700', color: '#64748b', fontSize: 13 },
  modalConfirmBtn: { flex: 1, backgroundColor: '#16a34a', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  modalConfirmText: { fontWeight: '700', color: '#ffffff', fontSize: 13 },
  pauseModalBox: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20 },
  pauseModalEmoji: { fontSize: 32, textAlign: 'center', marginBottom: 6 },
  pauseModalTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: 4 },
  pauseModalSub: { fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 14 },
  pauseChoiceBtn: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', padding: 12, borderRadius: 12, marginBottom: 8 },
  pauseChoiceText: { fontSize: 12, color: '#334155' },
  pauseProceedBtn: { marginTop: 10, paddingVertical: 8, alignItems: 'center' },
  pauseProceedText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' }
});
