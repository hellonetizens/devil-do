import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useAchievementStore, ACHIEVEMENTS } from '../stores/achievementStore';
import { haptics } from '../services/haptics';
import { notifications } from '../services/notifications';

export function AchievementToast() {
  const { pendingNotifications, markNotified } = useAchievementStore();
  const translateY = useSharedValue(-150);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  const currentNotification = pendingNotifications[0];
  const achievement = currentNotification
    ? ACHIEVEMENTS.find((a) => a.id === currentNotification)
    : null;

  useEffect(() => {
    if (achievement) {
      // Trigger haptics
      haptics.celebration();

      // Send push notification too
      notifications.sendAchievementUnlocked(achievement.title, achievement.icon);

      // Animate in
      translateY.value = withSpring(0, { damping: 15 });
      scale.value = withSpring(1, { damping: 10 });
      opacity.value = withTiming(1, { duration: 200 });

      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        dismissToast();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [achievement]);

  const dismissToast = () => {
    translateY.value = withTiming(-150, { duration: 300 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      if (currentNotification) {
        runOnJS(markNotified)(currentNotification);
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  if (!achievement) return null;

  return (
    <Animated.View
      style={[animatedStyle]}
      className="absolute top-12 left-4 right-4 z-50"
    >
      <Pressable onPress={dismissToast}>
        <View className="bg-fire-900 border-2 border-fire-500 rounded-2xl p-4 shadow-lg">
          <View className="flex-row items-center">
            {/* Icon with glow effect */}
            <View className="w-16 h-16 rounded-xl bg-fire-600 items-center justify-center mr-4">
              <Text className="text-4xl">{achievement.icon}</Text>
            </View>

            {/* Content */}
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="text-yellow-400 text-xs font-bold uppercase tracking-wider">
                  Achievement Unlocked!
                </Text>
                <Text className="ml-2">🏆</Text>
              </View>
              <Text className="text-fire-100 font-bold text-lg">
                {achievement.title}
              </Text>
              <Text className="text-fire-300 text-sm">
                {achievement.description}
              </Text>
            </View>
          </View>

          {/* Sparkle decoration */}
          <View className="absolute -top-2 -right-2">
            <Text className="text-2xl">✨</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
