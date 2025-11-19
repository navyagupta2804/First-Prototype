import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../../../firebaseConfig';
import CenteredContainer from '../../common/CenteredContainer';

// Helper component for the loading state (you can define this in a separate file if needed)
const LoadingView = () => (
    <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#ff4d2d" />
        <Text style={styles.loadingText}>Loading journal...</Text>
    </View>
);

export default function JournalScreen({ onClose, userId }) {
    // 1. STATE FOR JOURNAL DATA AND LOADING
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);

    // 2. DATA FETCHING LOGIC (from ProfileScreen.jsx)
    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const journalsRef = collection(db, 'journals');
        
        // Query ALL journal entries for the user, ordered by date
        const journalQuery = query(
            journalsRef,
            where('uid', '==', userId), 
            orderBy('createdAt', 'desc')
        );

        const unsubJournal = onSnapshot(
            journalQuery,
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setJournals(data);
                setLoading(false);
            },
            (error) => {
                console.error('Error loading journals:', error);
                setLoading(false);
            }
        );

        return () => unsubJournal();
    }, [userId]);


    // 3. RENDER ENTRY FUNCTION
    const renderEntries = ({item}) => {
        // Format the date if available
        const date = item.createdAt?.toDate ? item.createdAt.toDate() : new Date();
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
        
        // Ensure you use the 'title' field for the header and 'body' for the content
        // (Matching the fields used in the ProfileCard logic)
        const journalTitle = item.prompt || 'Untitled Entry'; 
        const journalBody = item.text || '';

        return (
            <View style={styles.journalEntry}>
                <View style={styles.journalHeader}>
                    <Ionicons name="book-outline" size={20} color="#ff4d2d" />
                    <Text style={styles.journalDate}>{journalTitle} • {formattedDate}</Text>
                </View>
                <Text style={styles.journalText}>{journalBody}</Text>
            </View>
        );
    };
    
    // 4. MAIN RETURN BLOCK
    if (loading) {
        return <LoadingView />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <CenteredContainer>
                {/* Header */}
                <View style={styles.pageTitle}>
                    <TouchableOpacity style={styles.backButtonContainer} onPress={onClose}>
                    <Ionicons name="arrow-back" size={16} color="#111" />  
                    <Text style={styles.title}>Your Journal</Text>
                    </TouchableOpacity>
                </View>
                
                {/* You should probably add a button to create a new entry here! */}
                
                {journals.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>📔</Text>
                        <Text style={styles.emptyTitle}>Start Journaling</Text>
                        <Text style={styles.emptyText}>
                            Document your cooking journey, track what works, and reflect on your progress.
                        </Text>
                        {/* Add a Create Entry Button */}
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
                            contentContainerStyle={styles.listContent}
                        />
                    </>
                )}
            </CenteredContainer>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f9fafb', paddingHorizontal: 16  },
    pageTitle: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'left', 
        paddingVertical: 20, marginTop: 20,  
    },
    backButtonContainer: { flexDirection: 'row', alignItems: 'center', paddingRight: 15 },
    
    title: { paddingLeft: 10, fontSize: 16, fontWeight: '500', color: '#111' },
    subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 16, fontWeight: '600' },

    journalEntry: { 
        padding: 16, 
        backgroundColor: 'white', 
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1, 
        borderColor: '#EEE', 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    journalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    journalDate: { fontSize: 14, color: '#ff4d2d', fontWeight: '700', marginLeft: 8 },
    journalText: {  fontSize: 14, color: '#374151', lineHeight: 22 },

    listContent: {  paddingBottom: 40 },

    emptyState: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#f3f4f6',
        borderRadius: 16,
        marginTop: 20,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
    },
    emptyEmoji: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#374151', marginBottom: 8 },
    emptyText: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 8, color: '#6b7280' }
});