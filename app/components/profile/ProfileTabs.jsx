import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ProfileTabs = ({ activeTab, setActiveTab }) => {
    return (
        <View style={styles.tabBar}>
            {['Posts', 'Saved', 'Badges'].map((tab) => (
                <TouchableOpacity
                    key={tab}
                    style={[styles.tab, activeTab === tab && styles.tabActive]}
                    onPress={() => setActiveTab(tab)}
                >
                    <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                        {tab}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row',
        backgroundColor: 'white',
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1
    },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
    tabActive: { backgroundColor: '#f3f4f6' },
    tabText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
    tabTextActive: { color: '#111' },
});

export default ProfileTabs;
