import React from 'react';
import { View, Text, Platform } from 'react-native';
import { colors } from './tokens';

type DevilMood = 'neutral' | 'happy' | 'angry' | 'smug' | 'disappointed' | 'impressed';

interface DevilProps {
  size?: number;
  mood?: DevilMood;
  animated?: boolean;
}

// Simple emoji for web
function WebDevil({ size = 80, mood = 'neutral' }: DevilProps) {
  const emoji = mood === 'angry' ? '👿' : '😈';
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.7 }}>{emoji}</Text>
    </View>
  );
}

// Minimalist devil mascot - geometric, clean, expressive
export function Devil({ size = 80, mood = 'neutral', animated = true }: DevilProps) {
  if (Platform.OS === 'web') {
    return <WebDevil size={size} mood={mood} />;
  }

  const Svg = require('react-native-svg').default;
  const { Path, Circle, G, Defs, LinearGradient, Stop } = require('react-native-svg');
  const MotiView = require('moti').MotiView;
  const scale = size / 80;

  // Eye expressions based on mood
  const getEyes = () => {
    switch (mood) {
      case 'happy':
        return (
          <>
            {/* Happy curved eyes */}
            <Path
              d="M24 32 Q28 28 32 32"
              stroke={colors.pop.DEFAULT}
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M48 32 Q52 28 56 32"
              stroke={colors.pop.DEFAULT}
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
            />
          </>
        );
      case 'angry':
        return (
          <>
            {/* Angry slanted eyes */}
            <Path
              d="M22 28 L34 32"
              stroke={colors.pop.DEFAULT}
              strokeWidth={3}
              strokeLinecap="round"
            />
            <Circle cx="28" cy="34" r="3" fill={colors.pop.DEFAULT} />
            <Path
              d="M58 28 L46 32"
              stroke={colors.pop.DEFAULT}
              strokeWidth={3}
              strokeLinecap="round"
            />
            <Circle cx="52" cy="34" r="3" fill={colors.pop.DEFAULT} />
          </>
        );
      case 'smug':
        return (
          <>
            {/* Smug half-lidded eyes */}
            <Path
              d="M24 34 Q28 30 32 34"
              stroke={colors.pop.DEFAULT}
              strokeWidth={2.5}
              strokeLinecap="round"
              fill="none"
            />
            <Circle cx="28" cy="33" r="2" fill={colors.pop.DEFAULT} />
            <Path
              d="M48 34 Q52 30 56 34"
              stroke={colors.pop.DEFAULT}
              strokeWidth={2.5}
              strokeLinecap="round"
              fill="none"
            />
            <Circle cx="52" cy="33" r="2" fill={colors.pop.DEFAULT} />
          </>
        );
      case 'disappointed':
        return (
          <>
            {/* Disappointed droopy eyes */}
            <Circle cx="28" cy="34" r="4" fill={colors.pop.DEFAULT} />
            <Path
              d="M22 30 L34 32"
              stroke={colors.gray[800]}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <Circle cx="52" cy="34" r="4" fill={colors.pop.DEFAULT} />
            <Path
              d="M46 32 L58 30"
              stroke={colors.gray[800]}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </>
        );
      case 'impressed':
        return (
          <>
            {/* Wide impressed eyes */}
            <Circle cx="28" cy="32" r="6" fill="none" stroke={colors.pop.DEFAULT} strokeWidth={2.5} />
            <Circle cx="28" cy="32" r="3" fill={colors.pop.DEFAULT} />
            <Circle cx="52" cy="32" r="6" fill="none" stroke={colors.pop.DEFAULT} strokeWidth={2.5} />
            <Circle cx="52" cy="32" r="3" fill={colors.pop.DEFAULT} />
          </>
        );
      default:
        return (
          <>
            {/* Neutral dots */}
            <Circle cx="28" cy="32" r="4" fill={colors.pop.DEFAULT} />
            <Circle cx="52" cy="32" r="4" fill={colors.pop.DEFAULT} />
          </>
        );
    }
  };

  // Mouth expressions based on mood
  const getMouth = () => {
    switch (mood) {
      case 'happy':
        return (
          <Path
            d="M30 50 Q40 60 50 50"
            stroke={colors.pop.DEFAULT}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
        );
      case 'angry':
        return (
          <Path
            d="M28 54 L40 48 L52 54"
            stroke={colors.pop.DEFAULT}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case 'smug':
        return (
          <Path
            d="M32 50 Q40 54 52 48"
            stroke={colors.pop.DEFAULT}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
        );
      case 'disappointed':
        return (
          <Path
            d="M30 54 Q40 48 50 54"
            stroke={colors.pop.DEFAULT}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
        );
      case 'impressed':
        return (
          <Circle cx="40" cy="52" r="6" fill="none" stroke={colors.pop.DEFAULT} strokeWidth={2.5} />
        );
      default:
        return (
          <Path
            d="M32 50 L48 50"
            stroke={colors.pop.DEFAULT}
            strokeWidth={3}
            strokeLinecap="round"
          />
        );
    }
  };

  const content = (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Defs>
        <LinearGradient id="hornGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.pop.DEFAULT} />
          <Stop offset="1" stopColor={colors.pop.dark} />
        </LinearGradient>
      </Defs>

      {/* Face - simple circle */}
      <Circle
        cx="40"
        cy="44"
        r="28"
        fill={colors.gray[900]}
        stroke={colors.gray[700]}
        strokeWidth={2}
      />

      {/* Left Horn */}
      <Path
        d="M18 30 Q12 10 20 4 Q22 14 26 24 Q22 28 18 30 Z"
        fill="url(#hornGradient)"
      />

      {/* Right Horn */}
      <Path
        d="M62 30 Q68 10 60 4 Q58 14 54 24 Q58 28 62 30 Z"
        fill="url(#hornGradient)"
      />

      {/* Eyes */}
      <G>{getEyes()}</G>

      {/* Mouth */}
      <G>{getMouth()}</G>
    </Svg>
  );

  if (!animated) {
    return <View>{content}</View>;
  }

  return (
    <MotiView
      from={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 15 }}
    >
      <MotiView
        animate={{
          translateY: mood === 'happy' ? -2 : mood === 'angry' ? 2 : 0,
        }}
        transition={{
          type: 'timing',
          duration: 1000,
          loop: mood === 'happy' || mood === 'angry',
        }}
      >
        {content}
      </MotiView>
    </MotiView>
  );
}

// Smaller inline devil icon
export function DevilIcon({ size = 24, color = colors.pop.DEFAULT }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Simple devil silhouette */}
      <Path
        d="M4 8 Q2 2 6 1 Q7 4 8 6 L8 8
           M20 8 Q22 2 18 1 Q17 4 16 6 L16 8
           M12 20 C6 20 4 14 4 10 C4 6 7 4 12 4 C17 4 20 6 20 10 C20 14 18 20 12 20 Z"
        fill={color}
      />
    </Svg>
  );
}

// Animated devil that reacts to user actions
export function ReactiveDevil({
  size = 120,
  mood = 'neutral',
}: {
  size?: number;
  mood?: DevilMood;
}) {
  return (
    <MotiView
      from={{ rotate: '0deg' }}
      animate={{
        rotate: mood === 'angry' ? ['0deg', '-5deg', '5deg', '0deg'] : '0deg',
        scale: mood === 'impressed' ? 1.1 : mood === 'disappointed' ? 0.95 : 1,
      }}
      transition={{
        type: 'spring',
        damping: 10,
        loop: mood === 'angry',
      }}
    >
      <Devil size={size} mood={mood} />
    </MotiView>
  );
}
