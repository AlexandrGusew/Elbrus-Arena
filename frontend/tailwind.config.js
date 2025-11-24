/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Fantasy theme colors
        'dark-bg': '#0b0b0f',
        'dark-panel': '#17161c',
        'dark-accent': '#4a2c2f',
        'dark-red': '#8b2c2f',
        'dark-gold': '#d4af37',
        'dark-amber': '#e6a85b',
        'dark-text': '#eae6dd',
      },
    },
  },
  plugins: [],
}