import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';
import * as firebaseService from '../services/firebase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      initialize: () => {
        // Subscribe to auth state changes
        const unsubscribe = firebaseService.onAuthChange((user) => {
          set({ user, isInitialized: true, isLoading: false });
        });
        return unsubscribe;
      },

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const user = await firebaseService.signIn(email, password);
          set({ user, isLoading: false });
        } catch (error: any) {
          const message = getErrorMessage(error.code);
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      signUp: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const user = await firebaseService.signUp(email, password);
          set({ user, isLoading: false });
        } catch (error: any) {
          const message = getErrorMessage(error.code);
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      signOut: async () => {
        set({ isLoading: true, error: null });
        try {
          await firebaseService.signOut();
          set({ user: null, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'devil-do-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({}), // Don't persist auth state, let Firebase handle it
    }
  )
);

// Firebase error code to human-readable message
function getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already taken. The devil already owns your soul.';
    case 'auth/invalid-email':
      return 'Invalid email. Even the devil has standards.';
    case 'auth/operation-not-allowed':
      return 'Sign up is disabled. The devil is not accepting new souls right now.';
    case 'auth/weak-password':
      return 'Password too weak. Even demons could crack that.';
    case 'auth/user-disabled':
      return 'Account disabled. You angered the devil one too many times.';
    case 'auth/user-not-found':
      return 'No account found. Your soul has not yet been claimed.';
    case 'auth/wrong-password':
      return 'Wrong password. Nice try, mortal.';
    case 'auth/invalid-credential':
      return 'Invalid credentials. The devil sees through your lies.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Even the devil needs a break from your incompetence.';
    default:
      return 'Something went wrong. The devil is displeased.';
  }
}
