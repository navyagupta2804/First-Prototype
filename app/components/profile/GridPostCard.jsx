import { Image, StyleSheet, TouchableOpacity } from 'react-native';

const GridPostCard = ({ item, onPress }) => {
    return (
        <TouchableOpacity 
            style={styles.container} 
            onPress={() => onPress && onPress(item)}
            activeOpacity={0.8}
        >
            <Image 
                source={{ uri: item.url }} 
                style={styles.image} 
                onError={(e) => console.log('Image Load Error:', e.nativeEvent.error)}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '32.8%', 
        aspectRatio: 1,
        overflow: 'hidden',
        borderRadius: 4,
    },
    image: {
        flex: 1,
        resizeMode: 'cover',
    },
});

export default GridPostCard;