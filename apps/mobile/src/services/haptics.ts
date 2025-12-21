import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Haptic feedback wrapper with platform check
const isHapticsSupported = Platform.OS === 'ios' || Platform.OS === 'android';

export const haptics = {
  // Light tap - for selections, toggles
  light: () => {
    if (isHapticsSupported) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  // Medium tap - for button presses
  medium: () => {
    if (isHapticsSupported) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  // Heavy tap - for completing tasks, important actions
  heavy: () => {
    if (isHapticsSupported) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  // Success - task completed, bet won
  success: () => {
    if (isHapticsSupported) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },

  // Warning - overdue task, devil taunt
  warning: () => {
    if (isHapticsSupported) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },

  // Error - task abandoned, bet lost
  error: () => {
    if (isHapticsSupported) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },

  // Selection changed - for tab switches, filters
  selection: () => {
    if (isHapticsSupported) {
      Haptics.selectionAsync();
    }
  },

  // Devil laugh pattern - for when devil wins
  devilLaugh: async () => {
    if (!isHapticsSupported) return;

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
    if (!isHapticsSupported) return;

    // Two heavy thumps
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise(r => setTimeout(r, 150));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  // Streak milestone - celebration pattern
  celebration: async () => {
    if (!isHapticsSupported) return;

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
