import { computed } from 'vue'
import { useBudgetsStore } from '@/stores/budgets'
import { transactionService } from '@/services/transactionService'
import { getRelativeMonth } from '@/utils/dateUtils'
import { CATEGORIES } from '@/types/budgets'
import type { MainCategory } from '@/types/budgets'

export function useDashboardAnalytics() {
  const budgetsStore = useBudgetsStore()

  // 총 예산에서 가장 많이 지출한 카테고리 찾기
  const highestSpendingCategory = computed(() => {
    const budgetSummary = budgetsStore.currentBudgetSummary
    if (
      !budgetSummary ||
      budgetSummary.mainCategoryBudgets.length === 0 ||
      budgetSummary.totalBudget === 0
    ) {
      return { category: '쇼핑', ratio: 30 } // 기본값
    }

    // 지출액이 가장 많은 카테고리 찾기
    const categoryWithHighestSpending = budgetSummary.mainCategoryBudgets.reduce(
      (prev, current) => {
        return current.totalSpent > prev.totalSpent ? current : prev
      },
    )

    // 총 예산에서 해당 카테고리 지출이 차지하는 비율 계산
    const ratio =
      budgetSummary.totalBudget > 0
        ? (categoryWithHighestSpending.totalSpent / budgetSummary.totalBudget) * 100
        : 0

    return {
      category: categoryWithHighestSpending.mainCategory,
      ratio: Math.round(ratio),
    }
  })

  // 전월 대비 변화 계산 (기존 유틸리티 활용)
  const categoryComparison = computed(() => {
    try {
      const budgetSummary = budgetsStore.currentBudgetSummary
      if (!budgetSummary || budgetSummary.mainCategoryBudgets.length === 0) {
        return { category: '문화', changeRatio: 10, isIncrease: false }
      }

      // 기존 유틸리티 활용
      const previousMonth = getRelativeMonth(1).string // 1달 전
      const previousSpending = transactionService.getSpendingByMonth(previousMonth)

      // 현재월 카테고리별 지출 (이미 계산된 데이터 활용)
      const currentCategorySpending = new Map(
        budgetSummary.mainCategoryBudgets.map((cat) => [cat.mainCategory, cat.totalSpent]),
      )

      // 전월 카테고리별 지출 (CATEGORIES 타입 활용)
      const previousCategorySpending = new Map<string, number>()
      Object.entries(previousSpending).forEach(([subCategory, amount]) => {
        // CATEGORIES.SUB에서 MainCategory 찾기
        let mainCategory: MainCategory = '기타'
        for (const [main, subs] of Object.entries(CATEGORIES.SUB)) {
          if ((subs as readonly string[]).includes(subCategory)) {
            mainCategory = main as MainCategory
            break
          }
        }

        const current = previousCategorySpending.get(mainCategory) || 0
        previousCategorySpending.set(mainCategory, current + amount)
      })

      // 카테고리별 변화 계산
      const changes = Array.from(currentCategorySpending.entries()).map(
        ([category, currentAmount]) => {
          const previousAmount = previousCategorySpending.get(category) || 0
          const change = currentAmount - previousAmount
          const changeRatio =
            previousAmount > 0 ? (change / previousAmount) * 100 : currentAmount > 0 ? 100 : 0

          return { category, change, changeRatio }
        },
      )

      // 가장 증가한 카테고리 또는 가장 적게 감소한 카테고리 찾기
      const increasedCategories = changes.filter((c) => c.change > 0)
      if (increasedCategories.length > 0) {
        const maxIncrease = increasedCategories.reduce((prev, curr) =>
          curr.changeRatio > prev.changeRatio ? curr : prev,
        )

        return {
          category: maxIncrease.category,
          changeRatio: Math.round(Math.abs(maxIncrease.changeRatio)),
          isIncrease: true,
        }
      }

      // 모두 감소했다면 가장 적게 감소한 카테고리
      const validChanges = changes.filter((c) => c.changeRatio !== 0)
      if (validChanges.length > 0) {
        const leastDecrease = validChanges.reduce((prev, curr) =>
          curr.changeRatio > prev.changeRatio ? curr : prev,
        )

        return {
          category: leastDecrease.category,
          changeRatio: Math.round(Math.abs(leastDecrease.changeRatio)),
          isIncrease: false,
        }
      }

      return { category: '문화', changeRatio: 10, isIncrease: false }
    } catch (error) {
      console.error('categoryComparison 오류:', error)
      return { category: '문화', changeRatio: 10, isIncrease: false }
    }
  })

  return {
    highestSpendingCategory,
    categoryComparison,
  }
}
