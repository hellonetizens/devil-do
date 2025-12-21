import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useXPStore, LEVEL_TITLES } from '../stores/xpStore';
import { haptics } from '../services/haptics';

export function LevelUpToast() {
  const { pendingLevelUp, clearLevelUpNotification } = useXPStore();

  const translateY = useSharedValue(-200);
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (pendingLevelUp) {
      // Epic entrance animation
      haptics.celebration();

      translateY.value = withSpring(0, { damping: 12, stiffness: 100 });
      scale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );
      opacity.value = withTiming(1, { duration: 300 });
      rotate.value = withSequence(
        withTiming(-5, { duration: 100 }),
        withTiming(5, { duration: 100 }),
        withTiming(-3, { duration: 100 }),
        withTiming(3, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        dismissToast();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [pendingLevelUp]);

  const dismissToast = () => {
    translateY.value = withTiming(-200, { duration: 300 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(clearLevelUpNotification)();
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  if (!pendingLevelUp) return null;

  const title = LEVEL_TITLES[pendingLevelUp] || 'Unknown';

  return (
    <Animated.View
      style={[animatedStyle]}
      className="absolute top-16 left-4 right-4 z-50"
    >
      <Pressable onPress={dismissToast}>
        <View className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl p-1">
          <View className="bg-fire-900 rounded-xl p-5 border-2 border-yellow-500">
            {/* Sparkles */}
            <View className="absolute -top-3 left-1/4">
              <Text className="text-2xl">✨</Text>
            </View>
            <View className="absolute -top-2 right-1/4">
              <Text className="text-xl">⭐</Text>
            </View>
            <View className="absolute -bottom-2 left-1/3">
              <Text className="text-xl">🌟</Text>
            </View>

            {/* Content */}
            <View className="items-center">
              <Text className="text-yellow-400 text-sm font-bold uppercase tracking-widest mb-1">
                Level Up!
              </Text>

              <View className="flex-row items-center mb-2">
                <Text className="text-5xl mr-3">🔥</Text>
                <View>
                  <Text className="text-white text-4xl font-black">
                    Level {pendingLevelUp}
                  </Text>
                  <Text className="text-yellow-300 text-lg font-bold">
                    {title}
                  </Text>
                </View>
              </View>

              <Text className="text-fire-200 text-center text-sm mt-2">
                {pendingLevelUp <= 5
                  ? "The devil is... mildly impressed."
                  : pendingLevelUp <= 10
                  ? "Okay, you're getting somewhere."
                  : pendingLevelUp <= 15
                  ? "Fine, I'll admit you're good."
                  : "You're actually beating me at my own game!"}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
