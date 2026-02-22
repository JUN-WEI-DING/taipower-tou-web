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
        // Energy-focused brand colors
        energy: {
          blue: '#0066FF',
          cyan: '#06B6D4',
          green: '#10B981',
          purple: '#8B5CF6',
          orange: '#F59E0B',
          rose: '#EF4444',
        },
        // Ocean Depths Theme - keep for backward compatibility
        ocean: {
          50: '#f1faee',
          100: '#e8f4f5',
          200: '#d1eae8',
          300: '#a8dadc',
          400: '#7ec8c3',
          500: '#2d8b8b',
          600: '#1a2332',
          700: '#0d1b2a',
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
        'energy': '0 4px 20px rgba(0, 102, 255, 0.15)',
        'energy-lg': '0 10px 40px rgba(0, 102, 255, 0.2)',
        'glow': '0 0 20px rgba(0, 102, 255, 0.3)',
        'glow-lg': '0 0 40px rgba(0, 102, 255, 0.4)',
      },
      backgroundImage: {
        'gradient-energy': 'linear-gradient(135deg, #0066FF 0%, #06B6D4 100%)',
        'gradient-success': 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #0EA5E9 0%, #0066FF 100%)',
        'gradient-midnight': 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease forwards',
        'wave': 'wave 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
    },
  },
  plugins: [nextui()],
}
