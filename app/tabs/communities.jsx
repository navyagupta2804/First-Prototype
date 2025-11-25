import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';

import CenteredContainer from '../components/common/CenteredContainer';
import CommunityCard from '../components/common/CommunityCard';
import PageHeader from '../components/common/PageHeader';
import CommunityScreen from '../components/communities/CommunityScreen';

export default function CommunitiesScreen() {
  const user = auth.currentUser;
  const [allCommunities, setAllCommunities] = useState([]); // Fetch all to check membership
  const [loading, setLoading] = useState(true);
  const [selectedCommunity, setSelectedCommunity] = useState(null);

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

  const handleCardPress = (communityId) => {
    const community = allCommunities.find(c => c.id === communityId);

    if (community) {
      setSelectedCommunity(community); 
    } else {
      console.error(`Community not found for ID: ${communityId}`);
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
            handleAction={() => handleCardPress(item.id)}
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

  if (selectedCommunity) {
    return (
      <CommunityScreen 
        community={selectedCommunity}
        onClose={() => setSelectedCommunity(null)} 
      />
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
  screenContainer: { flex: 1, backgroundColor: 'white', paddingHorizontal: 24 }, 
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  myCommunitiesTitle: { fontSize: 24, fontWeight: '700', marginBottom: 10 },
  listContent: { paddingBottom: 30, gap: 16 },
  emptyText: {
      textAlign: 'center',
      marginTop: 50,
      color: '#999',
      fontSize: 16,
      paddingHorizontal: 30,
  },
});