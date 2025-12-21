import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  emoji: string;
  title: string;
  description: string;
  accent: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    emoji: '😈',
    title: 'Meet Your Personal Devil',
    description: "I'm here to shame you into productivity. Duolingo has nothing on me.",
    accent: '#ff2222',
  },
  {
    id: '2',
    emoji: '🎰',
    title: 'Make Bets With the Devil',
    description: "Tell me what you need to do. I'll bet against you completing it. Prove me wrong.",
    accent: '#ff6600',
  },
  {
    id: '3',
    emoji: '🔥',
    title: 'Streak or Shame',
    description: "Complete tasks to build streaks. Break them and I'll roast you mercilessly.",
    accent: '#ffaa00',
  },
  {
    id: '4',
    emoji: '⏱️',
    title: 'Focus Timer',
    description: 'Pomodoro timer with accountability. Abandon a session and face my wrath.',
    accent: '#ff4444',
  },
  {
    id: '5',
    emoji: '📊',
    title: "I'm Always Watching",
    description: "I track your patterns, your excuses, your failures. Use this data... or don't. I'll remember.",
    accent: '#9932cc',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('onboarding_completed', 'true');
    router.replace('/(auth)/login');
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    return (
      <View style={{ width }} className="flex-1 items-center justify-center px-8">
        <Text className="text-8xl mb-8">{item.emoji}</Text>
        <Text
          className="text-3xl font-bold text-center mb-4"
          style={{ color: item.accent }}
        >
          {item.title}
        </Text>
        <Text className="text-fire-200 text-lg text-center leading-7">
          {item.description}
        </Text>
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View className="flex-row justify-center mb-8">
        {SLIDES.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              className="h-2 rounded-full bg-fire-500 mx-1"
              style={{ width: dotWidth, opacity }}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* Skip button */}
      <View className="absolute top-14 right-6 z-10">
        <Pressable onPress={handleSkip}>
          <Text className="text-fire-500 text-base font-medium">Skip</Text>
        </Pressable>
      </View>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        scrollEventThrottle={16}
        className="flex-1"
      />

      {/* Bottom section */}
      <View className="px-8 pb-12">
        {renderDots()}

        <Pressable
          onPress={handleNext}
          className="bg-fire-600 rounded-2xl py-4 items-center active:bg-fire-700"
        >
          <View className="flex-row items-center">
            {currentIndex === SLIDES.length - 1 ? (
              <>
                <Text className="text-white font-bold text-lg">Let's Begin</Text>
                <Ionicons name="flame" size={20} color="#ffffff" style={{ marginLeft: 8 }} />
              </>
            ) : (
              <>
                <Text className="text-white font-bold text-lg">Next</Text>
                <Ionicons name="arrow-forward" size={20} color="#ffffff" style={{ marginLeft: 8 }} />
              </>
            )}
          </View>
        </Pressable>
      </View>
    </View>
  );
}
