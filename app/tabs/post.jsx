import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { auth, storage, db } from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function PostScreen() {
  const [perm, requestPermission] = useCameraPermissions();
  const [preview, setPreview] = useState(null);
  const camRef = useRef(null);

  const upload = async (uri) => {
    try {
      const blob = await (await fetch(uri)).blob();
      const r = ref(storage, `users/${auth.currentUser.uid}/photos/${Date.now()}.jpg`);
      await uploadBytes(r, blob);
      const url = await getDownloadURL(r);

      await addDoc(collection(db, 'users', auth.currentUser.uid, 'photos'), { url, createdAt: serverTimestamp() });
      await addDoc(collection(db, 'feed'), { type: 'photo', url, userDisplay: auth.currentUser.displayName || 'Chef', createdAt: serverTimestamp() });

      Alert.alert('Posted!', 'Your photo was uploaded.');
      setPreview(url);
    } catch (e) {
      Alert.alert('Upload failed', e.message);
    }
  };

  const takePhoto = async () => {
    if (!perm?.granted) {
      const { status } = await requestPermission();
      if (status !== 'granted') return;
    }
    const photo = await camRef.current.takePictureAsync({ quality: 0.8 });
    await upload(photo.uri);
  };

  const pickFromGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8
    });
    if (!res.canceled) await upload(res.assets[0].uri);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {preview ? (
        <Image source={{ uri: preview }} style={{ flex: 1 }} />
      ) : (
        <CameraView style={{ flex: 1 }} ref={camRef} />
      )}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.btn} onPress={pickFromGallery}><Text style={styles.btnText}>Gallery</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.capture]} onPress={takePhoto}><Text style={styles.btnText}>Capture</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { position: 'absolute', bottom: 24, width: '100%', flexDirection: 'row', justifyContent: 'space-around' },
  btn: { backgroundColor: '#111216aa', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 999 },
  btnText: { color: 'white', fontWeight: '700' },
  capture: { borderWidth: 2, borderColor: 'white' }
});
