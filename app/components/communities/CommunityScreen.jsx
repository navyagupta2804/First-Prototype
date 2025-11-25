import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

import CenteredContainer from '../common/CenteredContainer';
import TabBar from '../common/TabBar';
import CommunityActivityFeed from './CommunityActivityFeed';
import CommunityHeader from './CommunityHeader';
import CommunityProgressCard from './CommunityProgressCard';

export default function CommunityScreen({ community, onClose }) {
    if (!community) return null;

    const [activeTab, setActiveTab] = useState('Log');
    const tabs = ['Log', 'Discussions', 'Members'];

    const totalMembers = community.memberUids.length; 
    const membersCooked = 1;

    const router = useRouter();
    const handleCommunityPost = (communityId) => {
      if (!communityId) {
        console.error("Community data is missing to navigate.");
        return;
      }

      // Navigate to the LogScreen and pass the community ID in the params object
      router.push({
        pathname: '../../tabs/log', 
        params: { 
          preSelectedCommunityId: communityId
        }
      });
    };

    const renderTabContent = () => {
      switch (activeTab) {
        case 'Log':
          return <CommunityActivityFeed onPress={() => handleCommunityPost(community.id)}/>;
        case 'Discussions':
          return <Text style={styles.placeholderText}>Discussions tab content coming soon!</Text>;
        case 'Members':
          return <Text style={styles.placeholderText}>Members list coming soon!</Text>;
        default:
          return null;
      }
    };

    return (
      <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <CommunityHeader 
            communityName={community.name}
            memberCount={totalMembers}
            onClose={onClose}
          />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>   
          <CenteredContainer>
            <Text style={styles.communityDescription}>{community.description}</Text>
            {/* Progress Card */}
            <CommunityProgressCard 
              totalMembers={totalMembers}
              membersCooked={membersCooked}
            />

            {/* Tab Navigation */}
            <TabBar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
              tabs={tabs} 
            />
            
            {/* Tab Content */}
            <View style={styles.tabContent}>
              {renderTabContent()}
            </View>
          </CenteredContainer>
        </ScrollView>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white', paddingHorizontal: 24 },
  pageTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'left', paddingBottom: 20 },
  backButtonContainer: { flexDirection: 'row', alignItems: 'center', paddingRight: 15 },
  title: { paddingLeft: 10, fontSize: 20, fontWeight: '800', color: '#ff4d2d' },
  communityDescription: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
    letterSpacing: 2,
    textAlign: 'center',
  },
  placeholderText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#6b7280',
  },
});