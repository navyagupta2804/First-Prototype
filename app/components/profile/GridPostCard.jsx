import { Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const GRID_ITEM_SIZE = (width - 36) / 3; // 16px padding on each side, 2px gap between items

const GridPostCard = ({ item }) => {
    if (!item || !item.url) return null;
    
    const imageUrl = item.url;

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
    container: { 
        width: GRID_ITEM_SIZE,
        height: GRID_ITEM_SIZE,
        marginBottom: 2,
    },
    image: { 
        width: '100%',
        height: '100%',
        borderRadius: 4,
        backgroundColor: '#f1f1f1',
    }
});

export default GridPostCard;
