// CommunityActivityFeed.jsx
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Dummy data remains here for demonstration
const DUMMY_POSTS = [
    { id: 'post1', author: 'Sarah M.', category: 'Meals Under $5', time: '2h ago', text: 'Made this amazing $3 pasta with just pantry staples. The key is using pasta water to make it creamy.', image: 'https://via.placeholder.com/300x200?text=Pasta+Dish', likes: 24, comments: 8 },
    { id: 'post2', author: 'BudgetChef', category: 'Weekly Haul', time: '4h ago', text: 'Got a huge haul from the farmers market for just $20! Planning veggie chili and roasted root veggies this week. #budgetcooking', image: null, likes: 15, comments: 3 },
    { id: 'post3', author: 'EcoEats', category: 'Tips & Tricks', time: '1d ago', text: 'Meal prepping tip: Cook a big batch of grains (rice, quinoa) at the start of the week. Saves so much time!', image: null, likes: 40, comments: 12 },
];

const CommunityActivityFeed = () => {
    return (
        <>
            {/* Share Input */}
            <TouchableOpacity style={styles.shareInput}>
                <Ionicons name="camera-outline" size={20} color="#6b7280" />
                <Text style={styles.shareInputText}>Share your budget cooking win...</Text>
            </TouchableOpacity>

            {/* Activity Feed List */}
            {DUMMY_POSTS.map(post => (
                <View key={post.id} style={styles.postCard}>
                    <View style={styles.postHeader}>
                        <View style={styles.postAvatarPlaceholder}>
                            <Text style={styles.postAvatarText}>{post.author.charAt(0)}</Text>
                        </View>
                        <View style={styles.postHeaderText}>
                            <Text style={styles.postAuthor}>{post.author}</Text>
                            <View style={styles.postCategoryTime}>
                                {post.category && (
                                    <View style={styles.postCategoryChip}>
                                        <Text style={styles.postCategoryText}>{post.category}</Text>
                                    </View>
                                )}
                                <Text style={styles.postTime}>{post.time}</Text>
                            </View>
                        </View>
                    </View>
                    <Text style={styles.postText}>{post.text}</Text>
                    {post.image && (
                        <Image source={{ uri: post.image }} style={styles.postImage} />
                    )}
                    <View style={styles.postActions}>
                        <View style={styles.postActionItem}>
                            <Ionicons name="heart-outline" size={18} color="#6b7280" />
                            <Text style={styles.postActionText}>{post.likes}</Text>
                        </View>
                        <View style={styles.postActionItem}>
                            <Ionicons name="chatbubble-outline" size={18} color="#6b7280" />
                            <Text style={styles.postActionText}>{post.comments}</Text>
                        </View>
                    </View>
                </View>
            ))}
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