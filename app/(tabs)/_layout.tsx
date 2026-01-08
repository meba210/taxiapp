import { Tabs } from 'expo-router';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 60,
          borderTopWidth: 0.2,
          display: 'none',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="home-assistant"
              size={24}
              color="blue"
            />
          ),
        }}
      />
    </Tabs>
  );
}
