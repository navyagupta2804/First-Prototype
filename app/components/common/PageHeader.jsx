import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CenteredContainer from './CenteredContainer';

const PageHeader = () => {
  const router = useRouter();

  const handleAddFriend = () => {
    // Logic to open Add Friend modal
    console.log("Add Friend tapped");
  };

  const handleNotifications = () => {
    // Logic to navigate to notifications
    console.log("Notifications tapped");
  };

  return (
    <CenteredContainer style={styles.header}>
      <Text style={styles.brand}>pantry</Text>
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.iconButton} onPress={handleAddFriend}>
          <Ionicons name="person-add-outline" size={24} color="#111" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleNotifications}>
          <Ionicons name="notifications-outline" size={24} color="#111" />
        </TouchableOpacity>
      </View>
    </CenteredContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontSize: 26, fontWeight: '900', color: '#ff4d2d', letterSpacing: 0.2 },
  headerIcons: { flexDirection: 'row', gap: 15 },
  // iconButton: { padding: 4 },
});

export default PageHeader;