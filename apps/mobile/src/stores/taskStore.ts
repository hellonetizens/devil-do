import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task, CreateTaskInput, TaskStatus, TaskPriority, EnergyLevel } from '../types';
import * as firebaseService from '../services/firebase';
import { haptics } from '../services/haptics';
import { useXPStore } from './xpStore';
import { useStreakStore } from './streakStore';
import { useMicroAchievementStore } from './microAchievementStore';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSyncedAt: string | null;

  // Actions
  fetchTasks: (userId: string) => Promise<void>;
  addTask: (userId: string, input: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  abandonTask: (id: string) => Promise<void>;

  // Local-only actions (for offline/free tier)
  addLocalTask: (input: CreateTaskInput) => string;
  updateLocalTask: (id: string, updates: Partial<Task>) => void;
  deleteLocalTask: (id: string) => void;

  // Sync actions
  syncLocalTasksToCloud: (userId: string) => Promise<void>;
  mergeCloudTasks: (cloudTasks: Task[]) => void;

  // Getters
  getOverdueTasks: () => Task[];
  getTodaysTasks: () => Task[];
  getTasksByProject: (projectId: string) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByPriority: (priority: TaskPriority) => Task[];
  getTasksByEnergy: (energy: EnergyLevel) => Task[];
  getTasksForCurrentEnergy: (currentEnergy: EnergyLevel) => Task[];
}

const generateLocalId = () => `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      isSyncing: false,
      error: null,
      lastSyncedAt: null,

      fetchTasks: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const tasks = await firebaseService.getTasks(userId);
          set({ tasks, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      addTask: async (userId: string, input: CreateTaskInput) => {
        set({ isLoading: true, error: null });
        try {
          const newTask = await firebaseService.createTask({
            user_id: userId,
            title: input.title,
            description: input.description,
            priority: input.priority || 'normal',
            status: 'pending',
            due_date: input.due_date,
            project_id: input.project_id,
            parent_task_id: input.parent_task_id,
          });
          set((state) => ({
            tasks: [newTask, ...state.tasks],
            isLoading: false,
          }));
          return newTask;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      updateTask: async (id: string, updates: Partial<Task>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedTask = await firebaseService.updateTask(id, updates);
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      deleteTask: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await firebaseService.deleteTask(id);
          set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      completeTask: async (id: string) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        // Haptic feedback for success
        haptics.success();

        // Award XP based on priority
        const xpStore = useXPStore.getState();
        if (task.priority === 'urgent') {
          xpStore.addXP('TASK_COMPLETE_URGENT', task.title);
        } else {
          xpStore.addXP('TASK_COMPLETE', task.title);
        }

        // Bonus XP if completed before due date
        if (task.due_date && new Date(task.due_date) > new Date()) {
          xpStore.addXP('TASK_COMPLETE_EARLY', 'Completed early!');
        }

        // Update streak store - this tracks daily goal progress
        const streakStore = useStreakStore.getState();
        streakStore.incrementTasksCompleted();

        // Trigger micro-achievements
        const microStore = useMicroAchievementStore.getState();
        const wasEarly = task.due_date ? new Date(task.due_date) > new Date() : false;
        microStore.onTaskComplete(task.priority, !!task.due_date, wasEarly);

        const updates: Partial<Task> = {
          status: 'completed',
          completed_at: new Date().toISOString(),
        };

        if (task.id.startsWith('local_')) {
          get().updateLocalTask(id, updates);
        } else {
          await get().updateTask(id, updates);
        }
      },

      abandonTask: async (id: string) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        // Haptic feedback for failure/shame
        haptics.error();

        // Lose XP for abandoning
        const xpStore = useXPStore.getState();
        xpStore.addXP('TASK_ABANDONED', task.title);

        const updates: Partial<Task> = {
          status: 'abandoned',
        };

        if (task.id.startsWith('local_')) {
          get().updateLocalTask(id, updates);
        } else {
          await get().updateTask(id, updates);
        }
      },

      // Local-only actions
      addLocalTask: (input: CreateTaskInput) => {
        const id = generateLocalId();
        const now = new Date().toISOString();
        const newTask: Task = {
          id,
          user_id: 'local',
          title: input.title,
          description: input.description,
          priority: input.priority || 'normal',
          status: 'pending',
          energy_required: input.energy_required,
          estimated_minutes: input.estimated_minutes,
          due_date: input.due_date,
          project_id: input.project_id,
          parent_task_id: input.parent_task_id,
          created_at: now,
          updated_at: now,
        };
        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));
        return id;
      },

      updateLocalTask: (id: string, updates: Partial<Task>) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, ...updates, updated_at: new Date().toISOString() }
              : t
          ),
        }));
      },

      deleteLocalTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      },

      // Sync actions
      syncLocalTasksToCloud: async (userId: string) => {
        const localTasks = get().tasks.filter((t) => t.id.startsWith('local_'));
        if (localTasks.length === 0) return;

        set({ isSyncing: true, error: null });
        try {
          const syncedTasks: Task[] = [];

          for (const localTask of localTasks) {
            const cloudTask = await firebaseService.createTask({
              user_id: userId,
              title: localTask.title,
              description: localTask.description,
              priority: localTask.priority,
              status: localTask.status,
              due_date: localTask.due_date,
              project_id: localTask.project_id,
              parent_task_id: localTask.parent_task_id,
            });
            syncedTasks.push(cloudTask);
          }

          // Replace local tasks with synced cloud tasks
          set((state) => ({
            tasks: [
              ...state.tasks.filter((t) => !t.id.startsWith('local_')),
              ...syncedTasks,
            ],
            isSyncing: false,
            lastSyncedAt: new Date().toISOString(),
          }));
        } catch (error) {
          set({ error: (error as Error).message, isSyncing: false });
        }
      },

      mergeCloudTasks: (cloudTasks: Task[]) => {
        set((state) => {
          const localTasks = state.tasks.filter((t) => t.id.startsWith('local_'));
          const cloudTaskIds = new Set(cloudTasks.map((t) => t.id));

          // Keep local tasks that aren't in the cloud yet
          const uniqueLocalTasks = localTasks.filter(
            (lt) => !cloudTasks.some((ct) => ct.title === lt.title && ct.status === lt.status)
          );

          return {
            tasks: [...cloudTasks, ...uniqueLocalTasks],
            lastSyncedAt: new Date().toISOString(),
          };
        });
      },

      // Getters
      getOverdueTasks: () => {
        const now = new Date();
        return get().tasks.filter((task) => {
          if (!task.due_date || task.status === 'completed') return false;
          return new Date(task.due_date) < now;
        });
      },

      getTodaysTasks: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().tasks.filter((task) => {
          if (!task.due_date) return false;
          return task.due_date.startsWith(today);
        });
      },

      getTasksByProject: (projectId: string) => {
        return get().tasks.filter((task) => task.project_id === projectId);
      },

      getTasksByStatus: (status: TaskStatus) => {
        return get().tasks.filter((task) => task.status === status);
      },

      getTasksByPriority: (priority: TaskPriority) => {
        return get().tasks.filter((task) => task.priority === priority);
      },

      getTasksByEnergy: (energy: EnergyLevel) => {
        return get().tasks.filter(
          (task) => task.energy_required === energy && task.status === 'pending'
        );
      },

      // Smart energy matching - shows tasks at or below current energy level
      getTasksForCurrentEnergy: (currentEnergy: EnergyLevel) => {
        const energyOrder: EnergyLevel[] = ['zombie', 'low', 'medium', 'high', 'hyperfocus'];
        const currentIndex = energyOrder.indexOf(currentEnergy);

        return get().tasks.filter((task) => {
          if (task.status !== 'pending') return false;
          if (!task.energy_required) return true; // Show tasks without energy set

          const taskEnergyIndex = energyOrder.indexOf(task.energy_required);
          // Show tasks that require same or less energy than current level
          return taskEnergyIndex <= currentIndex;
        });
      },
    }),
    {
      name: 'devil-do-tasks',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);
