import React, { useEffect, useState } from 'react';
import { View, Text, Platform } from 'react-native';

export type MascotMood =
  | 'idle'
  | 'happy'
  | 'excited'
  | 'angry'
  | 'disappointed'
  | 'sleeping'
  | 'celebrating'
  | 'thinking'
  | 'judging';

interface DevilMascotProps {
  size?: number;
  mood?: MascotMood;
  message?: string;
}

// Simple emoji-based devil with expressions
const DEVIL_FACES: Record<MascotMood, { face: string; extra?: string }> = {
  idle: { face: '😈' },
  happy: { face: '😈', extra: '✨' },
  excited: { face: '🤩' },
  angry: { face: '👿' },
  disappointed: { face: '😒' },
  sleeping: { face: '😴', extra: '💤' },
  celebrating: { face: '🥳', extra: '🎉' },
  thinking: { face: '🤔', extra: '💭' },
  judging: { face: '😏' },
};

export function DevilMascot({ size = 160, mood = 'idle' }: DevilMascotProps) {
  const [bounce, setBounce] = useState(0);

  // Bounce animation
  useEffect(() => {
    const speed = mood === 'excited' || mood === 'celebrating' ? 300 : 800;
    const interval = setInterval(() => {
      setBounce(b => (b + 1) % 2);
    }, speed);
    return () => clearInterval(interval);
  }, [mood]);

  const { face, extra } = DEVIL_FACES[mood] || DEVIL_FACES.idle;
  const bounceOffset = bounce === 0 ? 0 : (mood === 'excited' ? -8 : -4);
  const fontSize = size * 0.5;

  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      height: size,
      width: size,
    }}>
      {/* Main face with bounce */}
      <View style={{
        transform: [{ translateY: bounceOffset }],
        alignItems: 'center',
      }}>
        <Text style={{ fontSize, lineHeight: fontSize * 1.2 }}>
          {face}
        </Text>

        {/* Extra decoration */}
        {extra && (
          <Text style={{
            position: 'absolute',
            top: -10,
            right: -20,
            fontSize: fontSize * 0.35,
          }}>
            {extra}
          </Text>
        )}
      </View>

      {/* Shadow */}
      <View style={{
        width: size * 0.3,
        height: size * 0.06,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: size * 0.03,
        marginTop: 4,
        transform: [{ scaleX: bounce === 0 ? 1 : 0.8 }],
      }} />
    </View>
  );
}

// Compact version for inline use
export function DevilMascotCompact({ mood = 'idle' }: { mood?: MascotMood }) {
  const { face } = DEVIL_FACES[mood] || DEVIL_FACES.idle;
  return <Text style={{ fontSize: 24 }}>{face}</Text>;
}
