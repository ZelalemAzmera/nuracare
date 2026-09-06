import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Volume2, VolumeX, Droplets, Wind, Sparkles } from 'lucide-react-native';
import { Audio } from 'expo-av';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FloatingNatureBackgroundProps {
  children?: React.ReactNode;
  showSoundToggle?: boolean;
  intensity?: 'gentle' | 'vibrant';
}

// 6 Floating leaves with unique starting coordinates and speeds
const LEAF_EMOJIS = ['🍃', '🌿', '🌱', '🍃', '☘️', '🌿'];

export default function FloatingNatureBackground({
  children,
  showSoundToggle = true,
}: FloatingNatureBackgroundProps) {
  // Leaf animations
  const leavesAnim = useRef(
    LEAF_EMOJIS.map(() => ({
      translateY: new Animated.Value(SCREEN_HEIGHT + 20),
      translateX: new Animated.Value(Math.random() * SCREEN_WIDTH),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0.2 + Math.random() * 0.6),
    }))
  ).current;

  // Air wind stream animations
  const windAnim1 = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const windAnim2 = useRef(new Animated.Value(-SCREEN_WIDTH * 1.5)).current;
  const windOpacity = useRef(new Animated.Value(0.3)).current;

  // Ambient sound state
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Initialize and loop leaf & air breeze animations
  useEffect(() => {
    // 1. Leaves Floating Animation
    leavesAnim.forEach((leaf, idx) => {
      const duration = 10000 + (idx * 2200);
      const delay = idx * 1200;

      const animateLeaf = () => {
        leaf.translateY.setValue(SCREEN_HEIGHT + 40);
        leaf.translateX.setValue((idx * (SCREEN_WIDTH / 6)) + (Math.random() * 40 - 20));

        Animated.parallel([
          Animated.timing(leaf.translateY, {
            toValue: -60,
            duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(leaf.rotate, {
              toValue: 1,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(leaf.rotate, {
              toValue: 2,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => animateLeaf());
      };

      const timer = setTimeout(() => animateLeaf(), delay);
      return () => clearTimeout(timer);
    });

    // 2. Air / Wind Breeze Flow Animation
    const animateWind = () => {
      windAnim1.setValue(-SCREEN_WIDTH);
      windAnim2.setValue(-SCREEN_WIDTH * 1.5);

      Animated.parallel([
        Animated.timing(windAnim1, {
          toValue: SCREEN_WIDTH * 1.2,
          duration: 9000,
          useNativeDriver: true,
        }),
        Animated.timing(windAnim2, {
          toValue: SCREEN_WIDTH * 1.5,
          duration: 12000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(windOpacity, { toValue: 0.6, duration: 4500, useNativeDriver: true }),
          Animated.timing(windOpacity, { toValue: 0.15, duration: 4500, useNativeDriver: true }),
        ]),
      ]).start(() => animateWind());
    };

    animateWind();
  }, []);

  // Calming Water Droplet / Stream Ambient Sound setup
  useEffect(() => {
    let isMounted = true;

    async function initSound() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        // High quality soothing ambient water stream audio loop
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://cdn.freesound.org/previews/530/530697_11234978-lq.mp3' },
          { isLooping: true, volume: 0.35, shouldPlay: true }
        );

        if (isMounted) {
          soundRef.current = sound;
          setIsPlayingSound(true);
        } else {
          await sound.unloadAsync();
        }
      } catch (err) {
        // Audio playback fallback (non-blocking)
        console.log('Ambient sound initialization info:', err);
      }
    }

    initSound();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const toggleSound = async () => {
    if (!soundRef.current) return;
    try {
      if (isPlayingSound) {
        await soundRef.current.pauseAsync();
        setIsPlayingSound(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlayingSound(true);
      }
    } catch {
      setIsPlayingSound(!isPlayingSound);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Calm Gradient Simulation */}
      <View style={styles.calmBase} />

      {/* Flowing Air / Wind Stream 1 */}
      <Animated.View
        style={[
          styles.windLineWrap,
          {
            top: 140,
            opacity: windOpacity,
            transform: [{ translateX: windAnim1 }],
          },
        ]}
      >
        <Svg width={SCREEN_WIDTH * 1.5} height={60} viewBox="0 0 500 60">
          <Path
            d="M 0 30 Q 120 5 250 30 T 500 30"
            fill="none"
            stroke="rgba(34, 197, 94, 0.25)"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      {/* Flowing Air / Wind Stream 2 */}
      <Animated.View
        style={[
          styles.windLineWrap,
          {
            top: 360,
            opacity: windOpacity,
            transform: [{ translateX: windAnim2 }],
          },
        ]}
      >
        <Svg width={SCREEN_WIDTH * 1.8} height={80} viewBox="0 0 600 80">
          <Path
            d="M 0 40 Q 150 70 300 40 T 600 40"
            fill="none"
            stroke="rgba(16, 185, 129, 0.2)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      {/* Floating Animated Leaves */}
      {leavesAnim.map((leaf, idx) => {
        const spin = leaf.rotate.interpolate({
          inputRange: [0, 1, 2],
          outputRange: ['0deg', '180deg', '360deg'],
        });

        return (
          <Animated.View
            key={idx}
            pointerEvents="none"
            style={[
              styles.leaf,
              {
                opacity: leaf.opacity,
                transform: [
                  { translateX: leaf.translateX },
                  { translateY: leaf.translateY },
                  { rotate: spin },
                ],
              },
            ]}
          >
            <Text style={{ fontSize: 18 + (idx % 3) * 6 }}>{LEAF_EMOJIS[idx]}</Text>
          </Animated.View>
        );
      })}

      {/* Calming Water Droplet / Stream Floating Audio Toggle */}
      {showSoundToggle && (
        <TouchableOpacity
          style={[styles.soundPill, isPlayingSound && styles.soundPillActive]}
          onPress={toggleSound}
          activeOpacity={0.8}
          accessibilityLabel="Toggle calming water sound"
        >
          <Droplets size={14} color={isPlayingSound ? '#16a34a' : '#94a3b8'} />
          <Text style={[styles.soundText, isPlayingSound && styles.soundTextActive]}>
            {isPlayingSound ? 'Calming Water: On' : 'Calming Water: Muted'}
          </Text>
          {isPlayingSound ? (
            <Volume2 size={14} color="#16a34a" />
          ) : (
            <VolumeX size={14} color="#94a3b8" />
          )}
        </TouchableOpacity>
      )}

      {/* Child Content */}
      <View style={styles.contentWrap}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  calmBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f8fafc',
  },
  windLineWrap: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  leaf: {
    position: 'absolute',
    zIndex: 2,
  },
  soundPill: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 36,
    right: 16,
    zIndex: 99,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  soundPillActive: {
    borderColor: '#86efac',
    backgroundColor: '#f0fdf4',
  },
  soundText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  soundTextActive: {
    color: '#16a34a',
  },
  contentWrap: {
    flex: 1,
    zIndex: 10,
  },
});
