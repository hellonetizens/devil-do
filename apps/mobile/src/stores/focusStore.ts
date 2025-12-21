import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useXPStore } from './xpStore';
import { useMicroAchievementStore } from './microAchievementStore';
import { haptics } from '../services/haptics';

type FocusPhase = 'idle' | 'focus' | 'break';

interface FocusState {
  // Timer state
  phase: FocusPhase;
  timeRemaining: number; // seconds
  totalTime: number; // seconds
  isRunning: boolean;
  currentTaskId: string | null;

  // Session stats
  sessionsToday: number;
  totalFocusMinutesToday: number;
  lastSessionDate: string;

  // Streak
  focusStreak: number;
  bestFocusStreak: number;

  // Settings
  focusDuration: number; // minutes
  breakDuration: number; // minutes
  longBreakDuration: number; // minutes
  sessionsUntilLongBreak: number;
  currentSessionCount: number;

  // Actions
  startFocus: (taskId?: string) => void;
  startBreak: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  abandon: () => void;
  tick: () => void;
  completeSession: () => void;

  // Settings actions
  setFocusDuration: (minutes: number) => void;
  setBreakDuration: (minutes: number) => void;
  setLongBreakDuration: (minutes: number) => void;
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      // Timer state
      phase: 'idle',
      timeRemaining: 25 * 60,
      totalTime: 25 * 60,
      isRunning: false,
      currentTaskId: null,

      // Session stats
      sessionsToday: 0,
      totalFocusMinutesToday: 0,
      lastSessionDate: getTodayDate(),

      // Streak
      focusStreak: 0,
      bestFocusStreak: 0,

      // Settings
      focusDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,
      currentSessionCount: 0,

      startFocus: (taskId) => {
        const { focusDuration, lastSessionDate, sessionsToday, totalFocusMinutesToday } = get();
        const today = getTodayDate();

        // Reset daily stats if new day
        const isNewDay = lastSessionDate !== today;

        set({
          phase: 'focus',
          timeRemaining: focusDuration * 60,
          totalTime: focusDuration * 60,
          isRunning: true,
          currentTaskId: taskId || null,
          lastSessionDate: today,
          sessionsToday: isNewDay ? 0 : sessionsToday,
          totalFocusMinutesToday: isNewDay ? 0 : totalFocusMinutesToday,
        });
      },

      startBreak: () => {
        const { breakDuration, longBreakDuration, currentSessionCount, sessionsUntilLongBreak } = get();
        const isLongBreak = currentSessionCount > 0 && currentSessionCount % sessionsUntilLongBreak === 0;
        const duration = isLongBreak ? longBreakDuration : breakDuration;

        set({
          phase: 'break',
          timeRemaining: duration * 60,
          totalTime: duration * 60,
          isRunning: true,
          currentTaskId: null,
        });
      },

      pause: () => set({ isRunning: false }),

      resume: () => set({ isRunning: true }),

      reset: () => {
        const { focusDuration } = get();
        set({
          phase: 'idle',
          timeRemaining: focusDuration * 60,
          totalTime: focusDuration * 60,
          isRunning: false,
          currentTaskId: null,
        });
      },

      abandon: () => {
        const { focusDuration, focusStreak } = get();

        // Lose XP for abandoning
        const xpStore = useXPStore.getState();
        xpStore.addXP('FOCUS_SESSION_ABANDONED', 'Abandoned focus session');
        haptics.error();

        // Breaking a session resets the streak
        set({
          phase: 'idle',
          timeRemaining: focusDuration * 60,
          totalTime: focusDuration * 60,
          isRunning: false,
          currentTaskId: null,
          focusStreak: Math.max(0, focusStreak - 1), // Penalty
        });
      },

      tick: () => {
        const { timeRemaining, phase, isRunning } = get();
        if (!isRunning || timeRemaining <= 0) return;

        const newTime = timeRemaining - 1;

        if (newTime <= 0) {
          // Session complete
          get().completeSession();
        } else {
          set({ timeRemaining: newTime });
        }
      },

      completeSession: () => {
        const {
          phase,
          focusDuration,
          sessionsToday,
          totalFocusMinutesToday,
          currentSessionCount,
          focusStreak,
          bestFocusStreak,
        } = get();

        if (phase === 'focus') {
          const newStreak = focusStreak + 1;

          // Award XP for completing focus session
          const xpStore = useXPStore.getState();
          xpStore.addXP('FOCUS_SESSION_COMPLETE', 'Focus session complete!');
          haptics.success();

          // Trigger micro-achievement
          const microStore = useMicroAchievementStore.getState();
          microStore.onFocusComplete(focusDuration);

          // Bonus XP for streak milestones
          if (newStreak === 7) {
            xpStore.addXP('STREAK_MILESTONE_7', '7-day streak!');
          } else if (newStreak === 30) {
            xpStore.addXP('STREAK_MILESTONE_30', '30-day streak!');
          } else if (newStreak === 100) {
            xpStore.addXP('STREAK_MILESTONE_100', '100-day streak!');
          }

          set({
            phase: 'idle',
            timeRemaining: 0,
            isRunning: false,
            sessionsToday: sessionsToday + 1,
            totalFocusMinutesToday: totalFocusMinutesToday + focusDuration,
            currentSessionCount: currentSessionCount + 1,
            focusStreak: newStreak,
            bestFocusStreak: Math.max(newStreak, bestFocusStreak),
          });
        } else if (phase === 'break') {
          set({
            phase: 'idle',
            timeRemaining: focusDuration * 60,
            totalTime: focusDuration * 60,
            isRunning: false,
          });
        }
      },

      setFocusDuration: (minutes) => {
        const { phase } = get();
        set({
          focusDuration: minutes,
          ...(phase === 'idle'
            ? {
                timeRemaining: minutes * 60,
                totalTime: minutes * 60,
              }
            : {}),
        });
      },

      setBreakDuration: (minutes) => set({ breakDuration: minutes }),

      setLongBreakDuration: (minutes) => set({ longBreakDuration: minutes }),
    }),
    {
      name: 'devil-do-focus',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        focusDuration: state.focusDuration,
        breakDuration: state.breakDuration,
        longBreakDuration: state.longBreakDuration,
        sessionsUntilLongBreak: state.sessionsUntilLongBreak,
        focusStreak: state.focusStreak,
        bestFocusStreak: state.bestFocusStreak,
        sessionsToday: state.sessionsToday,
        totalFocusMinutesToday: state.totalFocusMinutesToday,
        lastSessionDate: state.lastSessionDate,
      }),
    }
  )
);
