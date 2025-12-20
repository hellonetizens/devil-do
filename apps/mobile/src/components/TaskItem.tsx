import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onPress?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
}

const priorityConfig = {
  urgent: { color: '#ff2222', icon: 'flame' as const },
  normal: { color: '#ff8800', icon: 'remove' as const },
  someday: { color: '#994444', icon: 'moon' as const },
};

export function TaskItem({ task, onPress, onComplete, onDelete }: TaskItemProps) {
  const isCompleted = task.status === 'completed';
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;
  const priority = priorityConfig[task.priority];

  return (
    <Pressable
      onPress={onPress}
      className="bg-surface border border-fire-800 rounded-xl p-4 mb-3 active:bg-fire-900"
    >
      <View className="flex-row items-start">
        {/* Checkbox */}
        <Pressable
          onPress={onComplete}
          className={`
            w-7 h-7 rounded-full border-2 mr-3 mt-0.5
            items-center justify-center
            ${isCompleted ? 'bg-success border-success' : 'border-fire-500'}
          `}
        >
          {isCompleted && (
            <Ionicons name="checkmark" size={18} color="#0a0000" />
          )}
        </Pressable>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-center">
            {task.priority === 'urgent' && (
              <Ionicons name="flame" size={16} color="#ff2222" style={{ marginRight: 4 }} />
            )}
            <Text
              className={`
                text-base font-medium flex-1
                ${isCompleted ? 'text-text-muted line-through' : 'text-white'}
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
                  flex-row items-center px-2 py-1 rounded-lg mr-2
                  ${isOverdue ? 'bg-fire-600' : 'bg-fire-900'}
                `}
              >
                <Ionicons
                  name={isOverdue ? "alert-circle" : "calendar"}
                  size={12}
                  color={isOverdue ? '#ff4444' : '#ff9999'}
                />
                <Text
                  className={`text-xs ml-1 ${isOverdue ? 'text-fire-100' : 'text-text-secondary'}`}
                >
                  {new Date(task.due_date).toLocaleDateString()}
                </Text>
              </View>
            )}

            {/* Priority indicator */}
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: priority.color }}
            />
          </View>
        </View>

        {/* Delete button */}
        {onDelete && (
          <Pressable
            onPress={onDelete}
            className="ml-2 p-2 -mr-2 -mt-2"
          >
            <Ionicons name="close" size={20} color="#994444" />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
