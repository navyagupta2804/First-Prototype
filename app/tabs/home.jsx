import { setUserProperties } from 'firebase/analytics';
import { collection, doc, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { analytics, auth, db } from '../../firebaseConfig';
import { getStartOfWeek, requiresGoalSetting } from '../utils/badgeCalculations';

import CenteredContainer from '../components/common/CenteredContainer';
import PageHeader from '../components/common/PageHeader';
import PostCard from '../components/common/PostCard';
import PersonalGreeting from '../components/home/PersonalGreeting';
import PromptCard from '../components/home/PromptCard';
import WeeklyGoalSetter from '../components/home/WeeklyGoalSetter';

const INTERNAL_TESTER_UIDS = [
    "sxs1k2tZFhTy0sQ1CFYJUD9tZSY2", // jins
    "XMAjQ3JzOdbOvAv2mlsgNxirdUK2", // mannu1623
    "oidjXXbQModtDgAkrvLVG3EFiUb2", // olufunmilola92
    "FtoyNcl5FNgsudn04CEyobyIpSH2", // test
    "uf6finICXxNjukDyd8ssVssx1ur2", // jin
    "hujq5wObGxdt27SDwvvPQYrXmW13", // navyag711
];

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

  // 3. ---- Analytics Tagging (NEW useEffect) ----
  useEffect(() => {
    // Only run if the user is logged in
    if (!userId) return;

    // Check if the current user ID is in the list of known internal testers
    if (INTERNAL_TESTER_UIDS.includes(userId)) {
      // Set the custom user property to tag this user's traffic
      setUserProperties(analytics, {
        internal_tester: 'Internal'
      });
      console.log(`[Analytics] User ${userId} tagged as internal_tester.`);
    }
    // Dependency array ensures this runs once when userId is available
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

  // ---- Goal Submission Handler ----
  const handleGoalSubmit = async (goal) => {
    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    const sundayMidnight = getStartOfWeek(new Date());
    
    try {
      await updateDoc(userRef, {
        weeklyGoal: goal,
        streakStartDate: sundayMidnight, 
        currentWeekPosts: 0, 
        streakCount: userData.streakCount || 0,
        hasGoalBeenMetThisWeek: false,
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
      {/* <ChallengeSection /> */}
      {/* <FriendActivityCard/> */}
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
  screenContainer: { flex: 1, backgroundColor: 'white', paddingHorizontal: 24 },
  feedHeader: { fontSize: 20, fontWeight: '800', marginVertical: 10 },
});

export default HomeScreen;

