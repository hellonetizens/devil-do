import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Input, Button, Devil } from '../src/components';
import { useTaskStore } from '../src/stores/taskStore';
import { useDevilStore } from '../src/stores/devilStore';
import type { TaskPriority } from '../src/types';

const PRIORITIES: { value: TaskPriority; label: string; emoji: string }[] = [
  { value: 'urgent', label: 'Urgent', emoji: '🔥' },
  { value: 'normal', label: 'Normal', emoji: '📌' },
  { value: 'someday', label: 'Someday', emoji: '💤' },
];

export default function AddTaskScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addLocalTask } = useTaskStore();
  const { triggerShame } = useDevilStore();

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setIsSubmitting(true);

    try {
      addLocalTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
      });

      // Devil reacts to new task
      if (priority === 'someday') {
        triggerShame('app_open'); // Snarky about "someday" tasks
      }

      router.back();
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Devil commentary */}
        <View className="items-center mb-6">
          <Devil size="sm" showMessage={true} />
        </View>

        {/* Title input */}
        <View className="mb-4">
          <Input
            label="What needs to be done?"
            value={title}
            onChangeText={setTitle}
            placeholder="Enter task title..."
            autoFocus
          />
        </View>

        {/* Description input */}
        <View className="mb-4">
          <Input
            label="Details (optional)"
            value={description}
            onChangeText={setDescription}
            placeholder="Add more details..."
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Priority selector */}
        <View className="mb-6">
          <Text className="text-text-secondary text-sm mb-2 font-medium">
            Priority
          </Text>
          <View className="flex-row">
            {PRIORITIES.map((item) => (
              <Pressable
                key={item.value}
                onPress={() => setPriority(item.value)}
                className={`
                  flex-1 p-4 rounded-xl mx-1 items-center
                  ${priority === item.value ? 'bg-accent' : 'bg-surfaceLight'}
                `}
              >
                <Text className="text-2xl mb-1">{item.emoji}</Text>
                <Text
                  className={`font-medium ${
                    priority === item.value ? 'text-white' : 'text-text-secondary'
                  }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Quick suggestions */}
        <View className="mb-6">
          <Text className="text-text-muted text-sm mb-2">Quick add:</Text>
          <View className="flex-row flex-wrap">
            {['Drink water', 'Take a break', 'Reply to email', 'Exercise'].map(
              (suggestion) => (
                <Pressable
                  key={suggestion}
                  onPress={() => setTitle(suggestion)}
                  className="bg-surfaceLight px-3 py-2 rounded-lg mr-2 mb-2"
                >
                  <Text className="text-text-secondary text-sm">{suggestion}</Text>
                </Pressable>
              )
            )}
          </View>
        </View>
      </ScrollView>

      {/* Submit button */}
      <View className="px-4 pb-8 pt-4 bg-background">
        <Button
          onPress={handleSubmit}
          disabled={!title.trim()}
          loading={isSubmitting}
          fullWidth
          size="lg"
        >
          Add Task
        </Button>
      </View>
    </View>
  );
}
