import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDevilStore } from '../src/stores/devilStore';

import '../global.css';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { triggerShame } = useDevilStore();

  // Trigger app open shame on first load
  useEffect(() => {
    triggerShame('app_open');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <View className="flex-1 bg-background">
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#0f0f1a',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: '#0f0f1a',
            },
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="task/[id]"
            options={{
              title: 'Task Details',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="add-task"
            options={{
              title: 'Add Task',
              presentation: 'modal',
            }}
          />
        </Stack>
      </View>
    </QueryClientProvider>
  );
}
