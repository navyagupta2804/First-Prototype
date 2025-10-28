import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { doc, increment, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView
} from 'react-native';
import { auth, db, storage } from '../../firebaseConfig';

export default function PostScreen() {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos.');
      return;
    }

    // Launch picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7 // Compress to save storage
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadPost = async () => {
    if (!image) {
      Alert.alert('No image', 'Please select or take a photo first.');
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    try {
      setUploading(true);

      // 1. Upload image to Firebase Storage
      const response = await fetch(image);
      const blob = await response.blob();
      const filename = `meals/${user.uid}_${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      const imageURL = await getDownloadURL(storageRef);

      // 2. Create post document
      const postId = `${user.uid}_${Date.now()}`;
      await setDoc(doc(db, 'posts', postId), {
        uid: user.uid,
        imageURL,
        caption: caption.trim() || '',
        createdAt: serverTimestamp(),
        likes: 0
      });

      // 3. Increment user's photoCount
      await updateDoc(doc(db, 'users', user.uid), {
        photoCount: increment(1)
      });

      // Success!
      Alert.alert('Posted!', 'Your meal has been logged.', [
        { text: 'OK', onPress: () => {
          setImage(null);
          setCaption('');
        }}
      ]);

    } catch (e) {
      console.error('Upload error:', e);
      Alert.alert('Upload failed', e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.brand}>pantry</Text>
      <Text style={styles.title}>Log a Meal</Text>

      {/* Image Preview or Picker Buttons */}
      {!image ? (
        <View style={styles.pickerContainer}>
          <TouchableOpacity style={styles.pickerButton} onPress={takePhoto}>
            <Text style={styles.pickerIcon}>📷</Text>
            <Text style={styles.pickerText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pickerButton} onPress={pickImage}>
            <Text style={styles.pickerIcon}>🖼️</Text>
            <Text style={styles.pickerText}>Choose from Library</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.imagePreview} />
          <TouchableOpacity style={styles.changeImageBtn} onPress={() => setImage(null)}>
            <Text style={styles.changeImageText}>Change Photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Caption Input */}
      <Text style={styles.label}>Caption (optional)</Text>
      <TextInput
        style={styles.captionInput}
        value={caption}
        onChangeText={setCaption}
        placeholder="What did you make today?"
        multiline
        maxLength={280}
      />
      <Text style={styles.charCount}>{caption.length}/280</Text>

      {/* Upload Button */}
      <TouchableOpacity
        style={[styles.uploadButton, (!image || uploading) && styles.uploadButtonDisabled]}
        onPress={uploadPost}
        disabled={!image || uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.uploadButtonText}>Post Meal</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.hint}>
        📸 Tip: Good lighting makes your meals look delicious!
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { padding: 24, paddingTop: 60 },
  brand: { fontSize: 28, fontWeight: '800', color: '#ff4d2d', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 24 },
  pickerContainer: { gap: 12, marginBottom: 24 },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed'
  },
  pickerIcon: { fontSize: 32, marginRight: 16 },
  pickerText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  imageContainer: { marginBottom: 24 },
  imagePreview: { width: '100%', height: 300, borderRadius: 12, marginBottom: 12 },
  changeImageBtn: { alignSelf: 'center' },
  changeImageText: { color: '#6b4eff', fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' },
  captionInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top'
  },
  charCount: { textAlign: 'right', color: '#6b7280', fontSize: 12, marginTop: 4, marginBottom: 16 },
  uploadButton: {
    backgroundColor: '#111216',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8
  },
  uploadButtonDisabled: { backgroundColor: '#d1d5db' },
  uploadButtonText: { color: 'white', fontWeight: '700', fontSize: 16 },
  hint: { color: '#6b7280', fontSize: 14, textAlign: 'center', marginTop: 16 }
});