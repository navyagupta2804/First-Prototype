import { Ionicons } from '@expo/vector-icons';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Settings Screen component.
 * @param {function} onSignOut - The function to execute the Firebase sign-out.
 * @param {function} onClose - The function to navigate back to the Profile screen.
 */
export default function SettingsScreen({ onSignOut, onClose }) {
  // Function to handle the press and confirmation
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

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} /> {/* Spacer to center title */}
      </View>
      <View style={styles.container}>
        {/* Example Setting Item (Placeholder for future features) */}
        <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Coming Soon', 'Profile editing feature is under development.')}>
          <Ionicons name="person-circle-outline" size={24} color="#111" />
          <Text style={styles.settingText}>Account Information</Text>
          <Ionicons name="chevron-forward" size={20} color="#6b7280" style={styles.chevron} />
        </TouchableOpacity>
        {/* The dedicated Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={confirmSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#111' },
  backButton: { padding: 5 },
  container: { flex: 1, padding: 16 },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  settingText: { flex: 1, marginLeft: 10, fontSize: 16, color: '#111', fontWeight: '500' },
  chevron: { marginLeft: 'auto' },

  // Logout Button specific styling
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  logoutText: { marginLeft: 10, fontSize: 16, color: '#ef4444', fontWeight: '500' },
});
