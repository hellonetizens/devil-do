import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task, CreateTaskInput, TaskStatus, TaskPriority } from '../types';
import * as firebaseService from '../services/firebase';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

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

  // Getters
  getOverdueTasks: () => Task[];
  getTodaysTasks: () => Task[];
  getTasksByProject: (projectId: string) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByPriority: (priority: TaskPriority) => Task[];
}

const generateLocalId = () => `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      error: null,

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
    }),
    {
      name: 'devil-do-tasks',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
);
