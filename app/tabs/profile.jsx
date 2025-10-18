import { signOut } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';

export default function ProfileScreen() {
  const user = auth.currentUser;
  const [profile, setProfile] = useState({
    displayName: user?.displayName || 'Chef',
    streak: 0,
    communities: 0,
    photoCount: 0
  });
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (!user) return;
    //console.log('Listening to profile and photos for user:', user.uid);
    const uref = doc(db, 'users', user.uid);
    getDoc(uref).then((snap) => {
      if (snap.exists()) setProfile((p) => ({ ...p, ...snap.data() }));
    });
    const unsub = onSnapshot(
      query(collection(db, 'users', user.uid, 'photos'), orderBy('createdAt', 'desc')),
      (snap) => {
        const arr = [];
        snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
        setPhotos(arr);
      }
    );
    return unsub;
  }, [user?.uid]);

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (e) {
            console.warn('Sign out error', e);
            Alert.alert('Error', 'Unable to sign out. Please try again.');
          }
        }
      }
    ]);
  };

  const Header = () => (
    <View>
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile.displayName || 'JD').split(' ').map((s) => s[0]).join('').slice(0, 2)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{profile.displayName}</Text>
          <Text style={styles.subtitle}>Cooking enthusiast • Member since 2024</Text>
          <Text style={styles.subtitle}>24 friends   •   {profile.communities || 0} communities</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.stat}><Text style={styles.statNum}>{photos.length}</Text><Text style={styles.statLabel}>Meals</Text></View>
        <View style={styles.stat}><Text style={styles.statNum}>{profile.streak || 0}</Text><Text style={styles.statLabel}>Streaks</Text></View>
        <View style={styles.stat}><Text style={styles.statNum}>{profile.photoCount || photos.length}</Text><Text style={styles.statLabel}>Badges</Text></View>
      </View>
      <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Posts</Text>
    </View>
  );

  const renderItem = ({ item }) => <Image source={{ uri: item.url }} style={styles.gridImg} />;

  return (
    <FlatList
      data={photos}
      keyExtractor={(it) => it.id}
      numColumns={3}
      renderItem={renderItem}
      ListHeaderComponent={<Header />}
      columnWrapperStyle={{ gap: 8 }}
      contentContainerStyle={{ padding: 16, gap: 8 }}
    />
  );
}

const styles = StyleSheet.create({
  headerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', color: '#111216' },
  name: { fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#6b7280' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 },
  stat: { alignItems: 'center', flex: 1 },
  statNum: { fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#6b7280' },
  gridImg: { flex: 1, aspectRatio: 1, borderRadius: 8, backgroundColor: '#f1f1f1' }
  ,
  logoutBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  logoutText: { color: '#ffffff', fontWeight: '700' }
});