import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '@/api/useApi'
import { useCardsStore } from './cards'
import type { Transaction } from '@/types/card'
import { calculateSum } from '@/utils/calculations'
import { saveToStorage, loadFromStorage } from '@/utils/storage'

import { 
  getCurrentMonth,
  validateBudgetSettings,
  createBudgetFromSettings,
  createBudgetFromApiData,
  validateTotalBudget,
  createNewBudget
} from '@/utils/budgetUtils'

import type {
  MainCategory,
  SubCategory,
  MainCategoryBudgetStatus,
  MonthlyBudget,
  BudgetSummary,
  BudgetSettingResponse,
  MonthSummary,
  BudgetSettingRequest
} from '@/types/budgets'

import {
  CATEGORIES,
  CATEGORY_ORDER,
  CATEGORY_ID_MAP,
  STORAGE_KEYS,
  DEFAULT_BUDGET_AMOUNTS
} from '@/types/budgets'

// Re-export for components
export { DEFAULT_BUDGET_AMOUNTS, CATEGORY_ORDER } from '@/types/budgets'
export type { CategoryData, MainCategory } from '@/types/budgets'

export const useBudgetsStore = defineStore('budgets', () => {
  const { request } = useApi()
  const cardsStore = useCardsStore()
  
  const monthlyBudgets = ref<MonthlyBudget[]>(loadFromStorage<MonthlyBudget[]>(STORAGE_KEYS.MONTHLY_BUDGETS) || [])
  const currentBudget = ref<MonthlyBudget | null>(loadFromStorage<MonthlyBudget>(STORAGE_KEYS.CURRENT_BUDGET))
  const categorySpendingData = ref<Record<string, Record<SubCategory, number>>>({})

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
      isOverBudget: totalSpent > budget.totalBudget
    }
  })


  // 공통 API 호출 유틸리티
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


  async function setTotalBudget(month: string, totalBudget: number): Promise<BudgetSettingResponse> {
    const validation = validateTotalBudget(month, totalBudget)
    if (!validation.isValid) return { success: false, message: validation.error }

    // 로컬 저장
    updateBudgetInStore(createNewBudget(month, totalBudget), month)

    for (const method of ['PUT', 'POST'] as const) {
      try {
        await request({ method, url: '/budget', data: { month, totalBudget } })
        return { 
          success: true, 
          message: `전체 예산이 성공적으로 ${method === 'PUT' ? '업데이트' : '생성'}되었습니다`
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


  const updateSpendingData = (mainCategoryBudgets: MainCategoryBudgetStatus[], month: string): MainCategoryBudgetStatus[] =>
    mainCategoryBudgets.map(mainCategory => {
      const updatedSubCategories = mainCategory.subCategories.map(sub => ({
        ...sub,
        spentAmount: calculateSpentAmount(sub.subCategory, month)
      }))
      
      return {
        ...mainCategory,
        totalSpent: calculateSum(updatedSubCategories, 'spentAmount'),
        subCategories: updatedSubCategories
      }
    })

  // 카테고리별 지출 데이터 초기화
  const initializeSpendingByCategory = (): Record<SubCategory, number> =>
    Object.values(CATEGORIES.SUB).flat().reduce(
      (acc, subCategory) => ({ ...acc, [subCategory]: 0 }),
      {} as Record<SubCategory, number>
    )


  // 카드 거래 내역 수집
  function getAllTransactionsForMonth(month: string): Transaction[] {
    const allTransactions: Transaction[] = []
    const monthPrefix = month.replace('-', '')
    
    cardsStore.cardsList.forEach(card => {
      const cardTransactions = cardsStore.getTransactionsByCard(card.cardId)
      allTransactions.push(...cardTransactions)
    })
    
    return allTransactions.filter(transaction => 
      transaction.resUsedDate.startsWith(monthPrefix)
    )
  }

  // 카드 거래 내역 처리
  function processCardTransactions(
    transactions: Transaction[], 
    spendingByCategory: Record<SubCategory, number>
  ): void {
    transactions.forEach(transaction => {
      if (transaction.resCancelYN === '0') {
        const category = '기타' as SubCategory
        const amount = Number(transaction.resUsedAmount)
        spendingByCategory[category] += amount
      }
    })
  }

  const getSpendingByMonth = (month: string): Record<SubCategory, number> => {
    if (categorySpendingData.value[month]) return categorySpendingData.value[month]

    const spendingByCategory = initializeSpendingByCategory()
    
    // 카드 거래 내역으로 지출 데이터 생성
    processCardTransactions(getAllTransactionsForMonth(month), spendingByCategory)
    
    return categorySpendingData.value[month] = spendingByCategory
  }

  const calculateSpentAmount = (subCategory: SubCategory, month: string): number => 
    getSpendingByMonth(month)[subCategory] || 0

  const getBudgetByMonth = (month: string): MainCategoryBudgetStatus[] =>
    monthlyBudgets.value.find(b => b.month === month)?.mainCategoryBudgets || 
    currentBudget.value?.mainCategoryBudgets || []

  const updateBudgetInStore = (budget: MonthlyBudget, month: string): void => {
    if (!budget?.month) return console.warn('Invalid budget object:', budget)

    const existingIndex = monthlyBudgets.value.findIndex(b => b?.month === month)
    
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
    try {
      const response = await request({ method: 'GET', url: `/budget` })
      const budget = Array.isArray(response.data) 
        ? createBudgetFromApiData(response.data, month)
        : response.data as MonthlyBudget
      
      updateBudgetInStore(budget, month)
    } catch (error) {
      console.warn(`${month} 예산 데이터 조회 실패:`, error)
    }
  }

  async function initializeCurrentMonthBudget(): Promise<void> {
    const currentMonth = getCurrentMonth()
    await fetchBudgetsByMonth(currentMonth)
  }

  async function getPreviousMonthsSummary(monthsBack: number): Promise<MonthSummary> {
    const targetDate = new Date()
    targetDate.setMonth(targetDate.getMonth() - monthsBack)
    
    const monthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`
    const monthName = `${targetDate.getMonth() + 1}월`
    
    const spendingData = getSpendingByMonth(monthStr)
    const totalSpent = Object.values(spendingData).reduce((sum: number, amount: number) => sum + amount, 0)
    
    const monthBudget = monthlyBudgets.value.find(b => b.month === monthStr)
    const totalBudget = monthBudget?.totalBudget || 0
    
    return { month: monthStr, monthName, totalSpent, totalBudget }
  }

  const transformBudgetRequestToCategoryData = (budgetRequest: BudgetSettingRequest): Array<{categoryId: number, targetAmount: number}> =>
    budgetRequest.mainCategoryBudgets.map(item => ({
      categoryId: CATEGORY_ID_MAP[item.mainCategory as MainCategory],
      targetAmount: item.budgetAmount
    }))


  async function setBudgetForMonth(budgetRequest: BudgetSettingRequest): Promise<BudgetSettingResponse> {
    const validation = validateBudgetSettings(budgetRequest)
    if (!validation.isValid) return { success: false, message: validation.error }

    // 로컬 저장
    const budget = createBudgetFromSettings(budgetRequest)
    updateBudgetInStore(budget, budgetRequest.month)

    // 서버 저장 (PUT 먼저 시도)
    const categoryData = transformBudgetRequestToCategoryData(budgetRequest)
    
    for (const method of ['PUT', 'POST'] as const) {
      try {
        await request({ method, url: '/budget/categories', data: categoryData })
        return { 
          success: true, 
          message: `카테고리별 예산이 성공적으로 ${method === 'PUT' ? '업데이트' : '생성'}되었습니다`,
          data: budget
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
    setTotalBudget,
    setBudgetForMonth,
    updateSpendingData,
    initializeCurrentMonthBudget,
    getPreviousMonthsSummary,
    getSpendingByMonth,
    getBudgetByMonth,
    getDefaultTotalBudget,
    getDefaultCategoryBudgets,
    validateBudgetSettings,
    createBudgetFromSettings
  }
})