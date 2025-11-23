import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

import CenteredContainer from '../common/CenteredContainer';
import TabBar from '../common/TabBar';
import CommunityActivityFeed from './CommunityActivityFeed';
import CommunityHeader from './CommunityHeader';
import CommunityOverviewCard from './CommunityOverviewCard';

const DUMMY_POSTS = [
  {
    id: 'post1',
    author: 'Sarah M.',
    avatar: null, // Could be a URL
    category: 'Meals Under $5',
    time: '2h ago',
    text: 'Made this amazing $3 pasta with just pantry staples! The key is using pasta water to make it creamy.',
    image: 'https://via.placeholder.com/300x200?text=Pasta+Dish', // Placeholder image
    likes: 24,
    comments: 8,
  },
  {
    id: 'post2',
    author: 'BudgetChef',
    avatar: null,
    category: 'Weekly Haul',
    time: '4h ago',
    text: 'Got a huge haul from the farmers market for just $20! Planning veggie chili and roasted root veggies this week. #budgetcooking',
    image: null, // No image for this post
    likes: 15,
    comments: 3,
  },
  {
    id: 'post3',
    author: 'EcoEats',
    avatar: null,
    category: 'Tips & Tricks',
    time: '1d ago',
    text: 'Meal prepping tip: Cook a big batch of grains (rice, quinoa) at the start of the week. Saves so much time!',
    image: null,
    likes: 40,
    comments: 12,
  },
];

export default function CommunityScreen({ community, onClose }) {
    if (!community) return null;

    const [activeTab, setActiveTab] = useState('Journal');
    const tabs = ['Log', 'Discussions', 'Members'];

    const totalMembers = community.memberUids.length; 

    const renderTabContent = () => {
      switch (activeTab) {
        case 'Journal':
          return <CommunityActivityFeed />;
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
            {/* Overview Card */}
            <CommunityOverviewCard 
              description={community.description}
              totalMembers={totalMembers}
              streak={12} 
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
  placeholderText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#6b7280',
  },
});