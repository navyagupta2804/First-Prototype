// utils/badgeCalculations.js (PURE JAVASCRIPT - NO REACT NATIVE IMPORTS)

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