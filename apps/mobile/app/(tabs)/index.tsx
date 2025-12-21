import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { MotiView, MotiPressable, AnimatePresence } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DevilMascot, MascotMood } from '../../src/design/DevilMascot';
import { colors } from '../../src/design/tokens';
import { useTaskStore } from '../../src/stores/taskStore';
import { useStreakStore } from '../../src/stores/streakStore';
import { useXPStore } from '../../src/stores/xpStore';
import { useDevilChatStore, getBetStats } from '../../src/stores/devilChatStore';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');

  const { tasks } = useTaskStore();
  const { currentStreak, tasksCompletedToday, getEffectiveDailyGoal, dailyGoalMetToday } = useStreakStore();
  const { level, getXPProgress, getLevelTitle } = useXPStore();
  const { bets, sendMessage, isTyping, lastMessage, startSession, devilMood } = useDevilChatStore();

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const dailyGoal = getEffectiveDailyGoal();
  const xpProgress = getXPProgress();
  const betStats = getBetStats(bets);

  useEffect(() => {
    startSession();
  }, []);

  // Update mascot mood based on app state
  useEffect(() => {
    if (dailyGoalMetToday) {
      setMascotMood('celebrating');
    } else if (isTyping) {
      setMascotMood('thinking');
    } else if (devilMood === 'angry') {
      setMascotMood('angry');
    } else if (devilMood === 'impressed') {
      setMascotMood('happy');
    } else if (pendingTasks.length === 0) {
      setMascotMood('happy');
    } else if (tasksCompletedToday === 0) {
      setMascotMood('judging');
    } else {
      setMascotMood('idle');
    }
  }, [dailyGoalMetToday, isTyping, devilMood, pendingTasks.length, tasksCompletedToday]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const message = inputText.trim();
    setInputText('');
    await sendMessage(message, tasks);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-black"
      keyboardVerticalOffset={100}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Stats */}
        <View className="px-6 pt-4 pb-6">
          <View className="flex-row justify-between items-center mb-6">
            {/* Level Badge */}
            <Pressable
              onPress={() => router.push('/achievements')}
              className="flex-row items-center"
            >
              <View className="w-10 h-10 rounded-full bg-gray-900 items-center justify-center border border-gray-800">
                <Text className="text-white font-bold">{level}</Text>
              </View>
              <View className="ml-3">
                <Text className="text-gray-500 text-xs">LEVEL {level}</Text>
                <Text className="text-white font-medium">{getLevelTitle()}</Text>
              </View>
            </Pressable>

            {/* Streak */}
            <View className="flex-row items-center">
              <View className="items-end mr-3">
                <Text className="text-gray-500 text-xs">STREAK</Text>
                <Text className="text-white font-bold text-lg">{currentStreak}</Text>
              </View>
              <View className="w-10 h-10 rounded-full bg-gray-900 items-center justify-center border border-gray-800">
                <Text className="text-lg">{currentStreak > 0 ? '🔥' : '💀'}</Text>
              </View>
            </View>
          </View>

          {/* XP Progress */}
          <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-500 text-xs">XP PROGRESS</Text>
              <Text className="text-gray-500 text-xs">{Math.round(xpProgress)}%</Text>
            </View>
            <View className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <MotiView
                animate={{ width: `${xpProgress}%` }}
                transition={{ type: 'spring', damping: 20 }}
                className="h-full bg-white rounded-full"
              />
            </View>
          </View>
        </View>

        {/* Mascot Section */}
        <View className="items-center py-8">
          <DevilMascot size={160} mood={mascotMood} />

          {/* Devil Speech */}
          <AnimatePresence>
            {lastMessage && (
              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -10 }}
                className="mt-6 mx-6 bg-gray-900 rounded-2xl p-4 border border-gray-800"
              >
                <Text className="text-gray-300 text-center leading-relaxed">
                  "{lastMessage}"
                </Text>
              </MotiView>
            )}
          </AnimatePresence>
        </View>

        {/* Daily Progress */}
        <View className="px-6 mb-6">
          <View className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white font-semibold text-lg">Today's Goal</Text>
              {dailyGoalMetToday && (
                <View className="bg-green-500/20 px-3 py-1 rounded-full">
                  <Text className="text-green-400 text-xs font-medium">COMPLETE</Text>
                </View>
              )}
            </View>

            {/* Progress Ring */}
            <View className="flex-row items-center">
              <View className="w-20 h-20 rounded-full border-4 border-gray-800 items-center justify-center mr-4"
                style={{
                  borderColor: dailyGoalMetToday ? colors.success : colors.gray[800],
                }}
              >
                <Text className="text-white font-bold text-2xl">{tasksCompletedToday}</Text>
                <Text className="text-gray-500 text-xs">/{dailyGoal}</Text>
              </View>

              <View className="flex-1">
                <Text className="text-gray-400 mb-2">
                  {dailyGoalMetToday
                    ? "You crushed it. The devil is mildly annoyed."
                    : tasksCompletedToday === 0
                    ? "Nothing done yet? Bold strategy."
                    : `${dailyGoal - tasksCompletedToday} more to shut me up.`}
                </Text>

                {/* Quick Task Count */}
                <Pressable
                  onPress={() => router.push('/tasks')}
                  className="flex-row items-center"
                >
                  <Text className="text-pop font-medium">{pendingTasks.length} tasks waiting</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.pop.DEFAULT} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Bet Scoreboard */}
        <View className="px-6 mb-6">
          <Pressable
            onPress={() => router.push('/bets')}
            className="bg-gray-900 rounded-2xl p-5 border border-gray-800"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white font-semibold">Devil vs You</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.gray[600]} />
            </View>

            <View className="flex-row">
              <View className="flex-1 items-center">
                <Text className="text-pop text-3xl font-bold">{betStats.devilWins}</Text>
                <Text className="text-gray-500 text-xs">DEVIL</Text>
              </View>
              <View className="w-px bg-gray-800" />
              <View className="flex-1 items-center">
                <Text className="text-green-400 text-3xl font-bold">{betStats.userWins}</Text>
                <Text className="text-gray-500 text-xs">YOU</Text>
              </View>
              <View className="w-px bg-gray-800" />
              <View className="flex-1 items-center">
                <Text className="text-white text-3xl font-bold">{betStats.active}</Text>
                <Text className="text-gray-500 text-xs">ACTIVE</Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text className="text-gray-500 text-xs mb-3">QUICK ACTIONS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              <QuickAction
                icon="add-circle"
                label="Add Task"
                onPress={() => router.push('/add-task')}
                primary
              />
              <QuickAction
                icon="timer"
                label="Focus"
                onPress={() => router.push('/(tabs)/focus')}
              />
              <QuickAction
                icon="trophy"
                label="Achievements"
                onPress={() => router.push('/achievements')}
              />
              <QuickAction
                icon="settings"
                label="Settings"
                onPress={() => router.push('/settings')}
              />
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Chat Input */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-black border-t border-gray-900 px-6 py-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="flex-row items-center">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Talk to the devil..."
            placeholderTextColor={colors.gray[600]}
            className="flex-1 bg-gray-900 text-white rounded-full px-5 py-3 mr-3 border border-gray-800"
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <MotiPressable
            onPress={handleSend}
            disabled={!inputText.trim() || isTyping}
            animate={{
              scale: inputText.trim() ? 1 : 0.9,
              opacity: inputText.trim() ? 1 : 0.5,
            }}
            transition={{ type: 'spring', damping: 15 }}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: inputText.trim() ? colors.pop.DEFAULT : colors.gray[800],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? colors.white : colors.gray[600]}
            />
          </MotiPressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
  primary = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <MotiPressable
      onPress={onPress}
      animate={({ pressed }) => {
        'worklet';
        return { scale: pressed ? 0.95 : 1 };
      }}
      transition={{ type: 'timing', duration: 100 }}
      style={{
        backgroundColor: primary ? colors.pop.DEFAULT : colors.gray[900],
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: primary ? colors.pop.DEFAULT : colors.gray[800],
      }}
    >
      <Ionicons
        name={icon}
        size={18}
        color={primary ? colors.white : colors.gray[400]}
        style={{ marginRight: 8 }}
      />
      <Text
        style={{
          color: primary ? colors.white : colors.gray[300],
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
    </MotiPressable>
  );
}
