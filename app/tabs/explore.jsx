import { StyleSheet, Text, TextInput, View } from 'react-native';
import CenteredContainer from '../components/common/CenteredContainer';

export default function ExploreScreen() {
  return (
    <View style={styles.screenContainer}>
      <CenteredContainer>
        <TextInput style={styles.search} placeholder="Search communities, challenges..." />
        <Text style={{ marginTop: 12, color: '#6b7280' }}>
          Coming soon: challenges & trending communities.
        </Text>
      </CenteredContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: 'white', paddingTop: 56 },
  search: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12 }
});
