import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import notificationService from '../../../services/notificationService';

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    dailyReminders: true,
    reminderTime: '09:00',
    friendActivity: true,
  });
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser;

  // Load settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      if (userData?.notificationSettings) {
        setSettings(userData.notificationSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      await notificationService.updateSettings(user.uid, newSettings);

      // Reschedule notifications if daily reminder settings changed
      if (key === 'dailyReminders' || key === 'reminderTime') {
        if (newSettings.dailyReminders) {
          const [hour, minute] = newSettings.reminderTime.split(':').map(Number);
          await notificationService.scheduleDailyReminder(hour, minute);
        } else {
          await notificationService.cancelAllScheduledNotifications();
        }
      }
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const requestNotificationPermissions = async () => {
    const { status, token } = await notificationService.requestPermissions();
    
    if (status === 'granted' && token) {
      await notificationService.registerToken(user.uid, token);
      alert('Notifications enabled!');
    } else {
      alert('Please enable notifications in your device settings');
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Daily Reminders</Text>
            <Text style={styles.settingDescription}>
              Get reminded about your cooking goals
            </Text>
          </View>
          <Switch
            value={settings.dailyReminders}
            onValueChange={(value) => updateSetting('dailyReminders', value)}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Friend Activity</Text>
            <Text style={styles.settingDescription}>
              Get notified when friends post or complete goals
            </Text>
          </View>
          <Switch
            value={settings.friendActivity}
            onValueChange={(value) => updateSetting('friendActivity', value)}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={requestNotificationPermissions}
        >
          <Text style={styles.buttonText}>Enable Push Notifications</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debug Info</Text>
        <TouchableOpacity
          style={styles.debugButton}
          onPress={async () => {
            const scheduled = await notificationService.getAllScheduledNotifications();
            console.log('Scheduled notifications:', scheduled);
            alert(`${scheduled.length} scheduled notifications`);
          }}
        >
          <Text style={styles.buttonText}>Show Scheduled Notifications</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  debugButton: {
    backgroundColor: '#666',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

// import { Ionicons } from '@expo/vector-icons';
// import { useState } from 'react';
// import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { launchImagePicker } from '../../../utils/imageUpload';
// import CenteredContainer from '../../common/CenteredContainer';

// /**
//  * Settings Screen component.
//  * @param {function} onSignOut - The function to execute the Firebase sign-out.
//  * @param {function} onClose - The function to navigate back to the Profile screen.
//  * @param {function} onSave - The function to save profile changes (display name/photoURL string).
//  */
// export default function SettingsScreen({ onSignOut, onClose, userData, onSave }) {
//   const [displayName, setDisplayName] = useState(userData.displayName || '');
//   const [photoURL, setPhotoURL] = useState(userData.photoURL || '');
//   const [isSaving, setIsSaving] = useState(false);
//   const [newPhotoAsset, setNewPhotoAsset] = useState(null);

//   const confirmSignOut = () => {
//     // Alerts don't work on web, so if on web, just sign out  
//     if (Platform.OS === 'web') {
//         onSignOut();
//     }

//     Alert.alert('Sign Out', 'Are you sure you want to log out of your account?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Log Out',
//         style: 'destructive',
//         onPress: onSignOut, // Execute the sign-out handler passed from the parent
//       }
//     ]);
//   };

//   const handleChangePhoto = async (type) => {
//     const asset = await launchImagePicker(type, [1, 1]); 
//     if (asset) {
//       setPhotoURL(asset.uri);  // 1. Set the photoURL state to the local URI for preview
//       setNewPhotoAsset(asset); // 2. Store the full asset for upload upon 'Save'
//     }
//   };

//   const handleSave = async () => {
//     if (isSaving) return;
        
//     // 1. Basic Validation: Determine if anything has actually changed
//     const displayNameChanged = displayName.trim() !== userData.displayName;
//     const photoChanged = newPhotoAsset !== null; // Check if we have a new asset to upload

//     if (!displayNameChanged && !photoChanged) {
//       console.log("No Changes", "You haven't made any changes to save.");
//       Alert.alert("No Changes", "You haven't made any changes to save.");
//       return;
//     }

//     if (!displayName.trim()) {
//       console.log("Error", "Display Name cannot be empty.");
//       Alert.alert("Error", "Display Name cannot be empty.");
//       return;
//     }

//     setIsSaving(true);

//     // 2. Pass the new data up to the parent handler
//     await onSave({ displayName: displayName.trim(), newPhotoAsset: newPhotoAsset, currentPhotoURL: userData.photoURL});
    
//     // 3. Clear the asset after a successful save
//     setNewPhotoAsset(null); 
//     setIsSaving(false);
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <CenteredContainer>
//         {/* Header */}
//         <View style={styles.pageTitle}>
//           <TouchableOpacity style={styles.backButtonContainer} onPress={onClose}>
//             <Ionicons name="arrow-back" size={16} color="#111" />  
//             <Text style={styles.title}>Settings</Text>
//           </TouchableOpacity>
//         </View>
//         <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//           {/* 1. Profile Photo & Display Name */}
//           <View style={styles.sectionCard}>
//             <Text style={styles.sectionTitle}>Profile Information</Text>
//             <View style={styles.profileInfoLayout}>
//               {/* Profile Photo (Left Side) */}
//               <View style={styles.avatarWrapper}>
//                 <Image source={{ uri: photoURL }} style={styles.largeAvatar} />
                              
//                 {/* Change Photo Button - Aligned with the avatar */}
//                 <TouchableOpacity style={styles.changePhotoButton}
//                   onPress={() => handleChangePhoto('library')}
//                 >
//                   <Ionicons name="camera-outline" size={18} color="#111" />
//                   <Text style={styles.changePhotoText}>Change Photo</Text>
//                 </TouchableOpacity>
//               </View>
              
//               {/* Display Name / Username (Right Side) */}
//               <View style={styles.displayNameBlock}>
//                 <TextInput
//                   style={styles.nameInput}
//                   value={displayName}
//                   onChangeText={setDisplayName}
//                   placeholder="Display name"
//                   placeholderTextColor="#A9A9A9"
//                 />
//                 <Text style={styles.usernameLabel}>Username</Text>
//               </View>
//             </View>
//           </View>

//           {/* 2. User Information */}
//           <View style={styles.sectionCard}>
//             <Text style={styles.sectionTitle}>User Information</Text>

//             {/* Email (Read Only) */}
//             <View style={styles.inputGroup}>
//               <Text style={styles.settingText}>Email</Text>
//                 <TextInput
//                   style={styles.readOnlyInput}
//                   value={userData.email} // CHANGE TO USER EMAIL
//                   editable={false}
//                 />
//             </View>

//             {/* Password */}
//             <View style={styles.inputGroup}>
//               <Text style={styles.settingText}>Password</Text>
//                 <TextInput
//                   style={styles.readOnlyInput}
//                   value={'••••••••'}
//                   secureTextEntry={true}
//                   editable={false}
//                 />
//             </View>
//           </View>
//           {/* Save Button */}
//           <TouchableOpacity
//             style={[styles.saveButton, isSaving && { opacity: 0.6 }]}
//             onPress={handleSave}
//             disabled={isSaving}
//           >
//             {isSaving ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//             <> 
//               <Ionicons name="save-outline" size={24} color="#10b981" />
//               <Text style={styles.saveButtonText}>Save Changes</Text>
//             </>
//             )}
//           </TouchableOpacity>
//           {/*Logout Button */}
//           <TouchableOpacity style={styles.logoutButton} onPress={confirmSignOut}>
//               <Ionicons name="log-out-outline" size={24} color="#ef4444" />
//               <Text style={styles.logoutText}>Log Out</Text>
//           </TouchableOpacity>
//         </ScrollView>
//       </CenteredContainer>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: '#f9fafb', paddingHorizontal: 16  },
//   pageTitle: {
//     flexDirection: 'row', alignItems: 'center', justifyContent: 'left', 
//     paddingVertical: 20, marginTop: 20,  
//   },
//   backButtonContainer: {
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     paddingRight: 15,
//   },
//   title: { paddingLeft: 10, fontSize: 16, fontWeight: '500', color: '#111' },
  
//   sectionCard: { 
//     backgroundColor: 'white', 
//     marginVertical: 16,
//     borderRadius: 16, 
//     padding: 20,
//     borderWidth: 1, 
//     borderColor: '#EEE', 
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2
//   },
//   sectionTitle: { marginBottom: 20, fontSize: 18, color: '#111', fontWeight: '500' },
//   settingText: { marginLeft: 10, marginBottom: 5, fontSize: 16, color: '#111' },
 
//   profileInfoLayout: {
//     flexDirection: 'row',
//     alignItems: 'center', 
//     marginBottom: 10,
//   },
//   avatarWrapper: {
//     alignItems: 'center',
//     marginRight: 20,
//   },
//   largeAvatar: { 
//     width: 160, 
//     height: 160, 
//     borderRadius: 100, 
//     marginBottom: 10,
//   },
//   changePhotoButton: {
//     flexDirection: 'row', alignItems: 'center',
//     backgroundColor: '#f3f4f6',
//     borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb',
//     paddingVertical: 8, paddingHorizontal: 15,
//   },
//   changePhotoText: { marginLeft: 5, fontWeight: '600', color: '#111' },
//   displayNameBlock: { flex: 1 },
//   nameInput: {
//     backgroundColor: '#f9fafb',
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     color: '#111',
//     marginBottom: 8,
//     fontWeight: '500',
//   },
//   usernameLabel: { marginLeft: 5, fontSize: 14, color: '#6b7280' },

//   inputGroup: { marginBottom: 15 },
//   input: {
//     backgroundColor: '#f9fafb',
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//     borderRadius: 8,
//     padding: 12,
//     marginLeft: 10,
//     fontSize: 16,
//     color: '#111',
//     fontWeight: '500',
//   },
//   readOnlyInput: {
//     backgroundColor: '#f3f4f6', // Lighter background for read-only
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//     borderRadius: 8,
//     padding: 12,
//     marginLeft: 10,
//     fontSize: 16,
//     color: '#939497ff', // Grayed text
//     fontWeight: '500',
//   },
  
//   // Save Button
//   saveButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     marginVertical: 16,
//     borderRadius: 16,
//     padding: 15,
//     borderWidth: 1,
//     borderColor: '#a2decaff',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2
//   },
//   saveButtonText: {  marginLeft: 10, fontSize: 16, color: '#10b981', fontWeight: '700' },

//   // Logout Button
//   logoutButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     marginVertical: 16,
//     borderRadius: 16,
//     padding: 15,
//     borderWidth: 1,
//     borderColor: '#fca5a5',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2
//   },
//   logoutText: { marginLeft: 10, fontSize: 16, color: '#ef4444', fontWeight: '700' },
// });
