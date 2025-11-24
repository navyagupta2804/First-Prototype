import { collection, doc, increment, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import CenteredContainer from '../components/common/CenteredContainer';
import PageHeader from '../components/common/PageHeader';
import PostForm from '../components/post/PostForm';
import { launchImagePicker, uploadImageToFirebase } from '../utils/imageUpload';

// import for dashboard
import { logEvent } from '../utils/analytics';

export default function PostScreen() {
  const [image, setImage] = useState(null);
  const [assetMimeType, setAssetMimeType] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

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

      // 1. Prepare Post ID + storage path
      const newPhotoRef = doc(collection(db, 'feed'));
      const postId = newPhotoRef.id;
      const storagePath = `users/${user.uid}/photos/${postId}`;

      // 2. Upload image
      const url = await uploadImageToFirebase(image, assetMimeType, storagePath);

      // 3. Build post data
      const postData = {
        id: postId,
        uid: user.uid,
        url: url,
        displayName: user.displayName,
        displayPhoto: user.photoURL,
        caption: caption.trim() || '',
        createdAt: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
        isPublished: true,
      };

      // 4. Write post
      await setDoc(newPhotoRef, postData);

      // 5. Update user stats
      await updateDoc(doc(db, 'users', user.uid), {
        photoCount: increment(1),
        lastPostAt: serverTimestamp(),
      });

      // ✅ 6. Log analytics event (SAFE, MINIMAL CHANGE)
      await logEvent("create_post", { hasImage: !!url });

      // Success
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
  title: { fontSize: 20, fontWeight: '700', marginBottom: 24 },
});
