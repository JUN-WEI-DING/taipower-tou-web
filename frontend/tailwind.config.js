/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 建議使用 Tableau 10 色調
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
    },
  },
  plugins: [],
}
