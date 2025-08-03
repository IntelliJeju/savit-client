/**
 * Budget Utility Functions
 * 예산 관리에 필요한 유틸리티 함수들
 */

import type { MainCategory, SubCategory, CategoryMapping, SubCategorySpending, MainCategoryBudget, MonthlyBudget, BudgetSettingRequest, ValidationResult } from '@/types/budgets'
import { CATEGORIES, CATEGORY_ORDER, BUDGET_AMOUNTS } from '@/constants/budgets'
import { calculateSum } from '@/utils/calculations'

/**
 * 카테고리 매핑 관계
 * CATEGORIES.SUB 구조로부터 자동으로 생성되는 메인-서브 카테고리 매핑 배열
 */
export const CATEGORY_MAPPINGS: CategoryMapping[] = Object.entries(CATEGORIES.SUB)
  .flatMap(([main, subs]) => 
    subs.map(sub => ({ main: main as MainCategory, sub }))
  )

/**
 * 서브카테고리로부터 메인카테고리 찾기
 */
export const getMainCategoryFromSub = (subCategory: SubCategory): MainCategory => {
  for (const [main, subs] of Object.entries(CATEGORIES.SUB) as [MainCategory, readonly SubCategory[]][]) {
    if (subs.includes(subCategory)) {
      return main
    }
  }
  return '기타'
}

/**
 * 메인카테고리에 속하는 모든 서브카테고리 배열 가져오기
 */
export const getSubCategoriesByMain = (mainCategory: MainCategory): SubCategory[] => {
  return [...CATEGORIES.SUB[mainCategory]]
}

/**
 * 메인카테고리에 속하는 서브카테고리별 지출 구조 생성
 */
export const createSubCategorySpending = (mainCategory: MainCategory): SubCategorySpending[] => {
  return getSubCategoriesByMain(mainCategory).map(sub => ({
    subCategory: sub,
    spentAmount: 0
  }))
}

/**
 * 현재 월 문자열 생성
 */
export const getCurrentMonth = (): string => new Date().toISOString().slice(0, 7)

/**
 * 메인 카테고리 예산 생성
 */
export const createMainCategoryBudget = (mainCategory: MainCategory): MainCategoryBudget => ({
  mainCategory,
  budgetAmount: BUDGET_AMOUNTS[mainCategory],  
  totalSpent: 0,                               
  subCategories: createSubCategorySpending(mainCategory) 
})

/**
 * 더미 예산 데이터 생성
 */
export const createDummyBudgetData = (): MonthlyBudget => {
  const mainCategoryBudgets = CATEGORY_ORDER.map(createMainCategoryBudget)
  const totalBudget = mainCategoryBudgets.reduce((sum, cat) => sum + cat.budgetAmount, 0)
  
  return {
    id: 'budget_test_2025_08',
    month: '2025-08',
    totalBudget,
    mainCategoryBudgets,
    createdAt: '2025-08-01T00:00:00.000Z',
    updatedAt: '2025-08-01T00:00:00.000Z'
  }
}

/**
 * 예산 설정 요청 데이터 검증
 */
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

/**
 * 설정 데이터에서 예산 생성
 */
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

/**
 * API 데이터에서 예산 생성
 */
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

/**
 * 총 예산만 설정하는 함수용 검증
 */
export const validateTotalBudget = (month: string, totalBudget: number): ValidationResult => {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return { isValid: false, error: '올바른 월 형식이 아닙니다 (YYYY-MM)' }
  }

  if (typeof totalBudget !== 'number' || totalBudget <= 0) {
    return { isValid: false, error: '올바른 예산 금액을 입력해주세요' }
  }

  return { isValid: true }
}

/**
 * 새 예산 객체 생성
 */
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