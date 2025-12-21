import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { EnergyLevel, ENERGY_LEVELS } from '../types';
import { haptics } from '../services/haptics';

interface EnergySelectorProps {
  selected?: EnergyLevel;
  onSelect: (energy: EnergyLevel) => void;
  compact?: boolean;
}

const energyOrder: EnergyLevel[] = ['zombie', 'low', 'medium', 'high', 'hyperfocus'];

export function EnergySelector({ selected, onSelect, compact = false }: EnergySelectorProps) {
  const handleSelect = (energy: EnergyLevel) => {
    haptics.light();
    onSelect(energy);
  };

  if (compact) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2 py-2">
          {energyOrder.map((energy) => {
            const info = ENERGY_LEVELS[energy];
            const isSelected = selected === energy;

            return (
              <Pressable
                key={energy}
                onPress={() => handleSelect(energy)}
                className={`px-3 py-2 rounded-lg border ${
                  isSelected
                    ? 'bg-fire-600 border-fire-500'
                    : 'bg-fire-900 border-fire-800'
                }`}
              >
                <Text className="text-center text-lg">{info.emoji}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  return (
    <View className="gap-2">
      <Text className="text-fire-300 text-sm font-medium mb-1">
        Energy Required
      </Text>
      {energyOrder.map((energy) => {
        const info = ENERGY_LEVELS[energy];
        const isSelected = selected === energy;

        return (
          <Pressable
            key={energy}
            onPress={() => handleSelect(energy)}
            className={`flex-row items-center p-3 rounded-lg border ${
              isSelected
                ? 'bg-fire-700 border-fire-500'
                : 'bg-fire-900 border-fire-800'
            }`}
          >
            <Text className="text-2xl mr-3">{info.emoji}</Text>
            <View className="flex-1">
              <Text className={`font-medium ${isSelected ? 'text-white' : 'text-fire-100'}`}>
                {info.label}
              </Text>
              <Text className="text-fire-400 text-xs">{info.description}</Text>
            </View>
            {isSelected && (
              <Text className="text-fire-400">✓</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// Current energy filter bar - shows at top of task list
interface EnergyFilterProps {
  currentEnergy: EnergyLevel | null;
  onEnergyChange: (energy: EnergyLevel | null) => void;
}

export function EnergyFilter({ currentEnergy, onEnergyChange }: EnergyFilterProps) {
  const handleSelect = (energy: EnergyLevel) => {
    haptics.light();
    if (currentEnergy === energy) {
      onEnergyChange(null); // Deselect
    } else {
      onEnergyChange(energy);
    }
  };

  return (
    <View className="mb-4">
      <Text className="text-fire-300 text-sm font-medium mb-2">
        How are you feeling right now?
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {energyOrder.map((energy) => {
            const info = ENERGY_LEVELS[energy];
            const isSelected = currentEnergy === energy;

            return (
              <Pressable
                key={energy}
                onPress={() => handleSelect(energy)}
                className={`px-4 py-2 rounded-full border ${
                  isSelected
                    ? 'bg-fire-600 border-yellow-500'
                    : 'bg-fire-900 border-fire-800'
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-lg mr-1">{info.emoji}</Text>
                  <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-fire-300'}`}>
                    {info.label.split(' ')[0]}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {currentEnergy && (
        <View className="mt-3 bg-fire-900/50 rounded-lg p-3 border border-fire-800">
          <Text className="text-fire-200 text-sm">
            {currentEnergy === 'zombie' && "🧟 Showing easy, mindless tasks you can do half-asleep."}
            {currentEnergy === 'low' && "😴 Showing simple tasks that don't need much brainpower."}
            {currentEnergy === 'medium' && "😐 Showing regular tasks for a normal day."}
            {currentEnergy === 'high' && "⚡ Showing tasks that need more focus and effort."}
            {currentEnergy === 'hyperfocus' && "🚀 Showing big tasks - ride that hyperfocus wave!"}
          </Text>
        </View>
      )}
    </View>
  );
}

// Energy badge for task cards
interface EnergyBadgeProps {
  energy: EnergyLevel;
  size?: 'small' | 'medium';
}

export function EnergyBadge({ energy, size = 'small' }: EnergyBadgeProps) {
  const info = ENERGY_LEVELS[energy];

  if (size === 'small') {
    return (
      <View className="bg-fire-800 rounded px-1.5 py-0.5">
        <Text className="text-xs">{info.emoji}</Text>
      </View>
    );
  }

  return (
    <View className="bg-fire-800 rounded-lg px-2 py-1 flex-row items-center">
      <Text className="text-sm mr-1">{info.emoji}</Text>
      <Text className="text-fire-300 text-xs">{info.label.split(' ')[0]}</Text>
    </View>
  );
}

// Time estimate badge
interface TimeEstimateBadgeProps {
  minutes: number;
}

export function TimeEstimateBadge({ minutes }: TimeEstimateBadgeProps) {
  const getTimeLabel = () => {
    if (minutes < 5) return '< 5m';
    if (minutes < 15) return '5-15m';
    if (minutes < 30) return '15-30m';
    if (minutes < 60) return '30-60m';
    return `${Math.round(minutes / 60)}h+`;
  };

  const getTimeEmoji = () => {
    if (minutes < 5) return '⚡';
    if (minutes < 15) return '🏃';
    if (minutes < 30) return '🚶';
    if (minutes < 60) return '🐢';
    return '🐌';
  };

  return (
    <View className="bg-fire-800 rounded-lg px-2 py-1 flex-row items-center">
      <Text className="text-xs mr-1">{getTimeEmoji()}</Text>
      <Text className="text-fire-300 text-xs">{getTimeLabel()}</Text>
    </View>
  );
}
