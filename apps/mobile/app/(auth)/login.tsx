import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Leaf, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useAuthStore } from '../../src/store';
import { router } from 'expo-router';
import FloatingNatureBackground from '../../src/components/ambient/FloatingNatureBackground';

export default function LoginScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, setGuestUser } = useAuth();
  const { setUser } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password || (isSignUp && !name)) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (e: any) {
      setError(e.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      setError(e.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  // Instant guest preview mode for smooth evaluation
  const handleGuestPreview = () => {
    const guestData = {
      id: 'guest_' + Date.now(),
      name: 'Guest Explorer',
      fastingMode: 'Orthodox Christian (Tsom)',
    };
    setUser(guestData);
    if (setGuestUser) {
      setGuestUser(guestData);
    }
    router.replace('/(tabs)');
  };

  return (
    <FloatingNatureBackground showSoundToggle={true}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <Leaf size={38} color="#16a34a" />
            </View>
            <Text style={styles.brandTitle}>NuraCare</Text>
            <Text style={styles.brandSubtitle}>
              {isSignUp
                ? 'Begin your personalized, calm wellness journey'
                : 'Welcome back to your natural health companion'}
            </Text>
          </View>

          {/* Aesthetic Glassmorphic Card */}
          <View style={styles.card}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Abebe Bikila"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {isSignUp && (
              <Text style={styles.termsNotice}>
                By signing up, you agree to NuraCare's{' '}
                <Text style={styles.termsLink} onPress={() => router.push('/legal')}>
                  Privacy & Terms
                </Text>
                .
              </Text>
            )}

            {/* Primary Action Button */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={styles.btnRow}>
                  <Text style={styles.primaryBtnText}>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </Text>
                  <ArrowRight size={18} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google OAuth Button */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogle}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Toggle Sign Up / Sign In */}
            <TouchableOpacity
              onPress={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              style={styles.toggleRow}
            >
              <Text style={styles.toggleText}>
                {isSignUp
                  ? 'Already have an account? '
                  : "Don't have an account yet? "}
                <Text style={styles.toggleHighlight}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Instant Explorer / Preview Button */}
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={handleGuestPreview}
              activeOpacity={0.7}
            >
              <Sparkles size={16} color="#16a34a" />
              <Text style={styles.exploreBtnText}>Explore NuraCare (Guest Mode)</Text>
            </TouchableOpacity>
          </View>

          {/* Privacy Safeguard Strip */}
          <View style={styles.footerShield}>
            <ShieldCheck size={14} color="#16a34a" />
            <Text style={styles.footerShieldText}>
              Protected by Ethiopian Data Protection Proclamation No. 1321/2024
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </FloatingNatureBackground>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16a34a',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 14,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  termsNotice: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 14,
    lineHeight: 16,
  },
  termsLink: {
    color: '#16a34a',
    fontWeight: '700',
  },
  primaryBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#16a34a',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  googleBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  toggleRow: {
    alignItems: 'center',
    marginTop: 18,
  },
  toggleText: {
    fontSize: 13,
    color: '#64748b',
  },
  toggleHighlight: {
    color: '#16a34a',
    fontWeight: '800',
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 16,
    gap: 6,
  },
  exploreBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16a34a',
  },
  footerShield: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 6,
  },
  footerShieldText: {
    fontSize: 11,
    color: '#64748b',
  },
});
