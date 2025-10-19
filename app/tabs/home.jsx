import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { db } from '../../firebaseConfig';
import Header from '../components/common/Header';
import PostCard from '../components/common/PostCard';
import PromptCard from '../components/home/PromptCard';
import UploadSection from '../components/home/UploadSection';


export default function HomeScreen() {
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

  const renderItem = ({ item }) => <PostCard item={item} />;

  // ---- Layout ----
  return (
    <View style={styles.screen}>
      <Header />
      <PromptCard />
      <UploadSection />
      <Text style={styles.feedHeader}>Community Updates</Text>
      <FlatList
        data={feed}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  feedHeader: { fontSize: 18, fontWeight: '800', marginVertical: 10 },
});