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

import { STORAGE_KEYS, DEFAULT_BUDGET_AMOUNTS, CATEGORY_ID_MAP, CATEGORIES } from '@/types/budgets'

// Re-export for components
export { DEFAULT_BUDGET_AMOUNTS, CATEGORY_ORDER, CATEGORY_ID_MAP } from '@/types/budgets'
export type { CategoryData } from '@/types/budgets'

export const useBudgetsStore = defineStore('budgets', () => {
  const { request, loading } = useApi()

  const monthlyBudgets = ref<MonthlyBudget[]>(
    loadFromStorage<MonthlyBudget[]>(STORAGE_KEYS.MONTHLY_BUDGETS) || [],
  )
  const currentBudget = ref<MonthlyBudget | null>(
    loadFromStorage<MonthlyBudget>(STORAGE_KEYS.CURRENT_BUDGET),
  )
  const categorySpendingData = ref<Record<string, Record<SubCategory, number>>>({})

  // ===== 데이터 처리 로직 (거래 서비스 사용) =====
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
    apiCall(
      '/budget',
      Object.values(DEFAULT_BUDGET_AMOUNTS).reduce((sum, amount) => sum + amount, 0),
    ).then((data) => (data as any).totalBudget || data)

  const getDefaultCategoryBudgets = (): Promise<Record<MainCategory, number>> =>
    apiCall('/budget/categories', { ...DEFAULT_BUDGET_AMOUNTS }).then(
      (data) => (data as any).categoryBudgets || data,
    )

  const transformBudgetRequestToCategoryData = (budgetRequest: BudgetSettingRequest) =>
    budgetRequest.mainCategoryBudgets.map((item) => ({
      categoryId: CATEGORY_ID_MAP[item.mainCategory as MainCategory],
      targetAmount: item.budgetAmount,
    }))

  async function fetchBudgetData(url: string) {
    try {
      const response = await request({ method: 'GET', url })
      return response.data
    } catch (error) {
      console.warn('예산 데이터 조회 실패:', error)
      return null
    }
  }

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

  async function setTotalBudget(
    month: string,
    totalBudget: number,
  ): Promise<BudgetSettingResponse> {
    const validation = validateTotalBudget(month, totalBudget)
    if (!validation.isValid) return { success: false, message: validation.error }

    // 로컬 저장
    updateBudgetInStore(createNewBudget(month, totalBudget), month)

    // API 호출
    for (const method of ['PUT', 'POST'] as const) {
      try {
        await request({ method, url: '/budget', data: { month, totalBudget } })
        return {
          success: true,
          message: `전체 예산이 성공적으로 ${method === 'PUT' ? '업데이트' : '생성'}되었습니다`,
        }
      } catch (error) {
        if (method === 'POST') {
          console.warn('전체 예산 서버 저장 실패:', error)
          return { success: true, message: '로컬에 예산이 저장되었습니다 (서버 연결 실패)' }
        }
      }
    }

    return { success: false, message: '예상치 못한 오류가 발생했습니다' }
  }

  const getBudgetByMonth = (month: string): MainCategoryBudgetStatus[] =>
    monthlyBudgets.value.find((b) => b.month === month)?.mainCategoryBudgets ||
    currentBudget.value?.mainCategoryBudgets ||
    []

  const updateBudgetInStore = (budget: MonthlyBudget, month: string): void => {
    if (!budget?.month) return console.warn('Invalid budget object:', budget)

    const existingIndex = monthlyBudgets.value.findIndex((b) => b?.month === month)

    existingIndex !== -1
      ? (monthlyBudgets.value[existingIndex] = budget)
      : monthlyBudgets.value.push(budget)

    if (month === getCurrentMonth()) {
      currentBudget.value = budget
      saveToStorage(STORAGE_KEYS.CURRENT_BUDGET, budget)
    }

    saveToStorage(STORAGE_KEYS.MONTHLY_BUDGETS, monthlyBudgets.value)
  }

  async function fetchBudgetsByMonth(month: string): Promise<void> {
    const data = await fetchBudgetData(`/budget`)
    if (data) {
      const budget = Array.isArray(data)
        ? createBudgetFromApiData(data, month)
        : (data as MonthlyBudget)
      updateBudgetInStore(budget, month)
    }
  }

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

  async function setBudgetForMonth(
    budgetRequest: BudgetSettingRequest,
  ): Promise<BudgetSettingResponse> {
    const validation = validateBudgetSettings(budgetRequest)
    if (!validation.isValid) return { success: false, message: validation.error }

    // 로컬 저장
    const budget = createBudgetFromSettings(budgetRequest)
    updateBudgetInStore(budget, budgetRequest.month)

    // API 호출
    const categoryData = transformBudgetRequestToCategoryData(budgetRequest)

    for (const method of ['PUT', 'POST'] as const) {
      try {
        await request({ method, url: '/budget/categories', data: categoryData })
        return {
          success: true,
          message: `카테고리별 예산이 성공적으로 ${method === 'PUT' ? '업데이트' : '생성'}되었습니다`,
          data: budget,
        }
      } catch (error) {
        if (method === 'POST') {
          console.warn('카테고리 예산 저장 실패:', error)
          return { success: false, message: '카테고리별 예산 저장에 실패했습니다' }
        }
      }
    }

    return { success: false, message: '예상치 못한 오류가 발생했습니다' }
  }

  return {
    monthlyBudgets,
    currentBudget,
    categorySpendingData,
    currentBudgetSummary,
    loading,
    setTotalBudget,
    setBudgetForMonth,
    fetchBudgetsByMonth,
    getPreviousMonthsSummary,
    getSpendingByMonth: getSpendingByMonthData,
    getBudgetByMonth,
    getDefaultTotalBudget,
    getDefaultCategoryBudgets,
    validateBudgetSettings,
    createBudgetFromSettings,
  }
})
