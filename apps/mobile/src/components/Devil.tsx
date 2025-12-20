import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useDevilStore } from '../stores/devilStore';
import type { DevilMood } from '../types';

interface DevilProps {
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
  onPress?: () => void;
}

const sizeMap = {
  sm: { container: 60, emoji: 32 },
  md: { container: 100, emoji: 56 },
  lg: { container: 150, emoji: 80 },
};

// Mood to expression mapping (using emoji as placeholder for actual mascot art)
const moodExpressions: Record<DevilMood, string> = {
  idle: '😈',
  watching: '👀',
  disappointed: '😤',
  pleased: '😏',
  furious: '👿',
  impressed: '🤯',
};

const moodColors: Record<DevilMood, string> = {
  idle: 'bg-devil-red/20',
  watching: 'bg-devil-orange/20',
  disappointed: 'bg-devil-darkRed/30',
  pleased: 'bg-success/20',
  furious: 'bg-danger/30',
  impressed: 'bg-devil-purple/20',
};

export function Devil({ size = 'md', showMessage = true, onPress }: DevilProps) {
  const { mood, currentMessage, isAnimating, triggerShame } = useDevilStore();

  const dimensions = sizeMap[size];

  // Animation values
  const bounce = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  // Idle bounce animation
  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  // Reaction animation when mood changes
  useEffect(() => {
    if (isAnimating) {
      scale.value = withSequence(
        withTiming(1.2, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
      rotate.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    }
  }, [isAnimating]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bounce.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Random idle interaction
      triggerShame('app_open');
    }
  };

  return (
    <View className="items-center">
      {/* Speech bubble */}
      {showMessage && currentMessage && (
        <View className="bg-surface rounded-2xl px-4 py-3 mb-3 max-w-[280px] relative">
          <Text className="text-text-primary text-center text-sm">
            {currentMessage}
          </Text>
          {/* Speech bubble tail */}
          <View
            className="absolute -bottom-2 left-1/2 -ml-2 w-0 h-0"
            style={{
              borderLeftWidth: 8,
              borderRightWidth: 8,
              borderTopWidth: 8,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderTopColor: '#1a1a2e',
            }}
          />
        </View>
      )}

      {/* Devil character */}
      <Pressable onPress={handlePress}>
        <Animated.View
          style={[
            animatedStyle,
            {
              width: dimensions.container,
              height: dimensions.container,
            },
          ]}
          className={`
            rounded-full items-center justify-center
            ${moodColors[mood]}
          `}
        >
          {/* Horns (decorative) */}
          <View className="absolute -top-2 flex-row">
            <Text style={{ fontSize: 16 }}>🔱</Text>
          </View>

          {/* Face */}
          <Text style={{ fontSize: dimensions.emoji }}>
            {moodExpressions[mood]}
          </Text>

          {/* Pitchfork (decorative) */}
          {size === 'lg' && (
            <View className="absolute -right-2 bottom-0">
              <Text style={{ fontSize: 24 }}>🔱</Text>
            </View>
          )}
        </Animated.View>
      </Pressable>

      {/* Mood indicator */}
      {size === 'lg' && (
        <Text className="text-text-muted text-xs mt-2 capitalize">
          {mood === 'idle' ? 'Waiting...' : mood}
        </Text>
      )}
    </View>
  );
}
