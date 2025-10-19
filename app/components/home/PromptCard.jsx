import dayjs from 'dayjs';
import {
  addDoc, collection, doc, getDoc,
  serverTimestamp, setDoc, updateDoc
} from 'firebase/firestore';
import { useState } from 'react';
import {
  ActivityIndicator, Alert, StyleSheet, Text,
  TextInput, TouchableOpacity
} from 'react-native';
import { auth, db } from '../../../firebaseConfig';
import CenteredContainer from '../common/CenteredContainer';

const PROMPT = "What's one comfort food that always makes you smile?";

export default function PromptCard() {
  const user = auth.currentUser;
  const [journalText, setJournalText] = useState('');
  const [saving, setSaving] = useState(false);

  // ---- Ensure user profile doc exists (Moved from home.jsx) ----
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

  // ---- Save journal + update streak (Moved from home.jsx) ----
  const onPostJournal = async () => {
    if (!journalText.trim()) {
      Alert.alert('Add a thought', 'Write a quick sentence before saving.');
      return;
    }
    if (!user) {
        Alert.alert('Sign in required', 'Please sign in to save a journal entry.');
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

  return (
    <CenteredContainer style={styles.promptCard}>
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
    </CenteredContainer>
  );
}

const styles = StyleSheet.create({
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
});