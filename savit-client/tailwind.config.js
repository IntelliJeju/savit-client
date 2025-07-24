/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 커스텀 색상 정의
        'app-green': '#0AB68B',
        'app-light-green': '#92DE8B',
        'app-dark-green': '#028174',
        'app-red': '#FE4444',
        'app-yellow': '#FFBC00',
        'app-purple': '#6C5CE7',
        'app-dark-gray': '#545045',
      },
    },
  },
  plugins: [],
}
