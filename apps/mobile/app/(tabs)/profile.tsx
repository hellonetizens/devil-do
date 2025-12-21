import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDevilChatStore, getBetStats } from '../../src/stores/devilChatStore';
import { useFocusStore } from '../../src/stores/focusStore';
import { useAuthStore } from '../../src/stores/authStore';
import { useAchievementStore, ACHIEVEMENTS } from '../../src/stores/achievementStore';
import { haptics } from '../../src/services/haptics';

export default function StatsScreen() {
  const { userPattern, bets } = useDevilChatStore();
  const { sessionsToday, focusStreak } = useFocusStore();
  const { user, signOut, isLoading } = useAuthStore();
  const { unlocked, getNextAchievements, getProgress } = useAchievementStore();
  const betStats = getBetStats(bets);

  const handleSignOut = async () => {
    haptics.medium();
    await signOut();
    router.replace('/(auth)/login');
  };

  const handleNavigation = (path: string) => {
    haptics.selection();
    router.push(path as any);
  };

  const completionPercent = Math.round(userPattern.averageTaskCompletionRate * 100);
  const nextAchievements = getNextAchievements();
  const totalAchievements = ACHIEVEMENTS.filter(a => !a.secret).length;

  return (
    <View className="flex-1 bg-background">
      {/* Header with Settings Button */}
      <View className="flex-row justify-between items-center px-4 pt-4 pb-2">
        <Text className="text-fire-100 font-bold text-xl">Stats</Text>
        <View className="flex-row">
          <Pressable
            onPress={() => handleNavigation('/achievements')}
            className="w-10 h-10 rounded-full bg-surface border border-fire-800 items-center justify-center active:bg-fire-900 mr-2"
          >
            <Text className="text-xl">🏆</Text>
          </Pressable>
          <Pressable
            onPress={() => handleNavigation('/settings')}
            className="w-10 h-10 rounded-full bg-surface border border-fire-800 items-center justify-center active:bg-fire-900"
          >
            <Ionicons name="settings-outline" size={20} color="#ff2222" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-2">
        {/* Devil's Analysis Header */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-fire-900 items-center justify-center border-2 border-fire-600">
            <Ionicons name="analytics" size={40} color="#ff2222" />
          </View>
          <Text className="text-fire-100 font-bold text-xl mt-3">Devil's Analysis</Text>
          <Text className="text-fire-400 text-sm">Everything I know about your failures</Text>
        </View>

        {/* Completion Rate */}
        <View className="bg-surface border border-fire-800 rounded-xl p-4 mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-fire-300 font-bold">Task Completion Rate</Text>
            <Text className={`text-2xl font-bold ${
              completionPercent >= 70 ? 'text-green-400' :
              completionPercent >= 40 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {completionPercent}%
            </Text>
          </View>
          <View className="h-3 bg-fire-900 rounded-full overflow-hidden">
            <View
              className={`h-full rounded-full ${
                completionPercent >= 70 ? 'bg-green-500' :
                completionPercent >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${completionPercent}%` }}
            />
          </View>
          <Text className="text-text-muted text-xs mt-2">
            {completionPercent >= 70 ? "Annoyingly good. I'll find your weaknesses." :
             completionPercent >= 40 ? "Mediocre. Exactly as I predicted." :
             "Pathetic. But at least you're consistent."}
          </Text>
        </View>

        {/* Key Stats Grid */}
        <View className="flex-row flex-wrap -mx-1 mb-4">
          <View className="w-1/2 p-1">
            <View className="bg-surface border border-fire-800 rounded-xl p-4">
              <Ionicons name="checkmark-circle" size={24} color="#44ff44" />
              <Text className="text-green-400 text-3xl font-bold mt-2">
                {userPattern.completedTasks}
              </Text>
              <Text className="text-text-muted text-sm">Completed</Text>
            </View>
          </View>
          <View className="w-1/2 p-1">
            <View className="bg-surface border border-fire-800 rounded-xl p-4">
              <Ionicons name="close-circle" size={24} color="#ff4444" />
              <Text className="text-red-400 text-3xl font-bold mt-2">
                {userPattern.abandonedTasks}
              </Text>
              <Text className="text-text-muted text-sm">Abandoned</Text>
            </View>
          </View>
          <View className="w-1/2 p-1">
            <View className="bg-surface border border-fire-800 rounded-xl p-4">
              <Ionicons name="flame" size={24} color="#ffaa00" />
              <Text className="text-yellow-400 text-3xl font-bold mt-2">
                {userPattern.currentStreak}
              </Text>
              <Text className="text-text-muted text-sm">Day Streak</Text>
            </View>
          </View>
          <View className="w-1/2 p-1">
            <View className="bg-surface border border-fire-800 rounded-xl p-4">
              <Ionicons name="trophy" size={24} color="#ff2222" />
              <Text className="text-accent text-3xl font-bold mt-2">
                {betStats.userWins}
              </Text>
              <Text className="text-text-muted text-sm">Bets Won</Text>
            </View>
          </View>
        </View>

        {/* Weaknesses Section */}
        <View className="bg-surface border border-fire-800 rounded-xl p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="warning" size={20} color="#ff4444" />
            <Text className="text-fire-300 font-bold ml-2">Your Weaknesses</Text>
          </View>

          {userPattern.weakDays.length > 0 ? (
            <View className="mb-3">
              <Text className="text-text-muted text-sm mb-1">Worst Days:</Text>
              <View className="flex-row flex-wrap">
                {userPattern.weakDays.map((day, i) => (
                  <View key={i} className="bg-red-500/20 rounded-full px-3 py-1 mr-2 mb-1">
                    <Text className="text-red-400 text-xs font-bold">{day}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text className="text-text-muted text-sm mb-3">
              Haven't found your weak days yet... but I will.
            </Text>
          )}

          {userPattern.peakProcrastinationTimes.length > 0 ? (
            <View className="mb-3">
              <Text className="text-text-muted text-sm mb-1">Peak Procrastination Times:</Text>
              <View className="flex-row flex-wrap">
                {userPattern.peakProcrastinationTimes.slice(0, 4).map((time, i) => (
                  <View key={i} className="bg-yellow-500/20 rounded-full px-3 py-1 mr-2 mb-1">
                    <Text className="text-yellow-400 text-xs font-bold">{time}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text className="text-text-muted text-sm">
              Tracking your procrastination patterns...
            </Text>
          )}
        </View>

        {/* Common Excuses */}
        <View className="bg-surface border border-fire-800 rounded-xl p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="chatbubble-ellipses" size={20} color="#994444" />
            <Text className="text-fire-300 font-bold ml-2">Your Favorite Excuses</Text>
          </View>

          {userPattern.commonExcuses.length > 0 ? (
            userPattern.commonExcuses.slice(0, 5).map((excuse, i) => (
              <View key={i} className="flex-row items-start mb-2">
                <Text className="text-fire-500 mr-2">"{i + 1}.</Text>
                <Text className="text-fire-200 flex-1 italic">"{excuse}"</Text>
              </View>
            ))
          ) : (
            <Text className="text-text-muted text-sm italic">
              No excuses recorded yet. Don't worry, you'll make some soon.
            </Text>
          )}
        </View>

        {/* Bet History Summary */}
        <View className="bg-surface border border-fire-800 rounded-xl p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="stats-chart" size={20} color="#ff2222" />
            <Text className="text-fire-300 font-bold ml-2">Betting Record</Text>
          </View>

          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-red-400 text-2xl font-bold">{betStats.devilWins}</Text>
              <Text className="text-text-muted text-xs">Devil Wins</Text>
            </View>
            <View className="items-center">
              <Text className="text-green-400 text-2xl font-bold">{betStats.userWins}</Text>
              <Text className="text-text-muted text-xs">Your Wins</Text>
            </View>
            <View className="items-center">
              <Text className="text-fire-200 text-2xl font-bold">
                {betStats.total > 0 ? `${betStats.userWinRate}%` : '-'}
              </Text>
              <Text className="text-text-muted text-xs">Win Rate</Text>
            </View>
          </View>

          {betStats.total > 0 && (
            <Text className="text-text-muted text-xs text-center mt-3">
              {betStats.userWinRate > 50
                ? "You're actually winning? This is unacceptable."
                : "Just as I predicted. Keep feeding my ego."}
            </Text>
          )}
        </View>

        {/* Achievements Preview */}
        <Pressable
          onPress={() => handleNavigation('/achievements')}
          className="bg-surface border border-fire-800 rounded-xl p-4 mb-4 active:bg-fire-900/50"
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Text className="text-xl mr-2">🏆</Text>
              <Text className="text-fire-300 font-bold">Achievements</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-fire-400 font-bold mr-2">{unlocked.length}/{totalAchievements}</Text>
              <Ionicons name="chevron-forward" size={16} color="#994444" />
            </View>
          </View>

          {/* Progress bar */}
          <View className="h-2 bg-fire-900 rounded-full overflow-hidden mb-3">
            <View
              className="h-full bg-fire-500"
              style={{ width: `${(unlocked.length / totalAchievements) * 100}%` }}
            />
          </View>

          {/* Next achievements */}
          {nextAchievements.length > 0 && (
            <View>
              <Text className="text-text-muted text-xs mb-2">Next to unlock:</Text>
              <View className="flex-row">
                {nextAchievements.slice(0, 3).map((achievement) => {
                  const progress = getProgress(achievement.id);
                  return (
                    <View key={achievement.id} className="flex-1 mr-2 last:mr-0">
                      <View className="bg-fire-900 rounded-lg p-2 items-center">
                        <Text className="text-xl mb-1">{achievement.icon}</Text>
                        <Text className="text-fire-200 text-xs font-medium text-center" numberOfLines={1}>
                          {achievement.title}
                        </Text>
                        <Text className="text-text-muted text-xs">{progress.percentage}%</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </Pressable>

        {/* Devil's Verdict */}
        <View className="bg-fire-900 border border-fire-600 rounded-xl p-4 mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="flame" size={20} color="#ff2222" />
            <Text className="text-fire-300 font-bold ml-2">Devil's Verdict</Text>
          </View>
          <Text className="text-fire-100 text-base italic">
            {completionPercent >= 70
              ? "You're one of the better ones. Don't let it go to your head - I'm still watching, waiting for you to slip."
              : completionPercent >= 40
              ? "Average. Unremarkable. Exactly the mediocrity I expected. Prove me wrong or don't - I'll be here either way."
              : "You're a masterclass in procrastination. I almost respect it. Almost. Now get back to work."}
          </Text>
        </View>

        {/* Account Section */}
        <View className="bg-surface border border-fire-800 rounded-xl p-4 mb-8">
          <View className="flex-row items-center mb-3">
            <Ionicons name="person-circle" size={20} color="#994444" />
            <Text className="text-fire-300 font-bold ml-2">Account</Text>
          </View>

          {user ? (
            <>
              <Text className="text-text-muted text-sm mb-3">
                Signed in as {user.email}
              </Text>
              <Pressable
                onPress={handleSignOut}
                disabled={isLoading}
                className="bg-fire-900 border border-fire-700 rounded-lg py-3 items-center active:bg-fire-800"
              >
                {isLoading ? (
                  <ActivityIndicator color="#ff2222" />
                ) : (
                  <View className="flex-row items-center">
                    <Ionicons name="log-out-outline" size={18} color="#ff4444" />
                    <Text className="text-red-400 font-semibold ml-2">
                      Escape Hell (Sign Out)
                    </Text>
                  </View>
                )}
              </Pressable>
            </>
          ) : (
            <>
              <Text className="text-text-muted text-sm mb-3">
                Local mode - your data is only on this device
              </Text>
              <Pressable
                onPress={() => router.push('/(auth)/login')}
                className="bg-fire-600 rounded-lg py-3 items-center active:bg-fire-700"
              >
                <View className="flex-row items-center">
                  <Ionicons name="log-in-outline" size={18} color="#ffffff" />
                  <Text className="text-white font-semibold ml-2">
                    Sign In to Sync
                  </Text>
                </View>
              </Pressable>
            </>
          )}
        </View>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
