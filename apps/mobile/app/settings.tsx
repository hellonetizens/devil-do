import React from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

let MotiPressable: any = Pressable;
if (Platform.OS !== 'web') {
  MotiPressable = require('moti').MotiPressable;
}
import Slider from '@react-native-community/slider';
import { useDevilStore } from '../src/stores/devilStore';
import { useFocusStore } from '../src/stores/focusStore';
import { useStreakStore } from '../src/stores/streakStore';
import { colors } from '../src/design/tokens';
import { haptics } from '../src/services/haptics';
import { notifications } from '../src/services/notifications';
import type { ShameLevel } from '../src/types';

const SHAME_LEVELS: { value: ShameLevel; label: string; description: string }[] = [
  { value: 'gentle', label: 'Gentle', description: 'Mildly disappointed' },
  { value: 'snarky', label: 'Snarky', description: 'Passive-aggressive' },
  { value: 'savage', label: 'Savage', description: 'No mercy' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { preferences, updatePreferences, resetDevil } = useDevilStore();
  const { focusDuration, breakDuration, setFocusDuration, setBreakDuration } = useFocusStore();
  const { dailyGoal, setDailyGoal } = useStreakStore();

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
      'This will clear all your tasks, stats, and preferences. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetDevil();
            Alert.alert('Data Reset', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-900">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text className="text-white text-xl font-semibold">Settings</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Shame Level */}
        <View className="pt-6 pb-4">
          <Text className="text-white font-medium mb-1">Shame Intensity</Text>
          <Text className="text-gray-500 text-sm mb-4">
            How harsh should the devil be?
          </Text>
          <View className="flex-row gap-2">
            {SHAME_LEVELS.map((level) => (
              <MotiPressable
                key={level.value}
                onPress={() => handleShameLevelChange(level.value)}
                animate={{
                  backgroundColor: preferences.shame_level === level.value
                    ? colors.pop.DEFAULT
                    : colors.gray[900],
                }}
                transition={{ type: 'timing', duration: 150 }}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 16,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: preferences.shame_level === level.value
                    ? colors.pop.DEFAULT
                    : colors.gray[800],
                }}
              >
                <Text className={`font-medium mb-1 ${
                  preferences.shame_level === level.value ? 'text-white' : 'text-gray-300'
                }`}>
                  {level.label}
                </Text>
                <Text className={`text-xs ${
                  preferences.shame_level === level.value ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {level.description}
                </Text>
              </MotiPressable>
            ))}
          </View>
        </View>

        {/* Focus Timer */}
        <View className="py-4">
          <Text className="text-white font-medium mb-4">Focus Timer</Text>

          <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-3">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-300">Focus Duration</Text>
              <Text className="text-white font-medium">{focusDuration} min</Text>
            </View>
            <Slider
              value={focusDuration}
              onValueChange={(val) => setFocusDuration(Math.round(val))}
              minimumValue={5}
              maximumValue={60}
              step={5}
              minimumTrackTintColor={colors.pop.DEFAULT}
              maximumTrackTintColor={colors.gray[800]}
              thumbTintColor={colors.white}
            />
          </View>

          <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-300">Break Duration</Text>
              <Text className="text-white font-medium">{breakDuration} min</Text>
            </View>
            <Slider
              value={breakDuration}
              onValueChange={(val) => setBreakDuration(Math.round(val))}
              minimumValue={1}
              maximumValue={15}
              step={1}
              minimumTrackTintColor={colors.pop.DEFAULT}
              maximumTrackTintColor={colors.gray[800]}
              thumbTintColor={colors.white}
            />
          </View>
        </View>

        {/* Daily Goal */}
        <View className="py-4">
          <Text className="text-white font-medium mb-4">Daily Goal</Text>

          <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-300">Tasks per day</Text>
              <Text className="text-white font-medium">{dailyGoal} tasks</Text>
            </View>
            <Slider
              value={dailyGoal}
              onValueChange={(val) => setDailyGoal(Math.round(val))}
              minimumValue={1}
              maximumValue={20}
              step={1}
              minimumTrackTintColor={colors.pop.DEFAULT}
              maximumTrackTintColor={colors.gray[800]}
              thumbTintColor={colors.white}
            />
          </View>
        </View>

        {/* Notifications */}
        <View className="py-4">
          <Text className="text-white font-medium mb-4">Notifications</Text>

          <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-gray-300">Shame Reminders</Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Let the devil remind you
                </Text>
              </View>
              <Switch
                value={preferences.notification_enabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: colors.gray[800], true: colors.pop.DEFAULT }}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="py-4 pb-8">
          <Text className="text-pop font-medium mb-4">Danger Zone</Text>

          <Pressable
            onPress={handleResetData}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-4"
          >
            <View className="flex-row items-center">
              <Ionicons name="trash-outline" size={20} color={colors.pop.DEFAULT} />
              <View className="ml-3 flex-1">
                <Text className="text-pop font-medium">Reset All Data</Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Clear everything and start fresh
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Version */}
        <View className="items-center pb-8">
          <Text className="text-gray-600 text-xs">Devil Do v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
