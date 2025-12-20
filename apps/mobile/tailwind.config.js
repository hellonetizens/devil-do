/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // HELLFIRE THEME 🔥
        background: '#0a0000',
        surface: '#1a0505',
        surfaceLight: '#2a0a0a',

        // Fire colors
        fire: {
          900: '#1a0000',
          800: '#2d0000',
          700: '#4a0000',
          600: '#6b0000',
          500: '#8b0000',
          400: '#b22222',
          300: '#dc143c',
          200: '#ff4444',
          100: '#ff6b6b',
          50: '#ff8a8a',
        },

        // Accent - hot red/orange
        accent: '#ff2222',
        accentLight: '#ff4444',
        accentDark: '#cc0000',

        // Ember/orange
        ember: {
          500: '#ff4500',
          400: '#ff6600',
          300: '#ff8800',
        },

        // Text
        text: {
          primary: '#ffffff',
          secondary: '#ff9999',
          muted: '#994444',
        },

        // Status
        success: '#44ff44',
        warning: '#ffaa00',
        danger: '#ff0000',
      },
      fontFamily: {
        sans: ['System'],
      },
      backgroundImage: {
        'hellfire': 'linear-gradient(to bottom, #1a0000, #0a0000)',
        'ember-glow': 'radial-gradient(ellipse at center, #4a0000 0%, #0a0000 70%)',
      },
    },
  },
  plugins: [],
};
