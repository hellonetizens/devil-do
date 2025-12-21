import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView, MotiPressable } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDevilChatStore, getBetStats } from '../../src/stores/devilChatStore';
import { colors } from '../../src/design/tokens';
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
  const insets = useSafeAreaInsets();
  const { bets, resolveBet } = useDevilChatStore();
  const stats = getBetStats(bets);
  const [refreshing, setRefreshing] = useState(false);

  const activeBets = bets.filter(b => b.status === 'active');
  const resolvedBets = bets.filter(b => b.status !== 'active');

  useEffect(() => {
    const expiredBets = activeBets.filter(b => b.deadline < Date.now());
    expiredBets.forEach(bet => resolveBet(bet.id, 'devil'));
  }, []);

  const getDevilTaunt = () => {
    if (stats.total === 0) return DEVIL_TAUNTS.noBets[Math.floor(Math.random() * DEVIL_TAUNTS.noBets.length)];
    if (stats.devilWins > stats.userWins) return DEVIL_TAUNTS.winning[Math.floor(Math.random() * DEVIL_TAUNTS.winning.length)];
    if (stats.userWins > stats.devilWins) return DEVIL_TAUNTS.losing[Math.floor(Math.random() * DEVIL_TAUNTS.losing.length)];
    return DEVIL_TAUNTS.tied[Math.floor(Math.random() * DEVIL_TAUNTS.tied.length)];
  };

  const onRefresh = () => {
    setRefreshing(true);
    const expiredBets = activeBets.filter(b => b.deadline < Date.now());
    expiredBets.forEach(bet => resolveBet(bet.id, 'devil'));
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
      <MotiView
        key={bet.id}
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-3"
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-3">
            <Text className="text-white font-semibold text-base">
              {bet.taskTitle || 'Unknown Task'}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              Devil predicts: <Text className="text-pop font-medium">{bet.devilPrediction.toUpperCase()}</Text>
            </Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${
            isActive ? 'bg-gray-800' : devilWon ? 'bg-pop/20' : 'bg-green-500/20'
          }`}>
            <Text className={`text-xs font-medium ${
              isActive ? 'text-gray-400' : devilWon ? 'text-pop' : 'text-green-400'
            }`}>
              {isActive ? 'ACTIVE' : devilWon ? 'DEVIL WON' : 'YOU WON'}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mb-2">
          <Text className="text-gray-500 text-sm">
            Stakes: <Text className="text-gray-300">{bet.stakes}</Text>
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-gray-500 text-sm">
            Confidence: <Text className="text-pop font-medium">{bet.devilConfidence}%</Text>
          </Text>
          {isActive && (
            <Text className={`text-sm ${isExpired ? 'text-pop font-medium' : 'text-gray-500'}`}>
              {isExpired ? 'EXPIRED' : formatTimeRemaining(bet.deadline)}
            </Text>
          )}
        </View>

        {isActive && (
          <View className="flex-row mt-4 gap-2">
            <MotiPressable
              onPress={() => resolveBet(bet.id, 'user')}
              animate={({ pressed }) => ({ scale: pressed ? 0.97 : 1 })}
              transition={{ type: 'timing', duration: 100 }}
              style={{
                flex: 1,
                backgroundColor: colors.success,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text className="text-white font-semibold">I Did It</Text>
            </MotiPressable>
            <MotiPressable
              onPress={() => resolveBet(bet.id, 'devil')}
              animate={({ pressed }) => ({ scale: pressed ? 0.97 : 1 })}
              transition={{ type: 'timing', duration: 100 }}
              style={{
                flex: 1,
                backgroundColor: colors.gray[800],
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text className="text-gray-400 font-semibold">I Failed</Text>
            </MotiPressable>
          </View>
        )}
      </MotiView>
    );
  };

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 py-4">
        <Text className="text-white font-semibold text-xl">Bets</Text>
      </View>

      {/* Scoreboard */}
      <View className="px-6 mb-4">
        <View className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <View className="flex-row">
            <View className="flex-1 items-center">
              <Text className="text-pop text-4xl font-bold">{stats.devilWins}</Text>
              <Text className="text-gray-500 text-xs mt-1">DEVIL</Text>
            </View>
            <View className="w-px bg-gray-800" />
            <View className="flex-1 items-center">
              <Text className="text-green-400 text-4xl font-bold">{stats.userWins}</Text>
              <Text className="text-gray-500 text-xs mt-1">YOU</Text>
            </View>
            <View className="w-px bg-gray-800" />
            <View className="flex-1 items-center">
              <Text className="text-white text-4xl font-bold">{stats.active}</Text>
              <Text className="text-gray-500 text-xs mt-1">ACTIVE</Text>
            </View>
          </View>

          {/* Win rate bar */}
          {stats.total > 0 && (
            <View className="mt-4">
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-500 text-xs">Your Win Rate</Text>
                <Text className={`text-xs font-medium ${stats.userWinRate >= 50 ? 'text-green-400' : 'text-pop'}`}>
                  {stats.userWinRate}%
                </Text>
              </View>
              <View className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <View
                  className={`h-full rounded-full ${stats.userWinRate >= 50 ? 'bg-green-400' : 'bg-pop'}`}
                  style={{ width: `${stats.userWinRate}%` }}
                />
              </View>
            </View>
          )}
        </View>

        {/* Devil Taunt */}
        <View className="mt-3 bg-gray-900/50 rounded-xl p-3 border border-gray-800">
          <Text className="text-gray-400 text-sm text-center italic">
            "{getDevilTaunt()}"
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.pop.DEFAULT}
          />
        }
      >
        {activeBets.length > 0 && (
          <>
            <Text className="text-gray-500 text-xs mb-3 font-medium">
              ACTIVE BETS ({activeBets.length})
            </Text>
            {activeBets.map(renderBet)}
          </>
        )}

        {activeBets.length === 0 && (
          <View className="items-center py-16">
            <Text className="text-5xl mb-4">🎰</Text>
            <Text className="text-white text-xl font-semibold mt-2">No Active Bets</Text>
            <Text className="text-gray-500 text-center mt-2 px-8">
              Challenge the devil by telling him what you're trying to accomplish.
            </Text>
            <MotiPressable
              onPress={() => router.navigate('/(tabs)')}
              animate={({ pressed }) => ({ scale: pressed ? 0.97 : 1 })}
              transition={{ type: 'timing', duration: 100 }}
              style={{
                marginTop: 24,
                backgroundColor: colors.pop.DEFAULT,
                paddingHorizontal: 24,
                paddingVertical: 14,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name="chatbubble" size={18} color={colors.white} />
              <Text className="text-white font-semibold ml-2">Challenge the Devil</Text>
            </MotiPressable>
          </View>
        )}

        {resolvedBets.length > 0 && (
          <View className="mt-6">
            <Text className="text-gray-500 text-xs mb-3 font-medium">
              HISTORY ({resolvedBets.length})
            </Text>
            {resolvedBets.slice(0, 10).map(renderBet)}
            {resolvedBets.length > 10 && (
              <Text className="text-gray-600 text-center text-sm mt-2">
                +{resolvedBets.length - 10} more bets
              </Text>
            )}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
