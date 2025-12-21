import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView, MotiPressable } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDevilChatStore, getBetStats } from '../../src/stores/devilChatStore';
import { useFocusStore } from '../../src/stores/focusStore';
import { useAuthStore } from '../../src/stores/authStore';
import { useXPStore } from '../../src/stores/xpStore';
import { useStreakStore } from '../../src/stores/streakStore';
import { useAchievementStore, ACHIEVEMENTS } from '../../src/stores/achievementStore';
import { colors } from '../../src/design/tokens';
import { haptics } from '../../src/services/haptics';

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { userPattern, bets } = useDevilChatStore();
  const { sessionsToday, focusStreak, totalFocusMinutesToday } = useFocusStore();
  const { user, signOut, isLoading } = useAuthStore();
  const { level, totalXP, getLevelTitle, getXPProgress } = useXPStore();
  const { currentStreak, bestStreak, tasksCompletedToday } = useStreakStore();
  const { unlocked, getNextAchievements, getProgress } = useAchievementStore();
  const betStats = getBetStats(bets);

  const handleSignOut = async () => {
    haptics.medium();
    await signOut();
    router.replace('/(auth)/login');
  };

  const completionPercent = Math.round(userPattern.averageTaskCompletionRate * 100);
  const nextAchievements = getNextAchievements();
  const totalAchievements = ACHIEVEMENTS.filter(a => !a.secret).length;
  const xpProgress = getXPProgress();

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <Text className="text-white font-semibold text-xl">Stats</Text>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => router.push('/achievements')}
            className="w-10 h-10 rounded-full bg-gray-900 items-center justify-center border border-gray-800"
          >
            <Text className="text-lg">🏆</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/settings')}
            className="w-10 h-10 rounded-full bg-gray-900 items-center justify-center border border-gray-800"
          >
            <Ionicons name="settings-outline" size={18} color={colors.gray[400]} />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Level Card */}
        <View className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-4">
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 rounded-2xl bg-black items-center justify-center border border-gray-800 mr-4">
              <Text className="text-white font-bold text-2xl">{level}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs">LEVEL {level}</Text>
              <Text className="text-white font-semibold text-lg">{getLevelTitle()}</Text>
              <Text className="text-gray-500 text-sm">{totalXP} XP total</Text>
            </View>
          </View>
          <View className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <MotiView
              animate={{ width: `${xpProgress}%` }}
              transition={{ type: 'spring', damping: 20 }}
              className="h-full bg-white rounded-full"
            />
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View className="flex-row flex-wrap -mx-1.5 mb-4">
          <View className="w-1/2 p-1.5">
            <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <Text className="text-gray-500 text-xs mb-1">STREAK</Text>
              <Text className="text-white text-3xl font-bold">{currentStreak}</Text>
              <Text className="text-gray-600 text-xs">Best: {bestStreak}</Text>
            </View>
          </View>
          <View className="w-1/2 p-1.5">
            <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <Text className="text-gray-500 text-xs mb-1">TODAY</Text>
              <Text className="text-white text-3xl font-bold">{tasksCompletedToday}</Text>
              <Text className="text-gray-600 text-xs">tasks done</Text>
            </View>
          </View>
          <View className="w-1/2 p-1.5">
            <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <Text className="text-gray-500 text-xs mb-1">COMPLETED</Text>
              <Text className="text-green-400 text-3xl font-bold">{userPattern.completedTasks}</Text>
              <Text className="text-gray-600 text-xs">all time</Text>
            </View>
          </View>
          <View className="w-1/2 p-1.5">
            <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <Text className="text-gray-500 text-xs mb-1">BETS WON</Text>
              <Text className="text-pop text-3xl font-bold">{betStats.userWins}</Text>
              <Text className="text-gray-600 text-xs">vs devil</Text>
            </View>
          </View>
        </View>

        {/* Completion Rate */}
        <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white font-medium">Completion Rate</Text>
            <Text className={`text-2xl font-bold ${
              completionPercent >= 70 ? 'text-green-400' :
              completionPercent >= 40 ? 'text-yellow-400' : 'text-pop'
            }`}>
              {completionPercent}%
            </Text>
          </View>
          <View className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <View
              className={`h-full rounded-full ${
                completionPercent >= 70 ? 'bg-green-400' :
                completionPercent >= 40 ? 'bg-yellow-400' : 'bg-pop'
              }`}
              style={{ width: `${completionPercent}%` }}
            />
          </View>
          <Text className="text-gray-500 text-xs mt-2">
            {completionPercent >= 70 ? "The devil is mildly impressed." :
             completionPercent >= 40 ? "Mediocre. Room for improvement." :
             "The devil is winning. Step it up."}
          </Text>
        </View>

        {/* Achievements Preview */}
        <Pressable
          onPress={() => router.push('/achievements')}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4"
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white font-medium">Achievements</Text>
            <View className="flex-row items-center">
              <Text className="text-gray-400 font-medium mr-2">{unlocked.length}/{totalAchievements}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.gray[600]} />
            </View>
          </View>
          <View className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
            <View
              className="h-full bg-white rounded-full"
              style={{ width: `${(unlocked.length / totalAchievements) * 100}%` }}
            />
          </View>
          {nextAchievements.length > 0 && (
            <View className="flex-row">
              {nextAchievements.slice(0, 3).map((achievement) => (
                <View key={achievement.id} className="flex-1 mr-2 last:mr-0">
                  <View className="bg-gray-800 rounded-xl p-2 items-center">
                    <Text className="text-xl mb-1">{achievement.icon}</Text>
                    <Text className="text-gray-300 text-xs text-center" numberOfLines={1}>
                      {achievement.title}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Pressable>

        {/* Weaknesses */}
        {(userPattern.weakDays.length > 0 || userPattern.peakProcrastinationTimes.length > 0) && (
          <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
            <Text className="text-white font-medium mb-3">Your Weaknesses</Text>
            {userPattern.weakDays.length > 0 && (
              <View className="mb-3">
                <Text className="text-gray-500 text-xs mb-2">WORST DAYS</Text>
                <View className="flex-row flex-wrap">
                  {userPattern.weakDays.map((day, i) => (
                    <View key={i} className="bg-pop/20 rounded-full px-3 py-1 mr-2 mb-1">
                      <Text className="text-pop text-xs font-medium">{day}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {userPattern.peakProcrastinationTimes.length > 0 && (
              <View>
                <Text className="text-gray-500 text-xs mb-2">PROCRASTINATION HOURS</Text>
                <View className="flex-row flex-wrap">
                  {userPattern.peakProcrastinationTimes.slice(0, 4).map((time, i) => (
                    <View key={i} className="bg-yellow-500/20 rounded-full px-3 py-1 mr-2 mb-1">
                      <Text className="text-yellow-400 text-xs font-medium">{time}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Account */}
        <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-8">
          <Text className="text-white font-medium mb-3">Account</Text>
          {user ? (
            <>
              <Text className="text-gray-500 text-sm mb-3">{user.email}</Text>
              <MotiPressable
                onPress={handleSignOut}
                disabled={isLoading}
                animate={({ pressed }) => ({ scale: pressed ? 0.97 : 1 })}
                transition={{ type: 'timing', duration: 100 }}
                style={{
                  backgroundColor: colors.gray[800],
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.pop.DEFAULT} />
                ) : (
                  <Text className="text-gray-400 font-medium">Sign Out</Text>
                )}
              </MotiPressable>
            </>
          ) : (
            <>
              <Text className="text-gray-500 text-sm mb-3">Local mode - data on this device only</Text>
              <MotiPressable
                onPress={() => router.push('/(auth)/login')}
                animate={({ pressed }) => ({ scale: pressed ? 0.97 : 1 })}
                transition={{ type: 'timing', duration: 100 }}
                style={{
                  backgroundColor: colors.pop.DEFAULT,
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text className="text-white font-medium">Sign In to Sync</Text>
              </MotiPressable>
            </>
          )}
        </View>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
