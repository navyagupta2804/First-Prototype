import { Link, useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../firebaseConfig';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const onSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/tabs/home');
    } catch (e) {
      Alert.alert('Sign in failed', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>pantry</Text>
      <TextInput 
        style={styles.input} 
        value={email} onChangeText={setEmail} 
        placeholder="Email" 
        placeholderTextColor="#A9A9A9"
        autoCapitalize="none" 
      />
      <TextInput 
        style={styles.input} 
        value={password} 
        onChangeText={setPassword} 
        placeholder="Password" 
        placeholderTextColor="#A9A9A9"
        secureTextEntry 
      />
      <TouchableOpacity style={styles.button} onPress={onSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <Link href="/signup" style={styles.link}>Create an account</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'white' },
  title: { fontSize: 36, fontWeight: 'bold', marginBottom: 24, color: '#ff4d2d' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, marginBottom: 12 },
  button: { backgroundColor: '#111216', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  buttonText: { color: 'white', fontWeight: '600' },
  link: { marginTop: 16, color: '#6b4eff', textAlign: 'center' }
});
