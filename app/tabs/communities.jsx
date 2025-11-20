import { arrayRemove, collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import CenteredContainer from '../components/common/CenteredContainer';
import CommunityCard from '../components/common/CommunityCard';
import PageHeader from '../components/common/PageHeader';

export default function CommunitiesScreen() {
  const user = auth.currentUser;
  const [allCommunities, setAllCommunities] = useState([]); // Fetch all to check membership
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }

    // Listen to ALL communities (public or private) to track membership
    const unsub = onSnapshot(collection(db, 'communities'), (snap) => {
      const communityArr = [];
      snap.forEach((d) => {
        const data = d.data();
        communityArr.push({ 
            id: d.id, 
            ...data,
            memberUids: data.memberUids || [],
        });
      });
      setAllCommunities(communityArr);
      setLoading(false);
    }, (error) => {
        console.error("Error listening to communities:", error);
        setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // --- LEAVE LOGIC ---
  const handleLeaveCommunity = async (communityId, communityName) => {
    if (!user) return;

    const communityRef = doc(db, 'communities', communityId);
    
    try {
        // Leave: Use arrayRemove to remove the UID from the memberUids array
        await updateDoc(communityRef, {
            memberUids: arrayRemove(user.uid),
        });
        Alert.alert('Left', `You have left ${communityName}.`);
    } catch (e) {
      console.error('Error leaving community:', e);
      Alert.alert('Error', e.message);
    }
  };

  // Filter the list to show only communities the user is a member of
  const myCommunities = allCommunities.filter(c => c.memberUids.includes(user.uid));

  const renderCommunities = ({ item }) => {
    return (
      <CenteredContainer>
        <CommunityCard
          item={item}
          userUid={user?.uid} 
          toggleMembership={handleLeaveCommunity}
          isMyCommunitiesView={true} 
      />
      </CenteredContainer>
    );
  };

  if (loading) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff4d2d" />
            <Text style={{ marginTop: 10 }}>Loading your communities...</Text>
        </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <PageHeader />
      <CenteredContainer>
        <Text style={styles.myCommunitiesTitle}>My Communities</Text>
      </CenteredContainer>
      <FlatList
        data={myCommunities}
        keyExtractor={(it) => it.id}
        renderItem={renderCommunities}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>You haven't joined any communities yet. Check the Explore tab!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: 'white' }, 
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  myCommunitiesTitle: { fontSize: 24, fontWeight: '700', marginBottom: 10 },
  listContent: { paddingHorizontal: 16, paddingBottom: 30, gap: 16 },
  emptyText: {
      textAlign: 'center',
      marginTop: 50,
      color: '#999',
      fontSize: 16,
      paddingHorizontal: 30,
  },
});