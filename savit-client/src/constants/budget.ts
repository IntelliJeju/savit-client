/**
 * Budget Category Setting Constants
 * 
 * Contains constants used in the BudgetCategorySetting component
 */

import type { CategoryData } from '@/types/budget'

// 기본 카테고리 데이터 (사회초년생 기준)
export const DEFAULT_CATEGORIES: CategoryData[] = [
  {
    name: '식비' as const,
    percentage: 40,
    lastMonthSpent: 300000
  },
  {
    name: '교통' as const,
    percentage: 15,
    lastMonthSpent: 130000
  },
  {
    name: '생활' as const,
    percentage: 25,
    lastMonthSpent: 200000
  },
  {
    name: '문화' as const,
    percentage: 15,
    lastMonthSpent: 200000
  },
  {
    name: '기타' as const,
    percentage: 5,
    lastMonthSpent: 50000
  }
]

// AI 추천 패턴 (사회초년생 기준)
export const RECOMMENDATION_PATTERNS = [
  [40, 15, 25, 15, 5],  // 식비 중심
  [35, 20, 25, 15, 5],  // 교통비 고려
  [38, 12, 30, 15, 5],  // 생활비 중심
  [42, 15, 23, 18, 2],  // 문화생활 중시
  [36, 18, 28, 12, 6]   // 균형형
] as const

// 추천 비율 변동 범위 (%)
export const RECOMMENDATION_VARIATION_RANGE = 6 // -3% ~ +3%

// API 지연 시뮬레이션 시간 (ms)
export const RECOMMENDATION_API_DELAY = 1000

// 기본 예산 금액 (fallback)
export const DEFAULT_TOTAL_BUDGET = 1000000