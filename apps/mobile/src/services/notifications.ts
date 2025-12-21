import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Only import notifications on native platforms
let Notifications: typeof import('expo-notifications') | null = null;

if (Platform.OS !== 'web') {
  Notifications = require('expo-notifications');

  // Configure notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// Devil shame messages for notifications
const SHAME_MESSAGES = {
  morning: [
    "Wake up! Those tasks aren't going to abandon themselves.",
    "Good morning, procrastinator. Ready to disappoint me today?",
    "Rise and fail! I mean... shine. 😈",
  ],
  afternoon: [
    "Still haven't done anything? I'm shocked. SHOCKED.",
    "The afternoon is slipping away. Just like your productivity.",
    "Tick tock. Your tasks are getting lonely.",
  ],
  evening: [
    "Day's almost over. How many tasks did you abandon?",
    "Evening check-in: Still a disappointment?",
    "Tomorrow is a new chance to fail. Get some rest.",
  ],
  overdue: [
    "You have overdue tasks. The devil is watching. 👀",
    "Tasks are piling up. Just like your excuses.",
    "Overdue alert! But you probably knew that already.",
  ],
  streak_reminder: [
    "Don't break your streak! Complete something. Anything.",
    "Your streak is in danger. The devil hopes you fail.",
    "One task. That's all it takes to keep your streak.",
  ],
  inactivity: [
    "Haven't seen you in a while. Running from your tasks?",
    "The devil misses shaming you. Come back.",
    "Your tasks miss you. Just kidding, they hate you too.",
  ],
};

// Notification IDs for management
const NOTIFICATION_IDS = {
  MORNING_REMINDER: 'morning_reminder',
  AFTERNOON_REMINDER: 'afternoon_reminder',
  EVENING_REMINDER: 'evening_reminder',
  STREAK_REMINDER: 'streak_reminder',
};

export const notifications = {
  // Request permissions
  requestPermissions: async (): Promise<boolean> => {
    if (!Notifications) return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    // Get push token for remote notifications (if needed later)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Devil Do',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF2222',
      });
    }

    return true;
  },

  // Schedule daily shame reminders
  scheduleDailyReminders: async () => {
    if (!Notifications) return;

    // Cancel existing reminders first
    await notifications.cancelAllScheduled();

    const enabled = await AsyncStorage.getItem('notifications_enabled');
    if (enabled === 'false') return;

    // Morning reminder (9 AM)
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_IDS.MORNING_REMINDER,
      content: {
        title: '😈 Devil Do',
        body: getRandomMessage('morning'),
        sound: true,
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });

    // Afternoon reminder (2 PM)
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_IDS.AFTERNOON_REMINDER,
      content: {
        title: '😈 Afternoon Check-in',
        body: getRandomMessage('afternoon'),
        sound: true,
      },
      trigger: {
        hour: 14,
        minute: 0,
        repeats: true,
      },
    });

    // Evening reminder (7 PM)
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_IDS.EVENING_REMINDER,
      content: {
        title: '😈 End of Day',
        body: getRandomMessage('evening'),
        sound: true,
      },
      trigger: {
        hour: 19,
        minute: 0,
        repeats: true,
      },
    });

    console.log('Daily reminders scheduled');
  },

  // Schedule streak reminder
  scheduleStreakReminder: async () => {
    if (!Notifications) return;

    // Remind at 8 PM if no tasks completed today
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_IDS.STREAK_REMINDER,
      content: {
        title: '🔥 Streak in Danger!',
        body: getRandomMessage('streak_reminder'),
        sound: true,
      },
      trigger: {
        hour: 20,
        minute: 0,
        repeats: true,
      },
    });
  },

  // Send immediate notification
  sendNow: async (title: string, body: string) => {
    if (!Notifications) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null, // Immediate
    });
  },

  // Send overdue task notification
  sendOverdueReminder: async (taskCount: number) => {
    const body = taskCount === 1
      ? getRandomMessage('overdue')
      : `You have ${taskCount} overdue tasks. ${getRandomMessage('overdue')}`;

    await notifications.sendNow('⏰ Overdue Tasks!', body);
  },

  // Send inactivity notification
  sendInactivityReminder: async (daysAway: number) => {
    const body = `${daysAway} days away? ${getRandomMessage('inactivity')}`;
    await notifications.sendNow('👋 Miss me?', body);
  },

  // Send achievement unlocked notification
  sendAchievementUnlocked: async (title: string, icon: string) => {
    await notifications.sendNow(
      '🏆 Achievement Unlocked!',
      `${icon} ${title} - The devil is... impressed?`
    );
  },

  // Send bet result notification
  sendBetResult: async (won: boolean, taskTitle: string) => {
    if (won) {
      await notifications.sendNow(
        '🎰 You Won the Bet!',
        `You completed "${taskTitle}". The devil is NOT happy.`
      );
    } else {
      await notifications.sendNow(
        '😈 Devil Wins!',
        `You failed "${taskTitle}". The devil sends his regards.`
      );
    }
  },

  // Cancel all scheduled notifications
  cancelAllScheduled: async () => {
    if (!Notifications) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  // Cancel specific notification
  cancel: async (identifier: string) => {
    if (!Notifications) return;
    await Notifications.cancelScheduledNotificationAsync(identifier);
  },

  // Get all scheduled notifications
  getScheduled: async () => {
    if (!Notifications) return [];
    return await Notifications.getAllScheduledNotificationsAsync();
  },

  // Set badge count
  setBadge: async (count: number) => {
    if (!Notifications) return;
    await Notifications.setBadgeCountAsync(count);
  },

  // Clear badge
  clearBadge: async () => {
    if (!Notifications) return;
    await Notifications.setBadgeCountAsync(0);
  },

  // Add notification response listener
  addResponseListener: (callback: (response: any) => void) => {
    if (!Notifications) return { remove: () => {} };
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  // Add notification received listener
  addReceivedListener: (callback: (notification: any) => void) => {
    if (!Notifications) return { remove: () => {} };
    return Notifications.addNotificationReceivedListener(callback);
  },
};

// Helper to get random message from category
function getRandomMessage(category: keyof typeof SHAME_MESSAGES): string {
  const messages = SHAME_MESSAGES[category];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Export for use in settings
export const NOTIFICATION_IDS_EXPORT = NOTIFICATION_IDS;
