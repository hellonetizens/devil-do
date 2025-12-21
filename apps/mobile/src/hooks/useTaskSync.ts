import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useTaskStore } from '../stores/taskStore';

export function useTaskSync() {
  const { user, isInitialized } = useAuthStore();
  const { fetchTasks, syncLocalTasksToCloud, mergeCloudTasks, tasks, isSyncing } = useTaskStore();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isInitialized || hasSynced.current) return;

    const syncTasks = async () => {
      if (user) {
        hasSynced.current = true;

        try {
          // First, fetch cloud tasks
          await fetchTasks(user.uid);

          // Then sync any local tasks to cloud
          await syncLocalTasksToCloud(user.uid);
        } catch (error) {
          console.error('Failed to sync tasks:', error);
          hasSynced.current = false; // Allow retry
        }
      }
    };

    syncTasks();
  }, [user, isInitialized]);

  // Reset sync flag when user changes
  useEffect(() => {
    if (!user) {
      hasSynced.current = false;
    }
  }, [user]);

  return { isSyncing };
}
