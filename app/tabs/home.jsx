import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { auth, db, storage } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  addDoc, collection, doc, getDoc, setDoc, updateDoc,
  onSnapshot, serverTimestamp, query, orderBy
} from 'firebase/firestore';
import dayjs from 'dayjs';

const PROMPT = "What's one comfort food that always makes you smile?";

export default function HomeScreen() {
  const user = auth.currentUser;
  const [journalText, setJournalText] = useState('');
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'feed'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const items = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
      setFeed(items);
    });
    return unsub;
  }, []);

  const ensureUserDoc = async () => {
    const uref = doc(db, 'users', user.uid);
    const snap = await getDoc(uref);
    if (!snap.exists()) {
      await setDoc(uref, {
        displayName: user.displayName || 'New Chef',
        streak: 0,
        communities: 0,
        photoCount: 0,
        lastJournalDate: null,
        createdAt: Date.now()
      });
    }
  };

  const onPostJournal = async () => {
    try {
      await ensureUserDoc();
      const uref = doc(db, 'users', user.uid);
      const snap = await getDoc(uref);
      const data = snap.data() || {};
      const today = dayjs().format('YYYY-MM-DD');

      let streak = data.streak || 0;
      if (data.lastJournalDate) {
        const last = dayjs(data.lastJournalDate);
        if (last.add(1, 'day').format('YYYY-MM-DD') === today) streak += 1;
        else if (last.format('YYYY-MM-DD') !== today) streak = 1;
      } else {
        streak = 1;
      }

      await updateDoc(uref, { lastJournalDate: today, streak });
      await addDoc(collection(db, 'journals'), {
        uid: user.uid,
        text: journalText,
        prompt: PROMPT,
        createdAt: serverTimestamp()
      });
      setJournalText('');
      Alert.alert('Saved', 'Your thoughts were saved and your streak updated!');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const onUploadImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow photo access.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      const blob = await (await fetch(asset.uri)).blob();
      const r = ref(storage, `users/${user.uid}/photos/${Date.now()}.jpg`);
      await uploadBytes(r, blob);
      const url = await getDownloadURL(r);

      await addDoc(collection(db, 'users', user.uid, 'photos'), {
        url, createdAt: serverTimestamp()
      });
      await addDoc(collection(db, 'feed'), {
        type: 'photo', url, userDisplay: user.displayName || 'Chef',
        createdAt: serverTimestamp()
      });

      const uref = doc(db, 'users', user.uid);
      const snap = await getDoc(uref);
      const cnt = (snap.data()?.photoCount || 0) + 1;
      await updateDoc(uref, { photoCount: cnt });

      Alert.alert('Uploaded', 'Photo added to your profile and feed.');
    } catch (e) {
      Alert.alert('Upload failed', e.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={{ fontWeight: '600', marginBottom: 6 }}>{item.userDisplay || 'Pantry User'}</Text>
      {item.type === 'photo' && <Image source={{ uri: item.url }} style={styles.feedImage} />}
      {item.text && <Text>{item.text}</Text>}
      <Text style={styles.time}>
        {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleString() : ''}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>pantry</Text>
        <TouchableOpacity onPress={() => signOut(auth)}><Text style={styles.link}>Sign out</Text></TouchableOpacity>
      </View>

      <View style={styles.prompt}>
        <Text style={styles.promptTitle}>Today's Prompt</Text>
        <Text style={styles.promptText}>{PROMPT}</Text>
        <TextInput
          value={journalText}
          onChangeText={setJournalText}
          placeholder="Share your thoughts here..."
          style={styles.input}
          multiline
        />
        <TouchableOpacity style={styles.primary} onPress={onPostJournal}>
          <Text style={styles.primaryText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.uploadRow}>
        <Text style={{ fontWeight: '600' }}>Document Today's Cooking</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={onUploadImage}>
          <Text style={styles.uploadText}>Add Entry</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.section}>Community Updates</Text>
      <FlatList
        data={feed}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  header: { paddingTop: 56, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontSize: 24, fontWeight: '800', color: '#ff4d2d' },
  link: { color: '#6b4eff', fontWeight: '600' },
  prompt: { backgroundColor: '#fff6ea', padding: 14, borderRadius: 12, borderColor: '#ffe3c8', borderWidth: 1, marginBottom: 14 },
  promptTitle: { fontWeight: '700', marginBottom: 8 },
  promptText: { marginBottom: 8 },
  input: { backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, minHeight: 60 },
  primary: { backgroundColor: '#111216', padding: 12, marginTop: 10, borderRadius: 10, alignItems: 'center' },
  primaryText: { color: 'white', fontWeight: '600' },
  uploadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  uploadBtn: { backgroundColor: '#111216', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  uploadText: { color: 'white', fontWeight: '700' },
  section: { fontSize: 18, fontWeight: '700', marginVertical: 8 },
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 12, marginBottom: 10 },
  feedImage: { width: '100%', height: 200, borderRadius: 10, backgroundColor: '#f1f1f1' },
  time: { color: '#666', fontSize: 12, marginTop: 6 }
});
