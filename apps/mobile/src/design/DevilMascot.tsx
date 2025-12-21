import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G, Ellipse, Defs, RadialGradient, Stop } from 'react-native-svg';
import { MotiView, AnimatePresence } from 'moti';
import { Easing } from 'react-native-reanimated';
import { colors } from './tokens';

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

// Cute tamagotchi-style devil mascot
export function DevilMascot({ size = 160, mood = 'idle' }: DevilMascotProps) {
  const [blinking, setBlinking] = useState(false);

  // Random blinking
  useEffect(() => {
    if (mood === 'sleeping') return;

    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setBlinking(true);
        setTimeout(() => setBlinking(false), 150);
      }
    }, 2000);

    return () => clearInterval(blinkInterval);
  }, [mood]);

  // Body bounce animation config based on mood
  const getBodyAnimation = () => {
    switch (mood) {
      case 'excited':
      case 'celebrating':
        return {
          translateY: [-8, 0, -8],
          rotate: ['-3deg', '3deg', '-3deg'],
        };
      case 'happy':
        return {
          translateY: [-4, 0, -4],
          scale: [1, 1.02, 1],
        };
      case 'angry':
        return {
          translateY: [0, -2, 0],
          rotate: ['-2deg', '2deg', '-2deg'],
          scale: [1, 1.05, 1],
        };
      case 'disappointed':
        return {
          translateY: [0, 2, 0],
          scale: [1, 0.98, 1],
        };
      case 'sleeping':
        return {
          translateY: [0, 2, 0],
          rotate: ['5deg', '5deg', '5deg'],
        };
      case 'thinking':
        return {
          translateY: [0, -2, 0],
          rotate: ['-8deg', '-8deg', '-8deg'],
        };
      case 'judging':
        return {
          scale: [1, 1.02, 1],
        };
      default:
        return {
          translateY: [0, -3, 0],
        };
    }
  };

  const bodyAnim = getBodyAnimation();

  return (
    <View style={{ width: size, height: size }}>
      {/* Floating particles for celebrating */}
      <AnimatePresence>
        {mood === 'celebrating' && (
          <>
            {[...Array(6)].map((_, i) => (
              <MotiView
                key={i}
                from={{
                  opacity: 1,
                  translateY: 0,
                  translateX: 0,
                  scale: 0,
                }}
                animate={{
                  opacity: 0,
                  translateY: -100,
                  translateX: (i % 2 === 0 ? 1 : -1) * (20 + i * 10),
                  scale: 1,
                }}
                transition={{
                  type: 'timing',
                  duration: 1500,
                  delay: i * 200,
                  loop: true,
                }}
                style={[
                  styles.particle,
                  {
                    left: size / 2 - 8 + (i - 3) * 15,
                    top: size / 2,
                  },
                ]}
              >
                <View
                  style={[
                    styles.particleDot,
                    { backgroundColor: i % 2 === 0 ? colors.pop.DEFAULT : colors.white },
                  ]}
                />
              </MotiView>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Shadow */}
      <MotiView
        animate={{
          scaleX: mood === 'excited' || mood === 'celebrating' ? [0.8, 1, 0.8] : 1,
          opacity: mood === 'sleeping' ? 0.3 : 0.2,
        }}
        transition={{
          type: 'timing',
          duration: 600,
          loop: true,
        }}
        style={[styles.shadow, { top: size - 20, left: size / 2 - 30 }]}
      />

      {/* Main body */}
      <MotiView
        animate={bodyAnim}
        transition={{
          type: 'timing',
          duration: mood === 'excited' || mood === 'celebrating' ? 400 : 800,
          easing: Easing.inOut(Easing.ease),
          loop: true,
        }}
        style={styles.body}
      >
        <Svg width={size} height={size} viewBox="0 0 160 160">
          <Defs>
            <RadialGradient id="bodyGradient" cx="50%" cy="30%" r="70%">
              <Stop offset="0%" stopColor={colors.gray[800]} />
              <Stop offset="100%" stopColor={colors.gray[950]} />
            </RadialGradient>
            <RadialGradient id="cheekGradient" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={colors.pop.DEFAULT} stopOpacity={0.4} />
              <Stop offset="100%" stopColor={colors.pop.DEFAULT} stopOpacity={0} />
            </RadialGradient>
          </Defs>

          {/* Body - cute round blob */}
          <Ellipse
            cx="80"
            cy="95"
            rx="55"
            ry="50"
            fill="url(#bodyGradient)"
          />

          {/* Horns */}
          <G>
            {/* Left horn */}
            <Path
              d="M35 60 Q20 30 35 15 Q40 35 48 50 Q42 58 35 60 Z"
              fill={colors.pop.DEFAULT}
            />
            <Path
              d="M35 60 Q25 35 35 20"
              stroke={colors.pop.light}
              strokeWidth={2}
              fill="none"
              opacity={0.5}
            />

            {/* Right horn */}
            <Path
              d="M125 60 Q140 30 125 15 Q120 35 112 50 Q118 58 125 60 Z"
              fill={colors.pop.DEFAULT}
            />
            <Path
              d="M125 60 Q135 35 125 20"
              stroke={colors.pop.light}
              strokeWidth={2}
              fill="none"
              opacity={0.5}
            />
          </G>

          {/* Face */}
          <G>
            {/* Blush cheeks */}
            {(mood === 'happy' || mood === 'excited' || mood === 'celebrating') && (
              <>
                <Circle cx="45" cy="100" r="12" fill="url(#cheekGradient)" />
                <Circle cx="115" cy="100" r="12" fill="url(#cheekGradient)" />
              </>
            )}

            {/* Eyes */}
            {renderEyes(mood, blinking)}

            {/* Mouth */}
            {renderMouth(mood)}

            {/* Sleeping Z's */}
            {mood === 'sleeping' && (
              <G>
                <MotiView
                  from={{ opacity: 0, translateY: 0 }}
                  animate={{ opacity: [0, 1, 0], translateY: -20 }}
                  transition={{ type: 'timing', duration: 2000, loop: true }}
                >
                  {/* Z's would need to be positioned outside SVG for animation */}
                </MotiView>
              </G>
            )}

            {/* Thinking sweat drop */}
            {mood === 'thinking' && (
              <Path
                d="M130 70 Q135 75 130 82 Q125 75 130 70"
                fill={colors.gray[400]}
              />
            )}

            {/* Angry vein */}
            {mood === 'angry' && (
              <Path
                d="M120 55 L125 50 L130 55 L125 52 L120 55"
                fill={colors.pop.DEFAULT}
                stroke={colors.pop.dark}
                strokeWidth={1}
              />
            )}
          </G>

          {/* Tail */}
          <Path
            d="M130 130 Q150 140 145 120 Q155 125 150 110"
            stroke={colors.gray[800]}
            strokeWidth={8}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M148 108 L155 100 L152 112 Z"
            fill={colors.pop.DEFAULT}
          />
        </Svg>
      </MotiView>

      {/* Sleeping Z's overlay */}
      {mood === 'sleeping' && (
        <View style={styles.zContainer}>
          {[0, 1, 2].map((i) => (
            <MotiView
              key={i}
              from={{ opacity: 0, translateY: 0, translateX: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 1, 1, 0],
                translateY: -40,
                translateX: 20,
                scale: 1,
              }}
              transition={{
                type: 'timing',
                duration: 2000,
                delay: i * 600,
                loop: true,
              }}
              style={[styles.zText, { right: 20 + i * 5, top: 30 + i * 10 }]}
            >
              <View style={styles.z}>
                <Svg width={16} height={16} viewBox="0 0 16 16">
                  <Path
                    d="M3 4 L13 4 L3 12 L13 12"
                    stroke={colors.gray[400]}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </Svg>
              </View>
            </MotiView>
          ))}
        </View>
      )}
    </View>
  );
}

function renderEyes(mood: MascotMood, blinking: boolean) {
  const eyesClosed = blinking || mood === 'sleeping';

  if (eyesClosed) {
    return (
      <>
        <Path d="M55 88 Q65 82 75 88" stroke={colors.white} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path d="M85 88 Q95 82 105 88" stroke={colors.white} strokeWidth={3} strokeLinecap="round" fill="none" />
      </>
    );
  }

  switch (mood) {
    case 'happy':
    case 'celebrating':
      return (
        <>
          <Path d="M55 85 Q65 78 75 85" stroke={colors.white} strokeWidth={3} strokeLinecap="round" fill="none" />
          <Path d="M85 85 Q95 78 105 85" stroke={colors.white} strokeWidth={3} strokeLinecap="round" fill="none" />
        </>
      );
    case 'excited':
      return (
        <>
          {/* Big sparkly eyes */}
          <Circle cx="65" cy="85" r="12" fill={colors.white} />
          <Circle cx="65" cy="83" r="6" fill={colors.gray[900]} />
          <Circle cx="62" cy="80" r="2" fill={colors.white} />
          <Circle cx="95" cy="85" r="12" fill={colors.white} />
          <Circle cx="95" cy="83" r="6" fill={colors.gray[900]} />
          <Circle cx="92" cy="80" r="2" fill={colors.white} />
        </>
      );
    case 'angry':
      return (
        <>
          <Path d="M52 80 L72 85" stroke={colors.gray[700]} strokeWidth={3} strokeLinecap="round" />
          <Circle cx="65" cy="88" r="8" fill={colors.white} />
          <Circle cx="65" cy="88" r="4" fill={colors.pop.DEFAULT} />
          <Path d="M108 80 L88 85" stroke={colors.gray[700]} strokeWidth={3} strokeLinecap="round" />
          <Circle cx="95" cy="88" r="8" fill={colors.white} />
          <Circle cx="95" cy="88" r="4" fill={colors.pop.DEFAULT} />
        </>
      );
    case 'disappointed':
      return (
        <>
          <Path d="M72 80 L55 85" stroke={colors.gray[700]} strokeWidth={2} strokeLinecap="round" />
          <Circle cx="65" cy="90" r="8" fill={colors.white} />
          <Circle cx="65" cy="92" r="4" fill={colors.gray[700]} />
          <Path d="M88 80 L105 85" stroke={colors.gray[700]} strokeWidth={2} strokeLinecap="round" />
          <Circle cx="95" cy="90" r="8" fill={colors.white} />
          <Circle cx="95" cy="92" r="4" fill={colors.gray[700]} />
        </>
      );
    case 'judging':
      return (
        <>
          {/* Half-lidded judgy eyes */}
          <Ellipse cx="65" cy="88" rx="10" ry="6" fill={colors.white} />
          <Circle cx="68" cy="88" r="4" fill={colors.gray[900]} />
          <Path d="M55 84 L75 82" stroke={colors.gray[800]} strokeWidth={3} strokeLinecap="round" />
          <Ellipse cx="95" cy="88" rx="10" ry="6" fill={colors.white} />
          <Circle cx="98" cy="88" r="4" fill={colors.gray[900]} />
          <Path d="M85 82 L105 84" stroke={colors.gray[800]} strokeWidth={3} strokeLinecap="round" />
        </>
      );
    case 'thinking':
      return (
        <>
          {/* Looking up and to the side */}
          <Circle cx="65" cy="85" r="10" fill={colors.white} />
          <Circle cx="60" cy="82" r="5" fill={colors.gray[900]} />
          <Circle cx="58" cy="80" r="2" fill={colors.white} />
          <Circle cx="95" cy="85" r="10" fill={colors.white} />
          <Circle cx="90" cy="82" r="5" fill={colors.gray[900]} />
          <Circle cx="88" cy="80" r="2" fill={colors.white} />
        </>
      );
    default:
      return (
        <>
          <Circle cx="65" cy="85" r="10" fill={colors.white} />
          <Circle cx="65" cy="85" r="5" fill={colors.gray[900]} />
          <Circle cx="63" cy="83" r="2" fill={colors.white} />
          <Circle cx="95" cy="85" r="10" fill={colors.white} />
          <Circle cx="95" cy="85" r="5" fill={colors.gray[900]} />
          <Circle cx="93" cy="83" r="2" fill={colors.white} />
        </>
      );
  }
}

function renderMouth(mood: MascotMood) {
  switch (mood) {
    case 'happy':
    case 'celebrating':
      return (
        <Path
          d="M60 108 Q80 125 100 108"
          stroke={colors.white}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      );
    case 'excited':
      return (
        <>
          <Ellipse cx="80" cy="112" rx="15" ry="12" fill={colors.gray[950]} />
          <Ellipse cx="80" cy="118" rx="8" ry="5" fill={colors.pop.light} opacity={0.5} />
        </>
      );
    case 'angry':
      return (
        <Path
          d="M60 115 L75 108 L85 108 L100 115"
          stroke={colors.white}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      );
    case 'disappointed':
      return (
        <Path
          d="M60 115 Q80 105 100 115"
          stroke={colors.white}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      );
    case 'sleeping':
      return (
        <Ellipse cx="80" cy="110" rx="8" ry="4" fill={colors.gray[600]} />
      );
    case 'judging':
      return (
        <Path
          d="M65 110 Q80 112 95 108"
          stroke={colors.white}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      );
    case 'thinking':
      return (
        <Circle cx="75" cy="112" r="5" fill={colors.gray[600]} />
      );
    default:
      return (
        <Path
          d="M65 110 L95 110"
          stroke={colors.white}
          strokeWidth={3}
          strokeLinecap="round"
        />
      );
  }
}

const styles = StyleSheet.create({
  body: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  shadow: {
    position: 'absolute',
    width: 60,
    height: 15,
    backgroundColor: colors.black,
    borderRadius: 30,
    opacity: 0.2,
  },
  particle: {
    position: 'absolute',
  },
  particleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  zContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: 80,
  },
  zText: {
    position: 'absolute',
  },
  z: {},
});
