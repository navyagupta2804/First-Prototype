import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { auth, db } from '../../firebaseConfig';
import GridPostCard from '../components/profile/GridPostCard';
import ProfileActivitySection from '../components/profile/ProfileActivitySection';
import ProfileBadges from '../components/profile/ProfileBadges';
import ProfileHeader from '../components/profile/ProfileHeader';
import { calculateBadgeCount } from '../utils/bageCalculations';

export default function ProfileScreen() {
  const user = auth.currentUser;
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let unsubPosts = null;
    let unsubJournals = null;

    // Fetch user profile
    const fetchProfile = async () => {
      try {
        console.log('Fetching profile for user:', user.uid);
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          console.log('Profile found:', snap.data());
          setProfile(snap.data());
        } else {
          console.log('No profile found, creating default');
          setProfile({
            displayName: user.displayName || 'Pantry Member',
            streak: 0,
            communities: 0,
            photoCount: 0,
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfile({
          displayName: user.displayName || 'Pantry Member',
          streak: 0,
          communities: 0,
          photoCount: 0,
        });
      }
    };

    // ✅ Subscribe to user's posts from 'posts' collection
    const postsQuery = query(
      collection(db, 'posts'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    unsubPosts = onSnapshot(
      postsQuery, 
      (snap) => {
        console.log('Posts snapshot received, count:', snap.size);
        const arr = [];
        snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
        setPosts(arr);
        setLoading(false);
      },
      (error) => {
        console.error('Error with posts listener:', error);
        setPosts([]);
        setLoading(false);
      }
    );

    // Subscribe to user's journals
    const journalsQuery = query(
      collection(db, 'journals'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    unsubJournals = onSnapshot(
      journalsQuery, 
      (snap) => {
        console.log('Journals snapshot received, count:', snap.size);
        const arr = [];
        snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
        setJournals(arr);
      },
      (error) => {
        console.error('Error with journals listener:', error);
        setJournals([]);
      }
    );

    fetchProfile();

    return () => {
      if (unsubPosts) unsubPosts();
      if (unsubJournals) unsubJournals();
    };
  }, [user]);

  const renderTabContent = () => {
    if (activeTab === 'posts') {
      return (
        <View style={styles.postsGrid}>
          {posts.length === 0 ? (
            // Empty Posts State
            <View style={styles.noPostsContainer}>
              <Ionicons name="camera-outline" size={64} color="#d1d5db" />
              <Text style={styles.noPostsText}>No posts yet!</Text>
              <Text style={styles.noPostsSubText}>
                Start your cooking journey by sharing your first meal.
              </Text>
            </View>
          ) : (
            // Photo Grid
            <View style={styles.photoGrid}>
              {posts.map((item) => (
                <GridPostCard key={item.id} item={item} />
              ))}
            </View>
          )}
        </View>
      );
    } else if (activeTab === 'saved') {
      return (
        <View style={styles.emptyTabContent}>
          <Ionicons name="bookmark-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyTabText}>No saved recipes yet</Text>
        </View>
      );
    } else {
      // Badges tab
      return (
        <View style={styles.badgesTabWrapper}>
          <ProfileBadges 
            photoCount={posts.length} 
            streak={profile.streak || 0}
            journalCount={journals.length}
          />
        </View>
      );
    }
  };

  if (loading || !profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff4d2d" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const calculatedBadgeCount = calculateBadgeCount(
    posts.length, 
    profile.streak || 0, 
    journals.length
  );
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* ✅ Header with pantry branding and icons */}
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

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* ✅ Profile Card */}
          <ProfileHeader profile={profile} />

          {/* ✅ Stats Grid */}
          <ProfileActivitySection
            profile={profile}
            photoCount={posts.length}
            journalCount={journals.length}
            badgeCount={calculatedBadgeCount}
          />

          {/* ✅ Tabs Container (rounded pill style) */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
              onPress={() => setActiveTab('posts')}
            >
              <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
                Posts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
              onPress={() => setActiveTab('saved')}
            >
              <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
                Saved
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'badges' && styles.tabActive]}
              onPress={() => setActiveTab('badges')}
            >
              <Text style={[styles.tabText, activeTab === 'badges' && styles.tabTextActive]}>
                Badges
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* ✅ Tab Content */}
          <View style={styles.tabContentWrapper}>
            {renderTabContent()}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ✅ Header (top bar with brand + icons)
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  brand: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ff4d2d',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },

  // ✅ Container (main content padding)
  container: {
    padding: 16,
  },

  // ✅ Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },

  // ✅ Tabs (rounded pill style like mockup)
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#f3f4f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#111',
  },
  
  // ✅ Tab Content Wrapper
  tabContentWrapper: {
    minHeight: 200,
  },

  // ✅ Posts Grid
  postsGrid: {
    marginBottom: 16,
    width: '100%', 
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    width: '100%',
  },
  
  // ✅ Empty State (no posts)
  noPostsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    width: '100%',
  },
  noPostsText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  noPostsSubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  
  // ✅ Empty Tab Content (saved/badges)
  emptyTabContent: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTabText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  
  // ✅ Badges Tab
  badgesTabWrapper: {
    marginBottom: 16,
  },
});