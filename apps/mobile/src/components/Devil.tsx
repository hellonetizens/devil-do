import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  sm: { container: 50, icon: 28 },
  md: { container: 80, icon: 44 },
  lg: { container: 120, icon: 64 },
};

const moodIcons: Record<DevilMood, keyof typeof Ionicons.glyphMap> = {
  idle: 'skull',
  watching: 'eye',
  disappointed: 'sad',
  pleased: 'happy',
  furious: 'flame',
  impressed: 'star',
};

const moodColors: Record<DevilMood, string> = {
  idle: '#ff2222',
  watching: '#ff4444',
  disappointed: '#994444',
  pleased: '#44ff44',
  furious: '#ff0000',
  impressed: '#ffaa00',
};

export function Devil({ size = 'md', showMessage = true, onPress }: DevilProps) {
  const { mood, currentMessage, isAnimating, triggerShame } = useDevilStore();
  const dimensions = sizeMap[size];

  const bounce = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.3);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (isAnimating) {
      scale.value = withSequence(
        withTiming(1.3, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
      rotate.value = withSequence(
        withTiming(-15, { duration: 100 }),
        withTiming(15, { duration: 100 }),
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

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value,
  }));

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      triggerShame('app_open');
    }
  };

  return (
    <View className="items-center">
      {/* Speech bubble */}
      {showMessage && currentMessage && (
        <View className="bg-fire-900 border border-fire-700 rounded-2xl px-4 py-3 mb-3 max-w-[300px] relative">
          <Text className="text-fire-100 text-center text-sm font-medium">
            {currentMessage}
          </Text>
          <View
            className="absolute -bottom-2 left-1/2 -ml-2"
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: 8,
              borderRightWidth: 8,
              borderTopWidth: 8,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderTopColor: '#4a0000',
            }}
          />
        </View>
      )}

      {/* Devil icon */}
      <Pressable onPress={handlePress}>
        <Animated.View
          style={[
            animatedStyle,
            glowStyle,
            {
              width: dimensions.container,
              height: dimensions.container,
              shadowColor: moodColors[mood],
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 20,
              elevation: 10,
            },
          ]}
          className="rounded-full items-center justify-center bg-fire-900 border-2 border-fire-600"
        >
          <Ionicons
            name={moodIcons[mood]}
            size={dimensions.icon}
            color={moodColors[mood]}
          />
        </Animated.View>
      </Pressable>

      {size === 'lg' && (
        <Text className="text-fire-400 text-xs mt-2 capitalize font-medium">
          {mood === 'idle' ? 'Waiting...' : mood}
        </Text>
      )}
    </View>
  );
}
