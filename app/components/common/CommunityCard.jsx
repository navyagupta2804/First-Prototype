// CommunityCard.jsx
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CommunityCard = ({ item, userUid, toggleMembership, isMyCommunitiesView }) => {
    // Determine membership status
    const joined = item.memberUids.includes(userUid); 
    
    let buttonText;
    let buttonAction;
    let buttonColor;
    
    // Logic for the button based on the view and membership status
    if (isMyCommunitiesView) {
        buttonText = 'Leave';
        buttonAction = () => toggleMembership(item.id, item.name, true); // true = joined
        buttonColor = '#e5e7eb';
    } else {
        buttonText = joined ? 'Leave' : 'Join';
        buttonAction = () => toggleMembership(item.id, item.name, joined);
        buttonColor = joined ? '#e5e7eb' : '#ff4d2d';
    }

    if (isMyCommunitiesView && !joined) return null;

    return (
        <View style={styles.card}>
            <View style={styles.cardInfo}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{item.name}</Text>
                    {/* Display Member Count next to Title */}
                    <Text style={styles.memberCountMeta}>
                        {item.memberUids.length} members
                    </Text>
                </View>
                <Text style={styles.description}>{item.description}</Text> 
            </View>
            
            <TouchableOpacity
                style={[styles.btn, { backgroundColor: buttonColor }]}
                onPress={buttonAction}
            >
                <Text style={{ color: (buttonColor === '#e5e7eb') ? '#111216' : 'white', fontWeight: '700' }}>
                    {buttonText}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default CommunityCard;

const styles = StyleSheet.create({
  card: { 
    borderWidth: 1, 
    borderColor: '#eee', 
    padding: 16, 
    borderRadius: 12, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardInfo: { flex: 1, marginRight: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '700', marginRight: 5 },
  memberCountMeta: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  description: { fontSize: 13, color: '#6b7280' },
  btn: { 
    paddingVertical: 8, 
    paddingHorizontal: 14, 
    borderRadius: 10, 
    minWidth: 70, 
    alignItems: 'center',
  }
});