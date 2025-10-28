import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { auth, db } from '../../firebaseConfig';
import CenteredContainer from '../components/common/CenteredContainer';
import GridPostCard from '../components/profile/GridPostCard';
import JournalSection from '../components/profile/JournalSection';
import ProfileActivitySection from '../components/profile/ProfileActivitySection';
import ProfileBadges from '../components/profile/ProfileBadges';
import ProfileHeader from '../components/profile/ProfileHeader';
import { calculateBadgeCount } from '../utils/bageCalculations';

export default function ProfileScreen() {
  const user = auth.currentUser;
  const [profile, setProfile] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let unsubPhotos = null;
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
          // Create default profile if doesn't exist
          setProfile({
            displayName: user.displayName || 'Pantry Member',
            streak: 0,
            communities: 0,
            photoCount: 0,
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Set default profile on error
        setProfile({
          displayName: user.displayName || 'Pantry Member',
          streak: 0,
          communities: 0,
          photoCount: 0,
        });
      }
    };

    // Subscribe to user's photos
    const photosQuery = query(
      collection(db, 'users', user.uid, 'photos'),
      orderBy('createdAt', 'desc')
    );
    
    unsubPhotos = onSnapshot(
      photosQuery, 
      (snap) => {
        console.log('Photos snapshot received, count:', snap.size);
        const arr = [];
        snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
        setPhotos(arr);
        setLoading(false);
      },
      (error) => {
        console.error('Error with photos listener:', error);
        setPhotos([]);
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
      if (unsubPhotos) unsubPhotos();
      if (unsubJournals) unsubJournals();
    };
  }, [user]);


  const renderTabContent = () => {
    if (activeTab === 'posts') { // Posts tab
      return (
        <View style={styles.postsGrid}>
          {photos.length === 0 ? (
            // Empty Posts State
            <View style={styles.noPostsContainer}>
              <Ionicons name="camera-off-outline" size={64} color="#9ca3af" />
              <Text style={styles.noPostsText}>No posts yet!</Text>
              <Text style={styles.noPostsSubText}>Start your cooking journey by sharing your first meal.</Text>
            </View>
          ) : (
            // Existing Photo Grid (with placeholder logic for incomplete rows)
            <View style={styles.photoGrid}>
              {photos.map((item) => (
                <GridPostCard key={item.id} item={item} />
              ))}
              {/* Add empty placeholders to fill the last row if needed, but only if photos > 0 */}
              {[...Array(Math.max(0, 3 - (photos.length % 3)))].map((_, index) => (
                  index < (photos.length % 3) && photos.length % 3 !== 0 && (
                      <View key={`empty-${index}`} style={styles.emptyGridItem} />
                  )
              ))}
            </View>
          )}
        </View>
      );
    } else if (activeTab === 'saved') { // Svaed tab
      return (
        <View style={styles.emptyTabContent}>
          <Ionicons name="bookmark-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyTabText}>No saved recipes yet</Text>
        </View>
      );
    } else { // Badges tab
      return (
        <View style={styles.badgesTabWrapper}>
          <ProfileBadges 
            photoCount={photos.length} 
            streak={profile.streak || 0}
            journalCount={journals.length}
          />
        </View>
      );
    }
  };

  if (loading || !profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff4d2d" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const calculatedBadgeCount = calculateBadgeCount(
    photos.length, 
    profile.streak || 0, 
    journals.length
  );
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <CenteredContainer style={styles.content}>
          <ProfileHeader profile={profile} />

          <ProfileActivitySection
            profile={profile}
            photoCount={photos.length}
            journalCount={journals.length}
            badgeCount={calculatedBadgeCount}
          />

          <JournalSection journals={journals} />
          
          {/* Tabs/Buttons Container */}
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
          
          {/* Tab Content Container (This renders the actual grid/badges/saved content) */}
          <View style={styles.tabContentWrapper}>
              {renderTabContent()}
          </View>
        </CenteredContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#111216',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  tabTextActive: {
    color: '#111216',
  },
  
  // Posts Grid
  postsGrid: {
    marginBottom: 16,
    width: '100%', 
    alignItems: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    width: '100%',
  },
  emptyGridItem: {
    width: '32.8%', 
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  
  // Styles for Empty State
  noPostsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  noPostsText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  noPostsSubText: {
    marginTop: 4,
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  
  // Empty Tab Content
  emptyTabContent: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTabText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
  },
  
  // Badges
  badgesTabWrapper: {
    marginBottom: 16,
  },

  
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
});
