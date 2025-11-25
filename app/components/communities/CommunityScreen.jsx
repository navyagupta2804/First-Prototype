import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../../firebaseConfig';

import { getStartOfWeek } from '../../utils/badgeCalculations';
import CenteredContainer from '../common/CenteredContainer';
import TabBar from '../common/TabBar';
import CommunityActivityFeed from './CommunityActivityFeed';
import CommunityHeader from './CommunityHeader';
import CommunityMemberList from './CommunityMemberList';
import CommunityProgressCard from './CommunityProgressCard';


export default function CommunityScreen({ community, onClose }) {
  if (!community) return null;
  const [communityMembers, setCommunityMembers] = useState([]);
  const [membersCooked, setMembersCooked] = useState(0);
  const [communityFeed, setcommunityFeed] = useState([]);
  const [activeTab, setActiveTab] = useState('Log');
  
  const tabs = ['Log', 'Discussions', 'Members'];
  const currentCommunityId = community.uid;
  const totalMembers = community.memberUids.length; 

  const router = useRouter();

  // ---- Community Feed Subscription ----
  useEffect(() => {
    if (!currentCommunityId) return;
    const q = query(
      collection(db, 'feed'), 
      where('communityIds', 'array-contains', currentCommunityId),
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const items = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
      setcommunityFeed(items);
    });
    return unsub;
  }, [currentCommunityId]);

  // ---- Community Members Subscription ----
  useEffect(() => {
    if (!currentCommunityId) return;
    const q = query(
      collection(db, 'users'), 
      where('joinedCommunities', 'array-contains', currentCommunityId),
      orderBy('displayName', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const items = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
      setCommunityMembers(items);
    });
    return unsub;
  }, [currentCommunityId]);

  // --- Weekly Progress Subscription (Posts since start of week) ---
  // This fetches a SUBSET of posts, only for calculating membersCooked.
  useEffect(() => {
    if (!currentCommunityId) return;

    const startOfWeek = getStartOfWeek(new Date());
    const q = query(
      collection(db, 'feed'), 
      where('communityIds', 'array-contains', currentCommunityId),
      where('isPublished', '==', true),
      where('createdAt', '>=', startOfWeek), 
      orderBy('createdAt', 'desc') 
    );

    const unsub = onSnapshot(q, (snap) => {
      const uniqueCookers = new Set();
        
      snap.forEach((d) => {
        const data = d.data();
        if (data.userId) {
          uniqueCookers.add(data.userId); 
        }
      });
        
      setMembersCooked(uniqueCookers.size); 
    });

    return unsub;
  }, [currentCommunityId]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Log': 
        return ( 
          <CommunityActivityFeed 
            communityFeed={communityFeed}
            onPress={() => handleCommunityPost(community.id)}
          />    
        );
      case 'Discussions':
        return <Text style={styles.placeholderText}>Discussions tab content coming soon!</Text>;
      case 'Members':
        return (
          <CommunityMemberList communityMembers={communityMembers} />
        );
      default:
        return null;
    }
  };

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