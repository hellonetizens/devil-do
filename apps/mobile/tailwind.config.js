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
        // MONOCHROME + POP
        // Clean blacks and whites with one accent color

        // Base
        background: '#000000',
        surface: '#0A0A0A',
        'surface-elevated': '#171717',

        // Grays - true neutral, no warmth
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },

        // The Pop - devil red, used sparingly
        pop: {
          DEFAULT: '#FF3B30',
          light: '#FF6961',
          dark: '#D32F2F',
          muted: 'rgba(255, 59, 48, 0.15)',
        },

        // Keep fire as alias for backwards compat during migration
        fire: {
          900: '#171717',
          800: '#262626',
          700: '#404040',
          600: '#525252',
          500: '#737373',
          400: '#A3A3A3',
          300: '#D4D4D4',
          200: '#E5E5E5',
          100: '#F5F5F5',
          50: '#FAFAFA',
        },

        // Accent
        accent: '#FF3B30',
        'accent-light': '#FF6961',
        'accent-dark': '#D32F2F',

        // Text
        text: {
          primary: '#FFFFFF',
          secondary: '#A3A3A3',
          muted: '#525252',
        },

        // Semantic
        success: '#34C759',
        warning: '#FF9500',
        danger: '#FF3B30',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
