import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function TabsLayout() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user?.uid) {
          setIsAdmin(false);
          return;
        }
        const snap = await getDoc(doc(db, "users", user.uid));
        setIsAdmin(!!snap.data()?.isAdmin);
      } catch (e) {
        console.log("Admin check failed in tabs:", e);
        setIsAdmin(false);
      }
    });

    // ✅ FIX: return a proper cleanup function
    return () => unsub();
  }, []);

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#111216' }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: 'Post',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="add-circle-outline" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          title: 'Communities',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          )
        }}
      />

      {/* Hidden unless admin */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" color={color} size={size} />
          ),
          href: isAdmin ? undefined : null, // hides the tab
        }}
      />
    </Tabs>
  );
}
