import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <TextInput style={styles.search} placeholder="Search communities, challenges..." />
      <Text style={{ marginTop: 12, color: '#6b7280' }}>
        Coming soon: challenges & trending communities.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 16, paddingTop: 56 },
  search: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12 }
});
