import type { MainCategory, SubCategory, SubCategorySpending, MainCategoryBudgetStatus, MonthlyBudget, BudgetSettingRequest } from '@/stores/budgets'
import { CATEGORIES, CATEGORY_ORDER, DEFAULT_BUDGET_AMOUNTS } from '@/stores/budgets'
import { calculateSum } from '@/utils/calculations'

// 검증 결과 타입
interface ValidationResult {
  isValid: boolean
  error?: string
}

// 서브카테고리 배열 가져오기
export const getSubCategoriesByMain = (mainCategory: MainCategory): SubCategory[] => {
  return [...CATEGORIES.SUB[mainCategory]]
}

// 메인카테고리에 속하는 서브카테고리별 지출 구조 생성
export const createSubCategorySpending = (mainCategory: MainCategory): SubCategorySpending[] => {
  return getSubCategoriesByMain(mainCategory).map(sub => ({
    subCategory: sub,
    spentAmount: 0
  }))
}

export const getCurrentMonth = (): string => new Date().toISOString().slice(0, 7)

// 메인 카테고리 예산 생성
export const createMainCategoryBudgetStatus = (mainCategory: MainCategory): MainCategoryBudgetStatus => ({
  mainCategory,
  budgetAmount: DEFAULT_BUDGET_AMOUNTS[mainCategory],  
  totalSpent: 0,                               
  subCategories: createSubCategorySpending(mainCategory) 
})

// 예산 설정 요청 검증
export const validateBudgetSettings = (request: BudgetSettingRequest): ValidationResult => {
  if (!request.month || !/^\d{4}-\d{2}$/.test(request.month)) {
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

// 설정 데이터에서 예산 생성
export const createBudgetFromSettings = (request: BudgetSettingRequest): MonthlyBudget => {
  const mainCategoryBudgets = CATEGORY_ORDER.map(mainCategory => {
    const categoryBudget = request.mainCategoryBudgets.find(b => b.mainCategory === mainCategory)
    
    return {
      mainCategory,
      budgetAmount: categoryBudget?.budgetAmount || 0,
      totalSpent: 0,
      subCategories: createSubCategorySpending(mainCategory)
    }
  })
  
  const totalBudget = calculateSum(mainCategoryBudgets, 'budgetAmount')
  
  return {
    id: `budget_${request.month}`,
    month: request.month,
    totalBudget,
    mainCategoryBudgets,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// api 데이터에서 예산 생성
export const createBudgetFromApiData = (data: any[], month: string): MonthlyBudget => {
  const mainCategoryBudgets = data.map((item: any) => ({
    mainCategory: item.mainCategory as MainCategory,
    budgetAmount: item.budgetAmount || 0,
    totalSpent: 0,
    subCategories: createSubCategorySpending(item.mainCategory)
  }))

  const totalBudget = calculateSum(mainCategoryBudgets, 'budgetAmount')
  
  return {
    id: `budget_${month}`,
    month,
    totalBudget,
    mainCategoryBudgets,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}


// 총 예산만 설정하는 함수용 검증

export const validateTotalBudget = (month: string, totalBudget: number): ValidationResult => {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return { isValid: false, error: '올바른 월 형식이 아닙니다 (YYYY-MM)' }
  }

  if (typeof totalBudget !== 'number' || totalBudget <= 0) {
    return { isValid: false, error: '올바른 예산 금액을 입력해주세요' }
  }

  return { isValid: true }
}

// 새 예산 객체 생성
export const createNewBudget = (month: string, totalBudget: number): MonthlyBudget => {
  return {
    id: `budget_${month}`,
    month,
    totalBudget,
    mainCategoryBudgets: CATEGORY_ORDER.map(category => ({
      mainCategory: category,
      budgetAmount: 0,
      totalSpent: 0,
      subCategories: createSubCategorySpending(category)
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
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