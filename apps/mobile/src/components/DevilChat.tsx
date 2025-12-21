import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useDevilChatStore, getBetStats } from '../stores/devilChatStore';
import { useTaskStore } from '../stores/taskStore';
import type { ConversationMessage } from '../services/devilAI';

const MOOD_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  cocky: 'flame',
  angry: 'skull',
  impressed: 'star',
  scheming: 'eye',
  mocking: 'happy',
  desperate: 'sad',
};

const MOOD_COLORS: Record<string, string> = {
  cocky: '#ff2222',
  angry: '#ff0000',
  impressed: '#ffd700',
  scheming: '#9932cc',
  mocking: '#ff6600',
  desperate: '#ff4444',
};

export function DevilChat() {
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const devilScale = useSharedValue(1);

  const {
    userPattern,
    bets,
    devilMood,
    lastMessage,
    isTyping,
    sendMessage,
    getKickOutMessage,
    startSession,
  } = useDevilChatStore();

  const { tasks } = useTaskStore();
  const betStats = getBetStats(bets);

  useEffect(() => {
    startSession();
  }, []);

  // Animate devil when mood changes
  useEffect(() => {
    devilScale.value = withSequence(
      withSpring(1.2, { damping: 3 }),
      withSpring(1, { damping: 5 })
    );
  }, [devilMood]);

  const devilAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: devilScale.value }],
  }));

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const message = inputText.trim();
    setInputText('');

    try {
      await sendMessage(message, tasks);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleQuickAction = async (action: string) => {
    await sendMessage(action, tasks);
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const renderMessage = (msg: ConversationMessage, index: number) => {
    const isDevil = msg.role === 'devil';

    return (
      <View
        key={index}
        className={`mb-3 ${isDevil ? 'items-start' : 'items-end'}`}
      >
        <View
          className={`max-w-[85%] rounded-2xl px-4 py-3 ${
            isDevil
              ? 'bg-fire-900 border border-fire-700 rounded-bl-sm'
              : 'bg-fire-600 rounded-br-sm'
          }`}
        >
          {isDevil && (
            <View className="flex-row items-center mb-1">
              <Ionicons name="flame" size={12} color="#ff2222" />
              <Text className="text-fire-400 text-xs ml-1 font-bold">DIABLO</Text>
            </View>
          )}
          <Text className={`${isDevil ? 'text-fire-100' : 'text-white'} text-base`}>
            {msg.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      keyboardVerticalOffset={100}
    >
      <View className="flex-1 bg-background">
        {/* Devil Header */}
        <View className="items-center pt-4 pb-2 border-b border-fire-900">
          <Animated.View
            style={[devilAnimatedStyle]}
            className="w-16 h-16 rounded-full bg-fire-900 items-center justify-center mb-2"
          >
            <Ionicons
              name={MOOD_ICONS[devilMood] || 'flame'}
              size={36}
              color={MOOD_COLORS[devilMood] || '#ff2222'}
            />
          </Animated.View>

          <Text className="text-fire-100 font-bold text-lg">DIABLO</Text>
          <Text className="text-fire-400 text-xs">
            {devilMood.toUpperCase()} MODE
          </Text>

          {/* Bet Scoreboard */}
          <View className="flex-row mt-3 bg-surface rounded-xl px-4 py-2 border border-fire-800">
            <View className="items-center px-3">
              <Text className="text-fire-400 text-xs">DEVIL</Text>
              <Text className="text-accent text-xl font-bold">{betStats.devilWins}</Text>
            </View>
            <View className="w-px bg-fire-700 mx-2" />
            <View className="items-center px-3">
              <Text className="text-fire-400 text-xs">YOU</Text>
              <Text className="text-green-400 text-xl font-bold">{betStats.userWins}</Text>
            </View>
            <View className="w-px bg-fire-700 mx-2" />
            <View className="items-center px-3">
              <Text className="text-fire-400 text-xs">ACTIVE</Text>
              <Text className="text-yellow-400 text-xl font-bold">{betStats.active}</Text>
            </View>
          </View>
        </View>

        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {userPattern.conversationHistory.length === 0 && (
            <View className="items-center py-8">
              <Text className="text-fire-400 text-center text-lg mb-4">
                {lastMessage}
              </Text>
              <Text className="text-text-muted text-center text-sm">
                Tell me what you need to do.{'\n'}I'll bet against you completing it.
              </Text>
            </View>
          )}

          {userPattern.conversationHistory.map(renderMessage)}

          {isTyping && (
            <View className="items-start mb-3">
              <View className="bg-fire-900 border border-fire-700 rounded-2xl rounded-bl-sm px-4 py-3">
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#ff2222" />
                  <Text className="text-fire-400 ml-2 text-sm">scheming...</Text>
                </View>
              </View>
            </View>
          )}

          <View className="h-4" />
        </ScrollView>

        {/* Quick Actions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="max-h-12 px-4 border-t border-fire-900"
          contentContainerStyle={{ paddingVertical: 8, gap: 8 }}
        >
          <QuickActionButton
            label="What should I do?"
            onPress={() => handleQuickAction("What should I do right now?")}
          />
          <QuickActionButton
            label="I can't focus"
            onPress={() => handleQuickAction("I can't focus today")}
          />
          <QuickActionButton
            label="Make a bet"
            onPress={() => handleQuickAction("I want to make a bet")}
          />
          <QuickActionButton
            label="Break down task"
            onPress={() => handleQuickAction("Help me break down a task")}
          />
          <QuickActionButton
            label="Roast me"
            onPress={() => handleQuickAction("Roast me. I deserve it.")}
          />
        </ScrollView>

        {/* Input Area */}
        <View className="px-4 py-3 border-t border-fire-900 bg-surface">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => router.push('/add-task')}
              className="w-10 h-10 rounded-full bg-fire-800 items-center justify-center mr-2 active:bg-fire-700"
            >
              <Ionicons name="add" size={24} color="#ff2222" />
            </Pressable>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Tell the devil what you're avoiding..."
              placeholderTextColor="#994444"
              className="flex-1 bg-fire-900 text-fire-100 rounded-xl px-4 py-3 mr-2 border border-fire-700"
              multiline
              maxLength={500}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <Pressable
              onPress={handleSend}
              disabled={!inputText.trim() || isTyping}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                inputText.trim() && !isTyping ? 'bg-accent' : 'bg-fire-800'
              }`}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() && !isTyping ? '#ffffff' : '#994444'}
              />
            </Pressable>
          </View>
        </View>

        {/* Task Count Badge */}
        {tasks.filter(t => t.status === 'pending').length > 0 && (
          <Pressable
            onPress={() => router.push('/tasks')}
            className="absolute top-16 right-4 bg-fire-600 rounded-full px-3 py-1 flex-row items-center active:bg-fire-700"
          >
            <Ionicons name="list" size={14} color="#ffffff" />
            <Text className="text-white text-xs font-bold ml-1">
              {tasks.filter(t => t.status === 'pending').length} tasks
            </Text>
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function QuickActionButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-fire-900 border border-fire-700 rounded-full px-4 py-2 active:bg-fire-800"
    >
      <Text className="text-fire-200 text-sm">{label}</Text>
    </Pressable>
  );
}
