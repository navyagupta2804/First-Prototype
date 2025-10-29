import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDocs, limit, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, Keyboard, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../../firebaseConfig';

const AddFriendModal = ({ isVisible, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const currentUserId = auth.currentUser?.uid;

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setSearchResults(null);
        setStatusMessage('');
        Keyboard.dismiss();

        try {
            // Search for user by UID (if it looks like a UID) or Display Name
            const isUidSearch = searchQuery.length > 20 && searchQuery.includes('-'); // Heuristic for UID
            
            let q;
            if (isUidSearch) {
                // Query by UID
                q = query(
                    collection(db, 'users'),
                    where('__name__', '==', searchQuery.trim()),
                    limit(1)
                );
            } else {
                // Query by Display Name
                q = query(
                    collection(db, 'users'),
                    where('displayName', '==', searchQuery.trim()),
                    limit(1)
                );
            }
            
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                setStatusMessage('No user found with that ID or name.');
                setSearchResults([]);
                return;
            }

            // Filter out the current user
            const results = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(user => user.id !== currentUserId);

            if (results.length === 0) {
                 setStatusMessage('That is your own ID, or no other users were found.');
            }

            setSearchResults(results);

        } catch (error) {
            console.error('Error searching for user:', error);
            setStatusMessage('An error occurred during search.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (targetUserId, targetUserName) => {
        if (!currentUserId) return;

        try {
            // 1. Create a request in the target user's incoming queue
            const requestRef = doc(db, 'users', targetUserId, 'friendRequests', currentUserId);
            await setDoc(requestRef, {
                senderId: currentUserId,
                senderName: auth.currentUser.displayName || 'Pantry Member',
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            // 2. Update status message
            setStatusMessage(`Friend request sent to ${targetUserName}!`);
            
            // 3. Clear search results after sending
            setSearchResults(null);
            setSearchQuery('');

        } catch (error) {
            console.error('Error sending friend request:', error);
            setStatusMessage('Failed to send request. Please try again.');
        }
    };

    const renderUserCard = (user) => (
        <View key={user.id} style={styles.userCard}>
            <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{user.displayName || 'Pantry Member'}</Text>
                <Text style={styles.cardId}>ID: {user.id.substring(0, 8)}...</Text>
            </View>
            <TouchableOpacity 
                style={styles.addButton}
                onPress={() => handleSendRequest(user.id, user.displayName)}
            >
                <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add a Friend</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close-circle-outline" size={30} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.modalSubtitle}>Search by Display Name or User ID (UID)</Text>
                    
                    {/* Search Input */}
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter name or ID"
                            placeholderTextColor="#9ca3af"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                        <TouchableOpacity 
                            style={styles.searchButton}
                            onPress={handleSearch}
                            disabled={loading || !searchQuery.trim()}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Ionicons name="search" size={24} color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Results / Status */}
                    <View style={styles.resultsContainer}>
                        {searchResults && searchResults.length > 0 && (
                            <Text style={styles.resultsHeader}>Found User:</Text>
                        )}
                        
                        {searchResults && searchResults.length > 0 
                            ? searchResults.map(renderUserCard)
                            : <Text style={styles.statusText}>{statusMessage}</Text>
                        }
                    </View>

                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111216',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 15,
        width: '100%',
        textAlign: 'left',
    },
    closeButton: {
        padding: 5,
    },
    searchContainer: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 20,
        backgroundColor: '#f9f9fb',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
    },
    input: {
        flex: 1,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#111216',
    },
    searchButton: {
        backgroundColor: '#ff4d2d',
        paddingHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultsContainer: {
        width: '100%',
        minHeight: 80,
    },
    resultsHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    statusText: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: 10,
    },
    userCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f0fdf4',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#10b981',
    },
    cardInfo: {
        flex: 1,
    },
    cardName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111216',
    },
    cardId: {
        fontSize: 12,
        color: '#6b7280',
    },
    addButton: {
        backgroundColor: '#10b981',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginLeft: 10,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '700',
    },
});

export default AddFriendModal;
