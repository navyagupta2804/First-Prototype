import { signOut, updateProfile } from 'firebase/auth';
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebaseConfig';

import AppHeader from '../components/common/AppHeader';
import ProfileCard from '../components/profile/ProfileCard';
import ProfileTabContent from '../components/profile/ProfileTabContent';
import ProfileTabs from '../components/profile/ProfileTabs';
import PostDetailScreen from '../components/profile/screens/PostDetailScreen';
import SettingsScreen from '../components/profile/screens/SettingsScreen';

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('Posts');
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

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
        collection(db, 'users', user.uid, 'photos'),
        orderBy('createdAt', 'desc')
      ),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Automatically navigate back to the profile (which will likely trigger a redirect to auth screen)
      setShowSettings(false); 
    } catch (e) {
      console.error('Sign out error:', e);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleSaveProfile = async ({ displayName, photoURL }) => {
    if (!user) return; // Must be signed in to save

    try {
      // 1. Update the core Firebase Auth profile (for user.displayName, user.photoURL)
      await updateProfile(user, { 
        displayName, 
        photoURL: photoURL || null // Use null if empty string to clear the photo
      });

      // 2. Update the Firestore user document (to ensure our userData state reflects changes)
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { 
        displayName, 
        photoURL: photoURL || null
      });

      // Because we have the onSnapshot listener, the profile data will refresh automatically.
      Alert.alert("Success", "Your profile changes have been saved!");

    } catch (e) {
      console.error("Error saving profile:", e);
      Alert.alert("Error", `Failed to save changes: ${e.message}`);
    }
  };

  if (loading || !userData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d2d" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </SafeAreaView>
    );
  }

  if (selectedPost) {
    return (
      <PostDetailScreen 
        posts={posts} 
        postId={selectedPost.id}
        onClose={() => setSelectedPost(null)} 
      />
    );
  }

  if (showSettings) {
    return (
      <SettingsScreen 
        onSignOut={handleSignOut} // Pass the sign-out function down
        onClose={() => setShowSettings(false)} // Pass the function to go back
        userData={userData} // Pass current data
        onSave={handleSaveProfile} // Pass the new save handler
      />
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
          onSettingsPress={() => setShowSettings(true)} 
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
          onPostPress={setSelectedPost}
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