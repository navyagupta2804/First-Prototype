import { collection, doc, getDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import CenteredContainer from '../components/common/CenteredContainer';
import GridPostCard from '../components/profile/GridPostCard';
import JournalSection from '../components/profile/JournalSection';
import ProfileHeader from '../components/profile/ProfileHeader';

const ProfileScreen = () => {
  const user = auth.currentUser;
  const [profile, setProfile] = useState({
    displayName: user?.displayName || 'Chef',
    streak: 0,
    communities: 0,
    photoCount: 0
  });
  const [photos, setPhotos] = useState([]);
  const [journals, setJournals] = useState([]);

  useEffect(() => {
    if (!user) return;
    const uref = doc(db, 'users', user.uid);
    
    // initial profile load
    getDoc(uref).then((snap) => {
      if (snap.exists()) setProfile((p) => ({ ...p, ...snap.data() }));
    });

    // photos listener
    const photosQuery = query(collection(db, 'users', user.uid, 'photos'), orderBy('createdAt', 'desc'));
    const unsubPhotos = onSnapshot(photosQuery, (snap) => {
      setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // journals listener
    // NOTE: This is inefficient; you should filter by uid on the server if possible.
    const journalsQuery = query(collection(db, 'journals'), orderBy('createdAt', 'desc'));
    const unsubJournals = onSnapshot(journalsQuery, (snap) => {
        const journalsArr = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(d => d.uid === user.uid); // Keep the client-side filter for now
        setJournals(journalsArr);
    });
    
    return () => {
      unsubPhotos();
      unsubJournals();
    };
  }, [user?.uid]);

  const renderPosts = ({ item }) => (
    <View style={styles.gridImg}>
      <GridPostCard item={item} />
    </View>
  );

  const renderHeader = () => (
    <>
      <ProfileHeader profile={profile} photoCount={photos.length}/>
      <JournalSection journals={journals}/>
      <Text style={styles.sectionHeader}>Posts</Text>
    </>
  );
  
  return (
    <CenteredContainer style={styles.sectionHeaderWrapper}>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={renderPosts}
        ListHeaderComponent={renderHeader}
        columnWrapperStyle={{ gap: 8 }}
        contentContainerStyle={{ padding: 16, gap: 8 }}
      />
    </CenteredContainer>
  );
}

export const styles = StyleSheet.create({
  gridImg: { flex: 1, aspectRatio: 1 / 1 },
  logoutText: { color: 'white', fontWeight: '700' },
  sectionHeader: { fontSize: 16, fontWeight: '700'}
});

export default ProfileScreen;