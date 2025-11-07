import { collection, doc, getDoc, increment, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import CenteredContainer from '../components/common/CenteredContainer';
import PageHeader from '../components/common/PageHeader';
import LogForm from '../components/log/LogForm';
import { logPostCreation } from '../utils/analyticsHelper';
import { launchImagePicker, uploadImageToFirebase } from '../utils/imageUpload';

export default function LogScreen() {
  const [image, setImage] = useState(null);
  const [assetMimeType, setAssetMimeType] = useState(null);
  const [caption, setCaption] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [uploading, setUploading] = useState(false);

  // --- Image Picker/Camera Logic ---
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
        likesCount: 0, 
        commentsCount: 0,
        isPublished: isPublished, 
      };

      // 4. Write to database
      await setDoc(newPhotoRef, postData);

      // 5. Increment user's photoCount
      await updateDoc(doc(db, 'users', user.uid), {
        photoCount: increment(1),
        lastPostAt: serverTimestamp(),
      });

      const userProfileSnap = await getDoc(doc(db, 'users', user.uid)); 
      const userGroup = userProfileSnap.data()?.abTestGroup;
      
      if (userGroup) {
        logPostCreation(userGroup); // <-- Log the event with the A/B group!
      }

      // Success!
      Alert.alert('Posted!', 'Your meal has been logged.', [
        { text: 'OK', onPress: () => {
          setImage(null);
          setCaption('');
          setIsPublished(true);
        }}
      ]);

      setImage(null);
      setCaption('');
      setIsPublished(true);

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
        <LogForm 
          image={image}
          caption={caption}
          isPublished={isPublished}
          uploading={uploading}
          setCaption={setCaption}
          setIsPublished={setIsPublished}
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