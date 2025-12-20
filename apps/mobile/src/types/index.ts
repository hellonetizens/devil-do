// User types
export type ShameLevel = 'gentle' | 'snarky' | 'savage';

export interface User {
  id: string;
  email: string;
  name?: string;
  shame_level: ShameLevel;
  notification_enabled: boolean;
  created_at: string;
}

export interface UserPreferences {
  shame_level: ShameLevel;
  notification_enabled: boolean;
  focus_duration: number; // minutes
  break_duration: number; // minutes
  daily_goal: number; // tasks
}

// Task types
export type TaskPriority = 'urgent' | 'normal' | 'someday';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'abandoned';

export interface Task {
  id: string;
  user_id: string;
  project_id?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  parent_task_id?: string;
  subtasks?: Task[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string;
  project_id?: string;
  parent_task_id?: string;
}

// Project types
export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

// Focus session types
export interface FocusSession {
  id: string;
  user_id: string;
  task_id?: string;
  duration: number; // planned duration in seconds
  actual_duration?: number; // actual duration if completed early
  completed: boolean;
  abandoned_at?: string;
  started_at: string;
  ended_at?: string;
}

// Streak types
export type StreakType = 'daily_tasks' | 'focus_sessions' | 'app_opens';

export interface Streak {
  id: string;
  user_id: string;
  type: StreakType;
  current_count: number;
  best_count: number;
  last_activity: string;
}

// Devil state types
export type DevilMood = 'idle' | 'watching' | 'disappointed' | 'pleased' | 'furious' | 'impressed';

export interface DevilState {
  mood: DevilMood;
  last_interaction: string;
  unlocked_costumes: string[];
  current_costume: string;
}

// Gamification types
export interface UserStats {
  total_tasks_completed: number;
  total_focus_minutes: number;
  current_streak: number;
  best_streak: number;
  xp: number;
  level: number;
  achievements: string[];
}

// Shame message types
export interface ShameMessage {
  text: string;
  mood: DevilMood;
  trigger: ShameTriger;
}

export type ShameTriger =
  | 'task_overdue'
  | 'streak_broken'
  | 'session_abandoned'
  | 'task_completed'
  | 'streak_milestone'
  | 'long_inactivity'
  | 'app_open'
  | 'all_tasks_done';
