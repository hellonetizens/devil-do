import React, { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useFocusStore } from '../stores/focusStore';
import { useDevilStore } from '../stores/devilStore';
import { Button } from './Button';
import { Devil } from './Devil';

export function FocusTimer() {
  const {
    phase,
    timeRemaining,
    totalTime,
    isRunning,
    sessionsToday,
    focusStreak,
    startFocus,
    startBreak,
    pause,
    resume,
    abandon,
    tick,
  } = useFocusStore();

  const { triggerShame } = useDevilStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progress = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(timeRemaining / totalTime, { duration: 1000 });
  }, [timeRemaining, totalTime]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, tick]);

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

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const getPhaseColor = () => {
    switch (phase) {
      case 'focus': return '#ff2222';
      case 'break': return '#44ff44';
      default: return '#994444';
    }
  };

  const getPhaseLabel = () => {
    switch (phase) {
      case 'focus': return 'FOCUS TIME';
      case 'break': return 'BREAK TIME';
      default: return 'READY TO BURN?';
    }
  };

  return (
    <View className="items-center p-6">
      <Devil size="lg" showMessage={true} />

      <View className="mt-8 items-center">
        <View className="flex-row items-center mb-2">
          <Ionicons
            name={phase === 'focus' ? 'flame' : phase === 'break' ? 'cafe' : 'hourglass'}
            size={24}
            color={getPhaseColor()}
          />
          <Text className="text-fire-300 text-lg ml-2 font-bold tracking-wider">
            {getPhaseLabel()}
          </Text>
        </View>

        <Text
          className="text-7xl font-bold tracking-wider"
          style={{ color: getPhaseColor() }}
        >
          {formatTime(timeRemaining)}
        </Text>

        {/* Progress bar */}
        <View className="w-72 h-3 bg-fire-900 rounded-full mt-6 overflow-hidden border border-fire-700">
          <Animated.View
            style={[progressStyle, { backgroundColor: getPhaseColor() }]}
            className="h-full rounded-full"
          />
        </View>
      </View>

      {/* Controls */}
      <View className="flex-row mt-8 gap-4">
        {phase === 'idle' ? (
          <Button onPress={() => startFocus()} size="lg">
            <View className="flex-row items-center">
              <Ionicons name="flame" size={24} color="#ffffff" />
              <Text className="text-white font-bold text-lg ml-2">Start Focus</Text>
            </View>
          </Button>
        ) : (
          <>
            {isRunning ? (
              <Button onPress={pause} variant="secondary" size="lg">
                <View className="flex-row items-center">
                  <Ionicons name="pause" size={24} color="#ff9999" />
                  <Text className="text-fire-100 font-bold ml-2">Pause</Text>
                </View>
              </Button>
            ) : (
              <Button onPress={resume} size="lg">
                <View className="flex-row items-center">
                  <Ionicons name="play" size={24} color="#ffffff" />
                  <Text className="text-white font-bold ml-2">Resume</Text>
                </View>
              </Button>
            )}
            <Button onPress={handleAbandon} variant="danger" size="lg">
              <View className="flex-row items-center">
                <Ionicons name="skull" size={24} color="#ffffff" />
                <Text className="text-white font-bold ml-2">Give Up</Text>
              </View>
            </Button>
          </>
        )}
      </View>

      {phase === 'idle' && sessionsToday > 0 && (
        <Button onPress={startBreak} variant="ghost" size="md">
          <View className="flex-row items-center">
            <Ionicons name="cafe" size={20} color="#ff9999" />
            <Text className="text-fire-200 ml-2">Take a Break</Text>
          </View>
        </Button>
      )}

      {/* Stats */}
      <View className="flex-row mt-10 gap-10">
        <View className="items-center">
          <Ionicons name="today" size={24} color="#994444" />
          <Text className="text-fire-100 text-3xl font-bold mt-1">{sessionsToday}</Text>
          <Text className="text-text-muted text-xs">today</Text>
        </View>
        <View className="items-center">
          <Ionicons name="flame" size={24} color="#ff2222" />
          <Text className="text-accent text-3xl font-bold mt-1">{focusStreak}</Text>
          <Text className="text-text-muted text-xs">streak</Text>
        </View>
      </View>
    </View>
  );
}
