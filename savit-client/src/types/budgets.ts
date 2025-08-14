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

export const CATEGORY_ID_MAP: Record<MainCategory, number> = {
  식비: 1,
  교통: 2, 
  생활: 3,
  문화: 4,
  기타: 5
} as const

export const DEFAULT_BUDGET_AMOUNTS: Record<MainCategory, number> = {
  식비: 400000,
  교통: 100000,
  생활: 300000,
  문화: 150000,
  기타: 50000
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