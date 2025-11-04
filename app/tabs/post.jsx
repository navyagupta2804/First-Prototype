import { collection, doc, increment, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import CenteredContainer from '../components/common/CenteredContainer';
import PageHeader from '../components/common/PageHeader';
import PostForm from '../components/post/PostForm';
import { launchImagePicker, uploadImageToFirebase } from '../utils/imageUpload';

export default function PostScreen() {
  const [image, setImage] = useState(null);
  const [assetMimeType, setAssetMimeType] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  // --- Image Picker/Camera Logic (Simplified) ---
  const launchPicker = async (type) => {
    const asset = await launchImagePicker(type); 
    if (asset) {
      setImage(asset.uri);
      setAssetMimeType(asset.mimeType);
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

    try {
      setUploading(true);

      // 1. Prepare unique Post ID and document references
      const newPhotoRef = doc(collection(db, 'feed'));
      const postId = newPhotoRef.id; // Define postId BEFORE it is used for the storagePath
      const storagePath = `users/${user.uid}/photos/${postId}`; 
      
      // 2. Upload image to Firebase Storage
      const url = await uploadImageToFirebase(image, assetMimeType, storagePath);

      // 3. Prepare the common post data
      const postData = {
        id: postId,
        uid: user.uid,
        url: url,
        displayName: user.displayName,
        displayPhoto: user.photoURL,
        caption: caption.trim() || '',
        createdAt: serverTimestamp(),
        likes: 0,
      };

      // 4. Dual Write
      await setDoc(doc(db, 'users', user.uid, 'photos', postId), postData); // Write 1
      await setDoc(newPhotoRef, postData); // Write 2

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
      <PageHeader />
      <CenteredContainer>
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
      </CenteredContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { paddingHorizontal: 16  },
  brand: { fontSize: 28, fontWeight: '800', color: '#ff4d2d', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 24 },
});