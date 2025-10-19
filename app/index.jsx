import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Replace the root route immediately after the component mounts.
    // This hands control to the primary authentication logic in _layout.jsx.
    router.replace('/signin'); 
  }, []);

  // Return a simple loading spinner to avoid the blank screen while the redirect executes
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#ff4d2d" />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    }
});