import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/design/tokens';

type TabIconProps = {
  focused: boolean;
  icon: keyof typeof Ionicons.glyphMap;
};

function TabIcon({ focused, icon }: TabIconProps) {
  return (
    <View className="items-center justify-center pt-2">
      <Ionicons
        name={icon}
        size={24}
        color={focused ? colors.pop.DEFAULT : colors.gray[600]}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.black,
          borderTopColor: colors.gray[900],
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.pop.DEFAULT,
        tabBarInactiveTintColor: colors.gray[600],
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.black,
          borderBottomColor: colors.gray[900],
          borderBottomWidth: 1,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.white,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="home" />
          ),
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: 'Focus',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="timer-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Bets',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="trophy-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Stats',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="bar-chart-outline" />
          ),
        }}
      />
    </Tabs>
  );
}
