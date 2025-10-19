
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ChallengeCard = ({ challenge }) => {
    const data = challenge;

    return (
        <View style={styles.challengeContainer}>
            <View style={styles.challengeHeader}>
                <Text style={styles.challengeTitle}>{data.title}</Text>
                {/* Trophy Icon (Placeholder) */}
                {/* <Text style={styles.trophyIcon}>🏆</Text> */}
            </View>
            <Text style={styles.challengeDescription}>{data.description}</Text>

            {/* STATS ROW */}
            <View style={styles.statsRow}>
                {/* 🧑‍🤝‍🧑 Participants */}
                <Text style={styles.statText}>
                    <Text style={styles.peopleIcon}>🧑‍🤝‍🧑</Text> {data.participants} joined
                </Text>
                <Text style={styles.statText}>{data.daysLeft} days left</Text>
            </View>

            {/* BOTTOM ROW (Badge and Join Button) */}
            <View style={styles.footer}>
                {/* BADGE CHIP */}
                <View style={styles.badgeChip}>
                    <Text style={styles.badgeText}>{data.badge}</Text>
                </View>
                
                {/* JOIN BUTTON */}
                <TouchableOpacity style={styles.joinButton} onPress={() => console.log('Join Challenge')}>
                    <Text style={styles.joinButtonText}>Completed!</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

};

const styles = StyleSheet.create({
    challengeContainer: {
        width: '100%',
        marginBottom: 15,
        padding: 16,
        backgroundColor: 'white',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        borderRadius: 12, 
    },
    challengeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    challengeTitle: { fontSize: 14, fontWeight: '700', color: '#1f2937' },
    challengeDescription: { fontSize: 14, color: '#4b5563', marginBottom: 12 },
    
    statsRow: { flexDirection: 'row', gap: 20, marginBottom: 16 },
    statText: { fontSize: 13, color: '#6b7280' },
    peopleIcon: { fontSize: 14, color: '#8b5cf6' },
    
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    badgeChip: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        backgroundColor: '#f3f4f6', 
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    badgeText: { fontSize: 12, fontWeight: '600', color: '#374151', },
    joinButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: '#632692', 
        borderRadius: 10,
    },
    joinButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 12,
    },
});

export default ChallengeCard;