import { arrayRemove, arrayUnion, collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import CenteredContainer from '../components/common/CenteredContainer';
import CommunityCard from '../components/common/CommunityCard';
import PageHeader from '../components/common/PageHeader';

export default function ExploreScreen() {
  const user = auth.currentUser;
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // 1. Listen to Communities Collection (Public Only for Browse)
    const q = query(collection(db, 'communities'), where('isPublic', '==', true));
    
    const unsub = onSnapshot(q, (snap) => {
      const communityArr = [];
      snap.forEach((d) => {
        const data = d.data();
        communityArr.push({ 
            id: d.id, 
            ...data,
            memberUids: data.memberUids || [],
            description: data.description || '',
        });
      });
      setCommunities(communityArr);
      setLoading(false);
    }, (error) => {
        console.error("Error listening to communities:", error);
        setLoading(false);
    });
    return () => unsub();
  }, []);

  // --- JOIN/LEAVE LOGIC ---
  const toggleMembership = async (communityId, communityName, isCurrentlyJoined) => {
    if (!user) return;

    const communityRef = doc(db, 'communities', communityId);
    
    try {
      if (isCurrentlyJoined) {
        await updateDoc(communityRef, {
            memberUids: arrayRemove(user.uid),
        });
        Alert.alert('Left', `You have left ${communityName}.`);
      } else {
        await updateDoc(communityRef, {
            memberUids: arrayUnion(user.uid),
        });
        Alert.alert('Joined!', `Welcome to ${communityName}!`);
      }
    } catch (e) {
      console.error('Error toggling membership:', e);
      Alert.alert('Error', e.message);
    }
  };

  let searchedCommunities = communities.filter(c => 
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                c.description?.toLowerCase().includes(searchTerm.toLowerCase()));

  const renderCommunities = ({ item }) => {
    return (
      <CenteredContainer>
        <CommunityCard
          item={item}
          userUid={user?.uid} 
          handleAction={toggleMembership}
          isMyCommunitiesView={false} 
      />
      </CenteredContainer>
    );
  };

  if (loading) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff4d2d" />
            <Text style={{ marginTop: 10 }}>Loading exploration data...</Text>
        </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <PageHeader />
        <View style={styles.contentContainer}>
          <CenteredContainer>
            <Text style={styles.exploreTitle}>Explore</Text>
            <TextInput 
              style={styles.search} 
              placeholder="Search communities, challenges..." 
              placeholderTextColor="#A9A9A9"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            
            {/* Community List */}
            <Text style={styles.sectionTitle}>Communities</Text>
          </CenteredContainer>
          <FlatList
            data={searchedCommunities}
            keyExtractor={(it) => it.id}
            renderItem={renderCommunities}
            contentContainerStyle={{ gap: 12, paddingBottom: 100 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No communities found matching "{searchTerm}".</Text>
            }
          />
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: 'white', paddingHorizontal: 24 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contentContainer: { flex: 1 },
  exploreTitle: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  search: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 12, 
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 },
});