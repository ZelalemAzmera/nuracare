import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Leaf } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

export default function LoginScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
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
        // User should be navigated automatically by RootLayout once auth state changes
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

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Leaf size={40} color="#16a34a" />
          </View>
          <Text style={styles.title}>NuraCare</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Create an account to begin' : 'Welcome back to your wellness journey'}
          </Text>
        </View>

        <View style={styles.form}>
          {error && <Text style={styles.errorText}>{error}</Text>}

          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {isSignUp && (
            <Text style={styles.termsText}>
              By signing up, you agree to our{' '}
              <Text style={styles.link} onPress={() => router.push('/terms')}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.link} onPress={() => router.push('/privacy')}>Privacy Policy</Text>.
            </Text>
          )}

          <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={handleSubmit} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.googleBtn} 
            onPress={handleGoogle} 
            disabled={loading}
          >
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setIsSignUp(!isSignUp); setError(null); }} style={styles.toggleBtn}>
            <Text style={styles.toggleText}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  termsText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  link: {
    color: '#16a34a',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    color: '#94a3b8',
    paddingHorizontal: 16,
    fontWeight: '500',
  },
  googleBtn: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  googleText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  toggleBtn: {
    marginTop: 24,
    alignItems: 'center',
  },
  toggleText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '600',
  }
});
