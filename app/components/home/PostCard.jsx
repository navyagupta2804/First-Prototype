import { Ionicons } from '@expo/vector-icons';
import {
  addDoc, collection, deleteDoc, doc, getDoc,
  increment, onSnapshot, orderBy, query,
  serverTimestamp, setDoc, updateDoc
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert, FlatList, Image, StyleSheet, Text,
  TextInput, TouchableOpacity, View
} from 'react-native';
import { auth, db } from '../../../firebaseConfig';
import CenteredContainer from '../common/CenteredContainer';

function CommentInput({ itemId, onCommentAdded }) {
  const [commentText, setCommentText] = useState('');
  const user = auth.currentUser;

  const onAddComment = async () => {
    if (!user) return Alert.alert('Sign in', 'Please sign in to comment.');
    if (!commentText.trim()) return;

    const commentsRef = collection(db, 'feed', itemId, 'comments');
    const feedRef = doc(db, 'feed', itemId);

    try {
      await addDoc(commentsRef, {
        uid: user.uid,
        text: commentText.trim(),
        displayName: user.displayName || 'Pantry Member',
        createdAt: serverTimestamp()
      });
      // increment comment count on feed doc
      await updateDoc(feedRef, { commentsCount: increment(1) });
      setCommentText('');
      if (onCommentAdded) onCommentAdded();
    } catch (e) {
      console.warn('Add comment error', e);
      Alert.alert('Error', 'Unable to add comment.');
    }
  };

  return (
    <View style={styles.commentInputRow}>
      <TextInput
        value={commentText}
        onChangeText={setCommentText}
        placeholder="Write a comment..."
        style={styles.commentInput}
      />
      <TouchableOpacity style={styles.sendBtn} onPress={onAddComment}>
        <Text style={{ color: '#fff' }}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}

function CommentsSection({ itemId, show }) {
  const [comments, setComments] = useState([]);

  // Subscribe to comments only when comments pane is open
  useEffect(() => {
    if (!show) return;
    const q = query(collection(db, 'feed', itemId, 'comments'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setComments(arr);
    });
    return unsub;
  }, [show, itemId]);

  if (!show) return null;

  return (
    <View style={styles.commentsSection}>
      <FlatList
        data={comments}
        keyExtractor={(it) => it.id}
        renderItem={({ item: c }) => (
          <View style={styles.commentRow}>
            <Text style={styles.commentAuthor}>{c.displayName}</Text>
            <Text style={styles.commentText}>{c.text}</Text>
          </View>
        )}
        style={{ maxHeight: 240 }}
      />
      <CommentInput itemId={itemId} />
    </View>
  );
}


export default function PostCard({ item }) {
  const [likesCount, setLikesCount] = useState(item.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(item.commentsCount || 0);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    // subscribe to counts on the feed doc
    const dref = doc(db, 'feed', item.id);
    const unsub = onSnapshot(dref, (snap) => {
      const data = snap.data() || {};
      setLikesCount(data.likesCount || 0);
      setCommentsCount(data.commentsCount || 0);
    });
    // check if current user liked
    const checkLike = async () => {
      try {
        if (!user) return setLiked(false);
        const likeDoc = await getDoc(doc(db, 'feed', item.id, 'likes', user.uid));
        setLiked(likeDoc.exists());
      } catch (e) {
        // noop
      }
    };
    checkLike();
    return unsub;
  }, [item.id]);

  const toggleLike = async () => {
    if (!user) return Alert.alert('Sign in', 'Please sign in to like posts.');
    const likeRef = doc(db, 'feed', item.id, 'likes', user.uid);
    const feedRef = doc(db, 'feed', item.id);
    try {
      if (liked) {
        await deleteDoc(likeRef);
        await updateDoc(feedRef, { likesCount: increment(-1) });
        setLiked(false);
      } else {
        await setDoc(likeRef, { uid: user.uid, createdAt: serverTimestamp() });
        await updateDoc(feedRef, { likesCount: increment(1) });
        setLiked(true);
      }
    } catch (e) {
      console.warn('Like toggle error', e);
    }
  };


  const userInitials = (item.userDisplay || 'PM').split(' ').map(s => s[0]).join('').slice(0, 2);
  const postTime = item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleString() : '';

  return (
    <CenteredContainer style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userInitials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.userDisplay || 'Pantry Member'}</Text>
          <Text style={styles.cardTime}>{postTime}</Text>
        </View>
      </View>
      {item.type === 'photo' && <Image source={{ uri: item.url }} style={styles.feedImage} resizeMode="cover" />}
      {item.text && <Text style={styles.cardBody}>{item.text}</Text>}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={toggleLike}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? '#ef4444' : '#111'} />
          <Text style={styles.actionText}>{likesCount || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowComments(s => !s)}>
          <Ionicons name="chatbubble-outline" size={20} color="#111" />
          <Text style={styles.actionText}>{commentsCount || 0}</Text>
        </TouchableOpacity>
      </View>
      <CommentsSection itemId={item.id} show={showComments} />
    </CenteredContainer>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: '#EEE', borderRadius: 14, padding: 12, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { fontWeight: '800', color: '#111216' },
  cardTitle: { fontWeight: '700' },
  cardTime: { color: '#6B7280', fontSize: 12 },
  feedImage: { width: '100%', height: 700, borderRadius: 10, backgroundColor: '#F3F4F6', marginTop: 6 },
  cardBody: { marginTop: 8, color: '#111216' },

  // Actions (likes/comments)
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionText: { marginLeft: 4, fontWeight: '700' },

  // Comments
  commentsSection: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#f1f1f1', paddingTop: 8 },
  commentRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f3f3' },
  commentAuthor: { fontWeight: '700' },
  commentText: { marginTop: 4 },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  commentInput: { flex: 1, borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, marginRight: 8 },
  sendBtn: { backgroundColor: '#111216', padding: 10, borderRadius: 8 }
});