import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, View } from 'react-native';

const JournalSection = ({ journals = [] }) => {
    if (!journals) return null;

    const renderEntries = ({item}) => {
        // Format the date if available
        const date = item.createdAt?.toDate ? item.createdAt.toDate() : new Date();
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });

        return (
            <View style={styles.journalEntry}>
                <View style={styles.journalHeader}>
                    <Ionicons name="book-outline" size={20} color="#8b5cf6" />
                    <Text style={styles.journalDate}>{formattedDate}</Text>
                </View>
                {item.prompt && (
                    <View style={styles.promptContainer}>
                        <Text style={styles.promptLabel}>Prompt:</Text>
                        <Text style={styles.promptText}>{item.prompt}</Text>
                    </View>
                )}
                <Text style={styles.journalText}>{item.text}</Text>
            </View>
        );
    };
    
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="book" size={24} color="#8b5cf6" />
                <Text style={styles.sectionHeader}>Your Journal</Text>
            </View>
            {journals.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>📔</Text>
                    <Text style={styles.emptyTitle}>Start Journaling</Text>
                    <Text style={styles.emptyText}>
                        Document your cooking journey, track what works, and reflect on your progress.
                    </Text>
                </View>
            ) : (
                <>
                    <Text style={styles.subtitle}>
                        {journals.length} {journals.length === 1 ? 'entry' : 'entries'} • Keep reflecting!
                    </Text>
                    <FlatList
                        data={journals}
                        keyExtractor={(item) => item.id}
                        renderItem={renderEntries}
                        scrollEnabled={false} 
                        contentContainerStyle={styles.listContent}
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionHeader: { 
        fontSize: 18, 
        fontWeight: '800', 
        marginLeft: 8,
        color: '#111216',
    },
    subtitle: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 12,
        fontWeight: '600',
    },
    journalEntry: { 
        padding: 16, 
        backgroundColor: '#faf5ff', 
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e9d5ff',
    },
    journalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    journalDate: {
        fontSize: 12,
        color: '#7c3aed',
        fontWeight: '700',
        marginLeft: 8,
    },
    promptContainer: {
        backgroundColor: '#f3e8ff',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#8b5cf6',
    },
    promptLabel: {
        fontSize: 11,
        color: '#7c3aed',
        fontWeight: '800',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    promptText: {
        fontSize: 13,
        color: '#6b21a8',
        fontWeight: '600',
    },
    journalText: { 
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    listContent: { 
        gap: 0,
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#faf5ff',
        borderRadius: 16,
        marginTop: 8,
        borderWidth: 2,
        borderColor: '#e9d5ff',
        borderStyle: 'dashed',
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111216',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default JournalSection;
