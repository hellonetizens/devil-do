import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAchievementStore, ACHIEVEMENTS, Achievement } from '../src/stores/achievementStore';

type Category = Achievement['category'] | 'all';

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '🏆' },
  { value: 'tasks', label: 'Tasks', icon: '✅' },
  { value: 'streaks', label: 'Streaks', icon: '🔥' },
  { value: 'bets', label: 'Bets', icon: '🎰' },
  { value: 'focus', label: 'Focus', icon: '🎯' },
  { value: 'special', label: 'Secret', icon: '🔮' },
];

export default function AchievementsScreen() {
  const { unlocked, isUnlocked, getProgress } = useAchievementStore();
  const [category, setCategory] = useState<Category>('all');

  const filteredAchievements = ACHIEVEMENTS.filter((a) => {
    if (category === 'all') return true;
    return a.category === category;
  });

  const unlockedCount = unlocked.length;
  const totalCount = ACHIEVEMENTS.filter(a => !a.secret).length;
  const secretsUnlocked = unlocked.filter(u => ACHIEVEMENTS.find(a => a.id === u.id)?.secret).length;

  const renderAchievement = (achievement: Achievement) => {
    const achieved = isUnlocked(achievement.id);
    const progress = getProgress(achievement.id);
    const isSecret = achievement.secret && !achieved;

    return (
      <View
        key={achievement.id}
        className={`mb-3 rounded-xl border overflow-hidden ${
          achieved
            ? 'bg-fire-900/50 border-fire-500'
            : 'bg-surface border-fire-800'
        }`}
      >
        <View className="flex-row p-4">
          {/* Icon */}
          <View
            className={`w-14 h-14 rounded-xl items-center justify-center mr-4 ${
              achieved ? 'bg-fire-600' : 'bg-fire-900'
            }`}
          >
            <Text className="text-3xl">{isSecret ? '❓' : achievement.icon}</Text>
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text
                className={`font-bold text-base ${
                  achieved ? 'text-fire-100' : isSecret ? 'text-fire-600' : 'text-fire-300'
                }`}
              >
                {isSecret ? '???' : achievement.title}
              </Text>
              {achieved && (
                <View className="ml-2 bg-green-500/20 px-2 py-0.5 rounded">
                  <Text className="text-green-400 text-xs font-bold">UNLOCKED</Text>
                </View>
              )}
            </View>

            <Text className={`text-sm mt-1 ${achieved ? 'text-fire-200' : 'text-text-muted'}`}>
              {isSecret ? 'Complete a secret challenge to reveal' : achievement.description}
            </Text>

            {/* Progress bar */}
            {!achieved && !isSecret && (
              <View className="mt-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-text-muted text-xs">Progress</Text>
                  <Text className="text-fire-400 text-xs font-bold">
                    {progress.current}/{progress.required}
                  </Text>
                </View>
                <View className="h-2 bg-fire-900 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-fire-500 rounded-full"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </View>
              </View>
            )}

            {/* Unlock date */}
            {achieved && (
              <View className="flex-row items-center mt-2">
                <Ionicons name="checkmark-circle" size={14} color="#44ff44" />
                <Text className="text-green-400 text-xs ml-1">
                  Unlocked {new Date(unlocked.find(u => u.id === achievement.id)?.unlockedAt || '').toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#ff2222" />
        </Pressable>
        <Text className="text-fire-100 text-2xl font-bold flex-1">Achievements</Text>
        <View className="bg-fire-600 rounded-full px-3 py-1">
          <Text className="text-white font-bold">{unlockedCount}/{totalCount}</Text>
        </View>
      </View>

      {/* Summary */}
      <View className="px-4 py-3">
        <View className="bg-surface border border-fire-800 rounded-xl p-4">
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-fire-100 text-2xl font-bold">{unlockedCount}</Text>
              <Text className="text-text-muted text-xs">Unlocked</Text>
            </View>
            <View className="w-px bg-fire-700" />
            <View className="items-center">
              <Text className="text-fire-100 text-2xl font-bold">{totalCount - unlockedCount}</Text>
              <Text className="text-text-muted text-xs">Remaining</Text>
            </View>
            <View className="w-px bg-fire-700" />
            <View className="items-center">
              <Text className="text-purple-400 text-2xl font-bold">{secretsUnlocked}</Text>
              <Text className="text-text-muted text-xs">Secrets</Text>
            </View>
          </View>

          {/* Overall progress */}
          <View className="mt-4">
            <View className="h-3 bg-fire-900 rounded-full overflow-hidden">
              <View
                className="h-full bg-gradient-to-r from-fire-500 to-yellow-500"
                style={{ width: `${(unlockedCount / totalCount) * 100}%`, backgroundColor: '#ff6600' }}
              />
            </View>
            <Text className="text-text-muted text-xs text-center mt-2">
              {Math.round((unlockedCount / totalCount) * 100)}% Complete
            </Text>
          </View>
        </View>
      </View>

      {/* Category filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-2"
        contentContainerStyle={{ gap: 8 }}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.value}
            onPress={() => setCategory(cat.value)}
            className={`flex-row items-center px-4 py-2 rounded-full ${
              category === cat.value
                ? 'bg-fire-600'
                : 'bg-surface border border-fire-800'
            }`}
          >
            <Text className="mr-2">{cat.icon}</Text>
            <Text
              className={`font-medium ${
                category === cat.value ? 'text-white' : 'text-fire-300'
              }`}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Achievements list */}
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Unlocked first */}
        {filteredAchievements
          .filter((a) => isUnlocked(a.id))
          .map(renderAchievement)}

        {/* Then locked (non-secret) */}
        {filteredAchievements
          .filter((a) => !isUnlocked(a.id) && !a.secret)
          .map(renderAchievement)}

        {/* Then secret */}
        {(category === 'all' || category === 'special') &&
          filteredAchievements
            .filter((a) => !isUnlocked(a.id) && a.secret)
            .map(renderAchievement)}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
