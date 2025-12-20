import React from 'react';
import { View, ScrollView } from 'react-native';
import { FocusTimer } from '../../src/components';

export default function FocusScreen() {
  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      >
        <FocusTimer />
      </ScrollView>
    </View>
  );
}
