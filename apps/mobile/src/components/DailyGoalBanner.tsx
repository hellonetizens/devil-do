import React, { useEffect } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { useStreakStore } from '../stores/streakStore';
import { haptics } from '../services/haptics';

// Only use Reanimated/SVG on native
let Animated: any = { View };
let Svg: any = null;
let Circle: any = null;
let G: any = null;
let AnimatedCircle: any = null;
let useSharedValue: any = () => ({ value: 0 });
let useAnimatedStyle: any = () => ({});
let withSpring: any = (v: any) => v;
let withRepeat: any = (v: any) => v;
let withSequence: any = (v: any) => v;
let withTiming: any = (v: any) => v;
let Easing: any = { inOut: () => {} };

const isWeb = Platform.OS === 'web';

if (!isWeb) {
  const reanimated = require('react-native-reanimated');
  Animated = reanimated.default;
  useSharedValue = reanimated.useSharedValue;
  useAnimatedStyle = reanimated.useAnimatedStyle;
  withSpring = reanimated.withSpring;
  withRepeat = reanimated.withRepeat;
  withSequence = reanimated.withSequence;
  withTiming = reanimated.withTiming;
  Easing = reanimated.Easing;
  const svg = require('react-native-svg');
  Svg = svg.default;
  Circle = svg.Circle;
  G = svg.G;
  AnimatedCircle = Animated.createAnimatedComponent(Circle);
}

interface DailyGoalBannerProps {
  onStreakPress?: () => void;
  onBadDayPress?: () => void;
}

export function DailyGoalBanner({ onStreakPress, onBadDayPress }: DailyGoalBannerProps) {
  const {
    currentStreak,
    freezesRemaining,
    isBadDayMode,
    tasksCompletedToday,
    dailyGoalMetToday,
    getEffectiveDailyGoal,
    getDailyProgress,
    activateBadDayMode,
    deactivateBadDayMode,
    checkAndResetDaily,
    checkStreakStatus,
  } = useStreakStore();

  // Check and reset daily on mount
  useEffect(() => {
    checkAndResetDaily();
  }, []);

  const effectiveGoal = getEffectiveDailyGoal();
  const progress = getDailyProgress();
  const streakStatus = checkStreakStatus();

  // Animation values
  const progressAnimation = useSharedValue(0);
  const fireScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    progressAnimation.value = withSpring(progress / 100, { damping: 15 });
  }, [progress]);

  useEffect(() => {
    if (currentStreak > 0) {
      // Pulsing fire animation
      fireScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [currentStreak]);

  useEffect(() => {
    if (dailyGoalMetToday) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0.5, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [dailyGoalMetToday]);

  const fireStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fireScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handleBadDayToggle = () => {
    if (isBadDayMode) {
      deactivateBadDayMode();
      haptics.medium();
    } else {
      activateBadDayMode();
      haptics.light();
    }
    onBadDayPress?.();
  };

  // Progress ring dimensions
  const size = 80;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <View className="bg-surface border border-fire-800 rounded-xl p-4 mb-4">
      <View className="flex-row items-center">
        {/* Progress Ring */}
        <View className="relative mr-4">
          {!isWeb && Svg && G && Circle ? (
            <Svg width={size} height={size}>
              <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                {/* Background circle */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#3d1a1a"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Progress circle */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={dailyGoalMetToday ? '#22c55e' : '#f97316'}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </G>
            </Svg>
          ) : (
            /* Web fallback - simple progress circle */
            <View
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: strokeWidth,
                borderColor: dailyGoalMetToday ? '#22c55e' : '#f97316',
                backgroundColor: '#3d1a1a',
              }}
            />
          )}
          {/* Center content */}
          <View className="absolute inset-0 items-center justify-center">
            <Text className="text-white font-black text-lg">
              {tasksCompletedToday}
            </Text>
            <Text className="text-fire-400 text-xs">/{effectiveGoal}</Text>
          </View>
        </View>

        {/* Info section */}
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-fire-100 font-bold text-base">
              Daily Goal {isBadDayMode && '(Reduced)'}
            </Text>
            {dailyGoalMetToday && (
              <Text className="ml-2 text-green-400 text-sm">✓ Complete!</Text>
            )}
          </View>

          <Text className="text-fire-400 text-sm mb-2">
            {dailyGoalMetToday
              ? "The devil's impressed... barely."
              : tasksCompletedToday === 0
              ? "Haven't started yet? Pathetic."
              : `${effectiveGoal - tasksCompletedToday} more to avoid shame.`}
          </Text>

          {/* Bad Day Mode Toggle */}
          <Pressable
            onPress={handleBadDayToggle}
            className={`self-start px-3 py-1 rounded-full ${
              isBadDayMode ? 'bg-purple-600' : 'bg-fire-800'
            }`}
          >
            <Text className={`text-xs font-medium ${isBadDayMode ? 'text-white' : 'text-fire-300'}`}>
              {isBadDayMode ? '😢 Bad Day Mode ON' : '💪 Having a tough day?'}
            </Text>
          </Pressable>
        </View>

        {/* Streak section */}
        <Pressable onPress={onStreakPress} className="items-center">
          <Animated.View style={fireStyle}>
            <Text className="text-3xl">
              {streakStatus === 'broken' ? '💀' : streakStatus === 'at_risk' ? '⚠️' : '🔥'}
            </Text>
          </Animated.View>
          <Text className="text-white font-black text-xl">{currentStreak}</Text>
          <Text className="text-fire-400 text-xs">streak</Text>

          {/* Freeze indicator */}
          {freezesRemaining > 0 && (
            <View className="flex-row mt-1">
              {Array.from({ length: freezesRemaining }).map((_, i) => (
                <Text key={i} className="text-xs">❄️</Text>
              ))}
            </View>
          )}
        </Pressable>
      </View>

      {/* Streak at risk warning */}
      {streakStatus === 'at_risk' && !dailyGoalMetToday && (
        <View className="mt-3 bg-yellow-900/50 rounded-lg p-2 border border-yellow-600">
          <Text className="text-yellow-400 text-sm text-center font-medium">
            ⚠️ Complete your goal to keep your {currentStreak}-day streak!
          </Text>
        </View>
      )}

      {/* Goal met celebration */}
      {dailyGoalMetToday && (
        <Animated.View
          style={glowStyle}
          className="mt-3 bg-green-900/30 rounded-lg p-2 border border-green-600"
        >
          <Text className="text-green-400 text-sm text-center font-medium">
            🎉 Daily goal crushed! The devil is mildly annoyed.
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

// Compact version for headers
export function DailyGoalCompact() {
  const { tasksCompletedToday, getEffectiveDailyGoal, currentStreak, dailyGoalMetToday } = useStreakStore();
  const effectiveGoal = getEffectiveDailyGoal();

  return (
    <View className="flex-row items-center">
      <View className="flex-row items-center mr-3">
        <Text className="text-2xl mr-1">🔥</Text>
        <Text className="text-white font-bold">{currentStreak}</Text>
      </View>
      <View className="bg-fire-800 rounded-full px-3 py-1">
        <Text className={`font-bold ${dailyGoalMetToday ? 'text-green-400' : 'text-fire-100'}`}>
          {tasksCompletedToday}/{effectiveGoal} ✓
        </Text>
      </View>
    </View>
  );
}
