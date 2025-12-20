import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useTaskStore } from '../../src/stores/taskStore';
import { useDevilStore } from '../../src/stores/devilStore';
import { TaskItem, Devil, Button } from '../../src/components';

export default function TasksScreen() {
  const { tasks, isLoading, completeTask, deleteLocalTask } = useTaskStore();
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
    // Check for overdue tasks and shame user
    if (overdueTasks.length > 0) {
      triggerShame('task_overdue', { overdueCount: overdueTasks.length });
    }
    setTimeout(() => setRefreshing(false), 1000);
  }, [overdueTasks.length, triggerShame]);

  const handleComplete = async (taskId: string) => {
    await completeTask(taskId);

    // Check if all tasks are done
    const remainingPending = pendingTasks.filter((t) => t.id !== taskId);
    if (remainingPending.length === 0) {
      triggerShame('all_tasks_done');
    } else {
      triggerShame('task_completed');
    }
  };

  const handleDelete = (taskId: string) => {
    deleteLocalTask(taskId);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header with Devil */}
      <View className="px-4 pt-4 pb-2">
        <Devil size="sm" showMessage={true} />
      </View>

      {/* Overdue warning */}
      {overdueTasks.length > 0 && (
        <View className="mx-4 mb-4 bg-danger/20 rounded-xl p-4">
          <Text className="text-danger font-bold">
            ⚠️ {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}
          </Text>
          <Text className="text-danger/80 text-sm mt-1">
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
            tintColor="#e63946"
          />
        }
      >
        {/* Quick stats */}
        <View className="flex-row justify-between mb-6">
          <View className="bg-surface rounded-xl p-4 flex-1 mr-2">
            <Text className="text-text-muted text-sm">Pending</Text>
            <Text className="text-text-primary text-2xl font-bold">
              {pendingTasks.length}
            </Text>
          </View>
          <View className="bg-surface rounded-xl p-4 flex-1 ml-2">
            <Text className="text-text-muted text-sm">Done Today</Text>
            <Text className="text-success text-2xl font-bold">
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
            <Text className="text-6xl mb-4">🎉</Text>
            <Text className="text-text-primary text-xl font-bold">No tasks!</Text>
            <Text className="text-text-secondary text-center mt-2">
              Either you're crushing it, or you're avoiding adding tasks.
              {'\n'}The devil suspects the latter.
            </Text>
          </View>
        ) : (
          <>
            <Text className="text-text-secondary text-sm mb-3 uppercase tracking-wider">
              To Do
            </Text>
            {pendingTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={() => handleComplete(task.id)}
                onDelete={() => handleDelete(task.id)}
              />
            ))}
          </>
        )}

        {/* Completed tasks (collapsed) */}
        {completedTasks.length > 0 && (
          <View className="mt-6 mb-8">
            <Text className="text-text-muted text-sm mb-3 uppercase tracking-wider">
              Completed ({completedTasks.length})
            </Text>
            {completedTasks.slice(0, 3).map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onDelete={() => handleDelete(task.id)}
              />
            ))}
            {completedTasks.length > 3 && (
              <Text className="text-text-muted text-center py-2">
                +{completedTasks.length - 3} more completed
              </Text>
            )}
          </View>
        )}

        {/* Spacer for FAB */}
        <View className="h-24" />
      </ScrollView>

      {/* Floating Add Button */}
      <Link href="/add-task" asChild>
        <Pressable className="absolute bottom-6 right-6 w-14 h-14 bg-accent rounded-full items-center justify-center shadow-lg active:opacity-80">
          <Text className="text-white text-3xl font-light">+</Text>
        </Pressable>
      </Link>
    </View>
  );
}
