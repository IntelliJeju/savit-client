import { ref, computed } from 'vue'
import { useBudgetsStore } from '@/stores/budgets'
import { formatCurrency } from '@/utils/calculations'
import { calculateSpendingRatio } from '@/utils/budgetUtils'
import { getRelativeMonth } from '@/utils/dateUtils'
import type { MainCategory, MainCategoryBudgetStatus } from '@/types/budgets'

export function useBudget() {
  const budgetsStore = useBudgetsStore()
  const isLoading = ref(false)
  
  // 카테고리 확장/축소 상태 관리
  const expandedCategories = ref<Set<MainCategory>>(new Set())

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

  // 월별 데이터 조회 함수들 (getRelativeMonth 직접 사용)
  const getMonthSpendingData = (monthsBack: number) => 
    budgetsStore.getSpendingByMonth(getRelativeMonth(monthsBack).string)
  
  const getMonthBudgetData = (monthsBack: number) => 
    budgetsStore.getBudgetByMonth(getRelativeMonth(monthsBack).string)

  // 지출 금액 계산 유틸리티
  const calculateSpentAmount = (
    mainCategory: MainCategoryBudgetStatus,
    spendingData: Record<string, number>,
  ): number => {
    return mainCategory.subCategories.reduce(
      (sum, sub) => sum + (spendingData[sub.subCategory] || 0),
      0,
    )
  }

  // 범용 계산 함수들
  const getMonthSpent = (mainCategory: MainCategoryBudgetStatus, monthsBack: number): number =>
    calculateSpentAmount(mainCategory, getMonthSpendingData(monthsBack))

  const getMonthRatio = (mainCategory: MainCategoryBudgetStatus, monthsBack: number): string =>
    calculateSpendingRatio(getMonthSpent(mainCategory, monthsBack), getMonthBudgetAmount(mainCategory, monthsBack))

  const getBudgetAmountForCategory = (
    mainCategory: MainCategoryBudgetStatus,
    budgetData: MainCategoryBudgetStatus[],
  ): number => {
    const budget = budgetData.find((b) => b.mainCategory === mainCategory.mainCategory)
    return budget?.budgetAmount || mainCategory.budgetAmount
  }

  const getMonthBudgetAmount = (mainCategory: MainCategoryBudgetStatus, monthsBack: number): number =>
    getBudgetAmountForCategory(mainCategory, getMonthBudgetData(monthsBack))

  const getAmountClass = (mainCategory: any): string => {
    return mainCategory.isOverBudget ? 'text-app-red' : 'text-app-blue'
  }

  return {
    // 상태
    isLoading,
    budgetSummary,
    isTotalBudgetSet,
    expandedCategories,
    
    // 함수
    toggleCategory,
    isExpanded,
    getExpandedClass,
    
    // 월별 데이터 조회
    getMonthSpendingData,
    getMonthBudgetData,
    
    // 계산 함수들
    getMonthSpent,
    getMonthRatio,
    getMonthBudgetAmount,
    getAmountClass,
    
    // 유틸리티
    formatCurrency,
    calculateSpendingRatio,
    
    // Store 인스턴스
    budgetsStore
  }
}