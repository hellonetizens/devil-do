import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserPattern,
  Bet,
  ConversationMessage,
  DevilResponse,
  chatWithDevil,
  decomposeTaskWithAttitude,
  predictProcrastination,
  generateReversePsychology,
  generateKickOutMessage,
  updatePatterns,
  createInitialPattern,
} from '../services/devilAI';
import type { Task } from '../types';

interface DevilChatState {
  // User patterns for AI learning
  userPattern: UserPattern;

  // Active bets
  bets: Bet[];

  // Current devil state
  devilMood: DevilResponse['mood'];
  lastMessage: string;
  isTyping: boolean;

  // Session tracking
  sessionStartTime: number;
  messagesThisSession: number;

  // Actions
  sendMessage: (message: string, currentTasks: Task[]) => Promise<DevilResponse>;
  addBet: (bet: Bet) => void;
  resolveBet: (betId: string, winner: 'devil' | 'user') => void;
  recordEvent: (event: 'task_completed' | 'task_abandoned' | 'session_started' | 'session_abandoned' | 'excuse_detected', data?: any) => void;
  getTaskBreakdown: (taskDescription: string) => Promise<{ subtasks: string[]; devilComment: string }>;
  checkProcrastination: (currentTasks: Task[]) => Promise<{ willProcrastinate: boolean; confidence: number; reason: string; intervention: string }>;
  getReversePsychology: (task: Task) => string;
  getKickOutMessage: () => string;
  startSession: () => void;
}

export const useDevilChatStore = create<DevilChatState>()(
  persist(
    (set, get) => ({
      userPattern: createInitialPattern(),
      bets: [],
      devilMood: 'cocky',
      lastMessage: "So you're finally here. Let's see if you actually do something today.",
      isTyping: false,
      sessionStartTime: Date.now(),
      messagesThisSession: 0,

      sendMessage: async (message: string, currentTasks: Task[]) => {
        set({ isTyping: true });

        const { userPattern, bets } = get();

        // Add user message to history
        const updatedHistory: ConversationMessage[] = [
          ...userPattern.conversationHistory,
          { role: 'user', content: message, timestamp: Date.now() },
        ].slice(-20); // Keep last 20 messages

        try {
          const response = await chatWithDevil(message, userPattern, bets, currentTasks);

          // Add devil response to history
          const finalHistory: ConversationMessage[] = [
            ...updatedHistory,
            { role: 'devil', content: response.message, timestamp: Date.now() },
          ].slice(-20);

          set({
            isTyping: false,
            devilMood: response.mood,
            lastMessage: response.message,
            messagesThisSession: get().messagesThisSession + 1,
            userPattern: {
              ...userPattern,
              conversationHistory: finalHistory,
            },
          });

          // If devil made a bet, add it
          if (response.bet) {
            get().addBet(response.bet);
          }

          return response;
        } catch (error) {
          set({ isTyping: false });
          throw error;
        }
      },

      addBet: (bet: Bet) => {
        set({ bets: [...get().bets, bet] });
      },

      resolveBet: (betId: string, winner: 'devil' | 'user') => {
        set({
          bets: get().bets.map(b =>
            b.id === betId
              ? { ...b, status: winner === 'devil' ? 'devil_won' : 'user_won' }
              : b
          ),
        });

        // Update devil mood based on outcome
        if (winner === 'user') {
          set({
            devilMood: 'angry',
            lastMessage: "Fine. You won that one. Don't get used to it.",
          });
        } else {
          set({
            devilMood: 'cocky',
            lastMessage: "Called it. I always call it. When will you learn?",
          });
        }
      },

      recordEvent: (event, data) => {
        const { userPattern } = get();
        const updated = updatePatterns(userPattern, event, data);
        set({ userPattern: updated });
      },

      getTaskBreakdown: async (taskDescription: string) => {
        const { userPattern } = get();
        return decomposeTaskWithAttitude(taskDescription, userPattern);
      },

      checkProcrastination: async (currentTasks: Task[]) => {
        const { userPattern } = get();
        return predictProcrastination(userPattern, currentTasks);
      },

      getReversePsychology: (task: Task) => {
        return generateReversePsychology(task);
      },

      getKickOutMessage: () => {
        const { sessionStartTime } = get();
        const timeInApp = Math.floor((Date.now() - sessionStartTime) / 1000);
        return generateKickOutMessage(timeInApp);
      },

      startSession: () => {
        set({
          sessionStartTime: Date.now(),
          messagesThisSession: 0,
        });
      },
    }),
    {
      name: 'devil-chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userPattern: state.userPattern,
        bets: state.bets,
      }),
    }
  )
);

// Helper to get bet stats
export function getBetStats(bets: Bet[]) {
  const active = bets.filter(b => b.status === 'active').length;
  const devilWins = bets.filter(b => b.status === 'devil_won').length;
  const userWins = bets.filter(b => b.status === 'user_won').length;
  const total = devilWins + userWins;

  return {
    active,
    devilWins,
    userWins,
    total,
    devilWinRate: total > 0 ? Math.round((devilWins / total) * 100) : 50,
    userWinRate: total > 0 ? Math.round((userWins / total) * 100) : 50,
  };
}
