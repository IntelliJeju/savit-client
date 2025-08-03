import { computed } from 'vue'

export const useCommonStyles = () => {
  const styles = computed(() => ({
    // 카드 컨테이너 스타일
    cardContainer: 'bg-white rounded-2xl p-5 border border-slate-200 shadow-sm',
    cardContainerSmall: 'bg-white rounded-xl p-4 border border-slate-200 shadow-sm',
    cardContainerLarge: 'bg-white rounded-2xl p-6 border border-slate-200 shadow-lg',
    
    // 페이지 배경
    pageBackground: 'min-h-screen bg-app-light-gray',
    
    // 아이콘 컨테이너
    iconContainer: 'w-10 h-10 rounded-xl flex items-center justify-center bg-app-light-gray',
    iconContainerLarge: 'w-12 h-12 rounded-xl flex items-center justify-center bg-app-light-gray',
    iconContainerRound: 'w-10 h-10 rounded-3xl flex items-center justify-center bg-app-light-gray',
    
    // 버튼 스타일
    buttonPrimary: 'bg-app-blue text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors',
    buttonSecondary: 'bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors',
    buttonDanger: 'bg-app-red text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-600 transition-colors',
    
    // 텍스트 스타일
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textMuted: 'text-gray-400',
    textSuccess: 'text-app-blue',
    textError: 'text-app-red',
    
    // 레이아웃
    flexCenter: 'flex items-center justify-center',
    flexBetween: 'flex items-center justify-between',
    gridCols2: 'grid grid-cols-2 gap-4',
    gridCols3: 'grid grid-cols-3 gap-4',
    
    // 공통 마진/패딩
    spacing: {
      xs: 'p-2',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    },
    
    margin: {
      xs: 'm-2',
      sm: 'm-4',
      md: 'm-6',
      lg: 'm-8',
      xl: 'm-10'
    }
  }))

  // 상태에 따른 스타일 함수
  const getStatusColor = (condition: boolean, type: 'text' | 'bg' = 'text') => {
    const colors = {
      success: type === 'text' ? 'text-app-blue' : 'bg-app-light-blue',
      error: type === 'text' ? 'text-app-red' : 'bg-app-light-red'
    }
    return condition ? colors.success : colors.error
  }

  const getBudgetStatusClass = (percentage: number) => ({
    text: getStatusColor(percentage === 100, 'text'),
    bg: getStatusColor(percentage === 100, 'bg')
  })

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'text-app-red'
    if (percentage >= 80) return 'text-yellow-500'
    return 'text-app-blue'
  }

  return {
    styles,
    getStatusColor,
    getBudgetStatusClass,
    getProgressColor
  }
}