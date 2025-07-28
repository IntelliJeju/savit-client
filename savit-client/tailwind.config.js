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
        'app-bg-green': '#A5E1D2',
        'app-red': '#FE4444',
        'app-light-red': '#FFBDBF',
        'app-yellow': '#FFBC00',
        'app-purple': '#6C5CE7',
        'app-gray': '#D9D9D9',
        'app-light-gray': '#F5F5F5',
        'app-dark-gray': '#545045',
        'app-blue': '#0088FF',
        'app-light-blue': '#C3E3FF'
      },
    },
  },
  plugins: []
}
