import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type TabIconProps = {
  focused: boolean;
  icon: keyof typeof Ionicons.glyphMap;
};

function TabIcon({ focused, icon }: TabIconProps) {
  return (
    <View className="items-center justify-center pt-2">
      <Ionicons
        name={icon}
        size={28}
        color={focused ? '#ff2222' : '#994444'}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#1a0505',
          borderTopColor: '#4a0000',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#ff2222',
        tabBarInactiveTintColor: '#994444',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#0a0000',
          borderBottomColor: '#4a0000',
          borderBottomWidth: 1,
        },
        headerTintColor: '#ff2222',
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#ffffff',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="checkmark-circle" />
          ),
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: 'Focus',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="flame" />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="folder" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Devil',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="skull" />
          ),
        }}
      />
    </Tabs>
  );
}
