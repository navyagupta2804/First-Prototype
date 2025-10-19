import { Image, StyleSheet, TouchableOpacity } from 'react-native';

const GridPostCard = ({ item }) => {
    const imageUrl = item.url; 
    if (!imageUrl) return null; 

    // Use TouchableOpacity to make the image tappable (to open a detail view later)
    return (
        <TouchableOpacity style={styles.container}>
            <Image 
                source={{ uri: imageUrl }} 
                style={styles.image} 
                resizeMode="cover"
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    image: { flex: 1, borderRadius: 8, backgroundColor: '#f1f1f1'} // Placeholder background while loading
});

export default GridPostCard;