import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/**
 * Renders the meal logging UI, separating the view from the screen logic.
 * @param {object} props
 * @param {string | null} props.image - The URI of the selected image.
 * @param {string} props.caption - The current caption text.
 * @param {boolean} props.uploading - Whether an upload is currently in progress.
 * @param {function} props.setCaption - Handler to update caption state.
 * @param {function} props.pickImage - Handler to select image from library.
 * @param {function} props.takePhoto - Handler to take a photo with the camera.
 * @param {function} props.uploadPost - Handler to initiate the post upload.
 */
export default function PostForm({
  image,
  caption,
  uploading,
  setCaption,
  pickImage,
  takePhoto,
  uploadPost,
  clearImage,
}) {
  const isPostDisabled = !image || uploading;

  // --- Image Picker/Preview Section ---
  const ImageSection = () => {
    if (image) {
      return (
        <View style={styles.imageContainer}>
          <Image key={image} source={{ uri: image }} style={styles.imagePreview} />
          <TouchableOpacity style={styles.changeImageBtn} onPress={clearImage}>
            <Text style={styles.changeImageText}>Change Photo</Text>
          </TouchableOpacity>
        </View>
      );
    }

    {/* Image Preview or Picker Buttons */}
    return (
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
    );
  };

  return (
    <View>
      <ImageSection />

      {/* Caption Input */}
      <Text style={styles.label}>Caption (optional)</Text>
      <TextInput
        style={styles.captionInput}
        value={caption}
        onChangeText={setCaption}
        placeholder="What did you make today? Tag a friend or add some details!"
        placeholderTextColor="#A9A9A9"
        multiline
        maxLength={500}
      />
      <Text style={styles.charCount}>{caption.length}/500</Text>

      {/* Upload Button */}
      <TouchableOpacity
        style={[styles.uploadButton, isPostDisabled && styles.uploadButtonDisabled]}
        onPress={uploadPost}
        disabled={isPostDisabled}
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
    </View>
  );
}

const styles = StyleSheet.create({
  // Image Picker Styles
  pickerContainer: { gap: 12, marginBottom: 24 },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  pickerIcon: { fontSize: 32, marginRight: 16 },
  pickerText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  
  // Image Preview Styles
  imageContainer: { marginBottom: 24 },
  imagePreview: { width: '100%', height: 300, borderRadius: 12, marginBottom: 12 },
  changeImageBtn: { alignSelf: 'center' },
  changeImageText: { color: '#6b4eff', fontWeight: '600', fontSize: 14 },
  
  // Input Styles
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' },
  captionInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: { textAlign: 'right', color: '#6b7280', fontSize: 12, marginTop: 4, marginBottom: 16 },
  
  // Button Styles
  uploadButton: {
    backgroundColor: '#ff4d2d',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#ff4d2d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  uploadButtonDisabled: { 
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
    elevation: 0, 
  },
  uploadButtonText: { color: 'white', fontWeight: '700', fontSize: 16 },
  hint: { color: '#6b7280', fontSize: 14, textAlign: 'center', marginTop: 16 },
});

