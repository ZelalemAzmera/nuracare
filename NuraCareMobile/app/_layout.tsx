import { Stack, router, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore, useWellnessStore } from '../src/store';
import { startBackgroundSyncLoop } from '../src/services/supabase/syncEngine';
import { initializeAuthListener } from '../src/services/auth';

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

    if (!user && !inAuthGroup) {
      // Redirect to login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect away from login if already signed in
      router.replace('/(tabs)');
    }
  }, [user, segments, isReady]);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="checkin-modal" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}
