import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

let MotiView: any = View;
let MotiPressable: any = Pressable;
if (Platform.OS !== 'web') {
  const m = require('moti');
  MotiView = m.MotiView;
  MotiPressable = m.MotiPressable;
}
import { useTaskStore } from '../src/stores/taskStore';
import { useDevilStore } from '../src/stores/devilStore';
import { colors } from '../src/design/tokens';
import type { Task } from '../src/types';

type FilterType = 'all' | 'pending' | 'completed' | 'abandoned';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'To Do' },
  { value: 'completed', label: 'Done' },
  { value: 'abandoned', label: 'Failed' },
];

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const { tasks, completeTask, abandonTask, deleteLocalTask, deleteTask } = useTaskStore();
  const { triggerShame } = useDevilStore();
  const [filter, setFilter] = useState<FilterType>('pending');

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'pending' || task.status === 'in_progress';
    return task.status === filter;
  });

  const handleComplete = async (task: Task) => {
    await completeTask(task.id);
    triggerShame('task_completed', { taskTitle: task.title });
  };

  const handleAbandon = async (task: Task) => {
    Alert.alert('Give up?', 'The devil will be pleased...', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Give Up',
        style: 'destructive',
        onPress: async () => {
          await abandonTask(task.id);
          triggerShame('session_abandoned', { taskTitle: task.title });
        },
      },
    ]);
  };

  const handleDelete = async (task: Task) => {
    Alert.alert('Delete?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (task.id.startsWith('local_')) {
            deleteLocalTask(task.id);
          } else {
            await deleteTask(task.id);
          }
        },
      },
    ]);
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status !== 'pending') return false;
    return new Date(task.due_date) < new Date();
  };

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </Pressable>
          <Text className="text-white text-xl font-semibold">Tasks</Text>
        </View>
        <MotiPressable
          onPress={() => router.push('/add-task')}
          animate={({ pressed }) => ({ scale: pressed ? 0.95 : 1 })}
          transition={{ type: 'timing', duration: 100 }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.pop.DEFAULT,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </MotiPressable>
      </View>

      {/* Stats */}
      <View className="flex-row px-6 py-3">
        <View className="flex-1 items-center">
          <Text className="text-white text-2xl font-bold">{pendingCount}</Text>
          <Text className="text-gray-500 text-xs">To Do</Text>
        </View>
        <View className="w-px bg-gray-800" />
        <View className="flex-1 items-center">
          <Text className="text-green-400 text-2xl font-bold">{completedCount}</Text>
          <Text className="text-gray-500 text-xs">Done</Text>
        </View>
      </View>

      {/* Filters */}
      <View className="flex-row px-6 py-3 gap-2">
        {FILTERS.map((f) => (
          <MotiPressable
            key={f.value}
            onPress={() => setFilter(f.value)}
            animate={{
              backgroundColor: filter === f.value ? colors.white : colors.gray[900],
            }}
            transition={{ type: 'timing', duration: 150 }}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 12,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: filter === f.value ? colors.white : colors.gray[800],
            }}
          >
            <Text style={{
              fontSize: 13,
              fontWeight: '500',
              color: filter === f.value ? colors.black : colors.gray[400],
            }}>
              {f.label}
            </Text>
          </MotiPressable>
        ))}
      </View>

      {/* Task List */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {filteredTasks.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-5xl mb-4">
              {filter === 'completed' ? '🎉' : filter === 'abandoned' ? '💀' : '✨'}
            </Text>
            <Text className="text-white text-lg font-semibold">
              {filter === 'pending' ? 'All caught up!' : 'Nothing here'}
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              {filter === 'pending' ? 'The devil is mildly impressed.' : 'Add some tasks to get started.'}
            </Text>
          </View>
        ) : (
          filteredTasks.map((task, index) => {
            const overdue = isOverdue(task);
            return (
              <MotiView
                key={task.id}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 200, delay: index * 50 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-3"
              >
                <View className="flex-row items-start">
                  {/* Checkbox */}
                  <Pressable
                    onPress={() => task.status === 'pending' && handleComplete(task)}
                    className="mr-3 mt-0.5"
                  >
                    {task.status === 'completed' ? (
                      <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center">
                        <Ionicons name="checkmark" size={16} color={colors.white} />
                      </View>
                    ) : task.status === 'abandoned' ? (
                      <View className="w-6 h-6 rounded-full bg-pop items-center justify-center">
                        <Ionicons name="close" size={16} color={colors.white} />
                      </View>
                    ) : (
                      <View className="w-6 h-6 rounded-full border-2 border-gray-600" />
                    )}
                  </Pressable>

                  {/* Content */}
                  <View className="flex-1">
                    <Text className={`font-medium ${
                      task.status === 'completed' ? 'text-gray-500 line-through' :
                      task.status === 'abandoned' ? 'text-gray-500 line-through' :
                      'text-white'
                    }`}>
                      {task.title}
                    </Text>

                    {task.description && (
                      <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>
                        {task.description}
                      </Text>
                    )}

                    <View className="flex-row items-center mt-2 gap-2">
                      {task.priority === 'urgent' && (
                        <View className="bg-pop/20 px-2 py-0.5 rounded">
                          <Text className="text-pop text-xs font-medium">URGENT</Text>
                        </View>
                      )}
                      {overdue && (
                        <View className="bg-pop/20 px-2 py-0.5 rounded">
                          <Text className="text-pop text-xs font-medium">OVERDUE</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Actions */}
                  {task.status === 'pending' && (
                    <View className="flex-row">
                      <Pressable onPress={() => handleAbandon(task)} className="p-2">
                        <Ionicons name="flag-outline" size={18} color={colors.gray[600]} />
                      </Pressable>
                      <Pressable onPress={() => handleDelete(task)} className="p-2">
                        <Ionicons name="trash-outline" size={18} color={colors.gray[600]} />
                      </Pressable>
                    </View>
                  )}
                </View>
              </MotiView>
            );
          })
        )}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
