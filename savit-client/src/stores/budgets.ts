import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { calculateSum } from '@/utils/calculations'
import { saveToStorage, loadFromStorage } from '@/utils/storage'
import { useApi } from '@/api/useApi'
import { transactionService } from '@/services/transactionService'

import {
  validateBudgetSettings,
  createBudgetFromSettings,
  createBudgetFromApiData,
  createNewBudget,
  validateTotalBudget,
} from '@/utils/budgetUtils'
import { getCurrentMonth, getRelativeMonth } from '@/utils/dateUtils'

import type {
  SubCategory,
  MainCategoryBudgetStatus,
  MonthlyBudget,
  BudgetSummary,
  BudgetSettingResponse,
  MonthSummary,
  BudgetSettingRequest,
  MainCategory,
} from '@/types/budgets'

import { STORAGE_KEYS, DEFAULT_BUDGET_AMOUNTS, CATEGORY_ID_MAP } from '@/types/budgets'

export const useBudgetsStore = defineStore('budgets', () => {
  const { request, loading } = useApi()

  const monthlyBudgets = ref<MonthlyBudget[]>(
    loadFromStorage<MonthlyBudget[]>(STORAGE_KEYS.MONTHLY_BUDGETS) || [],
  )
  const currentBudget = ref<MonthlyBudget | null>(
    loadFromStorage<MonthlyBudget>(STORAGE_KEYS.CURRENT_BUDGET),
  )
  const categorySpendingData = ref<Record<string, Record<SubCategory, number>>>({})

  // ===== 유틸리티 함수 =====
  const transformBudgetRequestToCategoryData = (budgetRequest: BudgetSettingRequest) =>
    budgetRequest.mainCategoryBudgets.map((item) => ({
      categoryId: CATEGORY_ID_MAP[item.mainCategory as MainCategory],
      targetAmount: item.budgetAmount,
    }))

  // ===== 데이터 처리 로직 =====
  const getSpendingByMonthData = (month: string): Record<SubCategory, number> => {
    if (categorySpendingData.value[month]) return categorySpendingData.value[month]

    const spendingData = transactionService.getSpendingByMonth(month)
    return (categorySpendingData.value[month] = spendingData)
  }

  const updateSpendingData = (
    mainCategoryBudgets: MainCategoryBudgetStatus[],
    month: string,
  ): MainCategoryBudgetStatus[] =>
    mainCategoryBudgets.map((mainCategory) => {
      const monthSpending = getSpendingByMonthData(month)
      const updatedSubCategories = mainCategory.subCategories.map((sub) => ({
        ...sub,
        spentAmount: monthSpending[sub.subCategory] || 0,
      }))

      return {
        ...mainCategory,
        totalSpent: calculateSum(updatedSubCategories, 'spentAmount'),
        subCategories: updatedSubCategories,
      }
    })

  // ===== API 호출 로직 (useBudgetApi에서 이동) =====
  const apiCall = async <T>(url: string, fallback: T): Promise<T> => {
    try {
      const response = await request({ method: 'GET', url })
      return response.data
    } catch {
      return fallback
    }
  }

  const getDefaultTotalBudget = (): Promise<number> => 
    apiCall('/budget', Object.values(DEFAULT_BUDGET_AMOUNTS).reduce((sum, amount) => sum + amount, 0))
      .then(data => (data as any).totalBudget || data)

  const getDefaultCategoryBudgets = (): Promise<Record<MainCategory, number>> => 
    apiCall('/budget/categories', { ...DEFAULT_BUDGET_AMOUNTS })
      .then(data => (data as any).categoryBudgets || data)

  const getPeerAvgForAllCategories = async (): Promise<Record<MainCategory, number>> => {
    const results: Record<MainCategory, number> = {} as Record<MainCategory, number>
    
    // 타임아웃을 방지하기 위해 Promise.allSettled 사용
    const promises = Object.entries(CATEGORY_ID_MAP).map(async ([category, categoryId]) => {
      try {
        const response = await request({ 
          method: 'GET', 
          url: `/budget/peer-avg/${categoryId}` 
        })
        return { 
          category: category as MainCategory, 
          amount: response.amount || 0 
        }
      } catch (error) {
        console.warn(`카테고리 ${category} 또래 평균 조회 실패:`, error)
        return { 
          category: category as MainCategory, 
          amount: DEFAULT_BUDGET_AMOUNTS[category as MainCategory] || 0 
        }
      }
    })
    
    const settledResults = await Promise.allSettled(promises)
    
    // 성공한 결과들로 객체 구성
    settledResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        results[result.value.category] = result.value.amount
      }
    })
    
    // 실패한 카테고리는 기본값으로 설정
    Object.keys(CATEGORY_ID_MAP).forEach(category => {
      if (!(category as MainCategory in results)) {
        results[category as MainCategory] = DEFAULT_BUDGET_AMOUNTS[category as MainCategory] || 0
      }
    })
    
    return results
  }

  const transformBudgetRequestToCategoryData = (budgetRequest: BudgetSettingRequest) =>
    budgetRequest.mainCategoryBudgets.map(item => ({
      categoryId: CATEGORY_ID_MAP[item.mainCategory as MainCategory],
      targetAmount: item.budgetAmount
    }))

  async function fetchBudgetData(url: string) {
    try {
      const response = await request({ method: 'GET', url })
      return response.data
    } catch (error) {
      if (fallback !== undefined) {
        return fallback
      }
      console.warn(`API 호출 실패 (${url}):`, error)
      return null
    }
  }

  const saveWithRetry = async (
    url: string,
    data: unknown,
    successMessage: string,
  ): Promise<BudgetSettingResponse> => {
    for (const method of ['PUT', 'POST'] as const) {
      try {
        await request({ method, url, data })
        return {
          success: true,
          message: `${successMessage} ${method === 'PUT' ? '업데이트' : '생성'}되었습니다`,
        }
      } catch (error) {
        if (method === 'POST') {
          console.warn(`서버 저장 실패 (${url}):`, error)
          return { success: false, message: '서버 저장에 실패했습니다' }
        }
      }
    }
    return { success: false, message: '예상치 못한 오류가 발생했습니다' }
  }

  const getDefaultTotalBudget = async (): Promise<number> => {
    const fallbackBudget = Object.values(DEFAULT_BUDGET_AMOUNTS).reduce(
      (sum, amount) => sum + amount,
      0,
    )
    const data = await apiCall('/budget', fallbackBudget)
    if (typeof data === 'number') return data
    return (data as any)?.totalBudget || fallbackBudget
  }

  const getDefaultCategoryBudgets = async (): Promise<Record<MainCategory, number>> => {
    const fallbackBudgets = { ...DEFAULT_BUDGET_AMOUNTS }
    const data = await apiCall('/budget/categories', fallbackBudgets)
    return (data as any)?.categoryBudgets || data || fallbackBudgets
  }

  async function fetchBudgetsByMonth(month: string): Promise<void> {
    const data = await apiCall('/budget')
    if (data) {
      const budget = Array.isArray(data)
        ? createBudgetFromApiData(data, month)
        : (data as MonthlyBudget)
      updateBudgetInStore(budget, month)
    }
  }

  // ===== Computed Properties =====
  const currentBudgetSummary = computed((): BudgetSummary | null => {
    if (!currentBudget.value) return null

    const budget = currentBudget.value
    const mainCategoryBudgets = updateSpendingData(budget.mainCategoryBudgets, getCurrentMonth())
    const totalSpent = calculateSum(mainCategoryBudgets, 'totalSpent')
    const remainingBudget = budget.totalBudget - totalSpent
    const spendingRatio = budget.totalBudget > 0 ? (totalSpent / budget.totalBudget) * 100 : 0

    return {
      totalBudget: budget.totalBudget,
      totalSpent,
      remainingBudget,
      spendingRatio,
      mainCategoryBudgets,
      isOverBudget: totalSpent > budget.totalBudget,
    }
  })

  // ===== 예산 설정 함수 =====
  async function setTotalBudget(
    month: string,
    totalBudget: number,
  ): Promise<BudgetSettingResponse> {
    const validation = validateTotalBudget(month, totalBudget)
    if (!validation.isValid) return { success: false, message: validation.error }

    updateBudgetInStore(createNewBudget(month, totalBudget), month)
    return saveWithRetry('/budget', { month, totalBudget }, '전체 예산이 성공적으로')
  }

  async function setBudgetForMonth(
    budgetRequest: BudgetSettingRequest,
  ): Promise<BudgetSettingResponse> {
    const validation = validateBudgetSettings(budgetRequest)
    if (!validation.isValid) return { success: false, message: validation.error }

    const budget = createBudgetFromSettings(budgetRequest)
    updateBudgetInStore(budget, budgetRequest.month)

    const categoryData = transformBudgetRequestToCategoryData(budgetRequest)
    const result = await saveWithRetry(
      '/budget/categories',
      categoryData,
      '카테고리별 예산이 성공적으로',
    )

    return { ...result, data: budget }
  }

  // ===== 데이터 조회 함수 =====
  async function getPreviousMonthsSummary(monthsBack: number): Promise<MonthSummary> {
    const monthData = getRelativeMonth(monthsBack)
    const monthStr = monthData.string
    const monthName = monthData.name

    const spendingData = getSpendingByMonthData(monthStr)
    const totalSpent = Object.values(spendingData).reduce(
      (sum: number, amount: number) => sum + amount,
      0,
    )

    const monthBudget = monthlyBudgets.value.find((b) => b.month === monthStr)
    const totalBudget = monthBudget?.totalBudget || 0

    return { month: monthStr, monthName, totalSpent, totalBudget }
  }

  return {
    //fetch
    fetchBudgetsByMonth,

    //ref
    monthlyBudgets,
    currentBudget,
    categorySpendingData,
    loading,

    //computed
    currentBudgetSummary,
    setTotalBudget,
    setBudgetForMonth,
    getPreviousMonthsSummary,
    getSpendingByMonth: getSpendingByMonthData,
    getBudgetByMonth,
    getDefaultTotalBudget,
    getDefaultCategoryBudgets,
    getPeerAvgForAllCategories,
    validateBudgetSettings,
    createBudgetFromSettings,
  }
})
