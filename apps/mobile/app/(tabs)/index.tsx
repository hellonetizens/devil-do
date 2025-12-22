import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/design/tokens';
import { useTaskStore } from '../../src/stores/taskStore';
import { useStreakStore } from '../../src/stores/streakStore';
import { useXPStore } from '../../src/stores/xpStore';
import { useDevilChatStore, getBetStats } from '../../src/stores/devilChatStore';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [localMessage, setLocalMessage] = useState('');

  const { tasks } = useTaskStore();
  const { currentStreak, tasksCompletedToday, getEffectiveDailyGoal, dailyGoalMetToday } = useStreakStore();
  const { level, getLevelTitle } = useXPStore();
  const { bets, sendMessage, isTyping, lastMessage, startSession, devilMood } = useDevilChatStore();

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const dailyGoal = getEffectiveDailyGoal();
  const betStats = getBetStats(bets);

  useEffect(() => {
    startSession();
  }, []);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) {
      if (Platform.OS === 'web') {
        setLocalMessage('Type something first!');
      } else {
        Alert.alert('Error', 'Type something first!');
      }
      return;
    }

    setInputText('');
    setLocalMessage('Sending...');

    try {
      await sendMessage(text, tasks);
      setLocalMessage('');
    } catch (error) {
      console.error('Send error:', error);
      setLocalMessage('Failed to send. Try again.');
    }
  };

  const getMoodEmoji = () => {
    if (dailyGoalMetToday) return '😈';
    if (devilMood === 'angry') return '👿';
    if (devilMood === 'impressed') return '😏';
    if (tasksCompletedToday === 0) return '😒';
    return '😈';
  };

  const goTo = (path: string) => {
    try {
      router.push(path as any);
    } catch (e) {
      console.error('Navigation error:', e);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#1a1a1a',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: '#666', fontSize: 11, letterSpacing: 1 }}>LEVEL {level}</Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '500' }}>{getLevelTitle()}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
              <Text style={{ color: '#666', fontSize: 11 }}>STREAK</Text>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '600' }}>{currentStreak}</Text>
            </View>
            <Text style={{ fontSize: 24 }}>{currentStreak > 0 ? '🔥' : '💀'}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Devil */}
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <Text style={{ fontSize: 72 }}>{getMoodEmoji()}</Text>

          {(lastMessage || localMessage) && (
            <View style={{
              marginTop: 24,
              marginHorizontal: 24,
              backgroundColor: '#111',
              borderRadius: 16,
              padding: 16,
              maxWidth: 320,
            }}>
              <Text style={{ color: '#ccc', textAlign: 'center', fontSize: 15, lineHeight: 22 }}>
                "{localMessage || lastMessage}"
              </Text>
            </View>
          )}

          {isTyping && (
            <Text style={{ color: '#666', marginTop: 12 }}>Devil is typing...</Text>
          )}
        </View>

        {/* Stats */}
        <View style={{ paddingHorizontal: 24 }}>
          {/* Today's Progress */}
          <TouchableOpacity
            onPress={() => goTo('/tasks')}
            activeOpacity={0.7}
            style={{
              backgroundColor: '#111',
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ color: '#888', fontSize: 13, fontWeight: '500' }}>Today's Progress</Text>
              {dailyGoalMetToday && (
                <Text style={{ color: '#22c55e', fontSize: 11 }}>COMPLETE</Text>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Text style={{ color: '#fff', fontSize: 48, fontWeight: '300' }}>{tasksCompletedToday}</Text>
              <Text style={{ color: '#444', fontSize: 24, fontWeight: '300', marginBottom: 4 }}>/{dailyGoal}</Text>
              <View style={{ flex: 1 }} />
              <Text style={{ color: '#666', fontSize: 12 }}>{pendingTasks.length} pending →</Text>
            </View>
          </TouchableOpacity>

          {/* Devil vs You */}
          <TouchableOpacity
            onPress={() => goTo('/(tabs)/projects')}
            activeOpacity={0.7}
            style={{
              backgroundColor: '#111',
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <Text style={{ color: '#888', fontSize: 13, fontWeight: '500', marginBottom: 16 }}>Devil vs You</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#ef4444', fontSize: 36, fontWeight: '300' }}>{betStats.devilWins}</Text>
                <Text style={{ color: '#555', fontSize: 11, marginTop: 4 }}>Devil</Text>
              </View>
              <Text style={{ color: '#333', fontSize: 20, paddingHorizontal: 16 }}>—</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#22c55e', fontSize: 36, fontWeight: '300' }}>{betStats.userWins}</Text>
                <Text style={{ color: '#555', fontSize: 11, marginTop: 4 }}>You</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={{ color: '#888', fontSize: 20, fontWeight: '300' }}>{betStats.active}</Text>
                <Text style={{ color: '#555', fontSize: 11, marginTop: 4 }}>Active</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Quick Actions */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => goTo('/add-task')}
              activeOpacity={0.7}
              style={{
                flex: 1,
                backgroundColor: '#fff',
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              <Ionicons name="add" size={20} color="#000" />
              <Text style={{ color: '#000', fontSize: 11, fontWeight: '500', marginTop: 4 }}>Add Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => goTo('/(tabs)/focus')}
              activeOpacity={0.7}
              style={{
                flex: 1,
                backgroundColor: '#111',
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              <Ionicons name="timer-outline" size={20} color="#888" />
              <Text style={{ color: '#888', fontSize: 11, fontWeight: '500', marginTop: 4 }}>Focus</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => goTo('/settings')}
              activeOpacity={0.7}
              style={{
                flex: 1,
                backgroundColor: '#111',
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              <Ionicons name="settings-outline" size={20} color="#888" />
              <Text style={{ color: '#888', fontSize: 11, fontWeight: '500', marginTop: 4 }}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Chat Input */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderTopWidth: 1,
          borderTopColor: '#1a1a1a',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Talk to the devil..."
            placeholderTextColor="#666"
            style={{
              flex: 1,
              backgroundColor: '#111',
              color: '#fff',
              borderRadius: 24,
              paddingHorizontal: 20,
              paddingVertical: 12,
              fontSize: 16,
              marginRight: 12,
            }}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={handleSend}
            activeOpacity={0.7}
            disabled={isTyping}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: inputText.trim() ? '#ff2222' : '#222',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={inputText.trim() ? '#fff' : '#666'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
