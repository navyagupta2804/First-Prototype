// utils/badgeCalculations.js (PURE JAVASCRIPT - NO REACT NATIVE IMPORTS)

// Helper to determine the start of the week for a given date
export const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Determine if a user needs to set their weekly goal.
 */
export const requiresGoalSetting = (userData) => {
    // 1. Get the current date and the date the user last started their "week"
    const today = new Date();
    const lastStart = userData.streakStartDate ? new Date(userData.streakStartDate.toDate()) : null;

    // Condition 1: Goal has never been set (First-time user)
    if (!userData.weeklyGoal || !lastStart) {
      return true;
    }

    // 2. Determine if a new week has started since the last streakStartDate
    // Compare the start of the current calendar week to the start of the recorded week.
    const currentWeekStart = getStartOfWeek(today).getTime();
    const lastWeekStart = getStartOfWeek(lastStart).getTime();

    console.log("currentWeekStart:", currentWeekStart);
    console.log("lastWeekStart:", lastWeekStart);
    
    // If the current calendar week is after the recorded week, they need to set a goal.
    return currentWeekStart > lastWeekStart;
};

/**
 * Calculates the total number of badges earned based on user metrics.
 */
export function calculateBadgeCount(photoCount, streak, journalCount = 0) {
    let badges = 0;
    // Meal Badges
    if (photoCount >= 1) badges++;
    if (photoCount >= 10) badges++;
    if (photoCount >= 50) badges++;
    // Streak Badges
    if (streak >= 3) badges++;
    if (streak >= 7) badges++;
    if (streak >= 30) badges++;
    // Journal Badges
    if (journalCount >= 5) badges++;
    if (journalCount >= 20) badges++;
    return badges;
}

/**
 * Returns a detailed list of all badges with earned status.
 */
export function getBadgesDetailed(photoCount, streak, journalCount) {
  return [
    { name: "First Meal", emoji: "🍳", earned: photoCount >= 1 },
    { name: "10 Meals", emoji: "👨‍🍳", earned: photoCount >= 10 },
    { name: "50 Meals", emoji: "🍽️", earned: photoCount >= 50 },
    { name: "3-Day Streak", emoji: "🔥", earned: streak >= 3 },
    { name: "Week Warrior", emoji: "⭐", earned: streak >= 7 },
    { name: "Month Master", emoji: "🏆", earned: streak >= 30 },
    { name: "Journal Starter", emoji: "📝", earned: journalCount >= 5 },
    { name: "Reflector", emoji: "💡", earned: journalCount >= 20 }
  ];
}