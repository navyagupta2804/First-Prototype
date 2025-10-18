import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import {
  addDoc, collection, doc, getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc, updateDoc
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList, Image,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';
import { auth, db, storage } from '../../firebaseConfig';


const PROMPT = "What's one comfort food that always makes you smile?";

export default function HomeScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  const [journalText, setJournalText] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feed, setFeed] = useState([]);

  // ---- Feed subscription ----
  useEffect(() => {
    const q = query(collection(db, 'feed'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const items = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
      setFeed(items);
    });
    return unsub;
  }, []);

  // ---- Ensure user profile doc exists ----
  const ensureUserDoc = async () => {
    const uref = doc(db, 'users', user.uid);
    const snap = await getDoc(uref);
    if (!snap.exists()) {
      await setDoc(uref, {
        displayName: user.displayName || 'Pantry Member',
        streak: 0,
        communities: 0,
        photoCount: 0,
        lastJournalDate: null,
        createdAt: Date.now()
      });
    }
  };

  // ---- Save journal + update streak ----
  const onPostJournal = async () => {
    if (!journalText.trim()) {
      Alert.alert('Add a thought', 'Write a quick sentence before saving.');
      return;
    }
    try {
      setSaving(true);
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
        text: journalText.trim(),
        prompt: PROMPT,
        createdAt: serverTimestamp()
      });
      setJournalText('');
      Alert.alert('Saved', 'Your thoughts were saved and your streak updated!');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  // ---- Upload photo from gallery ----
  const onUploadImage = async () => {
    try {
      setUploading(true);
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        setUploading(false);
        Alert.alert('Permission needed', 'Please allow photo access to upload.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85
      });
      if (result.canceled) {
        setUploading(false);
        return;
      }

      const asset = result.assets[0];
      const blob = await (await fetch(asset.uri)).blob();
      const r = ref(storage, `users/${user.uid}/photos/${Date.now()}.jpg`);
      await uploadBytes(r, blob);
      const url = await getDownloadURL(r);

      await addDoc(collection(db, 'users', user.uid, 'photos'), {
        url, createdAt: serverTimestamp()
      });
      await addDoc(collection(db, 'feed'), {
        type: 'photo',
        url,
        userDisplay: user.displayName || 'Pantry Member',
        createdAt: serverTimestamp()
      });

      const uref = doc(db, 'users', user.uid);
      const snap = await getDoc(uref);
      const cnt = (snap.data()?.photoCount || 0) + 1;
      await updateDoc(uref, { photoCount: cnt });

      Alert.alert('Uploaded', 'Photo added to your profile and feed.');
    } catch (e) {
      Alert.alert('Upload failed', e.message);
    } finally {
      setUploading(false);
    }
  };

  // ---- UI: Feed card ----
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(item.userDisplay || 'PM').split(' ').map(s => s[0]).join('').slice(0,2)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.userDisplay || 'Pantry Member'}</Text>
          <Text style={styles.cardTime}>
            {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleString() : ''}
          </Text>
        </View>
      </View>
      {item.type === 'photo' && (
        <Image source={{ uri: item.url }} style={styles.feedImage} resizeMode="cover" />
      )}
      {item.text && <Text style={styles.cardBody}>{item.text}</Text>}
    </View>
  );

  // ---- Layout ----
  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>pantry</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(tabs)/profile')}>
          <Ionicons name="person-circle" size={28} color="#111216" />
        </TouchableOpacity>


        {/* 👇 Add Logout Button */} {/* delete later */}
        <TouchableOpacity
          style={[styles.iconBtn, { marginLeft: 10 }]}
          onPress={() => signOut(auth)}
        >
          <Ionicons name="log-out-outline" size={24} color="#111216" />
        </TouchableOpacity>
        {/* delete later */}
      </View>

      {/* Prompt card */}
      <View style={styles.promptCard}>
        <Text style={styles.promptKicker}>Today's Prompt</Text>
        <Text style={styles.promptText}>{PROMPT}</Text>
        <TextInput
          value={journalText}
          onChangeText={setJournalText}
          placeholder="Share your thoughts..."
          style={styles.input}
          multiline
        />
        <TouchableOpacity style={styles.primaryBtn} onPress={onPostJournal} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Save</Text>}
        </TouchableOpacity>
      </View>

      {/* Upload row */}
      <View style={styles.uploadRow}>
        <View>
          <Text style={styles.sectionTitle}>Document Today’s Cooking</Text>
          <Text style={styles.sectionSub}>Add an entry with a photo</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={onUploadImage} disabled={uploading}>
          {uploading
            ? <ActivityIndicator color="#fff" />
            : (
              <>
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.addBtnText}>Add Entry</Text>
              </>
            )
          }
        </TouchableOpacity>
      </View>

      {/* Community updates */}
      <Text style={styles.feedHeader}>Community Updates</Text>
      <FlatList
        data={feed}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  header: { paddingTop: 56, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontSize: 26, fontWeight: '900', color: '#ff4d2d', letterSpacing: 0.2 },
  iconBtn: { padding: 6, borderRadius: 999 },

  // Prompt card (warm, friendly)
  promptCard: {
    backgroundColor: '#FFF1E6',
    borderColor: '#FFD4B8',
    borderWidth: 1,
    padding: 14,
    borderRadius: 14,
    marginBottom: 14
  },
  promptKicker: { fontWeight: '800', fontSize: 12, color: '#A15B2E', marginBottom: 6, textTransform: 'uppercase' },
  promptText: { fontSize: 14, color: '#4B5563', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', padding: 12, minHeight: 64 },
  primaryBtn: { backgroundColor: '#111216', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  primaryText: { color: '#fff', fontWeight: '700' },

  // Upload section
  uploadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  sectionSub: { color: '#6B7280', marginTop: 2 },
  addBtn: { backgroundColor: '#111216', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  addBtnText: { color: '#fff', fontWeight: '800' },

  // Feed
  feedHeader: { fontSize: 18, fontWeight: '800', marginVertical: 10 },
  card: { borderWidth: 1, borderColor: '#EEE', borderRadius: 14, padding: 12, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { fontWeight: '800', color: '#111216' },
  cardTitle: { fontWeight: '700' },
  cardTime: { color: '#6B7280', fontSize: 12 },
  feedImage: { width: '100%', height: 220, borderRadius: 10, backgroundColor: '#F3F4F6', marginTop: 6 },
  cardBody: { marginTop: 8, color: '#111216' }
});
