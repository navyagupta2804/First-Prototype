import { Image, StyleSheet, TouchableOpacity } from 'react-native';

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
        flex: 1,
        aspectRatio: 1,
        marginHorizontal: 1,
    },
    image: { 
        width: '100%',
        height: '100%',
        borderRadius: 4,
        backgroundColor: '#f1f1f1',
    }
});

export default GridPostCard;
