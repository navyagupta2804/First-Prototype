import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../common/AppHeader';

/**
 * Settings Screen component.
 * @param {function} onSignOut - The function to execute the Firebase sign-out.
 * @param {function} onClose - The function to navigate back to the Profile screen.
 */
export default function SettingsScreen({ onSignOut, onClose, userData, onSave }) {
    const [displayName, setDisplayName] = useState(userData.displayName || '');
    const [realName, setRealName] =  useState(userData.displayName || '');
    const [photoURL, setPhotoURL] = useState(userData.photoURL || '');
    const [isSaving, setIsSaving] = useState(false);

  const confirmSignOut = () => {
    // Alerts don't work on web, so if on web, just sign out  
    if (Platform.OS === 'web') {
        onSignOut();
    }

    Alert.alert('Sign Out', 'Are you sure you want to log out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: onSignOut, // Execute the sign-out handler passed from the parent
      }
    ]);
  };

  const handleSave = async () => {
    if (isSaving) return;
        
    // Basic validation: Check if fields have actually changed
    if (displayName === userData.displayName && photoURL === userData.photoURL) {
      Alert.alert("No Changes", "You haven't made any changes to save.");
      return;
    }

    if (!displayName.trim()) {
      Alert.alert("Error", "Display Name cannot be empty.");
      return;
    }

    setIsSaving(true);
    // Pass the new data up to the parent handler
    await onSave({ displayName: displayName.trim(), photoURL: photoURL.trim() });
    setIsSaving(false);
  };

  const userInitials = (userData.displayName || 'PM').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <AppHeader />
      <View style={styles.pageTitle}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="arrow-back" size={16} color="#111" />  
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. Profile Photo & Display Name */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.profileInfoLayout}>
            {/* Profile Photo (Left Side) */}
            <View style={styles.avatarWrapper}>
              {photoURL ? (
                <Image source={{ uri: photoURL }} style={styles.largeAvatar} />
              ) : (
                <View style={styles.largeAvatarPlaceholder}>
                  <Text style={styles.avatarText}>{userInitials}</Text>
                </View>
              )}
                            
              {/* Change Photo Button - Aligned with the avatar */}
              <TouchableOpacity style={styles.changePhotoButton}
                onPress={() => Alert.alert("Change Photo", "Currently, paste the Photo URL in the input field below.")}
              >
                <Ionicons name="camera-outline" size={18} color="#111" />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
            
            {/* Display Name / Username (Right Side) */}
            <View style={styles.displayNameBlock}>
              <TextInput
                style={styles.nameInput}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Display name"
              />
              <Text style={styles.usernameLabel}>Username</Text>
            </View>
          </View>
        </View>

        {/* 2. User Information */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>User Information</Text>
          
          {/* User Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.settingText}>Name</Text>
              <TextInput
                style={styles.input}
                value={realName}
                onChangeText={setRealName}
                placeholder="Your name"
              />
          </View>

          {/* Email (Read Only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.settingText}>Email</Text>
              <TextInput
                style={styles.readOnlyInput}
                value={userData.email} // CHANGE TO USER EMAIL
                editable={false}
              />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.settingText}>Password</Text>
              <TextInput
                style={styles.readOnlyInput}
                value={'••••••••'}
                onChangeText={setDisplayName}
                secureTextEntry={true}
                editable={false}
              />
          </View>
        </View>
        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
          <> 
            <Ionicons name="save-outline" size={24} color="#10b981" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </>
          )}
        </TouchableOpacity>
        {/*Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={confirmSignOut}>
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'f9fafb' },
  pageTitle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'left',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  title: { paddingLeft: 10, fontSize: 16, fontWeight: '500', color: '#111' },
  
  scrollContent: { padding: 16 },
  sectionCard: { 
    backgroundColor: 'white', 
    margin: 16,
    borderRadius: 16, 
    padding: 20,
    borderColor: '#e5e7eb', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  sectionTitle: { marginBottom: 20, fontSize: 18, color: '#111', fontWeight: '500' },
  settingText: { marginLeft: 10, marginBottom: 5, fontSize: 16, color: '#111' },
 
  profileInfoLayout: {
    flexDirection: 'row',
    alignItems: 'center', 
    marginBottom: 10,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginRight: 20,
  },
  largeAvatar: { 
    width: 160, 
    height: 160, 
    borderRadius: 100, 
    backgroundColor: '#f3f4f6', 
    marginBottom: 10,
  },
  largeAvatarPlaceholder: {
    width: 160, height: 160, borderRadius: 100,
    backgroundColor: '#e5e7eb',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: { fontWeight: '500', fontSize: 75, color: '#4b5563' },
  changePhotoButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb',
    paddingVertical: 8, paddingHorizontal: 15,
  },
  changePhotoText: { marginLeft: 5, fontWeight: '600', color: '#111' },
  displayNameBlock: { flex: 1 },
  nameInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111',
    marginBottom: 8,
  },
  usernameLabel: { marginLeft: 5, fontSize: 14, color: '#6b7280' },

  inputGroup: { marginBottom: 15 },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginLeft: 10,
    fontSize: 16,
    color: '#111',
  },
  readOnlyInput: {
    backgroundColor: '#f3f4f6', // Lighter background for read-only
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginLeft: 10,
    fontSize: 16,
    color: '#4b5563', // Grayed text
    fontWeight: '500',
  },
  
  // Save Button
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#a2decaff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  saveButtonText: {  marginLeft: 10, fontSize: 16, color: '#10b981', fontWeight: '700' },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#fca5a5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  logoutText: { marginLeft: 10, fontSize: 16, color: '#ef4444', fontWeight: '700' },
});
