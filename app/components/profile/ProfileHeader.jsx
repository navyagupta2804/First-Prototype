import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../../firebaseConfig';

// Helper function to format member since date
function getMemberSinceDate(createdAt) {
  if (!createdAt) return 'Member since 2025';
  
  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

const ProfileHeader = ({ profile }) => {
    if (!profile) return null;
    
    const memberSince = getMemberSinceDate(profile.createdAt);

    const handleSettings = () => {
        // For now, this opens logout confirmation
        // Later you can navigate to a settings screen
        Alert.alert('Settings', 'What would you like to do?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await signOut(auth);
                    } catch (e) {
                        console.warn('Sign out error', e);
                        Alert.alert('Error', 'Unable to sign out. Please try again.');
                    }
                }
            }
        ]);
    };

    return (
        <View style={styles.profileCard}>
            {/* Top Row: Avatar + Info + Settings */}
            <View style={styles.topRow}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {(profile.displayName || 'JD')
                            .split(' ')
                            .map((s) => s[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                    </Text>
                </View>
                
                <View style={styles.infoSection}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{profile.displayName}</Text>
                        <TouchableOpacity onPress={handleSettings}>
                            <Ionicons name="settings-outline" size={24} color="#6b7280" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.bio}>
                        Cooking enthusiast · Member since {memberSince}
                    </Text>
                    <View style={styles.socialRow}>
                        <Text style={styles.socialText}>
                            <Text style={styles.socialNumber}>24</Text> friends
                        </Text>
                        <Text style={styles.socialText}>
                            <Text style={styles.socialNumber}>{profile.communities || 0}</Text> communities
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    profileCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    topRow: {
        flexDirection: 'row',
        gap: 16,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#e5e7eb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#6b7280',
    },
    infoSection: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
    },
    bio: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 8,
    },
    socialRow: {
        flexDirection: 'row',
        gap: 16,
    },
    socialText: {
        fontSize: 13,
        color: '#6b7280',
    },
    socialNumber: {
        fontWeight: '600',
        color: '#111',
    },
});

export default ProfileHeader;