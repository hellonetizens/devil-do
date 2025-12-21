import { Audio } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';

// Sound cache to avoid reloading
const soundCache: Map<string, Sound> = new Map();

// Audio settings
let isSoundEnabled = true;
let volume = 0.7;

// Sound effect URLs (using free sound URLs - replace with actual assets in production)
// For now, we'll use synthesized sounds via the Web Audio API pattern
// In production, bundle actual audio files in assets/sounds/

type SoundEffect =
  | 'devil_laugh'
  | 'shame'
  | 'success'
  | 'fail'
  | 'bet_made'
  | 'bet_won'
  | 'bet_lost'
  | 'timer_complete'
  | 'timer_tick'
  | 'streak_milestone'
  | 'message_sent'
  | 'message_received'
  | 'button_tap';

// Placeholder - in production, use actual sound files
const SOUND_ASSETS: Record<SoundEffect, number | null> = {
  devil_laugh: null,      // require('../assets/sounds/devil_laugh.mp3'),
  shame: null,            // require('../assets/sounds/shame.mp3'),
  success: null,          // require('../assets/sounds/success.mp3'),
  fail: null,             // require('../assets/sounds/fail.mp3'),
  bet_made: null,         // require('../assets/sounds/bet_made.mp3'),
  bet_won: null,          // require('../assets/sounds/bet_won.mp3'),
  bet_lost: null,         // require('../assets/sounds/bet_lost.mp3'),
  timer_complete: null,   // require('../assets/sounds/timer_complete.mp3'),
  timer_tick: null,       // require('../assets/sounds/timer_tick.mp3'),
  streak_milestone: null, // require('../assets/sounds/streak_milestone.mp3'),
  message_sent: null,     // require('../assets/sounds/message_sent.mp3'),
  message_received: null, // require('../assets/sounds/message_received.mp3'),
  button_tap: null,       // require('../assets/sounds/button_tap.mp3'),
};

export const audio = {
  // Initialize audio settings
  init: async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false, // Respect silent mode
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.warn('Audio init failed:', error);
    }
  },

  // Enable/disable sounds
  setEnabled: (enabled: boolean) => {
    isSoundEnabled = enabled;
  },

  // Set volume (0-1)
  setVolume: (vol: number) => {
    volume = Math.max(0, Math.min(1, vol));
  },

  // Play a sound effect
  play: async (effect: SoundEffect) => {
    if (!isSoundEnabled) return;

    const asset = SOUND_ASSETS[effect];
    if (!asset) {
      // No sound file available yet - just log in dev
      console.log(`[Audio] Would play: ${effect}`);
      return;
    }

    try {
      // Check cache first
      let sound = soundCache.get(effect);

      if (!sound) {
        // Load the sound
        const { sound: newSound } = await Audio.Sound.createAsync(asset);
        sound = newSound;
        soundCache.set(effect, sound);
      }

      // Reset and play
      await sound.setPositionAsync(0);
      await sound.setVolumeAsync(volume);
      await sound.playAsync();
    } catch (error) {
      console.warn(`Failed to play sound ${effect}:`, error);
    }
  },

  // Stop a playing sound
  stop: async (effect: SoundEffect) => {
    const sound = soundCache.get(effect);
    if (sound) {
      try {
        await sound.stopAsync();
      } catch (error) {
        // Ignore errors when stopping
      }
    }
  },

  // Unload all sounds (cleanup)
  cleanup: async () => {
    for (const sound of soundCache.values()) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    soundCache.clear();
  },

  // Devil-specific sounds
  devil: {
    laugh: () => audio.play('devil_laugh'),
    shame: () => audio.play('shame'),
    betMade: () => audio.play('bet_made'),
    betWon: () => audio.play('bet_won'),
    betLost: () => audio.play('bet_lost'),
  },

  // Task sounds
  task: {
    complete: () => audio.play('success'),
    fail: () => audio.play('fail'),
  },

  // Timer sounds
  timer: {
    complete: () => audio.play('timer_complete'),
    tick: () => audio.play('timer_tick'),
  },

  // UI sounds
  ui: {
    tap: () => audio.play('button_tap'),
    send: () => audio.play('message_sent'),
    receive: () => audio.play('message_received'),
    milestone: () => audio.play('streak_milestone'),
  },
};
