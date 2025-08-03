/**
 * Budget Category Setting Types
 * 
 * Contains type definitions used in the BudgetCategorySetting component
 */

import type { MainCategory } from '@/stores/budgets'

// 카테고리 데이터 인터페이스
export interface CategoryData {
  name: MainCategory
  percentage: number
  lastMonthSpent: number
}

// 슬라이더 값 추출 결과
export interface SliderValues {
  newValue: number
  oldValue: number
  difference: number
}

// 조정 작업 타입
export type AdjustmentOperation = 'increase' | 'decrease'

// 예산 요청 데이터 (카테고리별)
export interface CategoryBudgetRequest {
  mainCategory: MainCategory
  budgetAmount: number
}

// 예산 설정 요청 데이터
export interface BudgetRequest {
  month: string
  mainCategoryBudgets: CategoryBudgetRequest[]
}