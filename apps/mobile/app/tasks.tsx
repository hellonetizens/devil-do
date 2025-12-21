import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '../src/stores/taskStore';
import { useAuthStore } from '../src/stores/authStore';
import { useDevilStore } from '../src/stores/devilStore';
import type { Task, TaskStatus } from '../src/types';

type FilterType = 'all' | 'pending' | 'completed' | 'abandoned';

const FILTERS: { value: FilterType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'all', label: 'All', icon: 'list' },
  { value: 'pending', label: 'Pending', icon: 'time' },
  { value: 'completed', label: 'Done', icon: 'checkmark-circle' },
  { value: 'abandoned', label: 'Failed', icon: 'close-circle' },
];

const PRIORITY_COLORS = {
  urgent: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-600' },
  normal: { bg: 'bg-fire-900', text: 'text-fire-200', border: 'border-fire-700' },
  someday: { bg: 'bg-fire-950', text: 'text-fire-400', border: 'border-fire-800' },
};

export default function TasksScreen() {
  const { tasks, completeTask, abandonTask, deleteLocalTask, deleteTask } = useTaskStore();
  const { user } = useAuthStore();
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
    Alert.alert(
      'Abandon Task?',
      'The devil will be very pleased...',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Give Up',
          style: 'destructive',
          onPress: async () => {
            await abandonTask(task.id);
            triggerShame('session_abandoned', { taskTitle: task.title });
          },
        },
      ]
    );
  };

  const handleDelete = async (task: Task) => {
    Alert.alert(
      'Delete Task?',
      'This cannot be undone.',
      [
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
      ]
    );
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status !== 'pending') return false;
    return new Date(task.due_date) < new Date();
  };

  const renderTask = (task: Task) => {
    const priority = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.normal;
    const overdue = isOverdue(task);

    return (
      <View
        key={task.id}
        className={`${priority.bg} border ${overdue ? 'border-red-500' : priority.border} rounded-xl p-4 mb-3`}
      >
        <View className="flex-row items-start">
          {/* Status indicator */}
          <View className="mr-3 mt-1">
            {task.status === 'completed' ? (
              <Ionicons name="checkmark-circle" size={24} color="#44ff44" />
            ) : task.status === 'abandoned' ? (
              <Ionicons name="close-circle" size={24} color="#ff4444" />
            ) : (
              <Pressable onPress={() => handleComplete(task)}>
                <Ionicons name="ellipse-outline" size={24} color="#994444" />
              </Pressable>
            )}
          </View>

          {/* Task content */}
          <View className="flex-1">
            <Text
              className={`font-medium text-base ${
                task.status === 'completed'
                  ? 'text-text-muted line-through'
                  : task.status === 'abandoned'
                  ? 'text-red-400 line-through'
                  : priority.text
              }`}
            >
              {task.title}
            </Text>

            {task.description && (
              <Text className="text-text-muted text-sm mt-1" numberOfLines={2}>
                {task.description}
              </Text>
            )}

            <View className="flex-row items-center mt-2 flex-wrap">
              {/* Priority badge */}
              <View className={`px-2 py-0.5 rounded mr-2 mb-1 ${
                task.priority === 'urgent' ? 'bg-red-500/30' :
                task.priority === 'someday' ? 'bg-fire-800' : 'bg-fire-700'
              }`}>
                <Text className={`text-xs font-bold ${
                  task.priority === 'urgent' ? 'text-red-400' : 'text-fire-300'
                }`}>
                  {task.priority.toUpperCase()}
                </Text>
              </View>

              {/* Overdue badge */}
              {overdue && (
                <View className="bg-red-500/30 px-2 py-0.5 rounded mr-2 mb-1">
                  <Text className="text-red-400 text-xs font-bold">OVERDUE</Text>
                </View>
              )}

              {/* Local badge */}
              {task.id.startsWith('local_') && (
                <View className="bg-yellow-500/20 px-2 py-0.5 rounded mb-1">
                  <Text className="text-yellow-400 text-xs">LOCAL</Text>
                </View>
              )}
            </View>
          </View>

          {/* Actions */}
          {task.status === 'pending' && (
            <View className="flex-row ml-2">
              <Pressable
                onPress={() => handleAbandon(task)}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="flag" size={18} color="#ff4444" />
              </Pressable>
              <Pressable
                onPress={() => handleDelete(task)}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="trash-outline" size={18} color="#666" />
              </Pressable>
            </View>
          )}
        </View>
      </View>
    );
  };

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const abandonedCount = tasks.filter(t => t.status === 'abandoned').length;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#ff2222" />
          </Pressable>
          <Text className="text-fire-100 text-2xl font-bold">Tasks</Text>
        </View>
        <Pressable
          onPress={() => router.push('/add-task')}
          className="w-10 h-10 bg-fire-600 rounded-full items-center justify-center active:bg-fire-700"
        >
          <Ionicons name="add" size={24} color="#ffffff" />
        </Pressable>
      </View>

      {/* Stats */}
      <View className="flex-row px-4 py-3">
        <View className="flex-1 items-center">
          <Text className="text-yellow-400 text-xl font-bold">{pendingCount}</Text>
          <Text className="text-text-muted text-xs">Pending</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-green-400 text-xl font-bold">{completedCount}</Text>
          <Text className="text-text-muted text-xs">Done</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-red-400 text-xl font-bold">{abandonedCount}</Text>
          <Text className="text-text-muted text-xs">Failed</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <View className="flex-row px-4 pb-3">
        {FILTERS.map((f) => (
          <Pressable
            key={f.value}
            onPress={() => setFilter(f.value)}
            className={`flex-1 py-2 mx-1 rounded-lg items-center ${
              filter === f.value ? 'bg-fire-600' : 'bg-surface border border-fire-800'
            }`}
          >
            <Ionicons
              name={f.icon}
              size={16}
              color={filter === f.value ? '#ffffff' : '#994444'}
            />
            <Text
              className={`text-xs mt-1 ${
                filter === f.value ? 'text-white font-bold' : 'text-fire-400'
              }`}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Task list */}
      <ScrollView className="flex-1 px-4">
        {filteredTasks.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-5xl mb-4">
              {filter === 'completed' ? '🎉' : filter === 'abandoned' ? '💀' : '✨'}
            </Text>
            <Text className="text-fire-100 text-lg font-bold">
              {filter === 'completed'
                ? 'No completed tasks yet'
                : filter === 'abandoned'
                ? 'No failures... yet'
                : filter === 'pending'
                ? 'All caught up!'
                : 'No tasks found'}
            </Text>
            <Text className="text-text-muted text-center mt-2">
              {filter === 'pending'
                ? "The devil is impressed... for now."
                : "Add some tasks to get started."}
            </Text>
          </View>
        ) : (
          <>
            {filteredTasks.map(renderTask)}
            <View className="h-8" />
          </>
        )}
      </ScrollView>
    </View>
  );
}
