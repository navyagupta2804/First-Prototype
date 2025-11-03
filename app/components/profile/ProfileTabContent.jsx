import { Ionicons } from '@expo/vector-icons';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SPACING = 6;

const renderGridItem = ({ item, onPostPress }) => (
    <TouchableOpacity style={styles.gridItem} activeOpacity={0.8} onPress={() => onPostPress(item)}>
      <Image 
        source={{ uri: item.url }} 
        style={styles.gridImage}
        onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
      />
    </TouchableOpacity>
);

const renderEmptyState = (iconName, title, text) => (
    <View style={styles.emptyState}>
        <Ionicons name={iconName} size={64} color="#d1d5db" />
        <Text style={styles.emptyStateTitle}>{title}</Text>
        <Text style={styles.emptyStateText}>{text}</Text>
    </View>
);

const ProfileTabContent = ({ activeTab, posts, onPostPress }) => {
    if (activeTab === 'Posts') {
        return posts.length > 0 ? (
            <FlatList
                data={posts}
                renderItem={({ item }) => renderGridItem({ item, onPostPress })}
                keyExtractor={(item) => item.id}
                numColumns={3}
                scrollEnabled={false} // Important: keep this false inside a parent ScrollView
                contentContainerStyle={styles.grid}
            />
        ) : (
            renderEmptyState(
                "camera-outline", 
                "No posts yet!", 
                "Start your cooking journey by sharing your first meal."
            )
        );
    } 
    
    if (activeTab === 'Saved') {
        return renderEmptyState(
            "bookmark-outline", 
            "No saved recipes yet", 
            "Mark recipes as favorites to find them here easily."
        );
    } 
    
    if (activeTab === 'Badges') {
        return renderEmptyState(
            "trophy-outline", 
            "Earn badges by cooking!", 
            "Unlock achievements for your streaks and posts."
        );
    }

    return null;
};

const styles = StyleSheet.create({
    // Grid
    grid: { justifyContent:'center', paddingBottom: 20 },
    gridItem: { width: '33.333%', padding: SPACING / 2, aspectRatio: 1 },
    gridImage: { width: '100%', height: '100%', borderRadius: 8, backgroundColor: '#f3f4f6' },
    
    // Empty States
    emptyState: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: 40 },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
        marginTop: 16,
        marginBottom: 8
    },
    emptyStateText: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 8 }
});

export default ProfileTabContent;
