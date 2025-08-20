import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { calculateSum } from '@/utils/calculations'
import { useApi } from '@/api/useApi'
import { transactionService } from '@/services/transactionService'

import {
  validateBudgetSettings,
  createBudgetFromSettings,
  createNewBudget,
  validateTotalBudget,
} from '@/utils/budgetUtils'
import { getCurrentMonth, getRelativeMonth } from '@/utils/dateUtils'

import type {
  SubCategory,
  MainCategoryBudgetStatus,
  MonthlyBudget,
  BudgetSummary,
  BudgetSettingResponse,
  MonthSummary,
  BudgetSettingRequest,
  MainCategory,
} from '@/types/budgets'

import {
  CATEGORY_ID_MAP,
  ID_TO_CATEGORY_MAP,
  CATEGORIES,
  DEFAULT_BUDGET_AMOUNTS,
} from '@/types/budgets'

export const useBudgetsStore = defineStore('budgets', () => {
  const { request, loading } = useApi()

  const monthlyBudgets = ref<MonthlyBudget[]>([])
  const currentBudget = ref<MonthlyBudget | null>(null)
  const categorySpendingData = ref<Record<string, Record<SubCategory, number>>>({})

  // ===== 유틸리티 함수 =====
  const transformBudgetRequestToCategoryData = (budgetRequest: BudgetSettingRequest) =>
    budgetRequest.mainCategoryBudgets.map((item) => ({
      categoryId: CATEGORY_ID_MAP[item.mainCategory as MainCategory][0], // 첫 번째 ID 사용
      targetAmount: item.budgetAmount,
    }))

  // ===== 데이터 처리 로직 =====
  const getSpendingByMonthData = (month: string): Record<SubCategory, number> => {
    const spendingData = transactionService.getSpendingByMonth(month)
    categorySpendingData.value[month] = spendingData
    return spendingData
  }

  const updateSpendingData = (
    mainCategoryBudgets: MainCategoryBudgetStatus[],
    month: string,
  ): MainCategoryBudgetStatus[] =>
    mainCategoryBudgets.map((mainCategory) => {
      const monthSpending = getSpendingByMonthData(month)
      const updatedSubCategories = mainCategory.subCategories.map((sub) => ({
        ...sub,
        spentAmount: monthSpending[sub.subCategory] || 0,
      }))

      return {
        ...mainCategory,
        totalSpent: calculateSum(updatedSubCategories, 'spentAmount'),
        subCategories: updatedSubCategories,
      }
    })

  const updateBudgetInStore = (budget: MonthlyBudget, month: string): void => {
    if (!budget?.month) return

    const existingIndex = monthlyBudgets.value.findIndex((b) => b?.month === month)
    if (existingIndex !== -1) {
      monthlyBudgets.value[existingIndex] = budget
    } else {
      monthlyBudgets.value.push(budget)
    }

    if (month === getCurrentMonth()) {
      currentBudget.value = budget
    }
  }

  const getBudgetByMonth = (month: string): MainCategoryBudgetStatus[] =>
    monthlyBudgets.value.find((b) => b.month === month)?.mainCategoryBudgets ||
    currentBudget.value?.mainCategoryBudgets ||
    []

  // ===== API 호출 로직 =====
  const saveWithRetry = async (
    url: string,
    data: unknown,
    successMessage: string,
  ): Promise<BudgetSettingResponse> => {
    for (const method of ['PUT', 'POST'] as const) {
      try {
        await request({ method, url, data })
        return {
          success: true,
          message: `${successMessage} ${method === 'PUT' ? '업데이트' : '생성'}되었습니다`,
        }
      } catch (error) {
        if (method === 'POST') {
          console.warn(`서버 저장 실패 (${url}):`, error)
          return { success: false, message: '서버 저장에 실패했습니다' }
        }
      }
    }
    return { success: false, message: '예상치 못한 오류가 발생했습니다' }
  }

  async function fetchMainCategoryBudget() {
    try {
      // 사용자 요구사항: 서버는 반드시 [1, 2, 3, 4, 5] ID로 호출해야 함
      const res = await request({
        url: '/budget/categories/list',
        method: 'POST',
        data: { categoryIds: [1, 2, 3, 4, 5] },
      })
      return res
    } catch (err) {
      console.error('fetchMainCategoryBudget Error: ', err)
      return null
    }
  }

  // 두 API를 결합하여 완전한 예산 정보를 가져오는 함수
  async function fetchBudgetsByMonth(month: string): Promise<void> {
    loading.value = true
    try {
      // 1. 두 API를 병렬로 호출
      const [totalBudgetRes, mainCategoryRes] = await Promise.all([
        request({ url: '/budget', method: 'GET', params: { month } }),
        fetchMainCategoryBudget(),
      ])

      if (!totalBudgetRes || !mainCategoryRes) {
        console.warn(`'${month}'의 예산 데이터 일부를 가져오지 못했습니다.`)
        return
      }

      // 2. API 응답을 올바른 주 카테고리 예산으로 변환
      const monthKey = month.replace('-', '')
      const categoryBudgetsFromApi = mainCategoryRes[monthKey] || []

      // 이 API에서만 사용하는 ID <-> 주 카테고리 매핑
      const API_ID_TO_MAIN_CAT: Record<number, MainCategory> = {
        1: '식비',
        2: '교통',
        3: '생활',
        4: '문화',
        5: '기타',
      }
      const MAIN_CAT_TO_API_ID = {
        식비: 1,
        교통: 2,
        생활: 3,
        문화: 4,
        기타: 5,
      }

      const mainCategoryBudgets: MainCategoryBudgetStatus[] = CATEGORIES.MAIN.map((mainCat) => {
        const apiId = MAIN_CAT_TO_API_ID[mainCat]
        const budgetFromApi = categoryBudgetsFromApi.find((item: any) => item.categoryId === apiId)

        const subCategories = (CATEGORIES.SUB[mainCat] || []).map((sub: SubCategory) => ({
          subCategory: sub,
          spentAmount: 0,
        }))

        return {
          mainCategory: mainCat,
          budgetAmount: budgetFromApi
            ? budgetFromApi.targetAmount
            : DEFAULT_BUDGET_AMOUNTS[mainCat], // API 응답 없으면 기본값 사용
          totalSpent: 0,
          subCategories,
        }
      })

      // 3. 최종 MonthlyBudget 객체 생성
      const completeBudget: MonthlyBudget = {
        id: totalBudgetRes.id || `budget_${month}`,
        month: month,
        totalBudget: totalBudgetRes.totalBudget || 0,
        mainCategoryBudgets: mainCategoryBudgets,
        createdAt: totalBudgetRes.createdAt || new Date().toISOString(),
        updatedAt: totalBudgetRes.updatedAt || new Date().toISOString(),
      }

      // 4. 스토어에 업데이트
      updateBudgetInStore(completeBudget, month)
    } catch (error) {
      console.error(`'${month}'의 예산 가져오기 실패:`, error)
    } finally {
      loading.value = false
    }
  }

  // ===== Computed Properties =====
  const currentBudgetSummary = computed((): BudgetSummary | null => {
    if (!currentBudget.value) return null

    const budget = currentBudget.value
    const mainCategoryBudgets = updateSpendingData(budget.mainCategoryBudgets, getCurrentMonth())
    const totalSpent = calculateSum(mainCategoryBudgets, 'totalSpent')
    const remainingBudget = budget.totalBudget - totalSpent
    const spendingRatio = budget.totalBudget > 0 ? (totalSpent / budget.totalBudget) * 100 : 0

    return {
      totalBudget: budget.totalBudget,
      totalSpent,
      remainingBudget,
      spendingRatio,
      mainCategoryBudgets,
      isOverBudget: totalSpent > budget.totalBudget,
    }
  })

  // ===== 예산 설정 함수 =====
  async function setTotalBudget(
    month: string,
    totalBudget: number,
  ): Promise<BudgetSettingResponse> {
    const validation = validateTotalBudget(month, totalBudget)
    if (!validation.isValid) return { success: false, message: validation.error }

    updateBudgetInStore(createNewBudget(month, totalBudget), month)
    return saveWithRetry('/budget', { month, totalBudget }, '전체 예산이 성공적으로')
  }

  async function setBudgetForMonth(
    budgetRequest: BudgetSettingRequest,
  ): Promise<BudgetSettingResponse> {
    const validation = validateBudgetSettings(budgetRequest)
    if (!validation.isValid) return { success: false, message: validation.error }

    const budget = createBudgetFromSettings(budgetRequest)
    updateBudgetInStore(budget, budgetRequest.month)

    const categoryData = transformBudgetRequestToCategoryData(budgetRequest)
    const result = await saveWithRetry(
      '/budget/categories',
      categoryData,
      '카테고리별 예산이 성공적으로',
    )

    return { ...result, data: budget }
  }

  // ===== 데이터 조회 함수 =====
  async function getPreviousMonthsSummary(monthsBack: number): Promise<MonthSummary> {
    const monthData = getRelativeMonth(monthsBack)
    const monthStr = monthData.string
    const monthName = monthData.name

    const spendingData = getSpendingByMonthData(monthStr)
    const totalSpent = Object.values(spendingData).reduce(
      (sum: number, amount: number) => sum + amount,
      0,
    )

    const monthBudget = monthlyBudgets.value.find((b) => b.month === monthStr)
    const totalBudget = monthBudget?.totalBudget || 0

    return { month: monthStr, monthName, totalSpent, totalBudget }
  }

  async function getPeerAvgByCategoryId(categoryId: number): Promise<number> {
    try {
      const res = await request({
        url: `/budget/peer-avg/${categoryId}`,
        method: 'GET',
      })
      return res.averageAmount || 0
    } catch (error) {
      console.error(`카테고리 ${categoryId}의 또래 평균 가져오기 실패:`, error)
      return 0
    }
  }

  return {
    //fetch
    fetchBudgetsByMonth,

    //ref
    monthlyBudgets,
    currentBudget,
    categorySpendingData,
    loading,

    //computed
    currentBudgetSummary,
    setTotalBudget,
    setBudgetForMonth,
    getPreviousMonthsSummary,
    getPeerAvgByCategoryId,
    getSpendingByMonth: getSpendingByMonthData,
    getBudgetByMonth,
    validateBudgetSettings,
    createBudgetFromSettings,
  }
})
