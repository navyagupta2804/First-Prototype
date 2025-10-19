import { collection, deleteDoc, doc, increment, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import CenteredContainer from '../components/common/CenteredContainer';

export default function CommunitiesScreen() {
  const user = auth.currentUser;
  const [communities, setCommunities] = useState([]);
  const [myMemberships, setMyMemberships] = useState({});

  useEffect(() => {
    // Seed demo communities if empty
    const unsub = onSnapshot(collection(db, 'communities'), async (snap) => {
      if (snap.empty) {
        await setDoc(doc(db, 'communities', 'budget'), { name: 'Budget Cooking', membersCount: 1248 });
        await setDoc(doc(db, 'communities', '30min'), { name: '30-Min Dinners', membersCount: 892 });
        await setDoc(doc(db, 'communities', 'plant'), { name: 'Plant-Based Journey', membersCount: 654 });
        return;
      }
      const communityArr = [];
      snap.forEach((d) => communityArr.push({ id: d.id, ...d.data() }));
      setCommunities(communityArr);
    });

    const unsub2 = onSnapshot(collection(db, 'users', user.uid, 'memberships'), (snap) => {
      const m = {};
      snap.forEach((d) => (m[d.id] = true));
      setMyMemberships(m);
    });

    return () => { unsub(); unsub2(); };
  }, []);

  const toggle = async (id, name) => {
    const memRef = doc(db, 'users', user.uid, 'memberships', id);
    const communityRef = doc(db, 'communities', id);
    const joined = myMemberships[id];
    try {
      if (joined) {
        await deleteDoc(memRef);
        await updateDoc(communityRef, { membersCount: increment(-1) });
      } else {
        await setDoc(memRef, { name, joinedAt: Date.now() });
        await updateDoc(communityRef, { membersCount: increment(1) });
      }
      await updateDoc(doc(db, 'users', user.uid), {
        communities: Object.keys(myMemberships).length + (joined ? -1 : 1)
      });
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const renderCommunities = ({ item }) => {
    const joined = !!myMemberships[item.id];
    return (
      <CenteredContainer style={styles.card}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.meta}>{item.membersCount || 0} members</Text>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: joined ? '#e5e7eb' : '#111216' }]}
          onPress={() => toggle(item.id, item.name)}
        >
          <Text style={{ color: joined ? '#111216' : 'white', fontWeight: '700' }}>
            {joined ? 'Leave' : 'Join'}
          </Text>
        </TouchableOpacity>
      </CenteredContainer>
    );
  };

  return (
    <View style={styles.screenContainer}>
      <FlatList
        data={communities}
        keyExtractor={(it) => it.id}
        renderItem={renderCommunities}
        contentContainerStyle={{ padding: 16, gap: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: 'white', paddingTop: 56 },
  card: { borderWidth: 1, borderColor: '#eee', padding: 16, borderRadius: 12, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '700' },
  meta: { color: '#6b7280', marginTop: 4, marginBottom: 8 },
  btn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 }
});
