import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';

type TabIconProps = {
  focused: boolean;
  icon: string;
  label: string;
};

function TabIcon({ focused, icon, label }: TabIconProps) {
  return (
    <View className="items-center justify-center pt-2">
      <Text style={{ fontSize: 24 }}>{icon}</Text>
      <Text
        className={`text-xs mt-1 ${focused ? 'text-accent' : 'text-text-muted'}`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#1a1a2e',
          borderTopColor: '#252542',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
        },
        tabBarShowLabel: false,
        headerStyle: {
          backgroundColor: '#0f0f1a',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="📋" label="Tasks" />
          ),
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: 'Focus',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🎯" label="Focus" />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="📁" label="Projects" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="😈" label="Devil" />
          ),
        }}
      />
    </Tabs>
  );
}
