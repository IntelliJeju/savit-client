import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { calculateSum } from '@/utils/calculations'
import { saveToStorage, loadFromStorage } from '@/utils/storage'
import { useBudgetApi } from '@/composables/useBudgetApi'
import { useBudgetDataProcessor } from '@/composables/useBudgetDataProcessor'

import { 
  getCurrentMonth,
  validateBudgetSettings,
  createBudgetFromSettings,
  createBudgetFromApiData,
  createNewBudget
} from '@/utils/budgetUtils'

import type {
  SubCategory,
  MainCategoryBudgetStatus,
  MonthlyBudget,
  BudgetSummary,
  BudgetSettingResponse,
  MonthSummary,
  BudgetSettingRequest
} from '@/types/budgets'

import {
  STORAGE_KEYS
} from '@/types/budgets'

// Re-export for components
export { DEFAULT_BUDGET_AMOUNTS, CATEGORY_ORDER } from '@/types/budgets'
export type { CategoryData, MainCategory } from '@/types/budgets'

export const useBudgetsStore = defineStore('budgets', () => {
  const { getDefaultTotalBudget, getDefaultCategoryBudgets, setTotalBudget: apiSetTotalBudget, setBudgetCategories, fetchBudgetData } = useBudgetApi()
  const { getSpendingByMonth, updateSpendingData } = useBudgetDataProcessor()
  
  const monthlyBudgets = ref<MonthlyBudget[]>(loadFromStorage<MonthlyBudget[]>(STORAGE_KEYS.MONTHLY_BUDGETS) || [])
  const currentBudget = ref<MonthlyBudget | null>(loadFromStorage<MonthlyBudget>(STORAGE_KEYS.CURRENT_BUDGET))
  const categorySpendingData = ref<Record<string, Record<SubCategory, number>>>({})

  const currentBudgetSummary = computed((): BudgetSummary | null => {
    if (!currentBudget.value) return null
    
    const budget = currentBudget.value
    const mainCategoryBudgets = updateSpendingData(budget.mainCategoryBudgets, getCurrentMonth(), categorySpendingData.value)
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


  async function setTotalBudget(month: string, totalBudget: number): Promise<BudgetSettingResponse> {
    // 로컬 저장
    updateBudgetInStore(createNewBudget(month, totalBudget), month)
    // API 호출
    return await apiSetTotalBudget(month, totalBudget)
  }

  const getBudgetByMonth = (month: string): MainCategoryBudgetStatus[] =>
    monthlyBudgets.value.find(b => b.month === month)?.mainCategoryBudgets || 
    currentBudget.value?.mainCategoryBudgets || []

  const getSpendingByMonthData = (month: string): Record<SubCategory, number> => 
    getSpendingByMonth(month, categorySpendingData.value)

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
    const data = await fetchBudgetData(`/budget`)
    if (data) {
      const budget = Array.isArray(data) 
        ? createBudgetFromApiData(data, month)
        : data as MonthlyBudget
      updateBudgetInStore(budget, month)
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
    
    const spendingData = getSpendingByMonthData(monthStr)
    const totalSpent = Object.values(spendingData).reduce((sum: number, amount: number) => sum + amount, 0)
    
    const monthBudget = monthlyBudgets.value.find(b => b.month === monthStr)
    const totalBudget = monthBudget?.totalBudget || 0
    
    return { month: monthStr, monthName, totalSpent, totalBudget }
  }

  async function setBudgetForMonth(budgetRequest: BudgetSettingRequest): Promise<BudgetSettingResponse> {
    // 로컬 저장
    const budget = createBudgetFromSettings(budgetRequest)
    updateBudgetInStore(budget, budgetRequest.month)

    // API 호출
    const result = await setBudgetCategories(budgetRequest)
    if (result.success) {
      return { ...result, data: budget }
    }
    return result
  }


  return {
    monthlyBudgets,
    currentBudget,
    categorySpendingData,
    currentBudgetSummary,
    setTotalBudget,
    setBudgetForMonth,
    initializeCurrentMonthBudget,
    getPreviousMonthsSummary,
    getSpendingByMonth: getSpendingByMonthData,
    getBudgetByMonth,
    getDefaultTotalBudget,
    getDefaultCategoryBudgets,
    validateBudgetSettings,
    createBudgetFromSettings
  }
})