import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';


export default function StatTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarPosition: 'top',
        tabBarActiveTintColor: 'e8def8',
      }}
    >
      <Tabs.Screen
        name="HeatMap"
        options={{
          title: 'Heat Map',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'location-sharp' : 'location-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="BarChart"
        options={{
          title: 'Bar Chart',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} size={24}/>
          ),
        }}
      />
    </Tabs>
  );
}
