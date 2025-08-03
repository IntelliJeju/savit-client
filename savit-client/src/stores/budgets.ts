import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '@/api/useApi'
import { useCardsStore } from './cards'
import { 
  type MainCategory, 
  type SubCategory,
  CATEGORY_MAPPINGS,
  CATEGORY_ORDER,
  getMainCategoryFromSub
} from '@/constants/categories'
import { calculateSum, groupBy } from '@/utils/calculations'
import { logger } from '@/utils/logger'

interface CategoryBudget {
  mainCategory: MainCategory
  subCategory: SubCategory
  budgetAmount: number
  spentAmount: number
}

export interface MainCategoryBudget {
  mainCategory: MainCategory
  totalBudget: number
  totalSpent: number
  subCategories: CategoryBudget[]
}

interface MonthlyBudget {
  id: string
  month: string
  totalBudget: number
  categoryBudgets: CategoryBudget[]
  createdAt: string
  updatedAt: string
}

interface BudgetSummary {
  totalBudget: number
  totalSpent: number
  remainingBudget: number
  spendingRatio: number
  categoryBudgets: CategoryBudget[]
  mainCategoryBudgets: MainCategoryBudget[]
  isOverBudget: boolean
}

export const useBudgetsStore = defineStore('budgets', () => {
  const { request } = useApi()
  const cardsStore = useCardsStore()
  
  const monthlyBudgets = ref<MonthlyBudget[]>([])
  const currentBudget = ref<MonthlyBudget | null>(null)
  const categorySpendingData = ref<Record<string, Record<SubCategory, number>>>({})
  
  const dummyBudgetData: MonthlyBudget = {
    id: 'budget_test_2025_08',
    month: '2025-08',
    totalBudget: 1890000,
    categoryBudgets: [
      { mainCategory: '식비', subCategory: '식당', budgetAmount: 300000, spentAmount: 0 },
      { mainCategory: '식비', subCategory: '카페', budgetAmount: 150000, spentAmount: 0 },
      { mainCategory: '식비', subCategory: '배달', budgetAmount: 200000, spentAmount: 0 },
      { mainCategory: '교통', subCategory: '대중교통', budgetAmount: 100000, spentAmount: 0 },
      { mainCategory: '교통', subCategory: '택시', budgetAmount: 80000, spentAmount: 0 },
      { mainCategory: '생활', subCategory: '통신비', budgetAmount: 120000, spentAmount: 0 },
      { mainCategory: '생활', subCategory: '공과금', budgetAmount: 150000, spentAmount: 0 },
      { mainCategory: '생활', subCategory: '편의점/마트', budgetAmount: 180000, spentAmount: 0 },
      { mainCategory: '생활', subCategory: '의료비', budgetAmount: 200000, spentAmount: 0 },
      { mainCategory: '생활', subCategory: '교육', budgetAmount: 200000, spentAmount: 0 },
      { mainCategory: '문화', subCategory: '공연', budgetAmount: 100000, spentAmount: 0 },
      { mainCategory: '문화', subCategory: '쇼핑', budgetAmount: 250000, spentAmount: 0 },
      { mainCategory: '문화', subCategory: '유흥', budgetAmount: 120000, spentAmount: 0 },
      { mainCategory: '문화', subCategory: '영화', budgetAmount: 80000, spentAmount: 0 },
      { mainCategory: '문화', subCategory: '정기구독', budgetAmount: 70000, spentAmount: 0 },
      { mainCategory: '기타', subCategory: '기타', budgetAmount: 100000, spentAmount: 0 }
    ],
    createdAt: '2025-08-01T00:00:00.000Z',
    updatedAt: '2025-08-01T00:00:00.000Z'
  }
  
  const dummyCategorySpending: Record<SubCategory, number> = {
    '식당': 285000, '카페': 95000, '배달': 145000,
    '대중교통': 75000, '택시': 45000,
    '통신비': 120000, '공과금': 135000, '편의점/마트': 165000, '의료비': 180000, '교육': 250000,
    '공연': 85000, '쇼핑': 320000, '유흥': 95000, '영화': 65000, '정기구독': 16000,
    '기타': 75000
  }
  
  
  const groupSubCategoriesByMain = (categoryBudgets: CategoryBudget[]): MainCategoryBudget[] => {
    const groupedByMain = groupBy(categoryBudgets, 'mainCategory')
    
    const mainCategoryBudgets: MainCategoryBudget[] = Object.entries(groupedByMain).map(([mainCategory, subCategories]) => ({
      mainCategory: mainCategory as MainCategory,
      totalBudget: calculateSum(subCategories, 'budgetAmount'),
      totalSpent: calculateSum(subCategories, 'spentAmount'),
      subCategories
    }))
    
    return mainCategoryBudgets.sort((a, b) => 
      CATEGORY_ORDER.indexOf(a.mainCategory) - CATEGORY_ORDER.indexOf(b.mainCategory)
    )
  }
  
  const calculateSpentAmount = (subCategory: SubCategory, month: string): number => {
    const monthData = categorySpendingData.value[month]
    if (monthData?.[subCategory]) return monthData[subCategory]
    
    return cardsStore.currentMonthUsage
      .filter(usage => usage.category === subCategory && usage.date.startsWith(month))
      .reduce((sum, usage) => sum + usage.amount, 0)
  }
  
  const currentBudgetSummary = computed((): BudgetSummary | null => {
    if (!currentBudget.value) return null
    
    const budget = currentBudget.value
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    const categoryBudgets = budget.categoryBudgets.map(categoryBudget => {
      const spentAmount = calculateSpentAmount(categoryBudget.subCategory, currentMonth)
      return { ...categoryBudget, spentAmount }
    })
    
    const mainCategoryBudgets = groupSubCategoriesByMain(categoryBudgets)
    const totalSpent = calculateSum(categoryBudgets, 'spentAmount')
    const remainingBudget = budget.totalBudget - totalSpent
    const spendingRatio = budget.totalBudget > 0 ? (totalSpent / budget.totalBudget) * 100 : 0
    
    return {
      totalBudget: budget.totalBudget,
      totalSpent,
      remainingBudget,
      spendingRatio,
      categoryBudgets,
      mainCategoryBudgets,
      isOverBudget: totalSpent > budget.totalBudget
    }
  })
  
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
      
      let budget: MonthlyBudget
      if (Array.isArray(response.data)) {
        const categoryBudgets = response.data.map((item: any) => ({
          mainCategory: getMainCategoryFromSub(item.subCategory as SubCategory),
          subCategory: item.subCategory as SubCategory,
          budgetAmount: item.budgetAmount || 0,
          spentAmount: item.spentAmount || 0
        }))
        const totalBudget = calculateSum(categoryBudgets, 'budgetAmount')
        
        budget = {
          id: `budget_${month}`,
          month,
          totalBudget,
          categoryBudgets,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      } else {
        budget = response.data as MonthlyBudget
      }
      
      const existingIndex = monthlyBudgets.value.findIndex(b => b.month === month)
      if (existingIndex !== -1) {
        monthlyBudgets.value[existingIndex] = budget
      } else {
        monthlyBudgets.value.push(budget)
      }
      
      if (month === new Date().toISOString().slice(0, 7)) {
        currentBudget.value = budget
      }
    } catch (error) {
      logger.apiError('GET', `/budgets/${month}`, error)
      if (month === '2025-08') {
        monthlyBudgets.value.push(dummyBudgetData)
        if (month === new Date().toISOString().slice(0, 7)) {
          currentBudget.value = dummyBudgetData
        }
      }
    }
  }

  const initializeCurrentMonthBudget = async (): Promise<void> => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    await Promise.all([
      fetchBudgetsByMonth(currentMonth),
      fetchCategorySpending(currentMonth)
    ])
  }
  
  const loadTestData = async (): Promise<void> => {
    monthlyBudgets.value = [dummyBudgetData]
    currentBudget.value = dummyBudgetData
    categorySpendingData.value['2025-08'] = dummyCategorySpending
  }

  return {
    monthlyBudgets,
    currentBudget,
    currentBudgetSummary,
    categoryMappings: CATEGORY_MAPPINGS,
    dummyBudgetData,
    dummyCategorySpending,
    getMainCategoryFromSub,
    groupSubCategoriesByMain,
    initializeCurrentMonthBudget,
    loadTestData
  }
})