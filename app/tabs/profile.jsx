import { signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebaseConfig';

import AppHeader from '../components/common/AppHeader';
import ProfileCard from '../components/profile/ProfileCard';
import ProfileTabContent from '../components/profile/ProfileTabContent';
import ProfileTabs from '../components/profile/ProfileTabs';

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
            badges: 0,
            createdAt: new Date(),
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

  if (loading || !userData) {
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
        
        {/* AppHeader (Brand, Add Friend, Notifications) */}
        <AppHeader />

        {/* Profile Card (Avatar, Stats, Sign Out) */}
        <ProfileCard
          userData={userData} 
          postsLength={posts.length} 
          onSignOut={handleSignOut} 
        />

        {/* Tabs (Posts, Saved, Badges) */}
        <ProfileTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        {/* Content based on active tab */}
        <ProfileTabContent 
          activeTab={activeTab} 
          posts={posts} 
        />

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
});