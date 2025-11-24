import { collection, doc, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { requiresGoalSetting } from '../utils/bageCalculations';
import { logEvent } from '../utils/analytics';

import CenteredContainer from '../components/common/CenteredContainer';
import PageHeader from '../components/common/PageHeader';
import PostCard from '../components/common/PostCard';
import ChallengeSection from '../components/home/ChallengeSection';
import FriendActivityCard from '../components/home/FriendActivityCard';
import PersonalGreeting from '../components/home/PersonalGreeting';
import PromptCard from '../components/home/PromptCard';
import WeeklyGoalSetter from '../components/home/WeeklyGoalSetter';


const HomeScreen = () => {
  const [feed, setFeed] = useState([]);
  const [userData, setUserData] = useState({}); 
  const userId = auth.currentUser?.uid;
  
  // 1. ---- User Data and Streak Status Subscription ----
  useEffect(() => {
    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    const unsub = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    });
    return unsub;
  }, [userId]);

  // 2. ---- Feed subscription ----
  useEffect(() => {
     const q = query(
      collection(db, 'feed'), 
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const items = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
      setFeed(items);
    });
    return unsub;
  }, []);

  //dashboard
  useEffect(() => {
    logEvent("view_home");
  }, []);

  // ---- Goal Submission Handler ----
  const handleGoalSubmit = async (goal) => {
    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    const now = new Date();
    
    try {
      await updateDoc(userRef, {
        weeklyGoal: goal,
        streakStartDate: now, 
        currentWeekPosts: 0, 
        streakCount: userData.streakCount || 0
      });
      console.log("Weekly goal set successfully!");
    } catch (error) {
      console.error("Error setting weekly goal:", error);
    }
  };

  const showGoalSetter = requiresGoalSetting(userData);
  const renderPosts = ({ item }) => <PostCard item={item} />;
  const renderHeader = () => (
    <>
      <PageHeader />
      <PersonalGreeting/>
      {showGoalSetter ? (
        <WeeklyGoalSetter onSubmitGoal={handleGoalSubmit} />
      ) : (
        <PromptCard />
      )}
      <ChallengeSection />
      <FriendActivityCard/>
      <CenteredContainer>
        <Text style={styles.feedHeader}>Community Updates</Text>
      </CenteredContainer>
    </>
  );

  // ---- Layout ----
  return (
    <View style={styles.screenContainer}>
      <FlatList
        data={feed}
        keyExtractor={(it) => it.id}
        renderItem={renderPosts}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: 'white', paddingHorizontal: 16 },
  feedHeader: { fontSize: 18, fontWeight: '800', marginVertical: 10 },
});

export default HomeScreen;

