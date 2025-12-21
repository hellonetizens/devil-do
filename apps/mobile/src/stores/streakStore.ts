import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { haptics } from '../services/haptics';

const getTodayDate = () => new Date().toISOString().split('T')[0];
const getMonthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
};

interface StreakState {
  // Daily streak tracking
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string;

  // Streak freeze system
  freezesRemaining: number;
  maxFreezesPerMonth: number;
  freezesUsedThisMonth: number;
  monthStartDate: string;
  lastFreezeUsedDate: string | null;

  // Bad day mode
  isBadDayMode: boolean;
  badDayDate: string | null;
  reducedGoalMultiplier: number; // 0.5 = 50% of normal goal

  // Daily goal tracking
  dailyGoal: number;
  tasksCompletedToday: number;
  dailyGoalMetToday: boolean;
  lastDailyResetDate: string;

  // Actions
  recordActivity: () => void;
  useStreakFreeze: () => boolean;
  activateBadDayMode: () => void;
  deactivateBadDayMode: () => void;
  incrementTasksCompleted: () => void;
  setDailyGoal: (goal: number) => void;
  checkAndResetDaily: () => void;
  getEffectiveDailyGoal: () => number;
  getDailyProgress: () => number;
  checkStreakStatus: () => 'active' | 'at_risk' | 'broken';
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      // Daily streak
      currentStreak: 0,
      bestStreak: 0,
      lastActiveDate: '',

      // Streak freeze
      freezesRemaining: 2,
      maxFreezesPerMonth: 2,
      freezesUsedThisMonth: 0,
      monthStartDate: getMonthStart(),
      lastFreezeUsedDate: null,

      // Bad day mode
      isBadDayMode: false,
      badDayDate: null,
      reducedGoalMultiplier: 0.5,

      // Daily goals
      dailyGoal: 5,
      tasksCompletedToday: 0,
      dailyGoalMetToday: false,
      lastDailyResetDate: getTodayDate(),

      recordActivity: () => {
        const { lastActiveDate, currentStreak, bestStreak } = get();
        const today = getTodayDate();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Already active today
        if (lastActiveDate === today) return;

        let newStreak = currentStreak;

        if (lastActiveDate === yesterdayStr) {
          // Continuing streak
          newStreak = currentStreak + 1;
          haptics.success();
        } else if (lastActiveDate === '') {
          // First ever activity
          newStreak = 1;
        } else {
          // Streak broken (but might be saved by freeze)
          newStreak = 1;
        }

        set({
          currentStreak: newStreak,
          bestStreak: Math.max(newStreak, bestStreak),
          lastActiveDate: today,
        });
      },

      useStreakFreeze: () => {
        const { freezesRemaining, currentStreak, lastActiveDate, monthStartDate, freezesUsedThisMonth } = get();
        const today = getTodayDate();
        const currentMonthStart = getMonthStart();

        // Reset monthly freezes if new month
        if (monthStartDate !== currentMonthStart) {
          set({
            freezesRemaining: 2,
            freezesUsedThisMonth: 0,
            monthStartDate: currentMonthStart,
          });
        }

        // Check if freeze is available
        if (get().freezesRemaining <= 0) {
          haptics.error();
          return false;
        }

        // Use the freeze
        haptics.warning();
        set({
          freezesRemaining: get().freezesRemaining - 1,
          freezesUsedThisMonth: get().freezesUsedThisMonth + 1,
          lastFreezeUsedDate: today,
          lastActiveDate: today, // Count as active to preserve streak
        });

        return true;
      },

      activateBadDayMode: () => {
        const today = getTodayDate();
        haptics.light();

        set({
          isBadDayMode: true,
          badDayDate: today,
        });
      },

      deactivateBadDayMode: () => {
        set({
          isBadDayMode: false,
          badDayDate: null,
        });
      },

      incrementTasksCompleted: () => {
        const { tasksCompletedToday, dailyGoalMetToday } = get();
        const newCount = tasksCompletedToday + 1;
        const effectiveGoal = get().getEffectiveDailyGoal();

        // Check if daily goal just met
        const goalJustMet = !dailyGoalMetToday && newCount >= effectiveGoal;

        if (goalJustMet) {
          haptics.celebration();
        }

        set({
          tasksCompletedToday: newCount,
          dailyGoalMetToday: newCount >= effectiveGoal,
        });

        // Record activity for streak
        get().recordActivity();
      },

      setDailyGoal: (goal) => {
        set({ dailyGoal: Math.max(1, Math.min(20, goal)) });
      },

      checkAndResetDaily: () => {
        const { lastDailyResetDate, monthStartDate } = get();
        const today = getTodayDate();
        const currentMonthStart = getMonthStart();

        // Reset monthly freezes if new month
        if (monthStartDate !== currentMonthStart) {
          set({
            freezesRemaining: 2,
            freezesUsedThisMonth: 0,
            monthStartDate: currentMonthStart,
          });
        }

        // Reset daily if new day
        if (lastDailyResetDate !== today) {
          // Deactivate bad day mode if it was from a previous day
          const { badDayDate } = get();
          if (badDayDate && badDayDate !== today) {
            set({ isBadDayMode: false, badDayDate: null });
          }

          set({
            tasksCompletedToday: 0,
            dailyGoalMetToday: false,
            lastDailyResetDate: today,
          });
        }
      },

      getEffectiveDailyGoal: () => {
        const { dailyGoal, isBadDayMode, reducedGoalMultiplier } = get();
        if (isBadDayMode) {
          return Math.max(1, Math.ceil(dailyGoal * reducedGoalMultiplier));
        }
        return dailyGoal;
      },

      getDailyProgress: () => {
        const { tasksCompletedToday } = get();
        const effectiveGoal = get().getEffectiveDailyGoal();
        return Math.min(100, Math.round((tasksCompletedToday / effectiveGoal) * 100));
      },

      checkStreakStatus: () => {
        const { lastActiveDate, currentStreak } = get();
        const today = getTodayDate();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActiveDate === today) return 'active';
        if (lastActiveDate === yesterdayStr) return 'at_risk';
        if (currentStreak > 0 && lastActiveDate !== today && lastActiveDate !== yesterdayStr) {
          return 'broken';
        }
        return 'active';
      },
    }),
    {
      name: 'devil-do-streaks',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
