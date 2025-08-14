import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBudgetsStore, DEFAULT_BUDGET_AMOUNTS } from '@/stores/budgets'
import type { CategoryData } from '@/stores/budgets'
import { getCurrentMonth, calculateDefaultTotalBudget } from '@/utils/budgetUtils'
import { calculateAmount } from '@/utils/calculations'

const RECOMMENDATION_API_DELAY = 1000

export function useBudgetManagement() {
  const route = useRoute()
  const router = useRouter()
  const budgetsStore = useBudgetsStore()
  const isLoading = ref(false)

  // budgetUtils에서 import된 함수 활용

  const getInitialTotalBudget = (): number => {
    const queryBudget = parseInt(route.query.totalBudget as string)
    return !isNaN(queryBudget) && queryBudget > 0
      ? queryBudget
      : budgetsStore.currentBudget?.totalBudget ||
          calculateDefaultTotalBudget(DEFAULT_BUDGET_AMOUNTS)
  }

  // Reactive state
  const totalBudget = ref(getInitialTotalBudget())

  // Budget operations
  const validateBudgetAllocation = (totalPercentage: number): boolean => {
    if (totalPercentage === 0) {
      alert('최소 한 카테고리에 예산을 배분해주세요.')
      return false
    }
    return true
  }

  const createBudgetRequest = (categories: CategoryData[], totalBudget: number) => ({
    month: getCurrentMonth(),
    mainCategoryBudgets: categories.map((cat) => ({
      mainCategory: cat.name,
      budgetAmount: calculateAmount(cat.percentage, totalBudget),
    })),
  })

  const handleBudgetSaveResult = (result: any): void => {
    if (result?.success) {
      alert('카테고리별 예산이 성공적으로 설정되었습니다!')
      setTimeout(() => router.push('/budget'), 100)
    } else {
      alert(result?.message || '예산 설정에 실패했습니다.')
    }
  }

  const handleSaveBudgetClick = async (
    categories: CategoryData[], 
    totalPercentage: number
  ): Promise<void> => {
    if (!validateBudgetAllocation(totalPercentage) || isLoading.value) return

    isLoading.value = true

    try {
      const budgetRequest = createBudgetRequest(categories, totalBudget.value)
      const result = await budgetsStore.setBudgetForMonth(budgetRequest)
      handleBudgetSaveResult(result)
    } catch (error) {
      console.error('예산 설정 오류:', error)
      const message = error instanceof Error ? error.message : '예산 설정 중 오류가 발생했습니다.'
      alert(`${message} 다시 시도해주세요.`)
    } finally {
      isLoading.value = false
    }
  }

  // Recommendation logic
  const handleRecommendationClick = async (applyRecommendedRatios: () => void): Promise<void> => {
    if (isLoading.value) return
    
    isLoading.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, RECOMMENDATION_API_DELAY))
      
      applyRecommendedRatios()
      alert('기본 추천 비율로 설정되었습니다!')
    } catch (error) {
      console.error('추천 실패:', error)
      alert('추천 비율을 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      isLoading.value = false
    }
  }

  // Initialization
  onMounted(async () => {
    try {
      await budgetsStore.initializeCurrentMonthBudget()
      if (!route.query.totalBudget && budgetsStore.currentBudget?.totalBudget) {
        totalBudget.value = budgetsStore.currentBudget.totalBudget
      }
    } catch (error) {
      console.error('예산 데이터 로드 실패:', error)
      if (!totalBudget.value) {
        totalBudget.value = calculateDefaultTotalBudget(DEFAULT_BUDGET_AMOUNTS)
      }
    }
  })

  return {
    totalBudget,
    isLoading,
    handleSaveBudgetClick,
    handleRecommendationClick,
  }
}