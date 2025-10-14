import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#111216' }}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({color,size}) => <Ionicons name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: ({color,size}) => <Ionicons name="search" color={color} size={size} /> }} />
      <Tabs.Screen name="post" options={{ title: 'Post', tabBarIcon: ({color,size}) => <MaterialIcons name="add-circle-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="communities" options={{ title: 'Communities', tabBarIcon: ({color,size}) => <Ionicons name="people" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({color,size}) => <Ionicons name="person" color={color} size={size} /> }} />
    </Tabs>
  );
}
