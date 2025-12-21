import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { useDevilChatStore, getBetStats } from '../../src/stores/devilChatStore';
import type { Bet } from '../../src/services/devilAI';

const DEVIL_TAUNTS = {
  winning: [
    "I'm dominating. As expected.",
    "Your failure rate is *chef's kiss*",
    "Keep it up, I'm building my throne with your failures.",
  ],
  losing: [
    "How are you winning?! This is unacceptable.",
    "Fine, you've got luck. It won't last.",
    "Don't get cocky. I'm just getting started.",
  ],
  tied: [
    "Perfectly balanced... for now.",
    "The battle rages on.",
    "Neither of us is winning. Pathetic.",
  ],
  noBets: [
    "No bets? Scared of losing?",
    "Come on, make a bet. I dare you.",
    "Too afraid to put your money where your mouth is?",
  ],
};

export default function BetsScreen() {
  const { bets, resolveBet } = useDevilChatStore();
  const stats = getBetStats(bets);
  const [refreshing, setRefreshing] = useState(false);

  const activeBets = bets.filter(b => b.status === 'active');
  const resolvedBets = bets.filter(b => b.status !== 'active');

  // Auto-check for expired bets
  useEffect(() => {
    const expiredBets = activeBets.filter(b => b.deadline < Date.now());
    expiredBets.forEach(bet => {
      resolveBet(bet.id, 'devil'); // Auto-resolve expired bets as devil wins
    });
  }, []);

  const getDevilTaunt = () => {
    if (stats.total === 0) {
      return DEVIL_TAUNTS.noBets[Math.floor(Math.random() * DEVIL_TAUNTS.noBets.length)];
    }
    if (stats.devilWins > stats.userWins) {
      return DEVIL_TAUNTS.winning[Math.floor(Math.random() * DEVIL_TAUNTS.winning.length)];
    }
    if (stats.userWins > stats.devilWins) {
      return DEVIL_TAUNTS.losing[Math.floor(Math.random() * DEVIL_TAUNTS.losing.length)];
    }
    return DEVIL_TAUNTS.tied[Math.floor(Math.random() * DEVIL_TAUNTS.tied.length)];
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Check for expired bets
    const expiredBets = activeBets.filter(b => b.deadline < Date.now());
    expiredBets.forEach(bet => {
      resolveBet(bet.id, 'devil');
    });
    setTimeout(() => setRefreshing(false), 500);
  };

  const formatTimeRemaining = (deadline: number) => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) return 'EXPIRED';
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)}d`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const renderBet = (bet: Bet) => {
    const isActive = bet.status === 'active';
    const devilWon = bet.status === 'devil_won';
    const isExpired = bet.deadline < Date.now();

    return (
      <View
        key={bet.id}
        className={`bg-surface border rounded-xl p-4 mb-3 ${
          isActive ? 'border-fire-600' : devilWon ? 'border-red-600' : 'border-green-600'
        }`}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-fire-100 font-bold text-base">
              {bet.taskTitle || 'Unknown Task'}
            </Text>
            <Text className="text-fire-400 text-sm mt-1">
              Devil predicts: <Text className="text-accent font-bold">{bet.devilPrediction.toUpperCase()}</Text>
            </Text>
          </View>
          <View className={`px-2 py-1 rounded ${
            isActive ? 'bg-yellow-500/20' : devilWon ? 'bg-red-500/20' : 'bg-green-500/20'
          }`}>
            <Text className={`text-xs font-bold ${
              isActive ? 'text-yellow-400' : devilWon ? 'text-red-400' : 'text-green-400'
            }`}>
              {isActive ? 'ACTIVE' : devilWon ? 'DEVIL WON' : 'YOU WON'}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mt-2">
          <Ionicons name="trophy" size={14} color="#994444" />
          <Text className="text-text-muted text-sm ml-1">
            Stakes: <Text className="text-fire-200">{bet.stakes}</Text>
          </Text>
        </View>

        <View className="flex-row items-center mt-1">
          <Ionicons name="analytics" size={14} color="#994444" />
          <Text className="text-text-muted text-sm ml-1">
            Devil's confidence: <Text className="text-accent font-bold">{bet.devilConfidence}%</Text>
          </Text>
        </View>

        {isActive && (
          <>
            <View className="flex-row items-center mt-1">
              <Ionicons name="time" size={14} color={isExpired ? '#ff4444' : '#994444'} />
              <Text className={`text-sm ml-1 ${isExpired ? 'text-red-400 font-bold' : 'text-text-muted'}`}>
                {isExpired ? 'EXPIRED' : `Time left: ${formatTimeRemaining(bet.deadline)}`}
              </Text>
            </View>

            <View className="flex-row mt-4 gap-2">
              <Pressable
                onPress={() => resolveBet(bet.id, 'user')}
                className="flex-1 bg-green-600 rounded-lg py-2 items-center active:bg-green-500"
              >
                <Text className="text-white font-bold">I Did It!</Text>
              </Pressable>
              <Pressable
                onPress={() => resolveBet(bet.id, 'devil')}
                className="flex-1 bg-fire-700 rounded-lg py-2 items-center active:bg-fire-600"
              >
                <Text className="text-fire-200 font-bold">I Failed</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* Scoreboard */}
      <View className="p-4 border-b border-fire-900">
        <View className="flex-row justify-around bg-surface rounded-xl p-4 border border-fire-800">
          <View className="items-center">
            <Ionicons name="skull" size={32} color="#ff2222" />
            <Text className="text-accent text-3xl font-bold mt-1">{stats.devilWins}</Text>
            <Text className="text-fire-400 text-xs">Devil Wins</Text>
          </View>
          <View className="w-px bg-fire-700" />
          <View className="items-center">
            <Ionicons name="person" size={32} color="#44ff44" />
            <Text className="text-green-400 text-3xl font-bold mt-1">{stats.userWins}</Text>
            <Text className="text-fire-400 text-xs">Your Wins</Text>
          </View>
          <View className="w-px bg-fire-700" />
          <View className="items-center">
            <Ionicons name="flame" size={32} color="#ffaa00" />
            <Text className="text-yellow-400 text-3xl font-bold mt-1">{stats.active}</Text>
            <Text className="text-fire-400 text-xs">Active</Text>
          </View>
        </View>

        {/* Devil Taunt */}
        <View className="mt-3 bg-fire-900/50 rounded-lg p-3 border border-fire-800">
          <View className="flex-row items-center">
            <Text className="text-xl mr-2">😈</Text>
            <Text className="text-fire-200 text-sm italic flex-1">"{getDevilTaunt()}"</Text>
          </View>
        </View>

        {stats.total > 0 && (
          <View className="mt-3">
            <View className="flex-row justify-between mb-1">
              <Text className="text-fire-400 text-xs">Your Win Rate</Text>
              <Text className={`text-xs font-bold ${stats.userWinRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.userWinRate}%
              </Text>
            </View>
            <View className="h-2 bg-fire-900 rounded-full overflow-hidden">
              <View
                className={`h-full ${stats.userWinRate >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${stats.userWinRate}%` }}
              />
            </View>
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff2222"
            colors={['#ff2222']}
          />
        }
      >
        {/* Active Bets */}
        {activeBets.length > 0 && (
          <>
            <Text className="text-fire-300 text-sm mb-3 uppercase tracking-wider font-bold">
              Active Bets ({activeBets.length})
            </Text>
            {activeBets.map(renderBet)}
          </>
        )}

        {activeBets.length === 0 && (
          <View className="items-center py-12">
            <Text className="text-6xl mb-4">🎰</Text>
            <Text className="text-fire-100 text-xl font-bold mt-2">No Active Bets</Text>
            <Text className="text-text-muted text-center mt-2 px-8">
              Talk to Diablo to make a bet.{'\n'}Tell him what you're trying to do.
            </Text>
            <Pressable
              onPress={() => router.navigate('/(tabs)')}
              className="mt-6 bg-fire-600 rounded-xl px-6 py-3 active:bg-fire-700"
            >
              <View className="flex-row items-center">
                <Ionicons name="chatbubble" size={18} color="#ffffff" />
                <Text className="text-white font-bold ml-2">Challenge the Devil</Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* Resolved Bets */}
        {resolvedBets.length > 0 && (
          <View className="mt-6">
            <Text className="text-text-muted text-sm mb-3 uppercase tracking-wider font-bold">
              History ({resolvedBets.length})
            </Text>
            {resolvedBets.slice(0, 10).map(renderBet)}
            {resolvedBets.length > 10 && (
              <Text className="text-text-muted text-center text-sm mt-2">
                +{resolvedBets.length - 10} more bets...
              </Text>
            )}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
