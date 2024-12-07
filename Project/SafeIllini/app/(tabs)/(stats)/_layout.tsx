import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarPosition: 'top',
        tabBarActiveTintColor: 'e8def8',
      }}
    >

    <Tabs.Screen
        name="Statistics"
        options={{
          title: 'Statistics',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} size={24}/>
          ),
        }}
      />

      <Tabs.Screen
        name="Heatmap"
        options={{
          title: 'Heatmap',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'location-sharp' : 'location-outline'} color={color} size={24} />
          ),
        }}
      />

      
  

    </Tabs>
  );
}
