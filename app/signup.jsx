import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { auth, db } from '../firebaseConfig';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name.trim()) return 'Please enter your name.';
    if (!email.trim()) return 'Please enter your email.';
    // very light e-mail check
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email.';
    if (pw.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) {
      return 'Password must include letters and numbers.';
    }
    if (pw !== pw2) return 'Passwords do not match.';
    return null;
  };

  const onSignUp = async () => {
    const err = validate();
 
    if (err) { 
      console.log('Fix and try again', err);
      Alert.alert(err); 
      return; 
    };

    try {
      setLoading(true);

      const trimmedName = name.trim();
      const trimmedEmail = email.trim();

      console.log('creating avatar');
      // 1. CREATE A DEFAULT PHOTO URL
      // used ui-avatars.com to generate a simple avatar
      const defaultPhotoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedName)}&background=e5e7eb&color=6b7280z&length=1&bold=true`;

      console.log('created avatar');
      const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, pw);
      
      // 2. UPDATE AUTH PROFILE (now with displayName AND photoURL)
      await updateProfile(cred.user, { 
        displayName: trimmedName,
        photoURL: defaultPhotoURL 
      });


      // 3. CREATE FIRESTORE DOC (with the critical path fix and photoURL)
      // Using 'profile' as the collection name for the user's own profile doc.
      const userProfileRef = doc(db, 'users', cred.user.uid);
      console.log("About to write Firestore doc to:", userProfileRef.path);
      await setDoc(userProfileRef, {
        displayName: trimmedName,
        email: trimmedEmail,
        photoURL: defaultPhotoURL, // <-- ADDED
        streak: 0,
        communities: 0,
        photoCount: 0,
        lastJournalDate: null,
        createdAt: serverTimestamp()
      });

      console.log("Firestore write completed!");
      router.replace('/tabs/home'); // go to app tabs
    } catch (e) {
      Alert.alert('Sign up failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>pantry</Text>
      <Text style={styles.title}>Create your account</Text>

      <Text style={styles.label}>Full name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Jordan Davis"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={pw}
        onChangeText={setPw}
        placeholder="At least 8 characters. Must included letters and numbers."
        secureTextEntry
        textContentType="newPassword"
      />

      <Text style={styles.label}>Confirm password</Text>
      <TextInput
        style={styles.input}
        value={pw2}
        onChangeText={setPw2}
        placeholder="Re-enter password"
        secureTextEntry
        textContentType="newPassword"
      />

      <TouchableOpacity style={styles.button} onPress={onSignUp} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
      </TouchableOpacity>

      <Text style={styles.hint}>
        By creating an account, you agree to our community guidelines.
      </Text>

      <Link href="/signin" style={styles.link}>I already have an account</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 24, paddingTop: 64 },
  brand: { fontSize: 28, fontWeight: '800', color: '#ff4d2d', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 12, color: '#6b7280', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12 },
  button: {
    backgroundColor: '#111216', padding: 14, borderRadius: 10, alignItems: 'center',
    marginTop: 18
  },
  buttonText: { color: 'white', fontWeight: '700' },
  link: { marginTop: 18, color: '#6b4eff', textAlign: 'center', fontWeight: '600' },
  hint: { color: '#6b7280', fontSize: 12, textAlign: 'center', marginTop: 12 }
});
