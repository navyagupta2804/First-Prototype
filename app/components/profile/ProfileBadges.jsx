import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { getBadgesDetailed } from '../../utils/bageCalculations';

const ProfileBadges = ({ photoCount = 0, streak = 0, journalCount = 0 }) => {
    const badges = getBadgesDetailed(photoCount, streak, journalCount);
    const earnedCount = badges.filter(b => b.earned).length;

    return (
        <View style={styles.milestonesSection}>
            <View style={styles.header}>
                <Ionicons name="trophy-outline" size={20} color="#10b981" />
                <Text style={styles.sectionTitle}>Your Milestones ({earnedCount}/{badges.length})</Text>
            </View>
            
            <View style={styles.badgesGrid}>
                {badges.map((badge, index) => (
                    <View 
                        key={index} 
                        style={[styles.badgeItem, !badge.earned && styles.badgeLocked]}
                    >
                        <Text style={[styles.badgeEmoji, !badge.earned && styles.badgeEmojiLocked]}>
                            {badge.emoji}
                        </Text>
                        <Text style={[styles.badgeName, !badge.earned && styles.badgeNameLocked]}>
                            {badge.name}
                        </Text>
                        {badge.earned && (
                            <View style={styles.badgeCheck}>
                                <Ionicons name="checkmark-circle-sharp" size={16} color="#10b981" />
                            </View>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    milestonesSection: {
        marginBottom: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111216',
        marginLeft: 8,
    },
    badgesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },
    badgeItem: {
        width: '30%', // Makes sure it's 3 items wide with some space
        backgroundColor: '#f0fdf4',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#10b981',
        position: 'relative',
    },
    badgeLocked: {
        backgroundColor: '#f3f4f6',
        borderColor: '#d1d5db',
        opacity: 0.6,
    },
    badgeEmoji: {
        fontSize: 32,
        marginBottom: 4,
    },
    badgeEmojiLocked: {
        opacity: 0.4,
    },
    badgeName: {
        fontSize: 11,
        fontWeight: '700',
        color: '#111216',
        textAlign: 'center',
    },
    badgeNameLocked: {
        color: '#9ca3af',
    },
    badgeCheck: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'white',
        borderRadius: 8,
    },
});

export default ProfileBadges;