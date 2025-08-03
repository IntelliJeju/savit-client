/**
 * Budget Store Types
 * 예산 관리 스토어에서 사용하는 타입 정의
 */

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

export interface SubCategorySpending {
  subCategory: SubCategory  
  spentAmount: number       
}

export interface MainCategoryBudget {
  mainCategory: MainCategory              
  budgetAmount: number                   
  totalSpent: number                      
  subCategories: SubCategorySpending[]    
}

export interface MonthlyBudget {
  id: string                                
  month: string                             
  totalBudget: number                       
  mainCategoryBudgets: MainCategoryBudget[] 
  createdAt: string                         
  updatedAt: string                         
}

/**
 * 예산 요약 정보
 * UI에서 표시할 계산된 예산 상태
 */
export interface BudgetSummary {
  totalBudget: number                       // 총 예산
  totalSpent: number                        // 총 지출
  remainingBudget: number                   // 남은 예산
  spendingRatio: number                     // 지출 비율 (%)
  mainCategoryBudgets: MainCategoryBudget[] // 카테고리별 상세 데이터
  isOverBudget: boolean                     // 예산 초과 여부
}

/**
 * 예산 설정 요청 데이터
 * BudgetSetting.vue에서 서버로 보낼 데이터 형식
 */
export interface BudgetSettingRequest {
  month: string                             // 대상 월 (YYYY-MM 형식)
  mainCategoryBudgets: {
    mainCategory: MainCategory              // 메인카테고리
    budgetAmount: number                    // 설정할 예산 금액
  }[]
}

/**
 * 예산 설정 응답 데이터
 * 서버에서 받을 예산 설정 결과
 */
export interface BudgetSettingResponse {
  success: boolean                          // 성공 여부
  message?: string                          // 오류 메시지 (선택사항)
  data?: MonthlyBudget                      // 설정된 예산 데이터 (선택사항)
}

/**
 * 검증 결과 타입
 */
export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * 월별 요약 데이터
 */
export interface MonthSummary {
  month: string
  monthName: string
  totalSpent: number
  totalBudget: number
}