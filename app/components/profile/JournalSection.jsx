import { FlatList, StyleSheet, Text, View } from 'react-native';

const JournalSection = ({ journals }) => {

    const renderEntries = ({item}) => (
        <View style={styles.journalEntry}>
            <Text style={{ fontWeight: 'bold' }}>{item.prompt}</Text>
            <Text>{item.text}</Text>
        </View>
    );
    
    return (
        <View>
            <Text style={styles.sectionHeader}>Journals</Text>
            {journals.length === 0 ? (
                 <Text style={styles.noData}>No journal entries yet.</Text>
            ) : (
                <FlatList
                    data={journals}
                    keyExtractor={(item) => item.id}
                    renderItem={renderEntries}
                    scrollEnabled={false} 
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({

  sectionHeader: { fontSize: 16, fontWeight: '700', marginBottom: 10, marginTop: 15 },
  journalEntry: { padding: 12, backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 8},
  entryPrompt: { fontWeight: 'bold', marginBottom: 4 },
  entryText: { color: '#333' },
  listContent: { gap: 8 },
  noData: { color: '#6b7280', textAlign: 'center', marginVertical: 20 }
});

export default JournalSection;