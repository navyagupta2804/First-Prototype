import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { db } from '../../firebaseConfig';
import CenteredContainer from '../components/common/CenteredContainer';
import ChallengeSection from '../components/home/ChallengeSection';
import HomeHeader from '../components/home/HomeHeader';
import PostCard from '../components/home/PostCard';
import PromptCard from '../components/home/PromptCard';
import UploadSection from '../components/home/UploadSection';
import PersonalGreeting from '../components/home/PersonalGreeting';
import FriendActivityCard from '../components/home/FriendActivityCard';

const HomeScreen = () => {
  const [feed, setFeed] = useState([]);

  // ---- Feed subscription (Kept in main component for global feed state) ----
  useEffect(() => {
    const q = query(collection(db, 'feed'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const items = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
      setFeed(items);
    });
    return unsub;
  }, []);

  const renderPosts = ({ item }) => <PostCard item={item} />;
  const renderHeader = () => (
    <>
      <HomeHeader />
      <PersonalGreeting/>
      <PromptCard />
      <UploadSection />
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

