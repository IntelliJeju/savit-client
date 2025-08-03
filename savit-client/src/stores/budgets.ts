import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '@/api/useApi'
import { useCardsStore } from './cards'
import { calculateSum } from '@/utils/calculations'
import { logger } from '@/utils/logger'

import type { 
  MainCategory, 
  SubCategory, 
  MonthlyBudget, 
  BudgetSummary, 
  BudgetSettingRequest, 
  BudgetSettingResponse,
  MainCategoryBudget,
  MonthSummary
} from '@/types/budgets'

import { STORAGE_KEYS, DUMMY_SPENDING_DATA, BUDGET_AMOUNTS } from '@/constants/budgets'

import { 
  CATEGORY_MAPPINGS,
  getMainCategoryFromSub,
  getCurrentMonth,
  createDummyBudgetData,
  validateBudgetSettings,
  createBudgetFromSettings,
  createBudgetFromApiData,
  validateTotalBudget,
  createNewBudget
} from '@/utils/budgetUtils'
import { saveToStorage, loadFromStorage } from '@/utils/storage'

export type { MainCategory, SubCategory, MonthlyBudget, BudgetSummary, BudgetSettingRequest, BudgetSettingResponse, MainCategoryBudget }

export const useBudgetsStore = defineStore('budgets', () => {
  const { request } = useApi()
  const cardsStore = useCardsStore()
  
  const monthlyBudgets = ref<MonthlyBudget[]>(loadFromStorage<MonthlyBudget[]>(STORAGE_KEYS.MONTHLY_BUDGETS) || [])
  const currentBudget = ref<MonthlyBudget | null>(loadFromStorage<MonthlyBudget>(STORAGE_KEYS.CURRENT_BUDGET))
  const categorySpendingData = ref<Record<string, Record<SubCategory, number>>>({})
  
  // 테스트용 더미 데이터
  const dummyBudgetData = createDummyBudgetData()
  const dummyCategorySpending = DUMMY_SPENDING_DATA.current
  const dummyPrevMonthSpending = DUMMY_SPENDING_DATA.prevMonth
  const dummyPrevPrevMonthSpending = DUMMY_SPENDING_DATA.prevPrevMonth

  const currentBudgetSummary = computed((): BudgetSummary | null => {
    if (!currentBudget.value) return null
    
    const budget = currentBudget.value
    const currentMonth = getCurrentMonth()
    const mainCategoryBudgets = updateSpendingData(budget.mainCategoryBudgets, currentMonth)
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

  const makeApiCall = async (config: any, fallbackResponse?: any) => {
    try {
      return await request(config)
    } catch (error) {
      logger.apiError(config.method, config.url, error)
      return fallbackResponse || { success: true }
    }
  }

  const setBudgetForMonth = async (budgetRequest: BudgetSettingRequest): Promise<BudgetSettingResponse> => {
    const validation = validateBudgetSettings(budgetRequest)
    if (!validation.isValid) {
      return { success: false, message: validation.error }
    }
    
    try {
      const response = await makeApiCall({
        method: 'POST',
        url: '/budgets/set',
        data: budgetRequest
      })
      
      if (response.success) {
        const newBudget = createBudgetFromSettings(budgetRequest)
        updateBudgetInStore(newBudget, budgetRequest.month)
        return { success: true, data: newBudget }
      }
      
      return response
    } catch (error) {
      logger.apiError('POST', '/budgets/set', error)
      return { success: false, message: '예산 설정 중 오류가 발생했습니다' }
    }
  }

  const setTotalBudget = async (month: string, totalBudget: number): Promise<BudgetSettingResponse> => {
    const validation = validateTotalBudget(month, totalBudget)
    if (!validation.isValid) {
      return { success: false, message: validation.error }
    }

    try {
      const response = await makeApiCall({
        method: 'POST',
        url: '/budgets/total',
        data: { month, totalBudget }
      })
      
      if (response.success) {
        updateOrCreateTotalBudget(month, totalBudget)
        return { success: true, message: '전체 예산이 성공적으로 설정되었습니다' }
      }
      
      return response
    } catch (error) {
      logger.apiError('POST', '/budgets/total', error)
      return { success: false, message: '전체 예산 설정 중 오류가 발생했습니다' }
    }
  }

  const updateOrCreateTotalBudget = (month: string, totalBudget: number) => {
    const existingIndex = monthlyBudgets.value.findIndex(b => b?.month === month)
    
    if (existingIndex !== -1) {
      monthlyBudgets.value[existingIndex].totalBudget = totalBudget
      monthlyBudgets.value[existingIndex].updatedAt = new Date().toISOString()
      
      if (month === getCurrentMonth()) {
        currentBudget.value = monthlyBudgets.value[existingIndex]
        saveToStorage(STORAGE_KEYS.CURRENT_BUDGET, currentBudget.value)
      }
    } else {
      const newBudget = createNewBudget(month, totalBudget)
      monthlyBudgets.value.push(newBudget)
      
      if (month === getCurrentMonth()) {
        currentBudget.value = newBudget
        saveToStorage(STORAGE_KEYS.CURRENT_BUDGET, currentBudget.value)
      }
    }
    
    saveToStorage(STORAGE_KEYS.MONTHLY_BUDGETS, monthlyBudgets.value)
  }

  const updateSpendingData = (mainCategoryBudgets: MainCategoryBudget[], month: string): MainCategoryBudget[] => {
    return mainCategoryBudgets.map(mainCategory => {
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
  }

  const calculateSpentAmount = (subCategory: SubCategory, month: string): number => {
    const monthData = categorySpendingData.value[month]
    if (monthData?.[subCategory]) return monthData[subCategory]
   
    return cardsStore.currentMonthUsage
      .filter(usage => usage.category === subCategory && usage.date.startsWith(month))
      .reduce((sum, usage) => sum + usage.amount, 0)
  }

  const updateBudgetInStore = (budget: MonthlyBudget, month: string): void => {
    if (!budget?.month) {
      console.warn('Invalid budget object:', budget)
      return
    }

    monthlyBudgets.value = monthlyBudgets.value.filter(b => b?.month)
    
    const existingIndex = monthlyBudgets.value.findIndex(b => b.month === month)
    if (existingIndex !== -1) {
      monthlyBudgets.value[existingIndex] = budget
    } else {
      monthlyBudgets.value.push(budget)
    }
    
    if (month === getCurrentMonth()) {
      currentBudget.value = budget
      saveToStorage(STORAGE_KEYS.CURRENT_BUDGET, budget)
    }
    
    saveToStorage(STORAGE_KEYS.MONTHLY_BUDGETS, monthlyBudgets.value)
  }

  const fetchCategorySpending = async (month: string): Promise<void> => {
    try {
      const response = await request({
        method: 'GET',
        url: `/spending/categories/${month}`
      })
      categorySpendingData.value[month] = response.data
    } catch (error) {
      logger.apiError('GET', `/spending/categories/${month}`, error)
      if (month === '2025-08') {
        categorySpendingData.value[month] = dummyCategorySpending
      }
    }
  }

  const fetchBudgetsByMonth = async (month: string): Promise<void> => {
    try {
      const response = await request({
        method: 'GET',
        url: `/budgets/${month}`
      })

      const budget = Array.isArray(response.data) 
        ? createBudgetFromApiData(response.data, month)  
        : response.data as MonthlyBudget                 
      
      updateBudgetInStore(budget, month)
    } catch (error) {
      logger.apiError('GET', `/budgets/${month}`, error)
      if (month === '2025-08') {
        updateBudgetInStore(dummyBudgetData, month)
      }
    }
  }

  const initializeCurrentMonthBudget = async (): Promise<void> => {
    const currentMonth = getCurrentMonth()
    await Promise.all([
      fetchBudgetsByMonth(currentMonth),
      fetchCategorySpending(currentMonth)
    ])
  }

  const loadTestData = async (): Promise<void> => {
    monthlyBudgets.value = dummyBudgetData ? [dummyBudgetData] : []
    currentBudget.value = dummyBudgetData
    categorySpendingData.value['2025-08'] = dummyCategorySpending
  }

  const getPreviousMonthsSummary = (monthsBack: number): MonthSummary => {
    const now = new Date()
    const targetDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1)
    const monthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`
    const monthName = `${targetDate.getMonth() + 1}월`
    
    const spendingData = monthsBack === 1 
      ? dummyPrevMonthSpending 
      : monthsBack === 2 
        ? dummyPrevPrevMonthSpending 
        : {} as Record<SubCategory, number>
    
    const totalSpent = Object.values(spendingData).reduce((sum, amount) => sum + amount, 0)
    const totalBudget = Object.values(BUDGET_AMOUNTS).reduce((sum, amount) => sum + amount, 0)
    
    return { month: monthStr, monthName, totalSpent, totalBudget }
  }

  return {
    monthlyBudgets,
    currentBudget,
    categorySpendingData,
    currentBudgetSummary,
    categoryMappings: CATEGORY_MAPPINGS,
    getMainCategoryFromSub,

    dummyBudgetData,
    dummyCategorySpending,
    dummyPrevMonthSpending,
    dummyPrevPrevMonthSpending,
    
    setBudgetForMonth,
    setTotalBudget,
    updateSpendingData,
    initializeCurrentMonthBudget,
    loadTestData,
    getPreviousMonthsSummary,
    
    validateBudgetSettings,
    createBudgetFromSettings
  }
})