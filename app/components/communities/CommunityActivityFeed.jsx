import { Ionicons } from '@expo/vector-icons';
import { serverTimestamp } from 'firebase/firestore';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PostCard from '../common/PostCard';

// Dummy data remains here for demonstration
const DUMMY_POSTS = [
    { 
        caption: 'Made this amazing $3 pasta with just pantry staples. The key is using pasta water to make it creamy.', 
        commentsCount: 8,
        createdAt: serverTimestamp(),
        displayName: "Lola",
        displayPhoto: "https://ui-avatars.com/api/?name=Lola&background=e5e7eb&color=6b7280z&length=1&bold=true",
        id: 'post1', 
        isPublished: true,
        likesCount: 24, 
        uid: 'oidjXXbQModtDgAkrvLVG3EFiUb2',
        url: 'https://via.placeholder.com/300x200?text=Pasta+Dish', 
    },
    { 
        id: 'post2', 
        uid: 'oidjXXbQModtDgAkrvLVG3EFiUb2',
        isPublished: true,
        createdAt: serverTimestamp(),
        caption: 'Got a huge haul from the farmers market for just $20! Planning veggie chili and roasted root veggies this week. #budgetcooking', 
        displayName: "Lola",
        displayPhoto: "https://ui-avatars.com/api/?name=Lola&background=e5e7eb&color=6b7280z&length=1&bold=true",
        url: null, 
        likesCount: 15, 
        commentsCount: 3 
    },
];

const CommunityActivityFeed = ({ communityFeed, onPress }) => {
    const renderPosts = ({ item }) => <PostCard item={item} />;
    return (
        <>
            {/* Share Input */}
            <TouchableOpacity style={styles.shareInput} onPress={onPress}>
                <Ionicons name="camera-outline" size={20} color="#6b7280" />
                <Text style={styles.shareInputText}>Share your cooking win!! 🙌</Text>
            </TouchableOpacity>

            {/* Activity Feed List */}
            <View style={styles.screenContainer}>
                  <FlatList
                    data={communityFeed}
                    keyExtractor={(it) => it.id}
                    renderItem={renderPosts}
                    contentContainerStyle={{ paddingBottom: 140 }}
                    showsVerticalScrollIndicator={false}
                  />
            </View>
        </>
    );
};

export default CommunityActivityFeed;

const styles = StyleSheet.create({
    // --- Share Input Styles ---
    shareInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    shareInputText: {
        marginLeft: 10,
        color: '#6b7280',
        fontSize: 14,
    },

    // --- Post Card Styles ---
    postCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    postAvatarPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#ff4d2d',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    postAvatarText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    postHeaderText: {
        flex: 1,
    },
    postAuthor: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111',
    },
    postCategoryTime: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    postCategoryChip: {
        backgroundColor: '#e0f2f7',
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginRight: 8,
    },
    postCategoryText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#0e7490',
    },
    postTime: {
        fontSize: 12,
        color: '#9ca3af',
    },
    postText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginBottom: 10,
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#f3f4f6',
        resizeMode: 'cover',
    },
    postActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    postActionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
    },
    postActionText: {
        fontSize: 12,
        color: '#6b7280',
        marginLeft: 5,
    },
});