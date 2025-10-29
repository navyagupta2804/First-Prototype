import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AppHeader = () => {
  const handleAddFriend = () => {
    // Logic to open Add Friend modal
    console.log("Add Friend tapped");
  };

  const handleNotifications = () => {
    // Logic to navigate to notifications
    console.log("Notifications tapped");
  };

  return (
    <View style={styles.header}>
      <Text style={styles.brand}>pantry</Text>
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.iconButton} onPress={handleAddFriend}>
          <Ionicons name="person-add-outline" size={24} color="#111" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleNotifications}>
          <Ionicons name="notifications-outline" size={24} color="#111" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  brand: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#ff4d2d' 
  },
  headerIcons: { 
    flexDirection: 'row', 
    gap: 16 
  },
  iconButton: { 
    padding: 4 
  },
});

export default AppHeader;