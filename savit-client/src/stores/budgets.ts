import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '@/api/useApi'
import { useCardsStore } from './cards'

export type MainCategory = '식비' | '교통' | '생활' | '문화' | '기타'

export type SubCategory = 
  | '식당' | '카페' | '배달'        
  | '대중교통' | '택시'            
  | '통신비' | '공과금' | '편의점/마트'  
  | '공연' | '쇼핑' | '유흥'         
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
  
  const dummyBudgetData: MonthlyBudget = {
    id: 'budget_test_2025_07',
    month: '2025-07',
    totalBudget: 1500000,
    categoryBudgets: [
      // 식비 관련 예산 (총 65만원)
      { mainCategory: '식비', subCategory: '식당', budgetAmount: 300000, spentAmount: 0 },
      { mainCategory: '식비', subCategory: '카페', budgetAmount: 150000, spentAmount: 0 },
      { mainCategory: '식비', subCategory: '배달', budgetAmount: 200000, spentAmount: 0 },
      // 교통 관련 예산 (총 18만원)
      { mainCategory: '교통', subCategory: '대중교통', budgetAmount: 100000, spentAmount: 0 },
      { mainCategory: '교통', subCategory: '택시', budgetAmount: 80000, spentAmount: 0 },
      // 생활 관련 예산 (총 45만원)
      { mainCategory: '생활', subCategory: '통신비', budgetAmount: 120000, spentAmount: 0 },
      { mainCategory: '생활', subCategory: '공과금', budgetAmount: 150000, spentAmount: 0 },
      { mainCategory: '생활', subCategory: '편의점/마트', budgetAmount: 180000, spentAmount: 0 },
      // 문화 관련 예산 (총 47만원)
      { mainCategory: '문화', subCategory: '공연', budgetAmount: 100000, spentAmount: 0 },
      { mainCategory: '문화', subCategory: '쇼핑', budgetAmount: 250000, spentAmount: 0 },
      { mainCategory: '문화', subCategory: '유흥', budgetAmount: 120000, spentAmount: 0 },
      // 기타 예산 (총 10만원)
      { mainCategory: '기타', subCategory: '기타', budgetAmount: 100000, spentAmount: 0 }
    ],
    createdAt: '2025-07-01T00:00:00.000Z',
    updatedAt: '2025-07-30T00:00:00.000Z'
  }
  
  // 테스트용 더미 지출 데이터 (카테고리별 실제 지출 금액)
  const dummyCategorySpending: Record<SubCategory, number> = {
    // 식비 지출 (총 525,000원 - 예산 650,000원 대비 80.7%)
    '식당': 285000,     // 예산 300,000원 대비 95%
    '카페': 95000,      // 예산 150,000원 대비 63%
    '배달': 145000,     // 예산 200,000원 대비 72%
    // 교통 지출 (총 120,000원 - 예산 180,000원 대비 66.7%)
    '대중교통': 75000,  // 예산 100,000원 대비 75%
    '택시': 45000,      // 예산 80,000원 대비 56%
    // 생활 지출 (총 420,000원 - 예산 450,000원 대비 93.3%)
    '통신비': 120000,   // 예산과 동일 (100%)
    '공과금': 135000,   // 예산 150,000원 대비 90%
    '편의점/마트': 165000, // 예산 180,000원 대비 91%
    // 문화 지출 (총 500,000원 - 예산 470,000원 대비 106% - 예산 초과!)
    '공연': 85000,      // 예산 100,000원 대비 85%
    '쇼핑': 320000,     // 예산 250,000원 대비 128% - 예산 초과!
    '유흥': 95000,      // 예산 120,000원 대비 79%
    // 기타 지출 (총 75,000원 - 예산 100,000원 대비 75%)
    '기타': 75000       // 예산 100,000원 대비 75%
  }
  
  // 대분류와 소분류 간의 매핑 관계 정의
  const categoryMappings: CategoryMapping[] = [
    // 식비 대분류 하위 3개 소분류
    { main: '식비', sub: '식당' },
    { main: '식비', sub: '카페' },
    { main: '식비', sub: '배달' },
    // 교통 대분류 하위 2개 소분류
    { main: '교통', sub: '대중교통' },
    { main: '교통', sub: '택시' },
    // 생활 대분류 하위 3개 소분류
    { main: '생활', sub: '통신비' },
    { main: '생활', sub: '공과금' },
    { main: '생활', sub: '편의점/마트' },
    // 문화 대분류 하위 3개 소분류
    { main: '문화', sub: '공연' },
    { main: '문화', sub: '쇼핑' },
    { main: '문화', sub: '유흥' },
    // 기타 대분류
    { main: '기타', sub: '기타' }
  ]
  
  // 기본 소분류 리스트 (예산 생성 시 기본값으로 사용)
  const defaultSubCategories: SubCategory[] = [
    // 식비 관련
    '식당', '카페', '배달',
    // 교통 관련
    '대중교통', '택시',
    // 생활 관련
    '통신비', '공과금', '편의점/마트',
    // 문화 관련
    '공연', '쇼핑', '유흥',
    // 기타
    '기타'
  ]
  
  /**
   * 소분류로부터 대분류를 찾는 함수
   * @param subCategory 소분류 (예: '식당')
   * @returns 대분류 (예: '식비') 또는 '기타'
   */
  const getMainCategoryFromSub = (subCategory: SubCategory): MainCategory => {
    const mapping = categoryMappings.find(m => m.sub === subCategory)
    return mapping?.main || '기타'
  }
  
  /**
   * 대분류에 속한 모든 소분류들을 반환
   * @param mainCategory 대분류 (예: '식비')
   * @returns 해당 대분류의 소분류 배열
   */
  const getSubCategoriesByMain = (mainCategory: MainCategory): SubCategory[] => {
    return categoryMappings
      .filter(m => m.main === mainCategory)
      .map(m => m.sub)
  }
  
  /**
   * 현재 월의 예산 요약 정보를 계산하는 computed 함수
   * 카테고리별 예산/지출 비교, 대분류별 집계, 전체 예산 상태 제공
   */
  const currentBudgetSummary = computed((): BudgetSummary | null => {
    if (!currentBudget.value) return null
    
    const budget = currentBudget.value
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM 형식
    
    // 현재 월의 지출 데이터 가져오기
    const monthSpendingData = categorySpendingData.value[currentMonth] || {}
    
    // 각 카테고리별로 실제 지출 금액 계산
    const categoryBudgets = budget.categoryBudgets.map(categoryBudget => {
      const spentAmount = monthSpendingData[categoryBudget.subCategory] || calculateSpentAmountBySubCategory(categoryBudget.subCategory, currentMonth)
      return {
        ...categoryBudget,
        spentAmount
      }
    })
    
    // 대분류별 예산 집계 계산
    const mainCategoryBudgets: MainCategoryBudget[] = (['식비', '교통', '생활', '문화', '기타'] as MainCategory[]).map(mainCategory => {
      const subCategories = categoryBudgets.filter(cat => cat.mainCategory === mainCategory)
      const totalBudget = subCategories.reduce((sum, cat) => sum + cat.budgetAmount, 0)
      const totalSpent = subCategories.reduce((sum, cat) => sum + cat.spentAmount, 0)
      
      return {
        mainCategory,
        totalBudget,
        totalSpent,
        subCategories
      }
    })
    
    // 전체 예산 요약 계산
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
  
  // 월별 카테고리 지출 데이터 저장소 (key: YYYY-MM, value: 카테고리별 지출액)
  const categorySpendingData = ref<Record<string, Record<SubCategory, number>>>({})
  
  /**
   * 지정된 월의 카테고리별 지출 데이터를 서버에서 가져오는 함수
   * 서버 요청 실패 시 카드 데이터로 대체 및 더미 데이터 사용
   * @param month 조회할 월 (YYYY-MM 형식)
   * @returns 카테고리별 지출 금액 객체
   */
  const fetchCategorySpending = async (month: string): Promise<Record<SubCategory, number>> => {
    try {
      // 서버에서 카테고리별 지출 데이터 요청
      const response = await request({
        method: 'GET',
        url: `/spending/categories/${month}`
      })
      
      const spendingData = response.data as Record<SubCategory, number>
      categorySpendingData.value[month] = spendingData
      
      return spendingData
    } catch (error) {
      console.error(`${month} 카테고리별 지출 조회 실패, 대체 데이터 사용:`, error)
      
      // 2025-07 월의 경우 더미 데이터 사용
      if (month === '2025-07') {
        categorySpendingData.value[month] = dummyCategorySpending
        return dummyCategorySpending
      }
      
      // 기존 카드 데이터의 카테고리명을 새로운 소분류로 매핑
      const legacyCategoryMap: Record<string, SubCategory> = {
        '카페': '카페',
        '식당': '식당',
        '쇼핑': '쇼핑',
        '편의점': '편의점/마트',
        '공연': '공연',
        '기타': '기타'
      }
      
      // 카드 스토어에서 데이터를 가져와서 카테고리별로 집계
      const localSpendingData: Partial<Record<SubCategory, number>> = {}
      
      cardsStore.currentMonthUsage
        .filter(usage => usage.date.startsWith(month))
        .forEach(usage => {
          const mappedCategory = legacyCategoryMap[usage.category] || usage.category as SubCategory
          localSpendingData[mappedCategory] = (localSpendingData[mappedCategory] || 0) + usage.amount
        })
      
      // 모든 기본 소분류에 대해 0원으로 초기화 후 실제 데이터 반영
      const fullSpendingData = defaultSubCategories.reduce((acc, category) => {
        acc[category] = localSpendingData[category] || 0
        return acc
      }, {} as Record<SubCategory, number>)
      
      categorySpendingData.value[month] = fullSpendingData
      return fullSpendingData
    }
  }
  
  /**
   * 특정 소분류의 지정 월 지출 금액을 계산
   * 캐시된 데이터가 있으면 사용, 없으면 카드 데이터에서 직접 계산
   * @param subCategory 소분류 (예: '식당')
   * @param month 계산할 월 (YYYY-MM 형식)
   * @returns 해당 소분류의 지출 금액
   */
  const calculateSpentAmountBySubCategory = (subCategory: SubCategory, month: string): number => {
    // 이미 캐시된 데이터가 있으면 바로 반환
    const monthData = categorySpendingData.value[month]
    if (monthData) {
      return monthData[subCategory] || 0
    }
    
    // 없으면 카드 데이터에서 직접 계산 (레거시 카테고리 매핑 사용)
    const legacyCategoryMap: Record<string, SubCategory> = {
      '카페': '카페',
      '식당': '식당',
      '쇼핑': '쇼핑',
      '편의점': '편의점/마트',
      '공연': '공연',
      '기타': '기타'
    }
    
    // 카드 사용 내역에서 일치하는 카테고리와 월의 데이터만 필터링하여 합계
    return cardsStore.currentMonthUsage
      .filter(usage => {
        const mappedCategory = legacyCategoryMap[usage.category] || usage.category as SubCategory
        return mappedCategory === subCategory && usage.date.startsWith(month)
      })
      .reduce((sum, usage) => sum + usage.amount, 0)
  }
  
  /**
   * 지정된 월의 예산 데이터를 조회
   * @param month 조회할 월 (YYYY-MM 형식)
   * @returns 해당 월의 예산 데이터 또는 null
   */
  const getBudgetByMonth = (month: string): MonthlyBudget | null => {
    return monthlyBudgets.value.find(budget => budget.month === month) || null
  }
  
  /**
   * 새로운 월별 예산을 생성하는 함수
   * 서버에 저장 시도하며, 실패 시 로컬에서 생성
   * @param month 생성할 월 (YYYY-MM 형식)
   * @param totalBudget 월 총 예산 금액
   * @param categoryBudgets 카테고리별 예산 금액 (Optional)
   * @returns 생성된 예산 데이터
   */
  const createMonthlyBudget = async (
    month: string, 
    totalBudget: number, 
    categoryBudgets?: Partial<Record<SubCategory, number>>
  ): Promise<MonthlyBudget> => {
    try {
      // 서버에 전송할 예산 데이터 구성
      const budgetData = {
        month,
        totalBudget,
        categoryBudgets: defaultSubCategories.map(subCategory => ({
          mainCategory: getMainCategoryFromSub(subCategory),
          subCategory,
          budgetAmount: categoryBudgets?.[subCategory] || 0,
          spentAmount: 0
        }))
      }
      
      // 서버에 예산 생성 요청
      const response = await request({
        method: 'POST',
        url: '/budgets',
        data: budgetData
      })
      
      const newBudget: MonthlyBudget = response.data
      monthlyBudgets.value.push(newBudget)
      
      // 현재 월이면 currentBudget에도 설정
      if (month === new Date().toISOString().slice(0, 7)) {
        currentBudget.value = newBudget
      }
      
      return newBudget
    } catch (error) {
      console.error('예산 생성 실패, 로컬 데이터로 대체:', error)
      
      // 서버 실패 시 로컬에서 예산 데이터 생성
      const newBudget: MonthlyBudget = {
        id: `budget_${Date.now()}`,
        month,
        totalBudget,
        categoryBudgets: defaultSubCategories.map(subCategory => ({
          mainCategory: getMainCategoryFromSub(subCategory),
          subCategory,
          budgetAmount: categoryBudgets?.[subCategory] || 0,
          spentAmount: 0
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      monthlyBudgets.value.push(newBudget)
      
      // 현재 월이면 currentBudget에도 설정
      if (month === new Date().toISOString().slice(0, 7)) {
        currentBudget.value = newBudget
      }
      
      return newBudget
    }
  }
  
  /**
   * 기존 월별 예산을 업데이트하는 함수
   * @param budgetId 업데이트할 예산의 ID
   * @param updates 업데이트할 데이터 (Partial)
   * @returns 업데이트된 예산 데이터
   */
  const updateMonthlyBudget = async (budgetId: string, updates: Partial<MonthlyBudget>): Promise<MonthlyBudget> => {
    try {
      // 서버에 예산 업데이트 요청
      const response = await request({
        method: 'PUT',
        url: `/budgets/${budgetId}`,
        data: updates
      })
      
      const updatedBudget: MonthlyBudget = response.data
      const index = monthlyBudgets.value.findIndex(b => b.id === budgetId)
      
      if (index !== -1) {
        // 로컬 상태 업데이트
        monthlyBudgets.value[index] = updatedBudget
        
        // 현재 예산이면 currentBudget도 업데이트
        if (currentBudget.value?.id === budgetId) {
          currentBudget.value = updatedBudget
        }
      }
      
      return updatedBudget
    } catch (error) {
      console.error('예산 업데이트 실패:', error)
      throw error
    }
  }
  
  /**
   * 서버에서 지정된 월의 예산 데이터를 가져오는 함수
   * 서버 실패 시 2025-07월에 대해서만 더미 데이터 반환
   * @param month 조회할 월 (YYYY-MM 형식)
   * @returns 예산 데이터 또는 null
   */
  const fetchBudgetsByMonth = async (month: string): Promise<MonthlyBudget | null> => {
    try {
      // 서버에서 예산 데이터 요청
      const response = await request({
        method: 'GET',
        url: `/budgets/${month}`
      })
      
      const budget: MonthlyBudget = response.data
      const existingIndex = monthlyBudgets.value.findIndex(b => b.month === month)
      
      // 기존 데이터 바꿔치기 또는 새로 추가
      if (existingIndex !== -1) {
        monthlyBudgets.value[existingIndex] = budget
      } else {
        monthlyBudgets.value.push(budget)
      }
      
      // 현재 월이면 currentBudget에도 설정
      if (month === new Date().toISOString().slice(0, 7)) {
        currentBudget.value = budget
      }
      
      return budget
    } catch (error) {
      console.error(`${month} 예산 조회 실패, 대체 데이터 확인:`, error)
      
      // 2025-07월에 대해서만 더미 데이터 제공
      if (month === '2025-07') {
        const existingIndex = monthlyBudgets.value.findIndex(b => b.month === month)
        
        if (existingIndex !== -1) {
          monthlyBudgets.value[existingIndex] = dummyBudgetData
        } else {
          monthlyBudgets.value.push(dummyBudgetData)
        }
        
        if (month === new Date().toISOString().slice(0, 7)) {
          currentBudget.value = dummyBudgetData
        }
        
        return dummyBudgetData
      }
      
      return null
    }
  }
  
  /**
   * 현재 월의 예산 및 지출 데이터를 초기화하는 함수
   * 예산 데이터와 지출 데이터를 병렬로 가져와서 성능 최적화
   */
  const initializeCurrentMonthBudget = async (): Promise<void> => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    // 예산 데이터와 지출 데이터를 동시에 가져오기
    await Promise.all([
      fetchBudgetsByMonth(currentMonth),
      fetchCategorySpending(currentMonth)
    ])
    
    // 예산 데이터가 없으면 currentBudget을 null로 설정
    if (!monthlyBudgets.value.find(b => b.month === currentMonth)) {
      currentBudget.value = null
    }
  }
  
  /**
   * 특정 소분류의 예산 대비 지출 비율 계산
   * @param subCategory 비율을 계산할 소분류
   * @returns 지출 비율 (0-100%)
   */
  const getSubCategorySpendingRatio = (subCategory: SubCategory): number => {
    if (!currentBudgetSummary.value) return 0
    
    const categoryBudget = currentBudgetSummary.value.categoryBudgets.find(c => c.subCategory === subCategory)
    if (!categoryBudget || categoryBudget.budgetAmount === 0) return 0
    
    return (categoryBudget.spentAmount / categoryBudget.budgetAmount) * 100
  }
  
  /**
   * 특정 대분류의 예산 대비 지출 비율 계산
   * @param mainCategory 비율을 계산할 대분류
   * @returns 지출 비율 (0-100%)
   */
  const getMainCategorySpendingRatio = (mainCategory: MainCategory): number => {
    if (!currentBudgetSummary.value) return 0
    
    const mainCategoryBudget = currentBudgetSummary.value.mainCategoryBudgets.find(c => c.mainCategory === mainCategory)
    if (!mainCategoryBudget || mainCategoryBudget.totalBudget === 0) return 0
    
    return (mainCategoryBudget.totalSpent / mainCategoryBudget.totalBudget) * 100
  }
  
  /**
   * 예산을 초과한 소분류들의 리스트를 반환
   * @returns 예산 초과 소분류 배열
   */
  const getOverBudgetSubCategories = (): SubCategory[] => {
    if (!currentBudgetSummary.value) return []
    
    return currentBudgetSummary.value.categoryBudgets
      .filter(cat => cat.spentAmount > cat.budgetAmount && cat.budgetAmount > 0)
      .map(cat => cat.subCategory)
  }
  
  /**
   * 예산을 초과한 대분류들의 리스트를 반환
   * @returns 예산 초과 대분류 배열
   */
  const getOverBudgetMainCategories = (): MainCategory[] => {
    if (!currentBudgetSummary.value) return []
    
    return currentBudgetSummary.value.mainCategoryBudgets
      .filter(cat => cat.totalSpent > cat.totalBudget && cat.totalBudget > 0)
      .map(cat => cat.mainCategory)
  }
  
  /**
   * 테스트 데이터를 로드하는 함수
   * 개발 및 데모 목적으로 더미 데이터를 스토어에 로드
   */
  const loadTestData = async (): Promise<void> => {
    console.log('테스트 데이터 로딩 중...')
    // 더미 예산 데이터 로드
    monthlyBudgets.value = [dummyBudgetData]
    currentBudget.value = dummyBudgetData
    // 더미 지출 데이터 로드
    categorySpendingData.value['2025-07'] = dummyCategorySpending
    console.log('테스트 데이터 로딩 완료!')
  }

  // 스토어에서 노출할 상태와 함수들
  return {
    // 상태 변수들
    monthlyBudgets,           // 모든 월별 예산 데이터
    currentBudget,            // 현재 월 예산 데이터
    currentBudgetSummary,     // 현재 월 예산 요약 정보
    categoryMappings,         // 카테고리 매핑 정보
    defaultSubCategories,     // 기본 소분류 리스트
    categorySpendingData,     // 월별 지출 데이터
    dummyBudgetData,          // 테스트용 더미 예산
    dummyCategorySpending,    // 테스트용 더미 지출
    
    // 유틸리티 함수들
    getMainCategoryFromSub,        // 소분류에서 대분류 찾기
    getSubCategoriesByMain,        // 대분류의 소분류들 가져오기
    getBudgetByMonth,              // 월별 예산 조회
    
    // CRUD 함수들
    createMonthlyBudget,           // 예산 생성
    updateMonthlyBudget,           // 예산 업데이트
    fetchBudgetsByMonth,           // 예산 조회
    fetchCategorySpending,         // 지출 데이터 조회
    
    // 초기화 및 설정 함수들
    initializeCurrentMonthBudget,  // 현재 월 데이터 초기화
    loadTestData,                  // 테스트 데이터 로드
    
    // 계산 및 분석 함수들
    getSubCategorySpendingRatio,   // 소분류 지출 비율
    getMainCategorySpendingRatio,  // 대분류 지출 비율
    getOverBudgetSubCategories,    // 예산 초과 소분류
    getOverBudgetMainCategories,   // 예산 초과 대분류
    calculateSpentAmountBySubCategory // 소분류별 지출 계산
  }
})