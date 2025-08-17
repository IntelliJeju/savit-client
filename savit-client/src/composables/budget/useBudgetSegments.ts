import type { Ref } from 'vue'
import type { MainCategoryBudgetStatus } from '@/types/budgets'

const subCategoryColors: Record<string, string> = {
  식당: '#92DE8B',
  카페: '#0AB68B',
  배달: '#028174',
  대중교통: '#92DE8B',
  택시: '#0AB68B',
  통신비: '#92DE8B',
  공과금: '#0AB68B',
  의료비: '#028174',
  교육: '#C3F2BF',
  '편의점/마트': '#045D56',
  공연: '#92DE8B',
  영화: '#0AB68B',
  쇼핑: '#028174',
  정기구독: '#C3F2BF',
  유흥: '#045D56',
  기타: '#0AB68B',
}

export function useBudgetSegments(
  expandedCategories: Ref<Set<string>>,
  getPrevMonth: () => string,
  getPrevPrevMonth: () => string,
  getPrevMonthSpendingData: () => Record<string, number>,
  getPrevPrevMonthSpendingData: () => Record<string, number>,
  getPrevMonthBudgetData: () => MainCategoryBudgetStatus[],
  getPrevPrevMonthBudgetData: () => MainCategoryBudgetStatus[]
) {
  const getSubCategoryColor = (subCategory: string): string => {
    return subCategoryColors[subCategory] || '#6b7280'
  }

  const getMainCategorySegments = (mainCategory: any) => {
    if (mainCategory.budgetAmount === 0) return []

    if (mainCategory.expanded) {
      return mainCategory.subCategories
        .filter((sub: any) => sub.spentAmount > 0)
        .map((sub: any) => ({
          label: sub.subCategory,
          value: Math.min((sub.spentAmount / mainCategory.budgetAmount) * 100, 100),
          color: getSubCategoryColor(sub.subCategory),
        }))
    }

    return [
      {
        label: mainCategory.mainCategory,
        value: Math.min(mainCategory.spendingRatio, 100),
        color: mainCategory.isOverBudget ? '#ef4444' : '#0AB68B',
      },
    ]
  }

  const getPrevMonthSegments = (mainCategory: MainCategoryBudgetStatus) => {
    const isExpanded = expandedCategories.value.has(mainCategory.mainCategory)
    const prevMonthData = getPrevMonthSpendingData()
    const budgetAmount = getBudgetAmountForCategory(mainCategory, getPrevMonthBudgetData())

    if (isExpanded) {
      return mainCategory.subCategories
        .filter((sub) => prevMonthData[sub.subCategory] > 0)
        .map((sub) => ({
          label: sub.subCategory,
          value: Math.min((prevMonthData[sub.subCategory] / budgetAmount) * 100, 100),
          color: getSubCategoryColor(sub.subCategory),
        }))
    }

    const prevMonthTotal = mainCategory.subCategories.reduce(
      (sum, sub) => sum + prevMonthData[sub.subCategory],
      0,
    )

    return [
      {
        label: `${getPrevMonth()} 지출`,
        value: Math.min((prevMonthTotal / budgetAmount) * 100, 100),
        color: '#6b7280',
      },
    ]
  }

  const getPrevPrevMonthSegments = (mainCategory: MainCategoryBudgetStatus) => {
    const isExpanded = expandedCategories.value.has(mainCategory.mainCategory)
    const prevPrevMonthData = getPrevPrevMonthSpendingData()
    const budgetAmount = getBudgetAmountForCategory(mainCategory, getPrevPrevMonthBudgetData())

    if (isExpanded) {
      return mainCategory.subCategories
        .filter((sub) => prevPrevMonthData[sub.subCategory] > 0)
        .map((sub) => ({
          label: sub.subCategory,
          value: Math.min((prevPrevMonthData[sub.subCategory] / budgetAmount) * 100, 100),
          color: getSubCategoryColor(sub.subCategory),
        }))
    }

    const prevPrevMonthTotal = mainCategory.subCategories.reduce(
      (sum, sub) => sum + prevPrevMonthData[sub.subCategory],
      0,
    )

    return [
      {
        label: `${getPrevPrevMonth()} 지출`,
        value: Math.min((prevPrevMonthTotal / budgetAmount) * 100, 100),
        color: '#9ca3af',
      },
    ]
  }

  // 예산 금액 조회 유틸리티
  const getBudgetAmountForCategory = (
    mainCategory: MainCategoryBudgetStatus,
    budgetData: MainCategoryBudgetStatus[],
  ): number => {
    const budget = budgetData.find((b) => b.mainCategory === mainCategory.mainCategory)
    return budget?.budgetAmount || mainCategory.budgetAmount
  }

  return {
    getMainCategorySegments,
    getPrevMonthSegments,
    getPrevPrevMonthSegments,
  }
}