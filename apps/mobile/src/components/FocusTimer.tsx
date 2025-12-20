import React, { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
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
    reset,
    abandon,
    tick,
  } = useFocusStore();

  const { triggerShame } = useDevilStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Progress animation
  const progress = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(timeRemaining / totalTime, { duration: 1000 });
  }, [timeRemaining, totalTime]);

  // Timer tick
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

  // Trigger shame on session complete/abandon
  useEffect(() => {
    if (phase === 'idle' && !isRunning && timeRemaining === 0) {
      // Session completed
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
      case 'focus':
        return 'bg-accent';
      case 'break':
        return 'bg-success';
      default:
        return 'bg-text-muted';
    }
  };

  const getPhaseLabel = () => {
    switch (phase) {
      case 'focus':
        return 'Focus Time';
      case 'break':
        return 'Break Time';
      default:
        return 'Ready to Focus?';
    }
  };

  return (
    <View className="items-center p-6">
      {/* Devil mascot */}
      <Devil size="lg" showMessage={true} />

      {/* Timer display */}
      <View className="mt-8 items-center">
        <Text className="text-text-secondary text-lg mb-2">{getPhaseLabel()}</Text>
        <Text className="text-text-primary text-6xl font-bold tracking-wider">
          {formatTime(timeRemaining)}
        </Text>

        {/* Progress bar */}
        <View className="w-64 h-2 bg-surfaceLight rounded-full mt-6 overflow-hidden">
          <Animated.View
            style={progressStyle}
            className={`h-full rounded-full ${getPhaseColor()}`}
          />
        </View>
      </View>

      {/* Controls */}
      <View className="flex-row mt-8 gap-4">
        {phase === 'idle' ? (
          <Button onPress={() => startFocus()} size="lg">
            Start Focus
          </Button>
        ) : (
          <>
            {isRunning ? (
              <Button onPress={pause} variant="secondary" size="lg">
                Pause
              </Button>
            ) : (
              <Button onPress={resume} size="lg">
                Resume
              </Button>
            )}
            <Button onPress={handleAbandon} variant="danger" size="lg">
              Give Up
            </Button>
          </>
        )}
      </View>

      {/* Quick break button after focus */}
      {phase === 'idle' && sessionsToday > 0 && (
        <Button onPress={startBreak} variant="ghost" size="md" className="mt-4">
          Take a Break
        </Button>
      )}

      {/* Stats */}
      <View className="flex-row mt-8 gap-8">
        <View className="items-center">
          <Text className="text-text-muted text-sm">Today</Text>
          <Text className="text-text-primary text-2xl font-bold">{sessionsToday}</Text>
          <Text className="text-text-muted text-xs">sessions</Text>
        </View>
        <View className="items-center">
          <Text className="text-text-muted text-sm">Streak</Text>
          <Text className="text-accent text-2xl font-bold">{focusStreak}</Text>
          <Text className="text-text-muted text-xs">🔥</Text>
        </View>
      </View>
    </View>
  );
}
