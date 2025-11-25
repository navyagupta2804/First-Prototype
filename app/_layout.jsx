import { Stack, useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import LoadingView from './components/common/LoadingView';

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
    return <LoadingView />;
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