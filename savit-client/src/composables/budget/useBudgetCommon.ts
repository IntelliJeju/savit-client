import { ref, computed, onMounted } from 'vue'
import { useBudgetsStore } from '@/stores/budgets'
import { formatCurrency } from '@/utils/calculations'
import { getCurrentMonth as getCurrentMonthUtil } from '@/utils/budgetUtils'
import type { MainCategory } from '@/types/budgets'

export function useBudgetCommon() {
  const budgetsStore = useBudgetsStore()
  const isLoading = ref(false)
  
  // 카테고리 확장/축소 상태 관리
  const expandedCategories = ref<Set<MainCategory>>(new Set())

  // 현재 월 예산 초기화
  const initializeBudget = async () => {
    isLoading.value = true
    try {
      await budgetsStore.initializeCurrentMonthBudget()
    } catch (error) {
      console.error('예산 초기화 실패:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 월별 이름 생성 함수
  const getMonthName = (monthsBack: number): string => {
    const date = new Date()
    date.setMonth(date.getMonth() - monthsBack)
    return `${date.getMonth() + 1}월`
  }

  // 월별 문자열 생성 함수 (YYYY-MM 형식)
  const getMonthString = (monthsBack: number): string => {
    const date = new Date()
    date.setMonth(date.getMonth() - monthsBack)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  }

  // 현재 월 문자열 (budgetUtils에서 import)
  const getCurrentMonth = () => getCurrentMonthUtil()

  // 이전 월 관련 함수들
  const getPrevMonth = () => getMonthName(1)
  const getPrevPrevMonth = () => getMonthName(2)
  const getPrevMonthString = () => getMonthString(1)
  const getPrevPrevMonthString = () => getMonthString(2)

  // 월별 데이터 조회 함수들
  const getPrevMonthSpendingData = () => budgetsStore.getSpendingByMonth(getPrevMonthString())
  const getPrevPrevMonthSpendingData = () => budgetsStore.getSpendingByMonth(getPrevPrevMonthString())
  const getPrevMonthBudgetData = () => budgetsStore.getBudgetByMonth(getPrevMonthString())
  const getPrevPrevMonthBudgetData = () => budgetsStore.getBudgetByMonth(getPrevPrevMonthString())

  // 지출 비율 계산
  const calculateSpendingRatio = (spent: number, budget: number): string => {
    return budget > 0 ? Math.min((spent / budget) * 100, 100).toFixed(1) : '0.0'
  }

  // 예산 설정 여부 확인
  const isTotalBudgetSet = computed(() => {
    return budgetsStore.currentBudget?.totalBudget && budgetsStore.currentBudget.totalBudget > 0
  })

  // 현재 예산 요약 정보
  const budgetSummary = computed(() => budgetsStore.currentBudgetSummary)

  // 카테고리 확장/축소 함수들
  const toggleCategory = (category: MainCategory) => {
    if (expandedCategories.value.has(category)) {
      expandedCategories.value.delete(category)
    } else {
      expandedCategories.value.clear()
      expandedCategories.value.add(category)
    }
  }

  const isExpanded = (category: MainCategory) => {
    return expandedCategories.value.has(category)
  }

  const getExpandedClass = (mainCategory: any) => ({
    'bg-app-light-gray': mainCategory.expanded,
  })

  return {
    // 상태
    isLoading,
    budgetSummary,
    isTotalBudgetSet,
    expandedCategories,
    
    // 함수
    initializeBudget,
    getMonthName,
    getMonthString,
    getCurrentMonth,
    getPrevMonth,
    getPrevPrevMonth,
    getPrevMonthString,
    getPrevPrevMonthString,
    getPrevMonthSpendingData,
    getPrevPrevMonthSpendingData,
    getPrevMonthBudgetData,
    getPrevPrevMonthBudgetData,
    calculateSpendingRatio,
    toggleCategory,
    isExpanded,
    getExpandedClass,
    
    // 유틸리티
    formatCurrency,
    
    // Store 인스턴스
    budgetsStore
  }
}