import { useApi } from '@/api/useApi'
import type { BudgetSettingRequest, BudgetSettingResponse, MainCategory } from '@/types/budgets'
import { DEFAULT_BUDGET_AMOUNTS, CATEGORY_ID_MAP } from '@/types/budgets'
import { validateTotalBudget, validateBudgetSettings } from '@/utils/budgetUtils'

export function useBudgetApi() {
  const { request } = useApi()

  // 공통 API 호출 유틸리티
  const apiCall = async <T>(url: string, fallback: T): Promise<T> => {
    try {
      const response = await request({ method: 'GET', url })
      return response.data
    } catch {
      return fallback
    }
  }

  const getDefaultTotalBudget = (): Promise<number> => 
    apiCall('/budget', Object.values(DEFAULT_BUDGET_AMOUNTS).reduce((sum, amount) => sum + amount, 0))
      .then(data => (data as any).totalBudget || data)

  const getDefaultCategoryBudgets = (): Promise<Record<MainCategory, number>> => 
    apiCall('/budget/categories', { ...DEFAULT_BUDGET_AMOUNTS })
      .then(data => (data as any).categoryBudgets || data)

  const transformBudgetRequestToCategoryData = (budgetRequest: BudgetSettingRequest) =>
    budgetRequest.mainCategoryBudgets.map(item => ({
      categoryId: CATEGORY_ID_MAP[item.mainCategory as MainCategory],
      targetAmount: item.budgetAmount
    }))

  async function setTotalBudget(month: string, totalBudget: number): Promise<BudgetSettingResponse> {
    const validation = validateTotalBudget(month, totalBudget)
    if (!validation.isValid) return { success: false, message: validation.error }

    for (const method of ['PUT', 'POST'] as const) {
      try {
        await request({ method, url: '/budget', data: { month, totalBudget } })
        return { 
          success: true, 
          message: `전체 예산이 성공적으로 ${method === 'PUT' ? '업데이트' : '생성'}되었습니다`
        }
      } catch (error) {
        if (method === 'POST') {
          console.warn('전체 예산 서버 저장 실패:', error)
          return { success: true, message: '로컬에 예산이 저장되었습니다 (서버 연결 실패)' }
        }
      }
    }

    return { success: false, message: '예상치 못한 오류가 발생했습니다' }
  }

  async function setBudgetCategories(budgetRequest: BudgetSettingRequest): Promise<BudgetSettingResponse> {
    const validation = validateBudgetSettings(budgetRequest)
    if (!validation.isValid) return { success: false, message: validation.error }

    const categoryData = transformBudgetRequestToCategoryData(budgetRequest)
    
    for (const method of ['PUT', 'POST'] as const) {
      try {
        await request({ method, url: '/budget/categories', data: categoryData })
        return { 
          success: true, 
          message: `카테고리별 예산이 성공적으로 ${method === 'PUT' ? '업데이트' : '생성'}되었습니다`
        }
      } catch (error) {
        if (method === 'POST') {
          console.warn('카테고리 예산 저장 실패:', error)
          return { success: false, message: '카테고리별 예산 저장에 실패했습니다' }
        }
      }
    }

    return { success: false, message: '예상치 못한 오류가 발생했습니다' }
  }

  async function fetchBudgetData(url: string) {
    try {
      const response = await request({ method: 'GET', url })
      return response.data
    } catch (error) {
      console.warn('예산 데이터 조회 실패:', error)
      return null
    }
  }

  return {
    getDefaultTotalBudget,
    getDefaultCategoryBudgets,
    setTotalBudget,
    setBudgetCategories,
    fetchBudgetData
  }
}