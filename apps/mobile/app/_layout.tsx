import { Stack, router, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore, useWellnessStore } from '../src/store';
import { startBackgroundSyncLoop } from '../src/services/supabase/syncEngine';
import { initializeAuthListener } from '../src/services/auth';
import { getProfile } from '../src/storage/profileStorage';

export default function RootLayout() {
  const { user, loadUser } = useAuthStore();
  const { loadWellnessData } = useWellnessStore();
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();

  useEffect(() => {
    // Load cached data
    loadUser();
    loadWellnessData();
    
    // Start listeners and sync
    initializeAuthListener();
    startBackgroundSyncLoop();
    
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const profile = getProfile();
    const needsOnboarding = !profile?.onboardingCompleted;

    if (!user && !inAuthGroup) {
      // Redirect to login
      router.replace('/(auth)/login');
    } else if (user) {
      if (needsOnboarding && segments[1] !== 'onboarding') {
        router.replace('/(auth)/onboarding/step1');
      } else if (!needsOnboarding && inAuthGroup) {
        // Redirect away from login/onboarding if already signed in and setup
        router.replace('/(tabs)');
      }
    }
  }, [user, segments, isReady]);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="lifestyle" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="checkin-modal" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="subscription" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}
