import * as ImagePicker from 'expo-image-picker';
import { collection, doc, increment, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'; // Added 'collection' import
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { auth, db, storage } from '../../firebaseConfig';
import PostForm from '../components/post/PostForm';

export default function PostScreen() {
  const [image, setImage] = useState(null);
  const [assetMimeType, setAssetMimeType] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  // --- Image Picker/Camera Logic ---
  const requestPermissions = async (type) => {
    const permissionMethod =
      type === 'camera'
        ? ImagePicker.requestCameraPermissionsAsync
        : ImagePicker.requestMediaLibraryPermissionsAsync;
    
    const { status } = await permissionMethod();
    if (status !== 'granted') {
      Alert.alert('Permission needed', `Please allow access to your ${type} to continue.`);
      return false;
    }
    return true;
  };

  const launchPicker = async (type) => {
    const isGranted = await requestPermissions(type);
    if (!isGranted) return;

    // Use a conditional to determine which method to call
    const launchMethod =
      type === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    
    const result = await launchMethod({
      mediaTypes: 'Images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {

      // If the image is HEIC/TIFF after the picker returns (on web), don't allow upload
      if (Platform.OS === 'web') {
          if (asset.mimeType && (asset.mimeType.includes('heic') || asset.mimeType.includes('tiff'))) {
              Alert.alert(
                  "File Conversion Failed", 
                  "This file type cannot be displayed in the web browser. Please convert the image to JPEG or PNG externally before uploading."
              );
              return;
          }
      }

      setImage(result.assets[0].uri); // NOTE: this is not setting correctly...
      setAssetMimeType(result.assets[0].mimeType || 'image/jpeg');
    }
  };

  const pickImage = async () => await launchPicker('library');
  const takePhoto = async () => await launchPicker('camera');
  const clearImage = () => {
    setImage(null);
    setAssetMimeType(null);
  };

  // --- Core Upload Logic ---
  const uploadPost = async () => {
    if (!image) {
      Alert.alert('No image', 'Please select or take a photo first.');
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    // Helper function to safely get the file extension
    const getFileExtension = (uri, mimeType) => {
      const match = /\.(\w+)$/.exec(uri);
      if (match) return match[1].toLowerCase();
      if (mimeType)return mimeType.split('/').pop().toLowerCase();
      return 'jpg'; // Default to a safe format
    };

    try {
      setUploading(true);

      // 1. Prepare unique Post ID and document references
      const newPhotoRef = doc(collection(db, 'feed'));
      const postId = newPhotoRef.id; // Define postId BEFORE it is used for the filename

      const extension = getFileExtension(image, assetMimeType)
      const filename = `users/${user.uid}/photos/${postId}.${extension}`;

      // 2. Upload image to Firebase Storage
      const response = await fetch(image);
      const blob = await response.blob(); // Binary Large Object
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);

      // 3. Prepare the common post data
      const postData = {
        id: postId,
        uid: user.uid,
        url: url,
        caption: caption.trim() || '',
        createdAt: serverTimestamp(),
        likes: 0,
      };

      // 4. Dual Write
      await setDoc(doc(db, 'users', user.uid, 'photos', postId), postData); // Write 1: To the user's subcollection (for Profile)
      await setDoc(newPhotoRef, postData); // Write 2: To the global 'feed' collection (for Home Feed)

      // 5. Increment user's photoCount
      await updateDoc(doc(db, 'users', user.uid), {
        photoCount: increment(1),
        lastPostAt: serverTimestamp(),
      });

      // Success!
      Alert.alert('Posted!', 'Your meal has been logged.', [
        { text: 'OK', onPress: () => {
          setImage(null);
          setCaption('');
        }}
      ]);

      setImage(null);
      setCaption('');

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
      <PostForm 
        image={image}
        caption={caption}
        uploading={uploading}
        setCaption={setCaption}
        pickImage={pickImage}
        takePhoto={takePhoto}
        uploadPost={uploadPost}
        clearImage={clearImage}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { padding: 24, paddingTop: 60 },
  brand: { fontSize: 28, fontWeight: '800', color: '#ff4d2d', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 24 },
});
