import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebaseConfig';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 3; // 3 columns with padding

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('Posts');
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Listen to user profile changes in real-time
    const unsubProfile = onSnapshot(
      doc(db, 'users', user.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          console.log('Profile loaded:', docSnap.data());
          setUserData(docSnap.data());
        } else {
          console.log('No profile found');
          // Set default values if profile doesn't exist
          setUserData({
            displayName: user.displayName || 'Pantry User',
            email: user.email,
            streak: 0,
            communities: 0,
            photoCount: 0,
            friends: 0,
            badges: 0
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error loading profile:', error);
        setLoading(false);
      }
    );

    // Listen to user's posts in real-time
    const unsubPosts = onSnapshot(
      query(
        collection(db, 'posts'),
        where('uid', '==', user.uid),
        orderBy('createdAt', 'desc')
      ),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Posts loaded:', data.length);
        setPosts(data);
      },
      (error) => {
        console.error('Error loading posts:', error);
        setPosts([]);
      }
    );

    return () => {
      unsubProfile();
      unsubPosts();
    };
  }, [user]);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (e) {
            console.error('Sign out error:', e);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        }
      }
    ]);
  };

  const getJoinDate = () => {
    if (!userData?.createdAt) return 'Recently';
    const date = userData.createdAt.toDate();
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const renderGridItem = ({ item }) => (
    <TouchableOpacity style={styles.gridItem} activeOpacity={0.8}>
      <Image 
        source={{ uri: item.imageURL }} 
        style={styles.gridImage}
        onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
      />
    </TouchableOpacity>
  );

  const renderEmptyGrid = () => (
    <View style={styles.emptyState}>
      <Ionicons name="camera-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyStateTitle}>No posts yet!</Text>
      <Text style={styles.emptyStateText}>
        Start your cooking journey by sharing your first meal.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d2d" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>pantry</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="person-add-outline" size={24} color="#111" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#111" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar & Name Section */}
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userData?.displayName
                  ?.split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) || 'JD'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.displayName}>{userData?.displayName || 'Pantry User'}</Text>
                <TouchableOpacity onPress={handleSignOut}>
                  <Ionicons name="settings-outline" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <Text style={styles.bio}>
                Cooking enthusiast · Member since {getJoinDate()}
              </Text>
              <View style={styles.socialStats}>
                <Text style={styles.socialText}>
                  <Text style={styles.socialNumber}>{userData?.friends || 0}</Text> friends
                </Text>
                <Text style={styles.socialText}>
                  <Text style={styles.socialNumber}>{userData?.communities || 0}</Text> communities
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <View style={styles.statIconRow}>
                <Ionicons name="calendar-outline" size={20} color="#111" />
                <Text style={styles.statNumber}>{userData?.photoCount || posts.length}</Text>
              </View>
              <Text style={styles.statLabel}>Meals</Text>
            </View>
            <View style={styles.statBox}>
              <View style={styles.statIconRow}>
                <Ionicons name="trending-up" size={20} color="#10b981" />
                <Text style={styles.statNumber}>{userData?.streak || 0}</Text>
              </View>
              <Text style={styles.statLabel}>Streaks</Text>
            </View>
            <View style={styles.statBox}>
              <View style={styles.statIconRow}>
                <Ionicons name="trophy" size={20} color="#f59e0b" />
                <Text style={styles.statNumber}>{userData?.badges || 0}</Text>
              </View>
              <Text style={styles.statLabel}>Badges</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          {['Posts', 'Saved', 'Badges'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content Grid */}
        {activeTab === 'Posts' && (
          posts.length > 0 ? (
            <FlatList
              data={posts}
              renderItem={renderGridItem}
              keyExtractor={(item) => item.id}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.grid}
            />
          ) : (
            renderEmptyGrid()
          )
        )}

        {activeTab === 'Saved' && (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyStateText}>No saved posts yet</Text>
          </View>
        )}

        {activeTab === 'Badges' && (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyStateText}>Earn badges by cooking!</Text>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb'
  },
  loadingText: { marginTop: 12, color: '#6b7280', fontSize: 14 },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  brand: { fontSize: 24, fontWeight: '800', color: '#ff4d2d' },
  headerIcons: { flexDirection: 'row', gap: 16 },
  iconButton: { padding: 4 },
  
  // Profile Card
  profileCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  profileHeader: { flexDirection: 'row', marginBottom: 20 },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: '#6b7280' },
  profileInfo: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  displayName: { fontSize: 20, fontWeight: '700', color: '#111' },
  bio: { fontSize: 13, color: '#6b7280', marginTop: 4, marginBottom: 8 },
  socialStats: { flexDirection: 'row', gap: 16 },
  socialText: { fontSize: 13, color: '#6b7280' },
  socialNumber: { fontWeight: '600', color: '#111' },
  
  // Stats Grid
  statsGrid: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  statNumber: { fontSize: 24, fontWeight: '700', color: '#111' },
  statLabel: { fontSize: 12, color: '#6b7280' },
  
  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#f3f4f6' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: '#111' },
  
  // Grid
  grid: { paddingHorizontal: 16, paddingBottom: 20 },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    padding: 2
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#f3f4f6'
  },
  
  // Empty States
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginTop: 16,
    marginBottom: 8
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8
  }
});