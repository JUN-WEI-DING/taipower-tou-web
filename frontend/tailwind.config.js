import { nextui } from '@nextui-org/react'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ocean Depths Theme - keep for backward compatibility
        ocean: {
          50: '#f1faee',  // cream
          100: '#e8f4f5',
          200: '#d1eae8',
          300: '#a8dadc',  // seafoam
          400: '#7ec8c3',
          500: '#2d8b8b',  // teal
          600: '#1a2332',  // deep navy
          700: '#0d1b2a',  // midnight
          800: '#0a1219',
          950: '#050a0f',
        },
        // Data visualization colors (Tableau 10)
        'data-blue': '#4e79a7',
        'data-orange': '#f28e2b',
        'data-red': '#e15759',
        'data-teal': '#76b7b2',
        'data-green': '#59a14f',
        'data-yellow': '#edc948',
        'data-purple': '#b07aa1',
        'data-pink': '#ff9da7',
        'data-brown': '#9c755f',
        'data-gray': '#bab0ac',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', '"Fira Sans"', '"Droid Sans"', '"Helvetica Neue"', '"Microsoft JhengHei"', 'sans-serif'],
      },
      boxShadow: {
        'ocean': '0 4px 20px rgba(26, 35, 50, 0.12)',
        'ocean-lg': '0 8px 30px rgba(26, 35, 50, 0.15)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease forwards',
        'wave': 'wave 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [nextui()],
}
