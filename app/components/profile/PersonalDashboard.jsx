import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const PersonalDashboard = ({ profile, photoCount = 0, journalCount = 0 }) => {
  if (!profile) return null;
  
  const badgeCount = calculateBadges(photoCount, profile.streak, journalCount);
  const streakMessage = getStreakMessage(profile.streak);
  const currentChallenge = getCurrentChallenge();

  return (
    <View style={styles.container}>
      {/* Prominent Streak Display */}
      <View style={styles.streakCard}>
        <View style={styles.streakHeader}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View style={styles.streakInfo}>
            <Text style={styles.streakNumber}>{profile.streak || 0}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
        </View>
        <Text style={styles.streakMessage}>{streakMessage}</Text>
        {profile.streak > 0 && (
          <View style={styles.streakProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min((profile.streak / 30) * 100, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {profile.streak < 30 ? `${30 - profile.streak} days to 30-day milestone!` : '30+ day champion! 🏆'}
            </Text>
          </View>
        )}
      </View>

      {/* Quick Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{photoCount}</Text>
          <Text style={styles.statLabel}>Meals Logged</Text>
          <Ionicons name="restaurant" size={20} color="#ff4d2d" style={styles.statIcon} />
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{journalCount}</Text>
          <Text style={styles.statLabel}>Journal Entries</Text>
          <Ionicons name="book" size={20} color="#8b5cf6" style={styles.statIcon} />
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{badgeCount}</Text>
          <Text style={styles.statLabel}>Badges Earned</Text>
          <Ionicons name="trophy" size={20} color="#10b981" style={styles.statIcon} />
        </View>
      </View>

      {/* Current Challenge Card */}
      {currentChallenge && (
        <View style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <Ionicons name="flag" size={24} color="#6366f1" />
            <Text style={styles.challengeTitle}>This Week's Challenge</Text>
          </View>
          <Text style={styles.challengeDescription}>{currentChallenge.description}</Text>
          <View style={styles.challengeProgress}>
            <View style={styles.challengeProgressBar}>
              <View 
                style={[
                  styles.challengeProgressFill, 
                  { width: `${(photoCount % 7 / currentChallenge.goal) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.challengeProgressText}>
              {photoCount % 7}/{currentChallenge.goal} completed
            </Text>
          </View>
        </View>
      )}

      {/* Milestones & Badges */}
      <View style={styles.milestonesSection}>
        <Text style={styles.sectionTitle}>Your Milestones</Text>
        <View style={styles.badgesGrid}>
          {getBadges(photoCount, profile.streak, journalCount).map((badge, index) => (
            <View 
              key={index} 
              style={[styles.badgeItem, !badge.earned && styles.badgeLocked]}
            >
              <Text style={[styles.badgeEmoji, !badge.earned && styles.badgeEmojiLocked]}>
                {badge.emoji}
              </Text>
              <Text style={[styles.badgeName, !badge.earned && styles.badgeNameLocked]}>
                {badge.name}
              </Text>
              {badge.earned && (
                <View style={styles.badgeCheck}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Motivational Message */}
      {profile.streak > 0 && (
        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>⭐</Text>
          <Text style={styles.motivationText}>
            {getMotivationalMessage(profile.streak)}
          </Text>
        </View>
      )}

      {/* Empty State */}
      {profile.streak === 0 && photoCount === 0 && journalCount === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>👋</Text>
          <Text style={styles.emptyTitle}>Welcome to Your Kitchen!</Text>
          <Text style={styles.emptyText}>
            Start your cooking journey by logging your first meal and sharing your experience.
          </Text>
        </View>
      )}
    </View>
  );
};

// Helper function to calculate badges
function calculateBadges(photoCount, streak, journalCount) {
  let badges = 0;
  if (photoCount >= 1) badges++;
  if (photoCount >= 10) badges++;
  if (photoCount >= 50) badges++;
  if (streak >= 3) badges++;
  if (streak >= 7) badges++;
  if (streak >= 30) badges++;
  if (journalCount >= 5) badges++;
  if (journalCount >= 20) badges++;
  return badges;
}

// Helper function to get streak message
function getStreakMessage(streak) {
  if (streak === 0) return "Start your cooking streak today!";
  if (streak === 1) return "Great start! Keep the momentum going!";
  if (streak < 7) return "You're building a habit! Keep it up!";
  if (streak < 14) return "Over a week strong! You're on fire!";
  if (streak < 30) return "Incredible consistency! Almost a month!";
  return "Cooking champion! You're unstoppable!";
}

// Helper function for motivational messages
function getMotivationalMessage(streak) {
  if (streak >= 30) return "Incredible! You're a cooking champion!";
  if (streak >= 14) return "Two weeks strong! Keep it up!";
  if (streak >= 7) return "One week streak! You're on fire!";
  if (streak >= 3) return "Great momentum! Keep going!";
  return "You're doing great! Keep logging!";
}

// Helper function to get current challenge
function getCurrentChallenge() {
  // Return a weekly challenge (this could be dynamic from Firebase later)
  return {
    description: "Cook 3 meals this week",
    goal: 3,
    reward: "Weekly Warrior badge"
  };
}

// Helper function to get all badges
function getBadges(photoCount, streak, journalCount) {
  return [
    {
      name: "First Meal",
      emoji: "🍳",
      earned: photoCount >= 1
    },
    {
      name: "10 Meals",
      emoji: "👨‍🍳",
      earned: photoCount >= 10
    },
    {
      name: "3-Day Streak",
      emoji: "🔥",
      earned: streak >= 3
    },
    {
      name: "Week Warrior",
      emoji: "⭐",
      earned: streak >= 7
    },
    {
      name: "Journal Starter",
      emoji: "📝",
      earned: journalCount >= 5
    },
    {
      name: "30-Day Champion",
      emoji: "🏆",
      earned: streak >= 30
    }
  ];
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111216',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111216',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  achievementsSection: {
    marginTop: 8,
  },
  achievementsList: {
    gap: 8,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  achievementText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111216',
  },
  emptyAchievements: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  // Streak Card Styles
  streakCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#111216',
  },
  streakLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
  },
  streakMessage: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 12,
    fontWeight: '500',
  },
  streakProgress: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#fed7aa',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#92400e',
    marginTop: 6,
    fontWeight: '600',
  },
  
  // Stats Grid Styles
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111216',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  statIcon: {
    marginTop: 8,
  },
  
  // Challenge Card Styles
  challengeCard: {
    backgroundColor: '#eef2ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111216',
    marginLeft: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#4338ca',
    marginBottom: 12,
    fontWeight: '500',
  },
  challengeProgress: {
    marginTop: 8,
  },
  challengeProgressBar: {
    height: 8,
    backgroundColor: '#c7d2fe',
    borderRadius: 4,
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  challengeProgressText: {
    fontSize: 12,
    color: '#4338ca',
    marginTop: 6,
    fontWeight: '600',
  },
  
  // Milestones Section Styles
  milestonesSection: {
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeItem: {
    width: '30%',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10b981',
    position: 'relative',
  },
  badgeLocked: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    opacity: 0.6,
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  badgeEmojiLocked: {
    opacity: 0.4,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111216',
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: '#9ca3af',
  },
  badgeCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  
  // Motivation Card Styles
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fef3c7',
    marginBottom: 16,
  },
  motivationEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  motivationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  
  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    marginTop: 16,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111216',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PersonalDashboard;
