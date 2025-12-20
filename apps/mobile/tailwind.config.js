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
        // DevilDo brand colors
        devil: {
          red: '#e63946',
          darkRed: '#9d0208',
          orange: '#f77f00',
          black: '#1a1a2e',
          dark: '#16213e',
          purple: '#4a0e4e',
        },
        // UI colors
        background: '#0f0f1a',
        surface: '#1a1a2e',
        surfaceLight: '#252542',
        accent: '#e63946',
        accentLight: '#ff6b6b',
        text: {
          primary: '#ffffff',
          secondary: '#a0a0b0',
          muted: '#606070',
        },
        success: '#2ecc71',
        warning: '#f39c12',
        danger: '#e74c3c',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
