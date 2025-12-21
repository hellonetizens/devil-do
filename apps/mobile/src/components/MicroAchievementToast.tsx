import React, { useEffect } from 'react';
import { Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useMicroAchievementStore, MicroAchievement } from '../stores/microAchievementStore';

const COLORS = {
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  blue: 'bg-blue-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
};

const BORDER_COLORS = {
  yellow: 'border-yellow-300',
  green: 'border-green-300',
  purple: 'border-purple-300',
  blue: 'border-blue-300',
  orange: 'border-orange-300',
  red: 'border-red-300',
};

export function MicroAchievementToast() {
  const { current, dismiss } = useMicroAchievementStore();

  const translateY = useSharedValue(-100);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(-5);

  useEffect(() => {
    if (current) {
      // Quick, punchy entrance
      translateY.value = withSpring(0, { damping: 12, stiffness: 200 });
      scale.value = withSequence(
        withSpring(1.1, { damping: 8 }),
        withSpring(1, { damping: 12 })
      );
      opacity.value = withTiming(1, { duration: 150 });
      rotate.value = withSequence(
        withTiming(3, { duration: 100 }),
        withTiming(-3, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    } else {
      translateY.value = -100;
      scale.value = 0.8;
      opacity.value = 0;
    }
  }, [current]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  if (!current) return null;

  return (
    <Animated.View
      style={animatedStyle}
      className="absolute top-14 left-4 right-4 z-50"
    >
      <Pressable onPress={dismiss}>
        <Animated.View
          className={`${COLORS[current.color]} rounded-2xl p-4 flex-row items-center border-2 ${BORDER_COLORS[current.color]} shadow-lg`}
        >
          {/* Emoji */}
          <Text className="text-4xl mr-3">{current.emoji}</Text>

          {/* Text */}
          <Animated.View className="flex-1">
            <Text className="text-white font-black text-lg">
              {current.title}
            </Text>
            <Text className="text-white/80 text-sm">
              {current.subtitle}
            </Text>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// Mini version that appears inline
export function MicroAchievementBadge({ achievement }: { achievement: MicroAchievement }) {
  return (
    <Animated.View
      className={`${COLORS[achievement.color]} rounded-full px-3 py-1 flex-row items-center`}
    >
      <Text className="text-base mr-1">{achievement.emoji}</Text>
      <Text className="text-white font-bold text-xs">{achievement.title}</Text>
    </Animated.View>
  );
}
