import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Devil, Card, Button } from '../../src/components';
import { useDevilStore } from '../../src/stores/devilStore';
import { useFocusStore } from '../../src/stores/focusStore';
import { useTaskStore } from '../../src/stores/taskStore';
import type { ShameLevel } from '../../src/types';

const SHAME_LEVELS: { level: ShameLevel; label: string; description: string }[] = [
  { level: 'gentle', label: 'Gentle', description: 'Light teasing, supportive' },
  { level: 'snarky', label: 'Snarky', description: 'Passive-aggressive wit' },
  { level: 'savage', label: 'Savage', description: 'No mercy, full roast' },
];

const COSTUMES = [
  { id: 'default', name: 'Classic Devil', emoji: '😈', unlocked: true },
  { id: 'angel', name: 'Fallen Angel', emoji: '😇', unlocked: false },
  { id: 'business', name: 'Business Demon', emoji: '🤵', unlocked: false },
  { id: 'party', name: 'Party Devil', emoji: '🥳', unlocked: false },
  { id: 'sleepy', name: 'Sleepy Imp', emoji: '😴', unlocked: false },
  { id: 'angry', name: 'Rage Mode', emoji: '👿', unlocked: false },
];

export default function ProfileScreen() {
  const {
    preferences,
    updatePreferences,
    totalShamesReceived,
    totalPraisesReceived,
    unlockedCostumes,
    currentCostume,
    setCostume,
  } = useDevilStore();

  const { bestFocusStreak, totalFocusMinutesToday } = useFocusStore();
  const { tasks } = useTaskStore();

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Devil with stats */}
        <View className="items-center mb-6">
          <Devil size="lg" showMessage={true} />
        </View>

        {/* Stats */}
        <Card className="mb-4">
          <Text className="text-text-primary font-bold text-lg mb-4">Your Stats</Text>
          <View className="flex-row flex-wrap">
            <View className="w-1/2 mb-4">
              <Text className="text-3xl font-bold text-accent">{completedTasks}</Text>
              <Text className="text-text-muted text-sm">Tasks Completed</Text>
            </View>
            <View className="w-1/2 mb-4">
              <Text className="text-3xl font-bold text-warning">{bestFocusStreak}</Text>
              <Text className="text-text-muted text-sm">Best Focus Streak</Text>
            </View>
            <View className="w-1/2">
              <Text className="text-3xl font-bold text-danger">{totalShamesReceived}</Text>
              <Text className="text-text-muted text-sm">Shames Received</Text>
            </View>
            <View className="w-1/2">
              <Text className="text-3xl font-bold text-success">{totalPraisesReceived}</Text>
              <Text className="text-text-muted text-sm">Rare Praises</Text>
            </View>
          </View>
        </Card>

        {/* Shame Level Selector */}
        <Card className="mb-4">
          <Text className="text-text-primary font-bold text-lg mb-4">
            Shame Intensity
          </Text>
          <View className="flex-row">
            {SHAME_LEVELS.map((item) => (
              <Pressable
                key={item.level}
                onPress={() => updatePreferences({ shame_level: item.level })}
                className={`
                  flex-1 p-3 rounded-xl mx-1 items-center
                  ${preferences.shame_level === item.level ? 'bg-accent' : 'bg-surfaceLight'}
                `}
              >
                <Text
                  className={`font-medium ${
                    preferences.shame_level === item.level
                      ? 'text-white'
                      : 'text-text-secondary'
                  }`}
                >
                  {item.label}
                </Text>
                <Text
                  className={`text-xs mt-1 text-center ${
                    preferences.shame_level === item.level
                      ? 'text-white/80'
                      : 'text-text-muted'
                  }`}
                >
                  {item.description}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Devil Costumes */}
        <Card className="mb-4">
          <Text className="text-text-primary font-bold text-lg mb-4">
            Devil Costumes
          </Text>
          <View className="flex-row flex-wrap -mx-1">
            {COSTUMES.map((costume) => {
              const isUnlocked = unlockedCostumes.includes(costume.id);
              const isSelected = currentCostume === costume.id;

              return (
                <Pressable
                  key={costume.id}
                  onPress={() => isUnlocked && setCostume(costume.id)}
                  className={`
                    w-1/3 p-1
                  `}
                >
                  <View
                    className={`
                      items-center p-3 rounded-xl
                      ${isSelected ? 'bg-accent' : 'bg-surfaceLight'}
                      ${!isUnlocked ? 'opacity-40' : ''}
                    `}
                  >
                    <Text style={{ fontSize: 32 }}>
                      {isUnlocked ? costume.emoji : '🔒'}
                    </Text>
                    <Text
                      className={`text-xs mt-1 text-center ${
                        isSelected ? 'text-white' : 'text-text-muted'
                      }`}
                    >
                      {costume.name}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <Text className="text-text-muted text-xs text-center mt-3">
            Complete achievements to unlock more costumes!
          </Text>
        </Card>

        {/* Focus Settings */}
        <Card className="mb-4">
          <Text className="text-text-primary font-bold text-lg mb-4">
            Focus Timer Settings
          </Text>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-text-secondary">Focus Duration</Text>
            <Text className="text-text-primary font-medium">
              {preferences.focus_duration} min
            </Text>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-text-secondary">Break Duration</Text>
            <Text className="text-text-primary font-medium">
              {preferences.break_duration} min
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-text-secondary">Daily Goal</Text>
            <Text className="text-text-primary font-medium">
              {preferences.daily_goal} tasks
            </Text>
          </View>
        </Card>

        {/* Pro Upgrade Banner */}
        <Card className="mb-8 bg-gradient-to-r from-devil-purple to-devil-red">
          <View className="flex-row items-center">
            <Text className="text-4xl mr-4">👿</Text>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">Unlock Savage Mode</Text>
              <Text className="text-white/80 text-sm">
                Get AI-powered personalized roasts, unlimited features, and more.
              </Text>
            </View>
          </View>
          <Button
            onPress={() => {}}
            variant="secondary"
            fullWidth
            className="mt-4"
          >
            Upgrade to Pro - $6.99/mo
          </Button>
        </Card>
      </ScrollView>
    </View>
  );
}
