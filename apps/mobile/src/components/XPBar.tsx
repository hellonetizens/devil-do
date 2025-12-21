import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useXPStore } from '../stores/xpStore';

interface XPBarProps {
  compact?: boolean;
  onPress?: () => void;
}

export function XPBar({ compact = false, onPress }: XPBarProps) {
  const { level, totalXP, todayXP, getXPProgress, getXPToNextLevel, getLevelTitle } = useXPStore();

  const progress = getXPProgress();
  const xpToNext = getXPToNextLevel();
  const title = getLevelTitle();

  const progressWidth = useSharedValue(progress);

  React.useEffect(() => {
    progressWidth.value = withSpring(progress, { damping: 15 });
  }, [progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  if (compact) {
    return (
      <Pressable onPress={onPress} className="flex-row items-center">
        <View className="w-8 h-8 rounded-full bg-fire-600 items-center justify-center mr-2">
          <Text className="text-white font-black text-sm">{level}</Text>
        </View>
        <View className="flex-1">
          <View className="h-2 bg-fire-900 rounded-full overflow-hidden">
            <Animated.View
              style={progressStyle}
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
            />
          </View>
        </View>
        {todayXP > 0 && (
          <Text className="text-yellow-400 text-xs font-bold ml-2">+{todayXP}</Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className="bg-surface border border-fire-800 rounded-xl p-4"
    >
      <View className="flex-row items-center mb-3">
        {/* Level badge */}
        <View className="w-14 h-14 rounded-xl bg-fire-600 items-center justify-center mr-4 border-2 border-yellow-500">
          <Text className="text-white font-black text-xl">{level}</Text>
        </View>

        {/* Level info */}
        <View className="flex-1">
          <Text className="text-fire-100 font-bold text-lg">{title}</Text>
          <Text className="text-fire-400 text-sm">
            {xpToNext > 0 ? `${xpToNext} XP to next level` : 'Max level!'}
          </Text>
        </View>

        {/* Total XP */}
        <View className="items-end">
          <Text className="text-yellow-400 font-bold text-lg">{totalXP}</Text>
          <Text className="text-fire-400 text-xs">Total XP</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View className="h-3 bg-fire-900 rounded-full overflow-hidden">
        <Animated.View
          style={progressStyle}
          className="h-full rounded-full"
        >
          <View className="flex-1 bg-yellow-500" />
        </Animated.View>
      </View>

      {/* Today's XP */}
      {todayXP > 0 && (
        <View className="flex-row justify-between mt-2">
          <Text className="text-text-muted text-xs">Today's progress</Text>
          <Text className="text-yellow-400 text-xs font-bold">+{todayXP} XP</Text>
        </View>
      )}
    </Pressable>
  );
}

// Mini XP popup for when XP is earned
export function XPPopup({ amount, visible }: { amount: number; visible: boolean }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible && amount !== 0) {
      translateY.value = 0;
      opacity.value = 1;

      translateY.value = withSequence(
        withTiming(-30, { duration: 500 }),
        withTiming(-50, { duration: 500 })
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(1, { duration: 700 }),
        withTiming(0, { duration: 200 })
      );
    }
  }, [visible, amount]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible || amount === 0) return null;

  return (
    <Animated.View style={animatedStyle} className="absolute -top-8 right-0">
      <Text
        className={`font-black text-lg ${amount > 0 ? 'text-yellow-400' : 'text-red-400'}`}
      >
        {amount > 0 ? '+' : ''}{amount} XP
      </Text>
    </Animated.View>
  );
}
