import { StyleSheet, Text, TextInput, View } from 'react-native';
import CenteredContainer from '../components/common/CenteredContainer';
import PageHeader from '../components/common/PageHeader';

export default function ExploreScreen() {
  return (
    <View style={styles.screenContainer}>
      <PageHeader />
      <CenteredContainer>
        <TextInput 
          style={styles.search} 
          placeholder="Search communities, challenges..." 
          placeholderTextColor="#A9A9A9"
        />
        <Text style={{ marginTop: 12, color: '#6b7280' }}>
          Coming soon: challenges & trending communities.
        </Text>
      </CenteredContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: 'white', paddingHorizontal: 16 },
  search: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12 }
});
