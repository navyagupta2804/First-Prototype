import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  addDoc, collection, doc, getDoc,
  serverTimestamp, updateDoc
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useState } from 'react';
import {
  ActivityIndicator, Alert, StyleSheet, Text,
  TouchableOpacity, View
} from 'react-native';
import { auth, db, storage } from '../../../firebaseConfig';
import CenteredContainer from '../common/CenteredContainer';

export default function UploadSection() {
  const user = auth.currentUser;
  const [uploading, setUploading] = useState(false);

  // ---- Upload photo from gallery (Moved from home.jsx) ----
  const onUploadImage = async () => {
    if (!user) {
        Alert.alert('Sign in required', 'Please sign in to upload a photo entry.');
        return;
    }
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

  return (
    <CenteredContainer style={styles.uploadRow}>
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
    </CenteredContainer>
  );
}

const styles = StyleSheet.create({
  // Upload section
  uploadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  sectionSub: { color: '#6B7280', marginTop: 2 },
  addBtn: { backgroundColor: '#111216', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  addBtnText: { color: '#fff', fontWeight: '800' },
});