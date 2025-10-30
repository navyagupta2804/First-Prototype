import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from '../../common/PostCard';

/**
 * Full-screen view to display a single post (reusing the PostCard component).
 * @param {object} post - The post data object (item).
 * @param {function} onClose - Function to navigate back to the profile grid.
 */
export default function PostDetailScreen({ posts, postId, onClose }) {
  const initialIndex = posts.findIndex(p => p.id === postId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>your posts</Text>
        <View style={{ width: 40 }} /> {/* Spacer */}
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (<PostCard item={item} />)}
        initialScrollIndex={initialIndex >= 0 ? initialIndex : 0}
        getItemLayout={(data, index) => (
          // Use a fixed height estimate for performance (800px is safe for the large PostCard)
          { length: 800, offset: 800 * index, index } 
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  backButton: { padding: 5 },
  scrollViewContent: { padding: 16, paddingBottom: 40 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }
});
