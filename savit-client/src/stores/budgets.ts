import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '@/api/useApi'
import { useCardsStore } from './cards'

export type MainCategory = '식비' | '교통' | '생활' | '문화' | '기타'
export type SubCategory = 
  | '식당' | '카페' | '배달'
  | '대중교통' | '택시'
  | '통신비' | '공과금' | '편의점/마트' | '의료비' | '교육'
  | '공연' | '쇼핑' | '유흥' | '영화' | '정기구독'
  | '기타'

export interface CategoryMapping {
  main: MainCategory
  sub: SubCategory
}

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
  
  const categoryMappings: CategoryMapping[] = [
    { main: '식비', sub: '식당' }, { main: '식비', sub: '카페' }, { main: '식비', sub: '배달' },
    { main: '교통', sub: '대중교통' }, { main: '교통', sub: '택시' },
    { main: '생활', sub: '통신비' }, { main: '생활', sub: '공과금' }, { main: '생활', sub: '편의점/마트' },
    { main: '생활', sub: '의료비' }, { main: '생활', sub: '교육' },
    { main: '문화', sub: '공연' }, { main: '문화', sub: '쇼핑' }, { main: '문화', sub: '유흥' },
    { main: '문화', sub: '영화' }, { main: '문화', sub: '정기구독' },
    { main: '기타', sub: '기타' }
  ]
  
  const getMainCategoryFromSub = (subCategory: SubCategory): MainCategory => {
    const mapping = categoryMappings.find(m => m.sub === subCategory)
    return mapping?.main || '기타'
  }
  
  const groupSubCategoriesByMain = (categoryBudgets: CategoryBudget[]): MainCategoryBudget[] => {
    const mainCategoryMap = new Map<MainCategory, CategoryBudget[]>()
    
    categoryBudgets.forEach(categoryBudget => {
      const mainCategory = getMainCategoryFromSub(categoryBudget.subCategory)
      if (!mainCategoryMap.has(mainCategory)) {
        mainCategoryMap.set(mainCategory, [])
      }
      mainCategoryMap.get(mainCategory)!.push(categoryBudget)
    })
    
    const mainCategoryBudgets: MainCategoryBudget[] = []
    mainCategoryMap.forEach((subCategories, mainCategory) => {
      const totalBudget = subCategories.reduce((sum, cat) => sum + cat.budgetAmount, 0)
      const totalSpent = subCategories.reduce((sum, cat) => sum + cat.spentAmount, 0)
      
      mainCategoryBudgets.push({
        mainCategory,
        totalBudget,
        totalSpent,
        subCategories
      })
    })
    
    const categoryOrder: MainCategory[] = ['식비', '교통', '생활', '문화', '기타']
    return mainCategoryBudgets.sort((a, b) => {
      return categoryOrder.indexOf(a.mainCategory) - categoryOrder.indexOf(b.mainCategory)
    })
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
    const totalSpent = categoryBudgets.reduce((sum, cat) => sum + cat.spentAmount, 0)
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
      console.error(`${month} 카테고리별 지출 조회 실패:`, error)
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
        const totalBudget = categoryBudgets.reduce((sum: number, cat: CategoryBudget) => sum + cat.budgetAmount, 0)
        
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
      console.error(`${month} 예산 조회 실패:`, error)
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
    categoryMappings,
    dummyBudgetData,
    dummyCategorySpending,
    getMainCategoryFromSub,
    groupSubCategoriesByMain,
    initializeCurrentMonthBudget,
    loadTestData
  }
})