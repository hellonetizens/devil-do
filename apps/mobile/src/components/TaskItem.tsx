import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onPress?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
}

const priorityColors = {
  urgent: 'bg-danger',
  normal: 'bg-warning',
  someday: 'bg-text-muted',
};

const priorityLabels = {
  urgent: '🔥',
  normal: '',
  someday: '💤',
};

export function TaskItem({ task, onPress, onComplete, onDelete }: TaskItemProps) {
  const isCompleted = task.status === 'completed';
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

  return (
    <Pressable
      onPress={onPress}
      className="bg-surface rounded-xl p-4 mb-3 active:opacity-80"
    >
      <View className="flex-row items-start">
        {/* Checkbox */}
        <Pressable
          onPress={onComplete}
          className={`
            w-6 h-6 rounded-full border-2 mr-3 mt-0.5
            items-center justify-center
            ${isCompleted ? 'bg-success border-success' : 'border-text-muted'}
          `}
        >
          {isCompleted && (
            <Text className="text-white text-xs">✓</Text>
          )}
        </Pressable>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-center">
            {priorityLabels[task.priority] && (
              <Text className="mr-1">{priorityLabels[task.priority]}</Text>
            )}
            <Text
              className={`
                text-base font-medium flex-1
                ${isCompleted ? 'text-text-muted line-through' : 'text-text-primary'}
              `}
              numberOfLines={2}
            >
              {task.title}
            </Text>
          </View>

          {task.description && (
            <Text
              className="text-text-secondary text-sm mt-1"
              numberOfLines={2}
            >
              {task.description}
            </Text>
          )}

          {/* Meta info */}
          <View className="flex-row items-center mt-2">
            {task.due_date && (
              <View
                className={`
                  px-2 py-1 rounded-lg mr-2
                  ${isOverdue ? 'bg-danger/20' : 'bg-surfaceLight'}
                `}
              >
                <Text
                  className={`text-xs ${isOverdue ? 'text-danger' : 'text-text-secondary'}`}
                >
                  {isOverdue ? '⚠️ ' : ''}
                  {new Date(task.due_date).toLocaleDateString()}
                </Text>
              </View>
            )}

            {/* Priority indicator */}
            <View className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`} />
          </View>
        </View>

        {/* Delete button */}
        {onDelete && (
          <Pressable
            onPress={onDelete}
            className="ml-2 p-2 -mr-2 -mt-2"
          >
            <Text className="text-text-muted">×</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
