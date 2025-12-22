import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusStore } from '../../src/stores/focusStore';
import { useDevilStore } from '../../src/stores/devilStore';
import { colors } from '../../src/design/tokens';
import { DevilMascot } from '../../src/design/DevilMascot';

// Conditional imports for native-only features
let Svg: any = null;
let Circle: any = null;
let MotiView: any = View;
let MotiPressable: any = Pressable;
const isWeb = Platform.OS === 'web';

if (!isWeb) {
  const svg = require('react-native-svg');
  Svg = svg.default;
  Circle = svg.Circle;
  const moti = require('moti');
  MotiView = moti.MotiView;
  MotiPressable = moti.MotiPressable;
}

// Web-safe animated button
function AnimatedButton({ onPress, style, children, disabled }: any) {
  if (isWeb) {
    return (
      <Pressable onPress={onPress} style={style} disabled={disabled}>
        {children}
      </Pressable>
    );
  }
  return (
    <MotiPressable
      onPress={onPress}
      disabled={disabled}
      animate={({ pressed }: any) => ({ scale: pressed ? 0.97 : 1 })}
      transition={{ type: 'timing', duration: 100 }}
      style={style}
    >
      {children}
    </MotiPressable>
  );
}

export default function FocusScreen() {
  const insets = useSafeAreaInsets();
  const {
    phase,
    timeRemaining,
    totalTime,
    isRunning,
    sessionsToday,
    focusStreak,
    focusDuration,
    startFocus,
    startBreak,
    pause,
    resume,
    abandon,
    tick,
  } = useFocusStore();

  const { triggerShame } = useDevilStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => tick(), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  // Trigger shame on session complete
  useEffect(() => {
    if (phase === 'idle' && !isRunning && timeRemaining === 0) {
      triggerShame('task_completed', { streakCount: focusStreak });
    }
  }, [phase, isRunning, timeRemaining]);

  const handleAbandon = () => {
    abandon();
    triggerShame('session_abandoned');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalTime > 0 ? timeRemaining / totalTime : 1;

  // Circle progress
  const size = 280;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const getMascotMood = () => {
    if (phase === 'break') return 'sleeping';
    if (!isRunning && phase === 'idle') return 'idle';
    if (isRunning && timeRemaining < 60) return 'excited';
    if (isRunning) return 'thinking';
    return 'idle';
  };

  const getPhaseMessage = () => {
    if (phase === 'break') return "Fine, take your break. You've earned it... barely.";
    if (phase === 'focus' && isRunning) return "Focus. No distractions. I'm watching.";
    if (phase === 'focus' && !isRunning) return "Paused? Already? Pathetic.";
    return "Ready to prove you can actually focus?";
  };

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 py-4">
        <Text className="text-white font-semibold text-xl">Focus</Text>
      </View>

      {/* Main Timer Area */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Timer Ring */}
        <View className="relative items-center justify-center">
          {Platform.OS !== 'web' && Svg && Circle ? (
            <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
              {/* Background circle */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={colors.gray[900]}
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Progress circle */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={phase === 'break' ? colors.success : colors.pop.DEFAULT}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                opacity={isRunning ? 1 : 0.5}
              />
            </Svg>
          ) : (
            /* Web fallback - simple circle border */
            <View
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: strokeWidth,
                borderColor: phase === 'break' ? colors.success : colors.pop.DEFAULT,
                opacity: isRunning ? 1 : 0.5,
              }}
            />
          )}

          {/* Timer Content */}
          <View className="absolute items-center">
            <Text className="text-gray-500 text-sm font-medium mb-2">
              {phase === 'focus' ? 'FOCUS' : phase === 'break' ? 'BREAK' : 'READY'}
            </Text>
            <Text className="text-white text-6xl font-bold tracking-tight">
              {formatTime(timeRemaining)}
            </Text>
            {phase !== 'idle' && (
              <Text className="text-gray-500 text-sm mt-2">
                {isRunning ? 'tap to pause' : 'paused'}
              </Text>
            )}
          </View>
        </View>

        {/* Devil Message */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="mt-8 bg-gray-900 rounded-2xl p-4 border border-gray-800 mx-4"
        >
          <Text className="text-gray-400 text-center">
            {getPhaseMessage()}
          </Text>
        </MotiView>
      </View>

      {/* Controls */}
      <View className="px-6 pb-8" style={{ paddingBottom: Math.max(insets.bottom + 16, 24) }}>
        {phase === 'idle' ? (
          <AnimatedButton
            onPress={() => startFocus()}
            style={{
              backgroundColor: colors.pop.DEFAULT,
              paddingVertical: 18,
              borderRadius: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="play" size={24} color={colors.white} />
            <Text className="text-white font-semibold text-lg ml-2">Start Focus</Text>
          </AnimatedButton>
        ) : (
          <View className="flex-row gap-3">
            {isRunning ? (
              <AnimatedButton
                onPress={pause}
                style={{
                  flex: 1,
                  backgroundColor: colors.gray[900],
                  paddingVertical: 18,
                  borderRadius: 16,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.gray[800],
                }}
              >
                <Ionicons name="pause" size={24} color={colors.white} />
              </AnimatedButton>
            ) : (
              <AnimatedButton
                onPress={resume}
                style={{
                  flex: 1,
                  backgroundColor: colors.pop.DEFAULT,
                  paddingVertical: 18,
                  borderRadius: 16,
                  alignItems: 'center',
                }}
              >
                <Ionicons name="play" size={24} color={colors.white} />
              </AnimatedButton>
            )}
            <AnimatedButton
              onPress={handleAbandon}
              style={{
                flex: 1,
                backgroundColor: colors.gray[900],
                paddingVertical: 18,
                borderRadius: 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.gray[800],
              }}
            >
              <Text className="text-gray-400 font-medium">Give Up</Text>
            </AnimatedButton>
          </View>
        )}

        {/* Break button */}
        {phase === 'idle' && sessionsToday > 0 && (
          <Pressable
            onPress={startBreak}
            className="mt-3 py-4 items-center"
          >
            <Text className="text-gray-500">Take a break</Text>
          </Pressable>
        )}
      </View>

      {/* Stats Bar */}
      <View
        className="flex-row justify-around bg-gray-900 border-t border-gray-800 py-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="items-center">
          <Text className="text-white font-bold text-2xl">{sessionsToday}</Text>
          <Text className="text-gray-500 text-xs">TODAY</Text>
        </View>
        <View className="w-px bg-gray-800" />
        <View className="items-center">
          <Text className="text-white font-bold text-2xl">{focusStreak}</Text>
          <Text className="text-gray-500 text-xs">STREAK</Text>
        </View>
        <View className="w-px bg-gray-800" />
        <View className="items-center">
          <Text className="text-white font-bold text-2xl">{focusDuration}</Text>
          <Text className="text-gray-500 text-xs">MINUTES</Text>
        </View>
      </View>
    </View>
  );
}
