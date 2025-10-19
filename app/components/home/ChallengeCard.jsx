
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ChallengeCard = ({ challenge }) => {
    const data = challenge;
    const [isCompleted, setIsCompleted] = useState(data.initialStatus === 'completed');

    const handleToggleCompletion = () => {
        // In a real app, you would send this status update to your database (e.g., Firestore)
        setIsCompleted(prev => !prev);
    };

    const buttonText = isCompleted ? 'Completed!' : 'In Progress...';
    const buttonStyle = isCompleted ? styles.completedButton : styles.inProgressButton;
    const buttonTextStyle = isCompleted ? styles.completedButtonText : styles.inProgressButtonText;

    return (
        <View style={styles.challengeContainer}>
            <View style={styles.challengeHeader}>
                <Text style={styles.challengeTitle}>{data.title}</Text>
                {/* Trophy Icon (Placeholder) */}
                <Text style={styles.trophyIcon}>🏆</Text>
            </View>
            <Text style={styles.challengeDescription}>{data.description}</Text>
            <View style={styles.statsRow}>
                <Text style={styles.statText}>
                    <Text style={styles.peopleIcon}>🧑‍🤝‍🧑</Text> {data.participants} joined
                </Text>
                <Text style={styles.statText}>{data.daysLeft} days left</Text>
            </View>
            <View style={styles.footer}>
                <View style={styles.badgeChip}>
                    <Text style={styles.badgeText}>{data.badge}</Text>
                </View>
                <TouchableOpacity style={[styles.completionButtonBase, buttonStyle]} onPress={handleToggleCompletion}>
                    <Text style={buttonTextStyle}>{buttonText}</Text>
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

    completionButtonBase: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        minWidth: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inProgressButton: { backgroundColor: 'white', borderColor: '#632692', borderWidth: 1 },
    inProgressButtonText: { color: '#374151', fontWeight: '700', fontSize: 12 },
    completedButton: { backgroundColor: '#632692', borderColor: '#632692', borderWidth: 1 },
    completedButtonText: { color: 'white', fontWeight: '700', fontSize: 12},
});

export default ChallengeCard;