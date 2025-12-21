import { Platform } from 'react-native';

// Only import Haptics on native platforms
let Haptics: typeof import('expo-haptics') | null = null;

const isHapticsSupported = Platform.OS === 'ios' || Platform.OS === 'android';

if (isHapticsSupported) {
  Haptics = require('expo-haptics');
}

export const haptics = {
  // Light tap - for selections, toggles
  light: () => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  // Medium tap - for button presses
  medium: () => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  // Heavy tap - for completing tasks, important actions
  heavy: () => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  // Success - task completed, bet won
  success: () => {
    if (Haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },

  // Warning - overdue task, devil taunt
  warning: () => {
    if (Haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },

  // Error - task abandoned, bet lost
  error: () => {
    if (Haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },

  // Selection changed - for tab switches, filters
  selection: () => {
    if (Haptics) {
      Haptics.selectionAsync();
    }
  },

  // Devil laugh pattern - for when devil wins
  devilLaugh: async () => {
    if (!Haptics) return;

    // Staccato pattern like evil laughter
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise(r => setTimeout(r, 100));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise(r => setTimeout(r, 80));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise(r => setTimeout(r, 100));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  // Shame pattern - for shame messages
  shame: async () => {
    if (!Haptics) return;

    // Two heavy thumps
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise(r => setTimeout(r, 150));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  // Streak milestone - celebration pattern
  celebration: async () => {
    if (!Haptics) return;

    // Rising intensity pattern
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise(r => setTimeout(r, 80));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise(r => setTimeout(r, 80));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise(r => setTimeout(r, 100));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
};
