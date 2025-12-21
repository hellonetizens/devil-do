import { useEffect, useCallback, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDevilStore } from '../src/stores/devilStore';
import { useAuthStore } from '../src/stores/authStore';
import { useStreakStore } from '../src/stores/streakStore';
import { useTaskSync } from '../src/hooks/useTaskSync';
import { AchievementToast } from '../src/components/AchievementToast';
import { LevelUpToast } from '../src/components/LevelUpToast';
import { MicroAchievementToast } from '../src/components/MicroAchievementToast';
import { notifications } from '../src/services/notifications';
import { audio } from '../src/services/audio';

import '../global.css';

const queryClient = new QueryClient();

// Keep splash screen visible while loading fonts (native only)
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => {});
}

function useProtectedRoute(hasCompletedOnboarding: boolean | null) {
  const segments = useSegments();
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized || hasCompletedOnboarding === null) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    // If hasn't completed onboarding and not on onboarding screen
    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace('/onboarding');
      return;
    }

    // If user is signed in and on auth screen, redirect to main app
    if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments, isInitialized, hasCompletedOnboarding]);
}

export default function RootLayout() {
  const { triggerShame } = useDevilStore();
  const { initialize, isInitialized } = useAuthStore();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  // Load Ionicons font for web
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
  });

  // Check onboarding status
  useEffect(() => {
    let mounted = true;

    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem('onboarding_completed');
        if (mounted) {
          setHasCompletedOnboarding(completed === 'true');
        }
      } catch (error) {
        // If AsyncStorage fails, assume onboarding not completed
        console.warn('AsyncStorage error:', error);
        if (mounted) {
          setHasCompletedOnboarding(false);
        }
      }
    };

    // Timeout fallback - use shorter timeout on web
    const timeout = setTimeout(() => {
      if (mounted) {
        setHasCompletedOnboarding(prev => prev === null ? false : prev);
      }
    }, Platform.OS === 'web' ? 500 : 2000);

    checkOnboarding();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, []);

  // Initialize auth listener with timeout fallback
  useEffect(() => {
    const unsubscribe = initialize();

    // Timeout fallback - if auth doesn't initialize in 3 seconds, proceed anyway
    const timeout = setTimeout(() => {
      if (!useAuthStore.getState().isInitialized) {
        useAuthStore.setState({ isInitialized: true });
      }
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Initialize audio and notifications
  useEffect(() => {
    const initServices = async () => {
      await audio.init();
      await notifications.requestPermissions();
      await notifications.scheduleDailyReminders();
    };
    initServices();

    // Cleanup audio on unmount
    return () => {
      audio.cleanup();
    };
  }, []);

  // Check and reset daily streak counters
  useEffect(() => {
    const { checkAndResetDaily } = useStreakStore.getState();
    checkAndResetDaily();
  }, []);

  // Sync tasks when user is authenticated
  useTaskSync();

  // Protect routes based on auth state
  useProtectedRoute(hasCompletedOnboarding);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Trigger app open shame on first load
  useEffect(() => {
    if (fontsLoaded && isInitialized) {
      triggerShame('app_open');
    }
  }, [fontsLoaded, isInitialized]);

  // Show loading screen while fonts load or onboarding status is being checked
  // On web, don't wait for fonts - they load async anyway
  const isLoading = Platform.OS === 'web'
    ? hasCompletedOnboarding === null
    : ((!fontsLoaded && !fontError) || hasCompletedOnboarding === null);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#ff2222" />
        <Text style={{ color: '#ff2222', marginTop: 16 }}>Summoning the devil...</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <View className="flex-1 bg-black" onLayout={onLayoutRootView}>
        <StatusBar style="light" />
        <LevelUpToast />
        <MicroAchievementToast />
        <AchievementToast />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#000000',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: '600',
            },
            contentStyle: {
              backgroundColor: '#000000',
            },
          }}
        >
          <Stack.Screen
            name="onboarding"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="(auth)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="add-task"
            options={{
              title: 'Add Task',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: 'Settings',
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="tasks"
            options={{
              title: 'Tasks',
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="achievements"
            options={{
              title: 'Achievements',
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </Stack>
      </View>
    </QueryClientProvider>
  );
}
