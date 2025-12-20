import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DevilMood, ShameLevel, ShameTriger, UserPreferences } from '../types';
import { generateShameMessage } from '../services/gemini';

interface DevilState {
  // Devil state
  mood: DevilMood;
  currentMessage: string;
  lastInteraction: string;
  isAnimating: boolean;

  // User preferences
  preferences: UserPreferences;

  // Stats
  totalShamesReceived: number;
  totalPraisesReceived: number;

  // Unlockables
  unlockedCostumes: string[];
  currentCostume: string;

  // Actions
  triggerShame: (trigger: ShameTriger, context?: {
    taskTitle?: string;
    streakCount?: number;
    overdueCount?: number;
    daysInactive?: number;
    userName?: string;
  }) => Promise<void>;
  setMood: (mood: DevilMood) => void;
  setMessage: (message: string) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  unlockCostume: (costumeId: string) => void;
  setCostume: (costumeId: string) => void;
  resetDevil: () => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  shame_level: 'snarky',
  notification_enabled: true,
  focus_duration: 25,
  break_duration: 5,
  daily_goal: 5,
};

const IDLE_MESSAGES = [
  "*taps foot impatiently*",
  "*checks watch dramatically*",
  "*files nails with pitchfork*",
  "*yawns loudly*",
  "*stares judgmentally*",
  "*whistles innocently*",
  "Well? I'm waiting...",
  "*spins pitchfork boredly*",
];

export const useDevilStore = create<DevilState>()(
  persist(
    (set, get) => ({
      mood: 'idle',
      currentMessage: IDLE_MESSAGES[0],
      lastInteraction: new Date().toISOString(),
      isAnimating: false,

      preferences: DEFAULT_PREFERENCES,

      totalShamesReceived: 0,
      totalPraisesReceived: 0,

      unlockedCostumes: ['default'],
      currentCostume: 'default',

      triggerShame: async (trigger, context = {}) => {
        set({ isAnimating: true });

        try {
          const { preferences } = get();
          const result = await generateShameMessage({
            trigger,
            shameLevel: preferences.shame_level,
            ...context,
          });

          const isPraise = ['task_completed', 'streak_milestone', 'all_tasks_done'].includes(trigger);

          set((state) => ({
            mood: result.mood,
            currentMessage: result.text,
            lastInteraction: new Date().toISOString(),
            isAnimating: false,
            totalShamesReceived: isPraise ? state.totalShamesReceived : state.totalShamesReceived + 1,
            totalPraisesReceived: isPraise ? state.totalPraisesReceived + 1 : state.totalPraisesReceived,
          }));

          // Reset to idle after a delay
          setTimeout(() => {
            const randomIdle = IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)];
            set({ mood: 'idle', currentMessage: randomIdle });
          }, 10000);
        } catch (error) {
          set({ isAnimating: false });
          console.error('Error triggering shame:', error);
        }
      },

      setMood: (mood) => set({ mood }),

      setMessage: (message) => set({ currentMessage: message }),

      updatePreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      unlockCostume: (costumeId) =>
        set((state) => ({
          unlockedCostumes: state.unlockedCostumes.includes(costumeId)
            ? state.unlockedCostumes
            : [...state.unlockedCostumes, costumeId],
        })),

      setCostume: (costumeId) => {
        const { unlockedCostumes } = get();
        if (unlockedCostumes.includes(costumeId)) {
          set({ currentCostume: costumeId });
        }
      },

      resetDevil: () =>
        set({
          mood: 'idle',
          currentMessage: IDLE_MESSAGES[0],
          lastInteraction: new Date().toISOString(),
          isAnimating: false,
        }),
    }),
    {
      name: 'devil-do-devil',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        totalShamesReceived: state.totalShamesReceived,
        totalPraisesReceived: state.totalPraisesReceived,
        unlockedCostumes: state.unlockedCostumes,
        currentCostume: state.currentCostume,
      }),
    }
  )
);
