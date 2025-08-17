import type { MainCategoryBudgetStatus } from '@/types/budgets'

export function useBudgetCalculations(
  getPrevMonthSpendingData: () => Record<string, number>,
  getPrevPrevMonthSpendingData: () => Record<string, number>,
  getPrevMonthBudgetData: () => MainCategoryBudgetStatus[],
  getPrevPrevMonthBudgetData: () => MainCategoryBudgetStatus[]
) {
  // 지출 금액 계산 유틸리티
  const calculateSpentAmount = (
    mainCategory: MainCategoryBudgetStatus,
    spendingData: Record<string, number>,
  ): number => {
    return mainCategory.subCategories.reduce(
      (sum, sub) => sum + (spendingData[sub.subCategory] || 0),
      0,
    )
  }

  const getPrevMonthSpent = (mainCategory: MainCategoryBudgetStatus): number =>
    calculateSpentAmount(mainCategory, getPrevMonthSpendingData())

  const getPrevPrevMonthSpent = (mainCategory: MainCategoryBudgetStatus): number =>
    calculateSpentAmount(mainCategory, getPrevPrevMonthSpendingData())

  // 비율 계산 유틸리티
  const calculateSpendingRatio = (spent: number, budget: number): string => {
    return budget > 0 ? Math.min((spent / budget) * 100, 100).toFixed(1) : '0.0'
  }

  const getPrevMonthRatio = (mainCategory: MainCategoryBudgetStatus): string =>
    calculateSpendingRatio(getPrevMonthSpent(mainCategory), getPrevMonthBudgetAmount(mainCategory))

  const getPrevPrevMonthRatio = (mainCategory: MainCategoryBudgetStatus): string =>
    calculateSpendingRatio(
      getPrevPrevMonthSpent(mainCategory),
      getPrevPrevMonthBudgetAmount(mainCategory),
    )

  // 예산 금액 조회 유틸리티
  const getBudgetAmountForCategory = (
    mainCategory: MainCategoryBudgetStatus,
    budgetData: MainCategoryBudgetStatus[],
  ): number => {
    const budget = budgetData.find((b) => b.mainCategory === mainCategory.mainCategory)
    return budget?.budgetAmount || mainCategory.budgetAmount
  }

  const getPrevMonthBudgetAmount = (mainCategory: MainCategoryBudgetStatus): number =>
    getBudgetAmountForCategory(mainCategory, getPrevMonthBudgetData())

  const getPrevPrevMonthBudgetAmount = (mainCategory: MainCategoryBudgetStatus): number =>
    getBudgetAmountForCategory(mainCategory, getPrevPrevMonthBudgetData())

  const getAmountClass = (mainCategory: any): string => {
    return mainCategory.isOverBudget ? 'text-app-red' : 'text-app-blue'
  }

  return {
    getPrevMonthSpent,
    getPrevPrevMonthSpent,
    getPrevMonthRatio,
    getPrevPrevMonthRatio,
    getPrevMonthBudgetAmount,
    getPrevPrevMonthBudgetAmount,
    getAmountClass,
  }
}