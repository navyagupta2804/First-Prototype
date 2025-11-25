import { Stack, useRouter, useSegments } from 'expo-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, Platform } from 'react-native';
import { auth } from '../firebaseConfig';
import * as Notifications from 'expo-notifications';

import notificationService from './services/notificationService';
import { setupNotificationChannels } from './utils/notificationChannels';

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const auth = getAuth();

  // Initialize notifications
  useEffect(() => {
    setupNotificationChannels();
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      // Register for push notifications when user signs in
      if (user) {
        await registerForPushNotifications(user.uid);
      }
    });

    return unsubscribe;
  }, []);

  // Register for push notifications
  const registerForPushNotifications = async (userId) => {
    try {
      const { status, token } = await notificationService.requestPermissions();
      
      if (status === 'granted' && token) {
        await notificationService.registerToken(userId, token);
        
        // Set default notification settings
        await notificationService.updateSettings(userId, {
          dailyReminders: true,
          reminderTime: '09:00',
          reminderDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          friendActivity: true,
        });

        // Schedule daily reminders (9:00 AM)
        await notificationService.scheduleDailyReminder(9, 0);
      }
    } catch (error) {
      console.error('Error registering for notifications:', error);
    }
  };

  // Set up notification listeners
  useEffect(() => {
    const handleNotificationReceived = (notification) => {
      console.log('Notification received in foreground:', notification);
      // You can show an in-app notification here
    };

    const handleNotificationTapped = (response) => {
      console.log('User tapped notification:', response);
      
      const data = response.notification.request.content.data;
      
      // Navigate based on notification type
      if (data?.type === 'friend_post' && data?.postId) {
        router.push(`/components/profile/screens/PostDetailScreen?postId=${data.postId}`);
      } else if (data?.type === 'friend_goal' && data?.userId) {
        router.push(`/tabs/profile?userId=${data.userId}`);
      } else if (data?.type === 'daily-reminder') {
        router.push('/tabs/log');
      }
    };

    notificationService.setupNotificationListeners(
      handleNotificationReceived,
      handleNotificationTapped
    );

    // Handle app opened from notification (quit state)
    if (Platform.OS !== 'web') {
      Notifications.getLastNotificationResponseAsync().then(response => {
        if (response) {
          const data = response.notification.request.content.data;
          if (data?.type === 'friend_post' && data?.postId) {
            router.push(`/components/profile/screens/PostDetailScreen?postId=${data.postId}`);
          } else if (data?.type === 'friend_goal' && data?.userId) {
            router.push(`/tabs/profile?userId=${data.userId}`);
          } else if (data?.type === 'daily-reminder') {
            router.push('/tabs/log');
          }
        }
      });
    }

    return () => {
      notificationService.removeNotificationListeners();
    };
  }, [router]);

  // Navigation logic
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/signin');
    } else if (user && inAuthGroup) {
      router.replace('/tabs/home');
    }
  }, [user, loading, segments]);

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="tabs" />
    </Stack>
  );
}



// export default function RootLayout() {
//   const router = useRouter();
//   const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, (user) => {
//       setHasCheckedAuth(true);

//       setTimeout(() => {
//         if (user) {
//           router.replace('/tabs/home');
//         } else {
//           router.replace('/signin');
//         }
//       }, 50);
//     });
//     return unsub;
//   }, []);

//   if (!hasCheckedAuth) {
//     return (
//         <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#ff4d2d" />
//         </View>
//     );
//   }

//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="tabs" />
//       <Stack.Screen name="signin" />
//       <Stack.Screen name="signup" />
//       <Stack.Screen name="index" /> 
//     </Stack>
//   );
// }

// const styles = StyleSheet.create({
//     loadingContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#fff',
//     }
// });
