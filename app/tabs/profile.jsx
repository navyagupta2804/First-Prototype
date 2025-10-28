import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { auth, db } from '../../firebaseConfig';
import GridPostCard from '../components/profile/GridPostCard';
import ProfileHeader from '../components/profile/ProfileHeader';

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
    if (activeTab === 'posts') {
      return (
        <View style={styles.postsGrid}>
          {photos.length === 0 ? (
            <View style={styles.emptyGrid}>
              {[...Array(9)].map((_, index) => (
                <View key={index} style={styles.emptyGridItem}>
                  <Ionicons name="camera-outline" size={32} color="#d1d5db" />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.photoGrid}>
              {photos.map((item) => (
                <GridPostCard key={item.id} item={item} />
              ))}
              {/* Add empty placeholders to fill the grid */}
              {[...Array(Math.max(0, 9 - photos.length))].map((_, index) => (
                <View key={`empty-${index}`} style={styles.emptyGridItem}>
                  <Ionicons name="camera-outline" size={32} color="#d1d5db" />
                </View>
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
      const badges = getBadges(photos.length, profile.streak, journals.length);
      return (
        <View style={styles.badgesContainer}>
          {badges.map((badge, index) => (
            <View 
              key={index} 
              style={[styles.badgeCard, !badge.earned && styles.badgeCardLocked]}
            >
              <Text style={[styles.badgeEmoji, !badge.earned && styles.badgeEmojiLocked]}>
                {badge.emoji}
              </Text>
              <Text style={[styles.badgeText, !badge.earned && styles.badgeTextLocked]}>
                {badge.name}
              </Text>
            </View>
          ))}
        </View>
      );
    }
  };

  if (loading || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff4d2d" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <ProfileHeader 
          profile={profile} 
          photoCount={photos.length}
          journalCount={journals.length}
        />
        
        {/* Tabs */}
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

        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to get all badges
function getBadges(photoCount, streak, journalCount) {
  return [
    { name: "First Meal", emoji: "🍳", earned: photoCount >= 1 },
    { name: "10 Meals", emoji: "👨‍🍳", earned: photoCount >= 10 },
    { name: "50 Meals", emoji: "🍽️", earned: photoCount >= 50 },
    { name: "3-Day Streak", emoji: "🔥", earned: streak >= 3 },
    { name: "Week Warrior", emoji: "⭐", earned: streak >= 7 },
    { name: "Month Master", emoji: "🏆", earned: streak >= 30 },
  ];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 8,
    color: '#111216',
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
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  emptyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  emptyGridItem: {
    width: '32.5%',
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 20,
  },
  badgeCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  badgeCardLocked: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    opacity: 0.6,
  },
  badgeEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  badgeEmojiLocked: {
    opacity: 0.4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111216',
    textAlign: 'center',
  },
  badgeTextLocked: {
    color: '#9ca3af',
  },
  
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
});
