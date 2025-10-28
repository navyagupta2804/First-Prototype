import { signOut } from 'firebase/auth';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../../firebaseConfig';


// Helper function to format member since date
function getMemberSinceDate(createdAt) {
  if (!createdAt) return 'Member since 2025';
  
  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  return `Member since ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

const ProfileHeader = ({ profile }) => {
    if (!profile) return null;
    
    const user = auth.currentUser;
    const memberSince = getMemberSinceDate(profile.createdAt);

    const handleLogout = () => {
        // 1. CHECK PLATFORM: If on web, execute sign out immediately (for right now bc the alert is now working on web)
        if (Platform.OS === 'web') {
            // Instant logout for web
            console.log("Web platform detected. Signing out immediately.");
            (async () => {
            try {
                await signOut(auth);
            } catch (e) {
                console.warn('Web Sign out error', e);
            }
            })();
            return;
        }

        // 2. NATIVE PLATFORMS (iOS/Android): Use the reliable Alert for confirmation
        Alert.alert('Log out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
                try {
                await signOut(auth);
                // Let the _layout.jsx listener handle navigation
                } catch (e) {
                console.warn('Native Sign out error', e);
                Alert.alert('Error', 'Unable to sign out. Please try again.');
                }
            }}
        ]);
    };

    return (
        <View style={styles.headerContainer}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {(profile.displayName || 'JD').split(' ').map((s) => s[0]).join('').slice(0, 2)}
                    </Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{profile.displayName}</Text>
                    <Text style={styles.subtitle}>Cooking enthusiast • {memberSince}</Text>
                    <Text style={styles.subtitle}>{profile.communities || 0} communities joined</Text>
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Log out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
    avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontWeight: '800', color: '#111216' },
    name: { fontSize: 20, fontWeight: '800' },
    subtitle: { color: '#6b7280' },
   
    logoutBtn: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginLeft: 8,
    },
});

export default ProfileHeader;
