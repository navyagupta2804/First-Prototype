import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

const CommunityOverviewCard = ({ description, totalMembers, streak }) => {
    const progressPercentage = (1 / totalMembers) * 100;

    return (
        <View style={styles.overviewCard}>
            <Text style={styles.communityDescription}>{description}</Text>
            
            {/* Progress Bar */}
            <Text style={styles.progressLabel}>This Week's Progress</Text>
            <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
            </View>
            <Text style={styles.progressText}>
                {1}/{totalMembers}
            </Text>
            <Text style={styles.progressSubtitle}>
                {progressPercentage.toFixed(0)}% of community cooked this week!
            </Text>

            {/* Streak */}
            <View style={styles.streakContainer}>
                <Ionicons name="trending-up-outline" size={20} color="#10b981" />
                <Text style={styles.streakText}>Strong Weeks</Text>
                <View style={styles.streakChip}>
                    <Text style={styles.streakChipText}>{streak} week streak</Text>
                </View>
            </View>
        </View>
    );
};

export default CommunityOverviewCard;

const styles = StyleSheet.create({
    overviewCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginVertical: 15,
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    communityDescription: {
        fontSize: 14,
        color: '#4b5563',
        marginBottom: 20,
        lineHeight: 20,
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111',
        marginBottom: 8,
    },
    progressBarBackground: {
        height: 10,
        backgroundColor: '#e5e7eb',
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 5,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#10b981', // Green color
        borderRadius: 5,
    },
    progressText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111',
        textAlign: 'right',
        marginBottom: 2,
    },
    progressSubtitle: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'right',
        marginBottom: 20,
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ecfdf5', // Light green background
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginTop: 10,
    },
    streakText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#10b981',
        marginLeft: 8,
        flex: 1,
    },
    streakChip: {
        backgroundColor: '#d1fae5', // Even lighter green
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
    },
    streakChipText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#065f46',
    },
});