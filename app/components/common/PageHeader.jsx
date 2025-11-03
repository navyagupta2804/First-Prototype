import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import CenteredContainer from './CenteredContainer';

const PageHeader = () => {
  const router = useRouter();

  return (
    <CenteredContainer style={styles.header}>
      <Text style={styles.brand}>pantry</Text>
      <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/tabs/profile')}>
        <Ionicons name="person-circle" size={28} color="#111216" />
      </TouchableOpacity>
    </CenteredContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontSize: 26, fontWeight: '900', color: '#ff4d2d', letterSpacing: 0.2 },
  iconBtn: { padding: 6, borderRadius: 999 },
});

export default PageHeader;