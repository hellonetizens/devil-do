import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MotiPressable, MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '../src/stores/taskStore';
import { useAuthStore } from '../src/stores/authStore';
import { colors } from '../src/design/tokens';
import { haptics } from '../src/services/haptics';
import type { TaskPriority, EnergyLevel } from '../src/types';

const PRIORITIES: { value: TaskPriority; label: string; description: string }[] = [
  { value: 'urgent', label: 'Urgent', description: 'Do it now' },
  { value: 'normal', label: 'Normal', description: 'Do it today' },
  { value: 'someday', label: 'Someday', description: 'Eventually' },
];

const ENERGY_LEVELS: { value: EnergyLevel; emoji: string; label: string }[] = [
  { value: 'zombie', emoji: '🧟', label: 'Zombie' },
  { value: 'low', emoji: '😴', label: 'Low' },
  { value: 'medium', emoji: '😐', label: 'Medium' },
  { value: 'high', emoji: '⚡', label: 'High' },
  { value: 'hyperfocus', emoji: '🚀', label: 'Hyper' },
];

const QUICK_TASKS = ['Drink water', 'Take a break', 'Reply to email', 'Exercise', 'Clean desk'];

export default function AddTaskScreen() {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [energy, setEnergy] = useState<EnergyLevel | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addLocalTask, addTask } = useTaskStore();
  const { user } = useAuthStore();

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    haptics.light();

    try {
      const taskInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        energy_required: energy,
      };

      if (user) {
        await addTask(user.uid, taskInput);
      } else {
        addLocalTask(taskInput);
      }

      haptics.success();
      router.back();
    } catch (error) {
      console.error('Error adding task:', error);
      haptics.error();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-black"
    >
      <View className="flex-1" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-900">
          <Pressable onPress={() => router.back()}>
            <Text className="text-gray-400">Cancel</Text>
          </Pressable>
          <Text className="text-white font-semibold">New Task</Text>
          <MotiPressable
            onPress={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            animate={{
              opacity: title.trim() ? 1 : 0.5,
            }}
            transition={{ type: 'timing', duration: 150 }}
          >
            <Text className="text-pop font-semibold">Add</Text>
          </MotiPressable>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View className="py-4">
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.gray[600]}
              className="text-white text-xl"
              autoFocus
            />
          </View>

          {/* Description */}
          <View className="py-4 border-t border-gray-900">
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Add details (optional)"
              placeholderTextColor={colors.gray[600]}
              className="text-gray-300"
              multiline
            />
          </View>

          {/* Priority */}
          <View className="py-4 border-t border-gray-900">
            <Text className="text-gray-500 text-xs mb-3">PRIORITY</Text>
            <View className="flex-row gap-2">
              {PRIORITIES.map((p) => (
                <MotiPressable
                  key={p.value}
                  onPress={() => {
                    haptics.selection();
                    setPriority(p.value);
                  }}
                  animate={{
                    backgroundColor: priority === p.value
                      ? p.value === 'urgent' ? colors.pop.DEFAULT : colors.gray[700]
                      : colors.gray[900],
                  }}
                  transition={{ type: 'timing', duration: 150 }}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: priority === p.value
                      ? p.value === 'urgent' ? colors.pop.DEFAULT : colors.gray[600]
                      : colors.gray[800],
                  }}
                >
                  <Text className={`font-medium text-sm ${
                    priority === p.value ? 'text-white' : 'text-gray-400'
                  }`}>
                    {p.label}
                  </Text>
                </MotiPressable>
              ))}
            </View>
          </View>

          {/* Energy Level */}
          <View className="py-4 border-t border-gray-900">
            <Text className="text-gray-500 text-xs mb-3">ENERGY REQUIRED</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {ENERGY_LEVELS.map((e) => (
                  <MotiPressable
                    key={e.value}
                    onPress={() => {
                      haptics.selection();
                      setEnergy(energy === e.value ? undefined : e.value);
                    }}
                    animate={{
                      backgroundColor: energy === e.value ? colors.gray[700] : colors.gray[900],
                    }}
                    transition={{ type: 'timing', duration: 150 }}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: energy === e.value ? colors.gray[600] : colors.gray[800],
                    }}
                  >
                    <Text className="text-lg mr-1">{e.emoji}</Text>
                    <Text className={`text-sm ${energy === e.value ? 'text-white' : 'text-gray-400'}`}>
                      {e.label}
                    </Text>
                  </MotiPressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Quick Tasks */}
          <View className="py-4 border-t border-gray-900">
            <Text className="text-gray-500 text-xs mb-3">QUICK ADD</Text>
            <View className="flex-row flex-wrap gap-2">
              {QUICK_TASKS.map((task) => (
                <Pressable
                  key={task}
                  onPress={() => {
                    haptics.light();
                    setTitle(task);
                  }}
                  className="bg-gray-900 border border-gray-800 px-3 py-2 rounded-lg"
                >
                  <Text className="text-gray-400 text-sm">{task}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View className="px-6 pb-4" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
          <MotiPressable
            onPress={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            animate={({ pressed }) => ({
              scale: pressed ? 0.97 : 1,
              opacity: title.trim() && !isSubmitting ? 1 : 0.5,
            })}
            transition={{ type: 'timing', duration: 100 }}
            style={{
              backgroundColor: colors.pop.DEFAULT,
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: 'center',
            }}
          >
            <Text className="text-white font-semibold text-lg">
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </Text>
          </MotiPressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
