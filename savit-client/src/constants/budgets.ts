/**
 * Budget Store Constants
 * 예산 관리 스토어에서 사용하는 상수 정의
 */

import type { MainCategory, SubCategory } from '@/types/budgets'

/**
 * 카테고리 계층 구조 정의
 * 메인카테고리와 그에 속하는 서브카테고리들을 정의
 */
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

/**
 * 메인카테고리 표시 순서
 */
export const CATEGORY_ORDER: MainCategory[] = [...CATEGORIES.MAIN]

/**
 * LocalStorage 키
 */
export const STORAGE_KEYS = {
  MONTHLY_BUDGETS: 'savit_monthly_budgets',
  CURRENT_BUDGET: 'savit_current_budget'
} as const

/**
 * 메인카테고리별 예산 금액 설정 (사회초년생 기준)
 * 테스트 및 개발용 더미 데이터
 */
export const BUDGET_AMOUNTS: Record<MainCategory, number> = {
  식비: 400000,    // 식당(150k) + 카페(50k) + 배달(200k)
  교통: 100000,    // 대중교통(80k) + 택시(20k)
  생활: 300000,    // 통신비(80k) + 공과금(80k) + 편의점/마트(100k) + 의료비(40k)
  문화: 200000,    // 쇼핑(100k) + 영화(30k) + 유흥(50k) + 정기구독(20k)
  기타: 50000
}

/**
 * 더미 지출 데이터 (테스트용)
 */
export const DUMMY_SPENDING_DATA = {
  current: {
    '식당': 120000, '카페': 35000, '배달': 180000,
    '대중교통': 65000, '택시': 15000,
    '통신비': 75000, '공과금': 85000, '편의점/마트': 90000, '의료비': 25000, '교육': 0,
    '공연': 0, '쇼핑': 85000, '유흥': 40000, '영화': 15000, '정기구독': 18000,
    '기타': 30000
  } as Record<SubCategory, number>,
  
  prevMonth: {
    '식당': 95000, '카페': 25000, '배달': 150000,
    '대중교통': 70000, '택시': 8000,
    '통신비': 75000, '공과금': 80000, '편의점/마트': 95000, '의료비': 15000, '교육': 0,
    '공연': 0, '쇼핑': 120000, '유흥': 30000, '영화': 12000, '정기구독': 18000,
    '기타': 25000
  } as Record<SubCategory, number>,
  
  prevPrevMonth: {
    '식당': 110000, '카페': 30000, '배달': 200000,
    '대중교통': 75000, '택시': 12000,
    '통신비': 75000, '공과금': 78000, '편의점/마트': 105000, '의료비': 35000, '교육': 0,
    '공연': 0, '쇼핑': 75000, '유흥': 45000, '영화': 18000, '정기구독': 18000,
    '기타': 40000
  } as Record<SubCategory, number>
} as const