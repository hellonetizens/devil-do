import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { Task, Project, FocusSession, Streak } from '../types';

// Firebase configuration - replace with your config
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth functions
export const signUp = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signOut = async () => {
  await firebaseSignOut(auth);
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Helper to convert Firestore timestamp to ISO string
const toISOString = (timestamp: Timestamp | null | undefined): string => {
  if (!timestamp) return new Date().toISOString();
  return timestamp.toDate().toISOString();
};

// Task functions
export const getTasks = async (userId: string): Promise<Task[]> => {
  const tasksRef = collection(db, 'tasks');
  const q = query(
    tasksRef,
    where('user_id', '==', userId),
    orderBy('created_at', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      user_id: data.user_id,
      project_id: data.project_id,
      parent_task_id: data.parent_task_id,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      due_date: data.due_date ? toISOString(data.due_date) : undefined,
      completed_at: data.completed_at ? toISOString(data.completed_at) : undefined,
      created_at: toISOString(data.created_at),
      updated_at: toISOString(data.updated_at),
    } as Task;
  });
};

export const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> => {
  const tasksRef = collection(db, 'tasks');
  const now = serverTimestamp();

  const docRef = await addDoc(tasksRef, {
    ...task,
    created_at: now,
    updated_at: now,
  });

  return {
    ...task,
    id: docRef.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Task;
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
  const taskRef = doc(db, 'tasks', id);

  await updateDoc(taskRef, {
    ...updates,
    updated_at: serverTimestamp(),
  });

  const updatedDoc = await getDoc(taskRef);
  const data = updatedDoc.data()!;

  return {
    id: updatedDoc.id,
    ...data,
    created_at: toISOString(data.created_at),
    updated_at: toISOString(data.updated_at),
  } as Task;
};

export const deleteTask = async (id: string): Promise<void> => {
  const taskRef = doc(db, 'tasks', id);
  await deleteDoc(taskRef);
};

// Project functions
export const getProjects = async (userId: string): Promise<Project[]> => {
  const projectsRef = collection(db, 'projects');
  const q = query(
    projectsRef,
    where('user_id', '==', userId),
    where('archived', '==', false),
    orderBy('created_at', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      user_id: data.user_id,
      name: data.name,
      description: data.description,
      color: data.color,
      archived: data.archived,
      created_at: toISOString(data.created_at),
      updated_at: toISOString(data.updated_at),
    } as Project;
  });
};

export const createProject = async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> => {
  const projectsRef = collection(db, 'projects');
  const now = serverTimestamp();

  const docRef = await addDoc(projectsRef, {
    ...project,
    created_at: now,
    updated_at: now,
  });

  return {
    ...project,
    id: docRef.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Project;
};

// Focus session functions
export const createFocusSession = async (session: Omit<FocusSession, 'id'>): Promise<FocusSession> => {
  const sessionsRef = collection(db, 'focus_sessions');

  const docRef = await addDoc(sessionsRef, {
    ...session,
    started_at: serverTimestamp(),
  });

  return {
    ...session,
    id: docRef.id,
  } as FocusSession;
};

export const completeFocusSession = async (id: string, actualDuration: number): Promise<FocusSession> => {
  const sessionRef = doc(db, 'focus_sessions', id);

  await updateDoc(sessionRef, {
    completed: true,
    actual_duration: actualDuration,
    ended_at: serverTimestamp(),
  });

  const updatedDoc = await getDoc(sessionRef);
  return { id: updatedDoc.id, ...updatedDoc.data() } as FocusSession;
};

export const abandonFocusSession = async (id: string): Promise<void> => {
  const sessionRef = doc(db, 'focus_sessions', id);

  await updateDoc(sessionRef, {
    completed: false,
    abandoned_at: serverTimestamp(),
    ended_at: serverTimestamp(),
  });
};

// Streak functions
export const getStreaks = async (userId: string): Promise<Streak[]> => {
  const streaksRef = collection(db, 'streaks');
  const q = query(streaksRef, where('user_id', '==', userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      user_id: data.user_id,
      type: data.type,
      current_count: data.current_count,
      best_count: data.best_count,
      last_activity: toISOString(data.last_activity),
    } as Streak;
  });
};

export const updateStreak = async (userId: string, type: Streak['type']): Promise<Streak> => {
  const streaksRef = collection(db, 'streaks');
  const q = query(
    streaksRef,
    where('user_id', '==', userId),
    where('type', '==', type)
  );
  const snapshot = await getDocs(q);

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  if (!snapshot.empty) {
    const existingDoc = snapshot.docs[0];
    const existing = existingDoc.data();
    const lastActivity = existing.last_activity?.toDate();
    const lastActivityDate = lastActivity?.toISOString().split('T')[0];

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split('T')[0];

    let newCount = existing.current_count;

    if (lastActivityDate === today) {
      return { id: existingDoc.id, ...existing } as Streak;
    } else if (lastActivityDate === yesterdayDate) {
      newCount = existing.current_count + 1;
    } else {
      newCount = 1;
    }

    const streakRef = doc(db, 'streaks', existingDoc.id);
    await updateDoc(streakRef, {
      current_count: newCount,
      best_count: Math.max(newCount, existing.best_count),
      last_activity: serverTimestamp(),
    });

    return {
      id: existingDoc.id,
      user_id: userId,
      type,
      current_count: newCount,
      best_count: Math.max(newCount, existing.best_count),
      last_activity: now.toISOString(),
    };
  } else {
    const docRef = await addDoc(streaksRef, {
      user_id: userId,
      type,
      current_count: 1,
      best_count: 1,
      last_activity: serverTimestamp(),
    });

    return {
      id: docRef.id,
      user_id: userId,
      type,
      current_count: 1,
      best_count: 1,
      last_activity: now.toISOString(),
    };
  }
};
