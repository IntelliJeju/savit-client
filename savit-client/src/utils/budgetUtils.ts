import type { MainCategory, SubCategory, SubCategorySpending, MainCategoryBudgetStatus, MonthlyBudget, BudgetSettingRequest } from '@/types/budgets'
import { CATEGORIES, CATEGORY_ORDER, DEFAULT_BUDGET_AMOUNTS } from '@/types/budgets'
import { calculateSum } from '@/utils/calculations'

// 검증 결과 타입
interface ValidationResult {
  isValid: boolean
  error?: string
}

// 공통 유틸리티 함수들
const validateMonthFormat = (month: string): boolean => {
  return Boolean(month && /^\d{4}-\d{2}$/.test(month))
}

const createTimestamps = () => {
  const now = new Date().toISOString()
  return { createdAt: now, updatedAt: now }
}

const createMainCategoryBudgets = (
  categoryAmounts: Partial<Record<MainCategory, number>> = {}
): MainCategoryBudgetStatus[] => {
  return CATEGORY_ORDER.map(category => ({
    mainCategory: category,
    budgetAmount: categoryAmounts[category] || 0,
    totalSpent: 0,
    subCategories: createSubCategorySpending(category)
  }))
}

// 메인카테고리에 속하는 서브카테고리별 지출 구조 생성
export const createSubCategorySpending = (mainCategory: MainCategory): SubCategorySpending[] => {
  return CATEGORIES.SUB[mainCategory].map(sub => ({
    subCategory: sub,
    spentAmount: 0
  }))
}


// 메인 카테고리 예산 생성
export const createMainCategoryBudgetStatus = (mainCategory: MainCategory): MainCategoryBudgetStatus => ({
  mainCategory,
  budgetAmount: DEFAULT_BUDGET_AMOUNTS[mainCategory],  
  totalSpent: 0,                               
  subCategories: createSubCategorySpending(mainCategory) 
})

// 예산 설정 요청 검증
export const validateBudgetSettings = (request: BudgetSettingRequest): ValidationResult => {
  if (!validateMonthFormat(request.month)) {
    return { isValid: false, error: '올바른 월 형식이 아닙니다 (YYYY-MM)' }
  }
  
  if (!Array.isArray(request.mainCategoryBudgets) || request.mainCategoryBudgets.length === 0) {
    return { isValid: false, error: '카테고리별 예산 데이터가 필요합니다' }
  }
  
  for (const budget of request.mainCategoryBudgets) {
    if (!CATEGORIES.MAIN.includes(budget.mainCategory as any)) {
      return { isValid: false, error: `잘못된 카테고리입니다: ${budget.mainCategory}` }
    }
    
    if (typeof budget.budgetAmount !== 'number' || budget.budgetAmount < 0) {
      return { isValid: false, error: `${budget.mainCategory} 예산 금액이 올바르지 않습니다` }
    }
  }
  
  return { isValid: true }
}

// 통합된 예산 생성 함수
const createBudget = (month: string, categoryAmounts: Partial<Record<MainCategory, number>> = {}): MonthlyBudget => {
  const mainCategoryBudgets = createMainCategoryBudgets(categoryAmounts)
  const totalBudget = calculateSum(mainCategoryBudgets, 'budgetAmount')
  
  return {
    id: `budget_${month}`,
    month,
    totalBudget,
    mainCategoryBudgets,
    ...createTimestamps()
  }
}

// 설정 데이터에서 예산 생성
export const createBudgetFromSettings = (request: BudgetSettingRequest): MonthlyBudget => {
  const categoryAmounts = request.mainCategoryBudgets.reduce((acc, budget) => {
    acc[budget.mainCategory as MainCategory] = budget.budgetAmount
    return acc
  }, {} as Partial<Record<MainCategory, number>>)
  
  return createBudget(request.month, categoryAmounts)
}

// API 데이터에서 예산 생성
export const createBudgetFromApiData = (data: any[], month: string): MonthlyBudget => {
  const categoryAmounts = data.reduce((acc, item) => {
    acc[item.mainCategory as MainCategory] = item.budgetAmount || 0
    return acc
  }, {} as Partial<Record<MainCategory, number>>)

  return createBudget(month, categoryAmounts)
}

// 검증 함수들 (통합)
export const validateTotalBudget = (month: string, totalBudget: number): ValidationResult => {
  if (!validateMonthFormat(month)) {
    return { isValid: false, error: '올바른 월 형식이 아닙니다 (YYYY-MM)' }
  }

  if (typeof totalBudget !== 'number' || totalBudget <= 0) {
    return { isValid: false, error: '올바른 예산 금액을 입력해주세요' }
  }

  return { isValid: true }
}

// 새 예산 객체 생성 (단순화)
export const createNewBudget = (month: string, totalBudget: number): MonthlyBudget => {
  return createBudget(month, {}) // 빈 카테고리 금액으로 생성
}

// 기본 카테고리 데이터 생성  
export const createDefaultCategoryData = (defaultAmounts: Record<MainCategory, number>, categoryOrder: MainCategory[]) => {
  return categoryOrder.map(category => ({
    name: category,
    percentage: 0,
    lastMonthSpent: defaultAmounts[category] || 0
  }))
}

// 기본 총 예산 계산
export const calculateDefaultTotalBudget = (defaultAmounts: Record<MainCategory, number>): number => {
  return Object.values(defaultAmounts).reduce((sum, amount) => sum + amount, 0)
}

// 지출 비율 계산 (중복 제거)
export const calculateSpendingRatio = (spent: number, budget: number): string => {
  return budget > 0 ? Math.min((spent / budget) * 100, 100).toFixed(1) : '0.0'
}