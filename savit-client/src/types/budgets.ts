export type MainCategory = '식비' | '교통' | '생활' | '문화' | '기타'

export type SubCategory = 
  | '식당' | '카페' | '배달'
  | '대중교통' | '택시' | '철도'
  | '통신비' | '공과금' | '편의점/마트' | '의료비' | '교육'
  | '공연' | '쇼핑' | '유흥' | '영화' | '정기구독'
  | '기타'

export const CATEGORIES = {
  MAIN: ['식비', '교통', '생활', '문화', '기타'] as const,
  SUB: {
    식비: ['식당', '카페', '배달'],
    교통: ['대중교통', '택시', '철도'],
    생활: ['통신비', '공과금', '편의점/마트', '의료비', '교육'],
    문화: ['공연', '쇼핑', '유흥', '영화', '정기구독'],
    기타: ['기타']
  } as const
} as const

export const CATEGORY_ORDER: MainCategory[] = [...CATEGORIES.MAIN]

export const CATEGORY_ID_MAP: Record<MainCategory, number[]> = {
  식비: [1, 2, 3],
  교통: [4, 5, 6, 17], 
  생활: [7, 8, 12, 13],
  문화: [9, 10, 11, 14, 15],
  기타: [16]
} as const

// 역방향 매핑: categoryId -> MainCategory
export const ID_TO_CATEGORY_MAP: Record<number, MainCategory> = {
  1: '식비', 2: '식비', 3: '식비',
  4: '교통', 5: '교통', 6: '교통', 17: '교통',
  7: '생활', 8: '생활', 12: '생활', 13: '생활',
  9: '문화', 10: '문화', 11: '문화', 14: '문화', 15: '문화',
  16: '기타'
} as const

export const DEFAULT_BUDGET_AMOUNTS: Record<MainCategory, number> = {
  식비: 520000,
  교통: 87000,
  생활: 600000,
  문화: 210000,
  기타: 570000
}

export const STORAGE_KEYS = {
  MONTHLY_BUDGETS: 'savit_monthly_budgets',
  CURRENT_BUDGET: 'savit_current_budget'
} as const

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