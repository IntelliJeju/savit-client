import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '@/api/useApi'
import { useCardsStore } from './cards'
import { calculateSum } from '@/utils/calculations'

import { 
  getCurrentMonth,
  validateBudgetSettings,
  createBudgetFromSettings,
  createBudgetFromApiData,
  validateTotalBudget,
  createNewBudget
} from '@/utils/budgetUtils'

import { saveToStorage, loadFromStorage } from '@/utils/storage'

export type MainCategory = '식비' | '교통' | '생활' | '문화' | '기타'

export type SubCategory = 
  | '식당' | '카페' | '배달'
  | '대중교통' | '택시'
  | '통신비' | '공과금' | '편의점/마트' | '의료비' | '교육'
  | '공연' | '쇼핑' | '유흥' | '영화' | '정기구독'
  | '기타'

export const CATEGORIES = {
  MAIN: ['식비', '교통', '생활', '문화', '기타'] as const,
  SUB: {
    식비: ['식당', '카페', '배달'],
    교통: ['대중교통', '택시'],
    생활: ['통신비', '공과금', '편의점/마트', '의료비', '교육'],
    문화: ['공연', '쇼핑', '유흥', '영화', '정기구독'],
    기타: ['기타']
  } as const
} as const

export const CATEGORY_ORDER: MainCategory[] = [...CATEGORIES.MAIN]

export const STORAGE_KEYS = {
  MONTHLY_BUDGETS: 'savit_monthly_budgets',
  CURRENT_BUDGET: 'savit_current_budget'
} as const

export const DEFAULT_BUDGET_AMOUNTS: Record<MainCategory, number> = {
  식비: 400000,
  교통: 100000,
  생활: 300000,
  문화: 150000,
  기타: 50000
}

export interface SubCategorySpending {
  subCategory: SubCategory  
  spentAmount: number       
}

export interface MainCategoryBudgetStatus {
  mainCategory: MainCategory              
  budgetAmount: number                   
  totalSpent: number                      
  subCategories: SubCategorySpending[]    
}

export interface MonthlyBudget {
  id: string                                
  month: string                             
  totalBudget: number                       
  mainCategoryBudgets: MainCategoryBudgetStatus[] 
  createdAt: string                         
  updatedAt: string                         
}

export interface BudgetSummary {
  totalBudget: number                       
  totalSpent: number                        
  remainingBudget: number                   
  spendingRatio: number                     
  mainCategoryBudgets: MainCategoryBudgetStatus[] 
  isOverBudget: boolean                     
}

export interface BudgetSettingResponse {
  success: boolean                         
  message?: string                          
  data?: MonthlyBudget                      
}

export interface MonthSummary {
  month: string
  monthName: string
  totalSpent: number
  totalBudget: number
}

export interface CategoryData {
  name: MainCategory
  percentage: number
  lastMonthSpent: number
}

export interface SliderValues {
  newValue: number
  oldValue: number
  difference: number
}

export type AdjustmentOperation = 'increase' | 'decrease'

export interface BudgetSettingRequest {
  month: string
  mainCategoryBudgets: {
    mainCategory: MainCategory
    budgetAmount: number
  }[]
}

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


  async function getDefaultTotalBudget(): Promise<number> {
    try {
      const response = await request({ method: 'GET', url: '/budget/all' })
      return response.data.totalBudget
    } catch (error) {
      return Object.values(DEFAULT_BUDGET_AMOUNTS).reduce((sum, amount) => sum + amount, 0)
    }
  }

  async function getDefaultCategoryBudgets(): Promise<Record<MainCategory, number>> {
    try {
      const response = await request({ method: 'GET', url: '/budget/categories/list' })
      return response.data.categoryBudgets
    } catch (error) {
      return { ...DEFAULT_BUDGET_AMOUNTS }
    }
  }

  async function setTotalBudget(month: string, totalBudget: number): Promise<BudgetSettingResponse> {
    const validation = validateTotalBudget(month, totalBudget)
    if (!validation.isValid) {
      return { success: false, message: validation.error }
    }

    // 일단 로컬에 저장
    const targetBudget = createNewBudget(month, totalBudget)
    updateBudgetInStore(targetBudget, month)

    try {
      // 네트워크 요청 시도
      await request({
        method: 'POST',
        url: '/budget/all',
        data: { month, totalBudget }
      })
      
      return { success: true, message: '전체 예산이 성공적으로 설정되었습니다' }
    } catch (error) {
      // 네트워크 오류가 발생해도 로컬 저장은 성공했으므로 success를 true로 반환
      console.warn('서버 연결 실패, 로컬에만 저장됨:', error)
      return { success: true, message: '로컬에 예산이 저장되었습니다' }
    }
  }


  function updateSpendingData(mainCategoryBudgets: MainCategoryBudgetStatus[], month: string): MainCategoryBudgetStatus[] {
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

  function getSpendingByMonth(month: string): Record<SubCategory, number> {
    const monthData = categorySpendingData.value[month]
    if (monthData) return monthData

    const spendingByCategory = {} as Record<SubCategory, number>
    Object.values(CATEGORIES.SUB).flat().forEach(subCategory => {
      spendingByCategory[subCategory as SubCategory] = 0
    })
    
    cardsStore.currentMonthUsage
      .filter(usage => usage.date.startsWith(month))
      .forEach(usage => {
        const category = usage.category as SubCategory
        if (Object.values(CATEGORIES.SUB).flat().includes(category)) {
          spendingByCategory[category] += usage.amount
        }
      })
    
    return spendingByCategory
  }

  function calculateSpentAmount(subCategory: SubCategory, month: string): number {
    return getSpendingByMonth(month)[subCategory] || 0
  }

  function getBudgetByMonth(month: string): MainCategoryBudgetStatus[] {
    const monthBudget = monthlyBudgets.value.find(b => b.month === month)
    return monthBudget ? monthBudget.mainCategoryBudgets : currentBudget.value?.mainCategoryBudgets || []
  }

  function updateBudgetInStore(budget: MonthlyBudget, month: string): void {
    if (!budget?.month) {
      console.warn('Invalid budget object:', budget)
      return
    }

    const existingIndex = monthlyBudgets.value.findIndex(b => b?.month === month)
    const isCurrentMonth = month === getCurrentMonth()
    
    if (existingIndex !== -1) {
      monthlyBudgets.value[existingIndex] = budget
    } else {
      monthlyBudgets.value.push(budget)
    }
    
    if (isCurrentMonth) {
      currentBudget.value = budget
      saveToStorage(STORAGE_KEYS.CURRENT_BUDGET, budget)
    }
    
    saveToStorage(STORAGE_KEYS.MONTHLY_BUDGETS, monthlyBudgets.value)
  }

  async function fetchCategorySpending(month: string): Promise<void> {
    try {
      const response = await request({ method: 'GET', url: `/cards/${month}` })
      categorySpendingData.value[month] = response.data
    } catch (error) {
    }
  }

  async function fetchBudgetsByMonth(month: string): Promise<void> {
    try {
      const response = await request({ method: 'GET', url: `/budget/${month}` })
      const budget = Array.isArray(response.data) 
        ? createBudgetFromApiData(response.data, month)
        : response.data as MonthlyBudget
      
      updateBudgetInStore(budget, month)
    } catch (error) {
    }
  }

  async function initializeCurrentMonthBudget(): Promise<void> {
    const currentMonth = getCurrentMonth()
    await Promise.all([
      fetchBudgetsByMonth(currentMonth),
      fetchCategorySpending(currentMonth)
    ])
  }

  async function getPreviousMonthsSummary(monthsBack: number): Promise<MonthSummary> {
    const targetDate = new Date()
    targetDate.setMonth(targetDate.getMonth() - monthsBack)
    
    const monthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`
    const monthName = `${targetDate.getMonth() + 1}월`
    
    const spendingData = getSpendingByMonth(monthStr)
    const totalSpent = Object.values(spendingData).reduce((sum, amount) => sum + amount, 0)
    
    const monthBudget = monthlyBudgets.value.find(b => b.month === monthStr)
    const totalBudget = monthBudget?.totalBudget || await getDefaultTotalBudget()
    
    return { month: monthStr, monthName, totalSpent, totalBudget }
  }

  async function setBudgetForMonth(budgetRequest: BudgetSettingRequest): Promise<BudgetSettingResponse> {
    const validation = validateBudgetSettings(budgetRequest)
    if (!validation.isValid) {
      return { success: false, message: validation.error }
    }

    // 일단 로컬에 저장
    const budget = createBudgetFromSettings(budgetRequest)
    updateBudgetInStore(budget, budgetRequest.month)

    try {
      // 네트워크 요청 시도
      await request({
        method: 'POST',
        url: '/budget/categories/list',
        data: budgetRequest
      })
      
      return { success: true, message: '카테고리별 예산이 성공적으로 설정되었습니다', data: budget }
    } catch (error) {
      // 네트워크 오류가 발생해도 로컬 저장은 성공했으므로 success를 true로 반환
      console.warn('서버 연결 실패, 로컬에만 저장됨:', error)
      return { success: true, message: '로컬에 카테고리별 예산이 저장되었습니다', data: budget }
    }
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