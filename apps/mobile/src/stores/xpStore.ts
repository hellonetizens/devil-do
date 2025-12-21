import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { haptics } from '../services/haptics';

// XP rewards for different actions
export const XP_REWARDS = {
  // Task actions
  TASK_COMPLETE: 10,
  TASK_COMPLETE_URGENT: 20,
  TASK_COMPLETE_EARLY: 5, // Bonus for completing before due date
  TASK_ABANDONED: -5,

  // Focus actions
  FOCUS_SESSION_COMPLETE: 15,
  FOCUS_SESSION_ABANDONED: -10,

  // Streak actions
  STREAK_MAINTAINED: 25,
  STREAK_MILESTONE_7: 50,
  STREAK_MILESTONE_30: 100,
  STREAK_MILESTONE_100: 250,

  // Bet actions
  BET_WON: 30,
  BET_LOST: -15,

  // Daily actions
  DAILY_GOAL_MET: 50,
  FIRST_TASK_OF_DAY: 10,

  // Achievement unlocks
  ACHIEVEMENT_UNLOCKED: 25,
} as const;

// Level thresholds - XP needed to reach each level
const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  450,    // Level 4
  700,    // Level 5
  1000,   // Level 6
  1400,   // Level 7
  1900,   // Level 8
  2500,   // Level 9
  3200,   // Level 10
  4000,   // Level 11
  5000,   // Level 12
  6200,   // Level 13
  7600,   // Level 14
  9200,   // Level 15
  11000,  // Level 16
  13000,  // Level 17
  15500,  // Level 18
  18500,  // Level 19
  22000,  // Level 20 (max for now)
];

// Level titles
export const LEVEL_TITLES: Record<number, string> = {
  1: 'Soul Trainee',
  2: 'Imp Apprentice',
  3: 'Task Minion',
  4: 'Focus Fiend',
  5: 'Streak Demon',
  6: 'Productivity Devil',
  7: 'Hell\'s Helper',
  8: 'Infernal Achiever',
  9: 'Doom Doer',
  10: 'Master of Tasks',
  11: 'Overlord Initiate',
  12: 'Chaos Controller',
  13: 'Realm Ruler',
  14: 'Inferno Legend',
  15: 'Hellfire Hero',
  16: 'Eternal Grinder',
  17: 'Apocalypse Agent',
  18: 'Supreme Slayer',
  19: 'Legendary Damned',
  20: 'Devil\'s Champion',
};

interface XPEvent {
  type: keyof typeof XP_REWARDS;
  amount: number;
  timestamp: string;
  description?: string;
}

interface XPState {
  totalXP: number;
  level: number;
  xpHistory: XPEvent[];

  // Daily tracking
  todayXP: number;
  lastXPDate: string;

  // Pending level up notification
  pendingLevelUp: number | null;

  // Actions
  addXP: (type: keyof typeof XP_REWARDS, description?: string) => void;
  addCustomXP: (amount: number, description: string) => void;
  getXPToNextLevel: () => number;
  getXPProgress: () => number; // 0-100 percentage
  getLevelTitle: () => string;
  clearLevelUpNotification: () => void;
  resetDaily: () => void;
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

const calculateLevel = (xp: number): number => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
};

export const useXPStore = create<XPState>()(
  persist(
    (set, get) => ({
      totalXP: 0,
      level: 1,
      xpHistory: [],
      todayXP: 0,
      lastXPDate: getTodayDate(),
      pendingLevelUp: null,

      addXP: (type, description) => {
        const amount = XP_REWARDS[type];
        const { totalXP, level, todayXP, lastXPDate, xpHistory } = get();
        const today = getTodayDate();

        // Reset daily XP if new day
        const isNewDay = lastXPDate !== today;
        const newTodayXP = isNewDay ? amount : todayXP + amount;

        const newTotalXP = Math.max(0, totalXP + amount);
        const newLevel = calculateLevel(newTotalXP);

        // Check for level up
        const leveledUp = newLevel > level;
        if (leveledUp) {
          haptics.celebration();
        } else if (amount > 0) {
          haptics.success();
        } else if (amount < 0) {
          haptics.warning();
        }

        // Add to history (keep last 50)
        const newEvent: XPEvent = {
          type,
          amount,
          timestamp: new Date().toISOString(),
          description,
        };

        set({
          totalXP: newTotalXP,
          level: newLevel,
          todayXP: Math.max(0, newTodayXP),
          lastXPDate: today,
          xpHistory: [newEvent, ...xpHistory].slice(0, 50),
          pendingLevelUp: leveledUp ? newLevel : get().pendingLevelUp,
        });
      },

      addCustomXP: (amount, description) => {
        const { totalXP, level, todayXP, lastXPDate, xpHistory } = get();
        const today = getTodayDate();

        const isNewDay = lastXPDate !== today;
        const newTodayXP = isNewDay ? amount : todayXP + amount;

        const newTotalXP = Math.max(0, totalXP + amount);
        const newLevel = calculateLevel(newTotalXP);

        const leveledUp = newLevel > level;
        if (leveledUp) {
          haptics.celebration();
        }

        const newEvent: XPEvent = {
          type: 'TASK_COMPLETE', // Generic
          amount,
          timestamp: new Date().toISOString(),
          description,
        };

        set({
          totalXP: newTotalXP,
          level: newLevel,
          todayXP: Math.max(0, newTodayXP),
          lastXPDate: today,
          xpHistory: [newEvent, ...xpHistory].slice(0, 50),
          pendingLevelUp: leveledUp ? newLevel : get().pendingLevelUp,
        });
      },

      getXPToNextLevel: () => {
        const { totalXP, level } = get();
        if (level >= LEVEL_THRESHOLDS.length) return 0;
        return LEVEL_THRESHOLDS[level] - totalXP;
      },

      getXPProgress: () => {
        const { totalXP, level } = get();
        if (level >= LEVEL_THRESHOLDS.length) return 100;

        const currentLevelXP = LEVEL_THRESHOLDS[level - 1];
        const nextLevelXP = LEVEL_THRESHOLDS[level];
        const progress = ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

        return Math.min(100, Math.max(0, progress));
      },

      getLevelTitle: () => {
        const { level } = get();
        return LEVEL_TITLES[level] || LEVEL_TITLES[20];
      },

      clearLevelUpNotification: () => {
        set({ pendingLevelUp: null });
      },

      resetDaily: () => {
        const today = getTodayDate();
        const { lastXPDate } = get();

        if (lastXPDate !== today) {
          set({ todayXP: 0, lastXPDate: today });
        }
      },
    }),
    {
      name: 'devil-do-xp',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        totalXP: state.totalXP,
        level: state.level,
        xpHistory: state.xpHistory,
        todayXP: state.todayXP,
        lastXPDate: state.lastXPDate,
      }),
    }
  )
);
