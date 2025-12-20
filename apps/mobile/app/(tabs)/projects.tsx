import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Card, Devil } from '../../src/components';

// Placeholder projects for demo
const DEMO_PROJECTS = [
  { id: '1', name: 'Learn Guitar', color: '#e63946', tasks: 5, completed: 2 },
  { id: '2', name: 'Side Hustle', color: '#f77f00', tasks: 8, completed: 3 },
  { id: '3', name: 'Home Renovation', color: '#4a0e4e', tasks: 12, completed: 1 },
  { id: '4', name: 'Fitness Goals', color: '#2ecc71', tasks: 6, completed: 4 },
];

// Graveyard of abandoned projects
const ABANDONED_PROJECTS = [
  { id: 'a1', name: 'Learn Japanese', daysAbandoned: 45 },
  { id: 'a2', name: 'Start a Podcast', daysAbandoned: 120 },
  { id: 'a3', name: 'Write a Novel', daysAbandoned: 200 },
];

export default function ProjectsScreen() {
  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="mb-6">
          <Devil size="sm" showMessage={false} />
        </View>

        {/* Active Projects */}
        <Text className="text-text-secondary text-sm uppercase tracking-wider mb-3">
          Active Projects
        </Text>

        <View className="flex-row flex-wrap -mx-1">
          {DEMO_PROJECTS.map((project) => (
            <View key={project.id} className="w-1/2 p-1">
              <Card className="h-32">
                <View
                  className="w-8 h-8 rounded-lg mb-2"
                  style={{ backgroundColor: project.color }}
                />
                <Text className="text-text-primary font-medium" numberOfLines={1}>
                  {project.name}
                </Text>
                <Text className="text-text-muted text-sm mt-1">
                  {project.completed}/{project.tasks} tasks
                </Text>
                {/* Progress bar */}
                <View className="h-1 bg-surfaceLight rounded-full mt-2 overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${(project.completed / project.tasks) * 100}%`,
                      backgroundColor: project.color,
                    }}
                  />
                </View>
              </Card>
            </View>
          ))}
        </View>

        {/* Add Project Button */}
        <Pressable className="mt-2 mb-6">
          <Card className="border-2 border-dashed border-surfaceLight items-center justify-center h-20">
            <Text className="text-accent text-lg">+ New Project</Text>
          </Card>
        </Pressable>

        {/* Project Graveyard */}
        <Text className="text-text-muted text-sm uppercase tracking-wider mb-3">
          ☠️ Project Graveyard
        </Text>
        <Text className="text-text-muted text-xs mb-4 italic">
          Where good intentions go to die...
        </Text>

        {ABANDONED_PROJECTS.map((project) => (
          <Card key={project.id} className="mb-2 opacity-60">
            <View className="flex-row items-center">
              <Text className="text-xl mr-3">⚰️</Text>
              <View className="flex-1">
                <Text className="text-text-secondary line-through">
                  {project.name}
                </Text>
                <Text className="text-text-muted text-xs">
                  Abandoned {project.daysAbandoned} days ago
                </Text>
              </View>
              <Pressable>
                <Text className="text-accent text-sm">Revive?</Text>
              </Pressable>
            </View>
          </Card>
        ))}

        {/* Spacer */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
