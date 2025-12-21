import { create } from 'zustand';
import { haptics } from '../services/haptics';

// Micro-achievements are quick, temporary dopamine hits
// They pop up frequently and disappear - designed for ADHD instant gratification

export interface MicroAchievement {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  color: 'yellow' | 'green' | 'purple' | 'blue' | 'orange' | 'red';
}

// All possible micro-achievements
export const MICRO_ACHIEVEMENTS: Record<string, Omit<MicroAchievement, 'id'>> = {
  // Task-based
  FIRST_TODAY: {
    emoji: '🌅',
    title: 'First Blood!',
    subtitle: 'First task of the day - off to a great start!',
    color: 'yellow',
  },
  THREE_IN_A_ROW: {
    emoji: '🔥',
    title: 'On Fire!',
    subtitle: '3 tasks in a row - keep it going!',
    color: 'orange',
  },
  FIVE_IN_A_ROW: {
    emoji: '⚡',
    title: 'Unstoppable!',
    subtitle: '5 tasks in a row - you\'re crushing it!',
    color: 'yellow',
  },
  SPEED_DEMON: {
    emoji: '💨',
    title: 'Speed Demon!',
    subtitle: 'Task done in under a minute!',
    color: 'blue',
  },
  MORNING_WARRIOR: {
    emoji: '☀️',
    title: 'Morning Warrior!',
    subtitle: 'Task completed before 9am!',
    color: 'yellow',
  },
  NIGHT_OWL: {
    emoji: '🦉',
    title: 'Night Owl!',
    subtitle: 'Burning the midnight oil!',
    color: 'purple',
  },
  LUNCH_GRIND: {
    emoji: '🥪',
    title: 'Lunch Grind!',
    subtitle: 'No break for the productive!',
    color: 'green',
  },
  DAILY_GOAL_50: {
    emoji: '📈',
    title: 'Halfway There!',
    subtitle: '50% of daily goal complete!',
    color: 'blue',
  },
  DAILY_GOAL_100: {
    emoji: '🎯',
    title: 'Goal Crushed!',
    subtitle: 'Daily goal achieved!',
    color: 'green',
  },
  DAILY_GOAL_150: {
    emoji: '🚀',
    title: 'Overachiever!',
    subtitle: '150% of daily goal - showing off!',
    color: 'purple',
  },
  URGENT_SLAYER: {
    emoji: '⚔️',
    title: 'Urgent Slayer!',
    subtitle: 'Took down an urgent task!',
    color: 'red',
  },
  EARLY_BIRD: {
    emoji: '🐦',
    title: 'Early Bird!',
    subtitle: 'Finished before the deadline!',
    color: 'green',
  },

  // Focus-based
  FOCUS_COMPLETE: {
    emoji: '🧘',
    title: 'Zen Mode!',
    subtitle: 'Focus session complete!',
    color: 'purple',
  },
  FOCUS_STREAK_3: {
    emoji: '🔥',
    title: 'Focus Fire!',
    subtitle: '3 focus sessions today!',
    color: 'orange',
  },
  DEEP_WORK: {
    emoji: '🧠',
    title: 'Deep Work!',
    subtitle: '1 hour of focused time!',
    color: 'purple',
  },

  // Streak-based
  STREAK_SAVED: {
    emoji: '❄️',
    title: 'Streak Saved!',
    subtitle: 'Used a freeze - smart move!',
    color: 'blue',
  },
  COMEBACK_KID: {
    emoji: '💪',
    title: 'Comeback Kid!',
    subtitle: 'First task after a break!',
    color: 'green',
  },

  // Random fun ones
  PERFECT_TIMING: {
    emoji: '⏰',
    title: 'Perfect Timing!',
    subtitle: 'Completed at exactly :00!',
    color: 'yellow',
  },
  LUCKY_SEVEN: {
    emoji: '🍀',
    title: 'Lucky Seven!',
    subtitle: '7th task of the day!',
    color: 'green',
  },
  DOUBLE_DIGITS: {
    emoji: '🔟',
    title: 'Double Digits!',
    subtitle: '10 tasks completed today!',
    color: 'yellow',
  },
};

interface MicroAchievementState {
  // Currently showing micro-achievement
  current: MicroAchievement | null;
  queue: MicroAchievement[];

  // Session tracking for triggers
  tasksCompletedInSession: number;
  consecutiveTasksWithoutBreak: number;
  lastTaskCompletedAt: Date | null;
  focusSessionsToday: number;
  lastFocusCompletedAt: Date | null;

  // Actions
  trigger: (achievementId: keyof typeof MICRO_ACHIEVEMENTS) => void;
  dismiss: () => void;
  reset: () => void;

  // Called when task is completed to check for triggers
  onTaskComplete: (taskPriority: string, hadDueDate: boolean, wasEarly: boolean) => void;
  onFocusComplete: (durationMinutes: number) => void;
  onStreakFreeze: () => void;
}

export const useMicroAchievementStore = create<MicroAchievementState>((set, get) => ({
  current: null,
  queue: [],
  tasksCompletedInSession: 0,
  consecutiveTasksWithoutBreak: 0,
  lastTaskCompletedAt: null,
  focusSessionsToday: 0,
  lastFocusCompletedAt: null,

  trigger: (achievementId) => {
    const achievement = MICRO_ACHIEVEMENTS[achievementId];
    if (!achievement) return;

    const microAchievement: MicroAchievement = {
      id: `${achievementId}_${Date.now()}`,
      ...achievement,
    };

    haptics.celebration();

    const { current, queue } = get();

    if (current === null) {
      set({ current: microAchievement });

      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        get().dismiss();
      }, 3000);
    } else {
      // Queue it up
      set({ queue: [...queue, microAchievement] });
    }
  },

  dismiss: () => {
    const { queue } = get();

    if (queue.length > 0) {
      const [next, ...rest] = queue;
      set({ current: next, queue: rest });

      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        get().dismiss();
      }, 3000);
    } else {
      set({ current: null });
    }
  },

  reset: () => {
    set({
      tasksCompletedInSession: 0,
      consecutiveTasksWithoutBreak: 0,
      lastTaskCompletedAt: null,
      focusSessionsToday: 0,
    });
  },

  onTaskComplete: (taskPriority, hadDueDate, wasEarly) => {
    const state = get();
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    const newTasksCompleted = state.tasksCompletedInSession + 1;
    let newConsecutive = state.consecutiveTasksWithoutBreak + 1;

    // Check if there was a long break (reset consecutive)
    if (state.lastTaskCompletedAt) {
      const timeSinceLastTask = now.getTime() - state.lastTaskCompletedAt.getTime();
      if (timeSinceLastTask > 30 * 60 * 1000) {
        // 30 minutes
        newConsecutive = 1;
        get().trigger('COMEBACK_KID');
      }
    }

    set({
      tasksCompletedInSession: newTasksCompleted,
      consecutiveTasksWithoutBreak: newConsecutive,
      lastTaskCompletedAt: now,
    });

    // Check various triggers
    if (newTasksCompleted === 1) {
      get().trigger('FIRST_TODAY');
    }

    if (newConsecutive === 3) {
      get().trigger('THREE_IN_A_ROW');
    }

    if (newConsecutive === 5) {
      get().trigger('FIVE_IN_A_ROW');
    }

    if (newTasksCompleted === 7) {
      get().trigger('LUCKY_SEVEN');
    }

    if (newTasksCompleted === 10) {
      get().trigger('DOUBLE_DIGITS');
    }

    // Time-based
    if (hour < 9) {
      get().trigger('MORNING_WARRIOR');
    }

    if (hour >= 22 || hour < 5) {
      get().trigger('NIGHT_OWL');
    }

    if (hour >= 12 && hour < 14) {
      get().trigger('LUNCH_GRIND');
    }

    if (minute === 0) {
      get().trigger('PERFECT_TIMING');
    }

    // Priority-based
    if (taskPriority === 'urgent') {
      get().trigger('URGENT_SLAYER');
    }

    // Due date based
    if (hadDueDate && wasEarly) {
      get().trigger('EARLY_BIRD');
    }

    // Speed-based (check if last task was less than 1 min ago)
    if (state.lastTaskCompletedAt) {
      const timeSinceLastTask = now.getTime() - state.lastTaskCompletedAt.getTime();
      if (timeSinceLastTask < 60 * 1000 && timeSinceLastTask > 5000) {
        get().trigger('SPEED_DEMON');
      }
    }
  },

  onFocusComplete: (durationMinutes) => {
    const state = get();
    const newSessions = state.focusSessionsToday + 1;

    set({
      focusSessionsToday: newSessions,
      lastFocusCompletedAt: new Date(),
    });

    get().trigger('FOCUS_COMPLETE');

    if (newSessions === 3) {
      get().trigger('FOCUS_STREAK_3');
    }

    if (durationMinutes >= 60) {
      get().trigger('DEEP_WORK');
    }
  },

  onStreakFreeze: () => {
    get().trigger('STREAK_SAVED');
  },
}));
