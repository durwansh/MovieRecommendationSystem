/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef2f2',
          100: '#ffe1e1',
          500: '#ef4444',
          600: '#e50914', // Netflix Red accent
          700: '#b91c1c',
          900: '#7f1d1d'
        },
        slate: {
          850: '#131c2e',
          950: '#090d16'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
