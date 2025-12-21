import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useDevilStore } from '../src/stores/devilStore';
import { useFocusStore } from '../src/stores/focusStore';
import { useAuthStore } from '../src/stores/authStore';
import { useTaskStore } from '../src/stores/taskStore';
import { haptics } from '../src/services/haptics';
import { notifications } from '../src/services/notifications';
import type { ShameLevel } from '../src/types';

const SHAME_LEVELS: { value: ShameLevel; label: string; emoji: string; description: string }[] = [
  { value: 'gentle', label: 'Gentle', emoji: '😈', description: 'Mildly disappointed sighs' },
  { value: 'snarky', label: 'Snarky', emoji: '👿', description: 'Passive-aggressive remarks' },
  { value: 'savage', label: 'Savage', emoji: '🔥', description: 'No mercy, full roast' },
];

export default function SettingsScreen() {
  const { preferences, updatePreferences, totalShamesReceived, totalPraisesReceived, resetDevil } = useDevilStore();
  const { focusDuration, breakDuration, longBreakDuration, setFocusDuration, setBreakDuration, setLongBreakDuration } = useFocusStore();
  const { user, signOut } = useAuthStore();
  const { tasks } = useTaskStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSignOut = async () => {
    haptics.medium();
    await signOut();
    router.replace('/(auth)/login');
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    haptics.selection();
    updatePreferences({ notification_enabled: enabled });

    if (enabled) {
      await notifications.scheduleDailyReminders();
    } else {
      await notifications.cancelAllScheduled();
    }
  };

  const handleShameLevelChange = (level: ShameLevel) => {
    haptics.selection();
    updatePreferences({ shame_level: level });
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data?',
      'This will clear all your tasks, stats, and preferences. The devil will forget everything about you. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            resetDevil();
            Alert.alert('Data Reset', 'All data has been cleared. The devil has forgotten you... for now.');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 pt-4 pb-2">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#ff2222" />
          </Pressable>
          <Text className="text-fire-100 text-2xl font-bold">Settings</Text>
        </View>

        {/* Shame Level */}
        <View className="px-4 pt-6">
          <Text className="text-fire-300 font-bold text-lg mb-2">Shame Intensity</Text>
          <Text className="text-text-muted text-sm mb-4">
            How harsh should the devil be when you procrastinate?
          </Text>

          <View className="flex-row justify-between">
            {SHAME_LEVELS.map((level) => (
              <Pressable
                key={level.value}
                onPress={() => handleShameLevelChange(level.value)}
                className={`flex-1 mx-1 p-4 rounded-xl items-center border ${
                  preferences.shame_level === level.value
                    ? 'bg-fire-600 border-fire-400'
                    : 'bg-surface border-fire-800'
                }`}
              >
                <Text className="text-3xl mb-2">{level.emoji}</Text>
                <Text
                  className={`font-bold ${
                    preferences.shame_level === level.value ? 'text-white' : 'text-fire-300'
                  }`}
                >
                  {level.label}
                </Text>
                <Text
                  className={`text-xs text-center mt-1 ${
                    preferences.shame_level === level.value ? 'text-fire-200' : 'text-text-muted'
                  }`}
                >
                  {level.description}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Focus Timer Settings */}
        <View className="px-4 pt-8">
          <Text className="text-fire-300 font-bold text-lg mb-4">Focus Timer</Text>

          {/* Focus Duration */}
          <View className="bg-surface border border-fire-800 rounded-xl p-4 mb-3">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-fire-100 font-medium">Focus Duration</Text>
              <Text className="text-fire-400 font-bold">{focusDuration} min</Text>
            </View>
            <Slider
              value={focusDuration}
              onValueChange={(val) => setFocusDuration(Math.round(val))}
              minimumValue={5}
              maximumValue={60}
              step={5}
              minimumTrackTintColor="#ff2222"
              maximumTrackTintColor="#4a0000"
              thumbTintColor="#ff4444"
            />
            <View className="flex-row justify-between mt-1">
              <Text className="text-text-muted text-xs">5 min</Text>
              <Text className="text-text-muted text-xs">60 min</Text>
            </View>
          </View>

          {/* Break Duration */}
          <View className="bg-surface border border-fire-800 rounded-xl p-4 mb-3">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-fire-100 font-medium">Short Break</Text>
              <Text className="text-fire-400 font-bold">{breakDuration} min</Text>
            </View>
            <Slider
              value={breakDuration}
              onValueChange={(val) => setBreakDuration(Math.round(val))}
              minimumValue={1}
              maximumValue={15}
              step={1}
              minimumTrackTintColor="#ff2222"
              maximumTrackTintColor="#4a0000"
              thumbTintColor="#ff4444"
            />
            <View className="flex-row justify-between mt-1">
              <Text className="text-text-muted text-xs">1 min</Text>
              <Text className="text-text-muted text-xs">15 min</Text>
            </View>
          </View>

          {/* Long Break Duration */}
          <View className="bg-surface border border-fire-800 rounded-xl p-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-fire-100 font-medium">Long Break</Text>
              <Text className="text-fire-400 font-bold">{longBreakDuration} min</Text>
            </View>
            <Slider
              value={longBreakDuration}
              onValueChange={(val) => setLongBreakDuration(Math.round(val))}
              minimumValue={10}
              maximumValue={30}
              step={5}
              minimumTrackTintColor="#ff2222"
              maximumTrackTintColor="#4a0000"
              thumbTintColor="#ff4444"
            />
            <View className="flex-row justify-between mt-1">
              <Text className="text-text-muted text-xs">10 min</Text>
              <Text className="text-text-muted text-xs">30 min</Text>
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View className="px-4 pt-8">
          <Text className="text-fire-300 font-bold text-lg mb-4">Notifications</Text>

          <View className="bg-surface border border-fire-800 rounded-xl p-4 mb-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-fire-100 font-medium">Shame Notifications</Text>
                <Text className="text-text-muted text-sm mt-1">
                  Let the devil remind you of your failures
                </Text>
              </View>
              <Switch
                value={preferences.notification_enabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#4a0000', true: '#ff4444' }}
                thumbColor={preferences.notification_enabled ? '#ff2222' : '#666'}
              />
            </View>
          </View>

          <View className="bg-surface border border-fire-800 rounded-xl p-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-fire-100 font-medium">Daily Task Goal</Text>
              <Text className="text-fire-400 font-bold">{preferences.daily_goal} tasks</Text>
            </View>
            <Slider
              value={preferences.daily_goal}
              onValueChange={(val) => updatePreferences({ daily_goal: Math.round(val) })}
              minimumValue={1}
              maximumValue={20}
              step={1}
              minimumTrackTintColor="#ff2222"
              maximumTrackTintColor="#4a0000"
              thumbTintColor="#ff4444"
            />
            <View className="flex-row justify-between mt-1">
              <Text className="text-text-muted text-xs">1 task</Text>
              <Text className="text-text-muted text-xs">20 tasks</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className="px-4 pt-8">
          <Text className="text-fire-300 font-bold text-lg mb-4">Your History with the Devil</Text>

          <View className="flex-row">
            <View className="flex-1 bg-surface border border-fire-800 rounded-xl p-4 mr-2">
              <Ionicons name="flame" size={24} color="#ff4444" />
              <Text className="text-fire-100 text-2xl font-bold mt-2">{totalShamesReceived}</Text>
              <Text className="text-text-muted text-sm">Times Shamed</Text>
            </View>
            <View className="flex-1 bg-surface border border-fire-800 rounded-xl p-4 ml-2">
              <Ionicons name="star" size={24} color="#ffd700" />
              <Text className="text-fire-100 text-2xl font-bold mt-2">{totalPraisesReceived}</Text>
              <Text className="text-text-muted text-sm">Times Praised</Text>
            </View>
          </View>

          <View className="bg-surface border border-fire-800 rounded-xl p-4 mt-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-fire-100">Total Tasks</Text>
              <Text className="text-fire-400 font-bold">{tasks.length}</Text>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View className="px-4 pt-8">
          <Text className="text-fire-300 font-bold text-lg mb-4">Account</Text>

          {user ? (
            <View className="bg-surface border border-fire-800 rounded-xl p-4 mb-3">
              <View className="flex-row items-center mb-3">
                <Ionicons name="mail" size={20} color="#994444" />
                <Text className="text-fire-100 ml-3">{user.email}</Text>
              </View>
              <Pressable
                onPress={handleSignOut}
                className="bg-fire-900 border border-fire-700 rounded-lg py-3 items-center active:bg-fire-800"
              >
                <View className="flex-row items-center">
                  <Ionicons name="log-out-outline" size={18} color="#ff4444" />
                  <Text className="text-red-400 font-semibold ml-2">Sign Out</Text>
                </View>
              </Pressable>
            </View>
          ) : (
            <View className="bg-surface border border-fire-800 rounded-xl p-4 mb-3">
              <Text className="text-text-muted text-sm mb-3">
                You're in local mode. Sign in to sync across devices.
              </Text>
              <Pressable
                onPress={() => router.push('/(auth)/login')}
                className="bg-fire-600 rounded-lg py-3 items-center active:bg-fire-700"
              >
                <Text className="text-white font-semibold">Sign In</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Danger Zone */}
        <View className="px-4 pt-8 pb-12">
          <Text className="text-red-500 font-bold text-lg mb-4">Danger Zone</Text>

          <Pressable
            onPress={handleResetData}
            className="bg-red-900/30 border border-red-800 rounded-xl p-4 active:bg-red-900/50"
          >
            <View className="flex-row items-center">
              <Ionicons name="trash" size={24} color="#ff4444" />
              <View className="ml-4 flex-1">
                <Text className="text-red-400 font-bold">Reset All Data</Text>
                <Text className="text-red-400/70 text-sm mt-1">
                  Clear all tasks, stats, and preferences
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ff4444" />
            </View>
          </Pressable>
        </View>

        {/* Version */}
        <View className="items-center pb-8">
          <Text className="text-text-muted text-xs">Devil Do v1.0.0</Text>
          <Text className="text-text-muted text-xs mt-1">Made with 😈 for procrastinators</Text>
        </View>
      </ScrollView>
    </View>
  );
}
