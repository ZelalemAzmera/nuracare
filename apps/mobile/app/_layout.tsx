import 'react-native-gesture-handler';
import { Stack, router, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { useWellnessStore, useAuthStore } from '../src/store';
import { startBackgroundSyncLoop } from '../src/services/supabase/syncEngine';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ProfileProvider, useProfile } from '../src/context/ProfileContext';

function InnerLayout() {
  const { user, loading: authLoading } = useAuth();
  const { user: storeUser } = useAuthStore();
  const currentUser = user || storeUser;
  const { profile, loading: profileLoading } = useProfile();
  const { loadWellnessData } = useWellnessStore();
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();

  useEffect(() => {
    loadWellnessData();
    startBackgroundSyncLoop();
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || authLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isGuest = currentUser?.id && String(currentUser.id).startsWith('guest_');
    
    if (!currentUser && !inAuthGroup) {
      // Redirect to login
      router.replace('/(auth)/login');
    } else if (currentUser) {
      if (isGuest) {
        if (inAuthGroup) {
          router.replace('/(tabs)');
        }
        return;
      }

      if (profileLoading) return;
      
      const needsOnboarding = !profile || !profile.name || profile._fallback || (Array.isArray(profile.conditions) === false && !profile.age);
      
      if (needsOnboarding && (segments as any)[1] !== 'onboarding') {
        router.replace('/(auth)/onboarding/step1');
      } else if (!needsOnboarding && inAuthGroup) {
        // Redirect away from login/onboarding if already signed in and setup
        router.replace('/(tabs)');
      }
    }
  }, [currentUser, profile, authLoading, profileLoading, segments, isReady]);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="chat" options={{ headerShown: false }} />
      <Stack.Screen name="privacy-center" options={{ headerShown: false }} />
      <Stack.Screen name="consent-settings" options={{ headerShown: false }} />
      <Stack.Screen name="permissions-management" options={{ headerShown: false }} />
      <Stack.Screen name="delete-account" options={{ headerShown: false }} />
      <Stack.Screen name="legal" options={{ headerShown: false }} />
      <Stack.Screen name="checkin-modal" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="subscription" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <InnerLayout />
      </ProfileProvider>
    </AuthProvider>
  );
}
