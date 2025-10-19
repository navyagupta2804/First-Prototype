import { Stack, useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { auth } from '../firebaseConfig';

export default function RootLayout() {
  const router = useRouter();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setHasCheckedAuth(true);

      setTimeout(() => {
        if (user) {
          router.replace('/tabs/home');
        } else {
          router.replace('/signin');
        }
      }, 50);
    });
    return unsub;
  }, []);

  if (!hasCheckedAuth) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff4d2d" />
        </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="tabs" />
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="index" /> 
    </Stack>
  );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    }
});