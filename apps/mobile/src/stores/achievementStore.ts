import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { haptics } from '../services/haptics';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji
  category: 'tasks' | 'streaks' | 'bets' | 'focus' | 'special';
  requirement: number;
  secret?: boolean; // Hidden until unlocked
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: string;
  notified: boolean;
}

// All available achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Task achievements
  { id: 'first_blood', title: 'First Blood', description: 'Complete your first task', icon: '🩸', category: 'tasks', requirement: 1 },
  { id: 'task_10', title: 'Getting Started', description: 'Complete 10 tasks', icon: '📝', category: 'tasks', requirement: 10 },
  { id: 'task_50', title: 'Productive Soul', description: 'Complete 50 tasks', icon: '⚡', category: 'tasks', requirement: 50 },
  { id: 'task_100', title: 'Century Club', description: 'Complete 100 tasks', icon: '💯', category: 'tasks', requirement: 100 },
  { id: 'task_500', title: 'Task Master', description: 'Complete 500 tasks', icon: '👑', category: 'tasks', requirement: 500 },
  { id: 'task_1000', title: 'Legendary', description: 'Complete 1000 tasks', icon: '🏆', category: 'tasks', requirement: 1000 },

  // Streak achievements
  { id: 'streak_3', title: 'Hat Trick', description: 'Maintain a 3-day streak', icon: '🎩', category: 'streaks', requirement: 3 },
  { id: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '📅', category: 'streaks', requirement: 7 },
  { id: 'streak_14', title: 'Fortnight Fighter', description: 'Maintain a 14-day streak', icon: '⚔️', category: 'streaks', requirement: 14 },
  { id: 'streak_30', title: 'Monthly Monster', description: 'Maintain a 30-day streak', icon: '🗓️', category: 'streaks', requirement: 30 },
  { id: 'streak_100', title: 'Unstoppable', description: 'Maintain a 100-day streak', icon: '🔥', category: 'streaks', requirement: 100 },
  { id: 'streak_365', title: 'Year of Hell', description: 'Maintain a 365-day streak', icon: '😈', category: 'streaks', requirement: 365 },

  // Bet achievements
  { id: 'bet_first', title: 'Gambler', description: 'Win your first bet against the devil', icon: '🎰', category: 'bets', requirement: 1 },
  { id: 'bet_10', title: 'High Roller', description: 'Win 10 bets', icon: '💰', category: 'bets', requirement: 10 },
  { id: 'bet_25', title: 'Devil Slayer', description: 'Win 25 bets', icon: '🗡️', category: 'bets', requirement: 25 },
  { id: 'bet_50', title: 'Soul Keeper', description: 'Win 50 bets', icon: '👻', category: 'bets', requirement: 50 },
  { id: 'bet_streak_5', title: 'Lucky Devil', description: 'Win 5 bets in a row', icon: '🍀', category: 'bets', requirement: 5 },

  // Focus achievements
  { id: 'focus_first', title: 'Focused', description: 'Complete your first focus session', icon: '🎯', category: 'focus', requirement: 1 },
  { id: 'focus_10', title: 'Deep Work', description: 'Complete 10 focus sessions', icon: '🧘', category: 'focus', requirement: 10 },
  { id: 'focus_50', title: 'Flow State', description: 'Complete 50 focus sessions', icon: '🌊', category: 'focus', requirement: 50 },
  { id: 'focus_100', title: 'Zen Master', description: 'Complete 100 focus sessions', icon: '☯️', category: 'focus', requirement: 100 },
  { id: 'focus_hours_10', title: '10 Hour Club', description: 'Accumulate 10 hours of focus', icon: '⏰', category: 'focus', requirement: 600 },
  { id: 'focus_hours_100', title: 'Centurion', description: 'Accumulate 100 hours of focus', icon: '🏛️', category: 'focus', requirement: 6000 },

  // Special/secret achievements
  { id: 'night_owl', title: 'Night Owl', description: 'Complete a task after midnight', icon: '🦉', category: 'special', requirement: 1, secret: true },
  { id: 'early_bird', title: 'Early Bird', description: 'Complete a task before 6am', icon: '🐦', category: 'special', requirement: 1, secret: true },
  { id: 'comeback', title: 'Comeback Kid', description: 'Return after 7+ days away', icon: '🔄', category: 'special', requirement: 1, secret: true },
  { id: 'shameless', title: 'Shameless', description: 'Receive 100 shame messages', icon: '😏', category: 'special', requirement: 100, secret: true },
  { id: 'devil_destroyer', title: 'Devil Destroyer', description: 'Beat the devil 10 times in a row', icon: '💀', category: 'special', requirement: 10, secret: true },
  { id: 'urgent_master', title: 'Urgent Master', description: 'Complete 10 urgent tasks on time', icon: '🚨', category: 'special', requirement: 10, secret: true },
];

interface AchievementState {
  unlocked: UnlockedAchievement[];
  pendingNotifications: string[]; // Achievement IDs to show

  // Stats for tracking progress
  stats: {
    tasksCompleted: number;
    currentStreak: number;
    bestStreak: number;
    betsWon: number;
    betWinStreak: number;
    focusSessionsCompleted: number;
    totalFocusMinutes: number;
    shamesReceived: number;
    urgentTasksCompleted: number;
  };

  // Actions
  checkAndUnlock: (achievementId: string) => boolean;
  updateStat: (stat: keyof AchievementState['stats'], value: number) => void;
  incrementStat: (stat: keyof AchievementState['stats'], by?: number) => void;
  markNotified: (achievementId: string) => void;
  getProgress: (achievementId: string) => { current: number; required: number; percentage: number };
  isUnlocked: (achievementId: string) => boolean;
  getNextAchievements: (category?: Achievement['category']) => Achievement[];
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      unlocked: [],
      pendingNotifications: [],

      stats: {
        tasksCompleted: 0,
        currentStreak: 0,
        bestStreak: 0,
        betsWon: 0,
        betWinStreak: 0,
        focusSessionsCompleted: 0,
        totalFocusMinutes: 0,
        shamesReceived: 0,
        urgentTasksCompleted: 0,
      },

      checkAndUnlock: (achievementId: string) => {
        const { unlocked, stats } = get();

        // Already unlocked
        if (unlocked.some((a) => a.id === achievementId)) {
          return false;
        }

        const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
        if (!achievement) return false;

        // Check if requirement is met
        let currentValue = 0;
        switch (achievement.id) {
          case 'first_blood':
          case 'task_10':
          case 'task_50':
          case 'task_100':
          case 'task_500':
          case 'task_1000':
            currentValue = stats.tasksCompleted;
            break;
          case 'streak_3':
          case 'streak_7':
          case 'streak_14':
          case 'streak_30':
          case 'streak_100':
          case 'streak_365':
            currentValue = stats.currentStreak;
            break;
          case 'bet_first':
          case 'bet_10':
          case 'bet_25':
          case 'bet_50':
            currentValue = stats.betsWon;
            break;
          case 'bet_streak_5':
          case 'devil_destroyer':
            currentValue = stats.betWinStreak;
            break;
          case 'focus_first':
          case 'focus_10':
          case 'focus_50':
          case 'focus_100':
            currentValue = stats.focusSessionsCompleted;
            break;
          case 'focus_hours_10':
          case 'focus_hours_100':
            currentValue = stats.totalFocusMinutes;
            break;
          case 'shameless':
            currentValue = stats.shamesReceived;
            break;
          case 'urgent_master':
            currentValue = stats.urgentTasksCompleted;
            break;
          default:
            currentValue = 1; // Special achievements just need to be triggered
        }

        if (currentValue >= achievement.requirement) {
          // Unlock!
          haptics.celebration();

          set((state) => ({
            unlocked: [
              ...state.unlocked,
              { id: achievementId, unlockedAt: new Date().toISOString(), notified: false },
            ],
            pendingNotifications: [...state.pendingNotifications, achievementId],
          }));

          return true;
        }

        return false;
      },

      updateStat: (stat, value) => {
        set((state) => ({
          stats: { ...state.stats, [stat]: value },
        }));
      },

      incrementStat: (stat, by = 1) => {
        const { stats, checkAndUnlock } = get();
        const newValue = stats[stat] + by;

        set((state) => ({
          stats: { ...state.stats, [stat]: newValue },
        }));

        // Check for related achievements
        const achievementsToCheck: string[] = [];

        switch (stat) {
          case 'tasksCompleted':
            achievementsToCheck.push('first_blood', 'task_10', 'task_50', 'task_100', 'task_500', 'task_1000');
            break;
          case 'currentStreak':
            achievementsToCheck.push('streak_3', 'streak_7', 'streak_14', 'streak_30', 'streak_100', 'streak_365');
            break;
          case 'betsWon':
            achievementsToCheck.push('bet_first', 'bet_10', 'bet_25', 'bet_50');
            break;
          case 'betWinStreak':
            achievementsToCheck.push('bet_streak_5', 'devil_destroyer');
            break;
          case 'focusSessionsCompleted':
            achievementsToCheck.push('focus_first', 'focus_10', 'focus_50', 'focus_100');
            break;
          case 'totalFocusMinutes':
            achievementsToCheck.push('focus_hours_10', 'focus_hours_100');
            break;
          case 'shamesReceived':
            achievementsToCheck.push('shameless');
            break;
          case 'urgentTasksCompleted':
            achievementsToCheck.push('urgent_master');
            break;
        }

        achievementsToCheck.forEach(checkAndUnlock);
      },

      markNotified: (achievementId: string) => {
        set((state) => ({
          unlocked: state.unlocked.map((a) =>
            a.id === achievementId ? { ...a, notified: true } : a
          ),
          pendingNotifications: state.pendingNotifications.filter((id) => id !== achievementId),
        }));
      },

      getProgress: (achievementId: string) => {
        const { stats } = get();
        const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
        if (!achievement) return { current: 0, required: 0, percentage: 0 };

        let current = 0;
        switch (achievementId) {
          case 'first_blood':
          case 'task_10':
          case 'task_50':
          case 'task_100':
          case 'task_500':
          case 'task_1000':
            current = stats.tasksCompleted;
            break;
          case 'streak_3':
          case 'streak_7':
          case 'streak_14':
          case 'streak_30':
          case 'streak_100':
          case 'streak_365':
            current = stats.currentStreak;
            break;
          case 'bet_first':
          case 'bet_10':
          case 'bet_25':
          case 'bet_50':
            current = stats.betsWon;
            break;
          case 'bet_streak_5':
          case 'devil_destroyer':
            current = stats.betWinStreak;
            break;
          case 'focus_first':
          case 'focus_10':
          case 'focus_50':
          case 'focus_100':
            current = stats.focusSessionsCompleted;
            break;
          case 'focus_hours_10':
          case 'focus_hours_100':
            current = stats.totalFocusMinutes;
            break;
          case 'shameless':
            current = stats.shamesReceived;
            break;
          case 'urgent_master':
            current = stats.urgentTasksCompleted;
            break;
        }

        return {
          current: Math.min(current, achievement.requirement),
          required: achievement.requirement,
          percentage: Math.min(100, Math.round((current / achievement.requirement) * 100)),
        };
      },

      isUnlocked: (achievementId: string) => {
        return get().unlocked.some((a) => a.id === achievementId);
      },

      getNextAchievements: (category) => {
        const { unlocked } = get();
        const unlockedIds = new Set(unlocked.map((a) => a.id));

        return ACHIEVEMENTS.filter((a) => {
          if (unlockedIds.has(a.id)) return false;
          if (a.secret) return false;
          if (category && a.category !== category) return false;
          return true;
        }).slice(0, 3);
      },
    }),
    {
      name: 'devil-do-achievements',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
