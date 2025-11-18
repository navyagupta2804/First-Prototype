import JournalBadge from "../../../../assets/badges/journal_badge.png";
import Streak7Badge from "../../../../assets/badges/streak_badge.png";
import MealBadge from "../../../../assets/badges/meal_badge.png";

export const BADGE_DEFS = [
  {
    id: 'cook_first',
    name: 'First Cook',
    description: 'Upload your first meal.',
    Icon: MealBadge,
    sortOrder: 1,
  },
  {
    id: 'streak_7',
    name: '7-Day Streak',
    description: 'Cook 7 days in a row.',
    Icon: Streak7Badge,
    sortOrder: 2,
  }, 
  {
    id: 'first_journal',
    name: 'First Journal',
    description: 'Log your first cooking journal.',
    Icon: JournalBadge,
    sortOrder: 3,
  }
];

export default BADGE_DEFS;
