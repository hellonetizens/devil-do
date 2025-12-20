import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '../../src/stores/taskStore';
import { useDevilStore } from '../../src/stores/devilStore';
import { TaskItem, Devil } from '../../src/components';

export default function TasksScreen() {
  const { tasks, completeTask, deleteLocalTask } = useTaskStore();
  const { triggerShame } = useDevilStore();
  const [refreshing, setRefreshing] = useState(false);

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const overdueTasks = tasks.filter((t) => {
    if (!t.due_date || t.status === 'completed') return false;
    return new Date(t.due_date) < new Date();
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (overdueTasks.length > 0) {
      triggerShame('task_overdue', { overdueCount: overdueTasks.length });
    }
    setTimeout(() => setRefreshing(false), 1000);
  }, [overdueTasks.length, triggerShame]);

  const handleComplete = async (taskId: string) => {
    await completeTask(taskId);
    const remainingPending = pendingTasks.filter((t) => t.id !== taskId);
    if (remainingPending.length === 0) {
      triggerShame('all_tasks_done');
    } else {
      triggerShame('task_completed');
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header with Devil */}
      <View className="px-4 pt-4 pb-2">
        <Devil size="sm" showMessage={true} />
      </View>

      {/* Overdue warning */}
      {overdueTasks.length > 0 && (
        <View className="mx-4 mb-4 bg-fire-700 border border-fire-500 rounded-xl p-4">
          <View className="flex-row items-center">
            <Ionicons name="warning" size={24} color="#ff4444" />
            <Text className="text-fire-100 font-bold ml-2">
              {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}
            </Text>
          </View>
          <Text className="text-fire-200 text-sm mt-1">
            The devil is watching... and judging.
          </Text>
        </View>
      )}

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff2222"
          />
        }
      >
        {/* Quick stats */}
        <View className="flex-row justify-between mb-6">
          <View className="bg-surface border border-fire-800 rounded-xl p-4 flex-1 mr-2">
            <View className="flex-row items-center">
              <Ionicons name="time" size={20} color="#ff9999" />
              <Text className="text-text-muted text-sm ml-2">Pending</Text>
            </View>
            <Text className="text-fire-100 text-3xl font-bold mt-1">
              {pendingTasks.length}
            </Text>
          </View>
          <View className="bg-surface border border-fire-800 rounded-xl p-4 flex-1 ml-2">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-done" size={20} color="#44ff44" />
              <Text className="text-text-muted text-sm ml-2">Done Today</Text>
            </View>
            <Text className="text-success text-3xl font-bold mt-1">
              {completedTasks.filter((t) => {
                if (!t.completed_at) return false;
                const today = new Date().toISOString().split('T')[0];
                return t.completed_at.startsWith(today);
              }).length}
            </Text>
          </View>
        </View>

        {/* Task list */}
        {pendingTasks.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons name="flame" size={64} color="#ff2222" />
            <Text className="text-fire-100 text-xl font-bold mt-4">No tasks!</Text>
            <Text className="text-text-secondary text-center mt-2 px-8">
              Either you're crushing it, or you're avoiding adding tasks.
              The devil suspects the latter.
            </Text>
          </View>
        ) : (
          <>
            <Text className="text-fire-300 text-sm mb-3 uppercase tracking-wider font-bold">
              To Do
            </Text>
            {pendingTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={() => handleComplete(task.id)}
                onDelete={() => deleteLocalTask(task.id)}
              />
            ))}
          </>
        )}

        {/* Completed tasks */}
        {completedTasks.length > 0 && (
          <View className="mt-6 mb-8">
            <Text className="text-text-muted text-sm mb-3 uppercase tracking-wider font-bold">
              Completed ({completedTasks.length})
            </Text>
            {completedTasks.slice(0, 3).map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onDelete={() => deleteLocalTask(task.id)}
              />
            ))}
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* Floating Add Button */}
      <Link href="/add-task" asChild>
        <Pressable className="absolute bottom-6 right-6 w-16 h-16 bg-accent rounded-full items-center justify-center shadow-lg border-2 border-fire-400 active:bg-fire-400">
          <Ionicons name="add" size={32} color="#ffffff" />
        </Pressable>
      </Link>
    </View>
  );
}
