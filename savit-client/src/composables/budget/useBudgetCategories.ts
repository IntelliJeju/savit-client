import { ref, computed, type Ref } from 'vue'
import { DEFAULT_BUDGET_AMOUNTS, CATEGORY_ORDER } from '@/types/budgets'
import { calculateDefaultTotalBudget, createDefaultCategoryData } from '@/utils/budgetUtils'
import type { CategoryData, MainCategory } from '@/types/budgets'
import {
  calculateAmount,
  calculatePercentageFromAmount,
  extractNumericValue,
  adjustCategoriesProportionally,
  adjustCategoriesForSlider,
  redistributeExcessPercentage,
  roundAndAdjustRatios,
} from '@/utils/calculations'

const BUDGET_STORAGE_KEY = 'budget-category-settings'
const MAX_PERCENTAGE = 100

export function useBudgetCategories(totalBudget: Ref<number>) {
  const loadSavedCategories = (): CategoryData[] => {
    try {
      const saved = localStorage.getItem(BUDGET_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (
          Array.isArray(parsed) &&
          parsed.every(
            (item) => item && typeof item.name === 'string' && typeof item.percentage === 'number',
          )
        ) {
          return parsed
        }
      }
    } catch (error) {
      console.error('저장된 카테고리 데이터 로드 실패:', error)
    }
    return createDefaultCategoryData(DEFAULT_BUDGET_AMOUNTS, CATEGORY_ORDER)
  }

  const saveCategoriesData = (categoriesData: CategoryData[]): void => {
    try {
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(categoriesData))
    } catch (error) {
      console.error('카테고리 데이터 저장 실패:', error)
    }
  }

  // Reactive state
  const categories = ref<CategoryData[]>(loadSavedCategories())

  // Computed properties
  const totalPercentage = computed(() => {
    const total = categories.value.reduce((sum, cat) => sum + cat.percentage, 0)
    return Math.round(total * 10) / 10
  })

  const remainingBudget = computed(() => {
    const usedBudget = categories.value.reduce(
      (sum, cat) => sum + calculateAmount(cat.percentage, totalBudget.value),
      0,
    )
    return totalBudget.value - usedBudget
  })

  const percentageClass = computed(() => [
    'text-lg font-bold',
    totalPercentage.value === MAX_PERCENTAGE ? 'text-app-green' : 'text-app-red',
  ])

  // 카테고리 금액 계산 (이미 calculations utils에 있는 함수 재사용)
  const calculateCategoryAmount = (percentage: number): number =>
    calculateAmount(percentage, totalBudget.value)

  const calculateOtherCategoriesTotal = (excludeIndex: number): number =>
    categories.value.reduce(
      (sum, cat, idx) => (idx === excludeIndex ? sum : sum + cat.percentage),
      0,
    )

  const adjustExcessPercentage = (categoryIndex: number, newPercentage: number): void => {
    const otherTotal = calculateOtherCategoriesTotal(categoryIndex)

    if (newPercentage + otherTotal > MAX_PERCENTAGE) {
      const excess = newPercentage + otherTotal - MAX_PERCENTAGE
      adjustCategoriesProportionally({
        categories: categories.value,
        excludeIndex: categoryIndex,
        excess,
      })
    }
  }

  const redistributeIfExceeds = (changedIndex: number): void => {
    const total = categories.value.reduce((sum, cat) => sum + cat.percentage, 0)

    if (total > MAX_PERCENTAGE) {
      redistributeExcessPercentage(categories.value, changedIndex, total - MAX_PERCENTAGE)
    }
  }

  // 이벤트 핸들러
  const handleAmountInputChange = (categoryIndex: number, event: Event): void => {
    const inputAmount = extractNumericValue(event)
    if (totalBudget.value === 0) return

    const newPercentage = calculatePercentageFromAmount(inputAmount, totalBudget.value)
    categories.value[categoryIndex].percentage = newPercentage

    adjustExcessPercentage(categoryIndex, newPercentage)
    saveCategoriesData(categories.value)
  }

  const handleSliderChange = (changedIndex: number, event: Event): void => {
    const target = event.target as HTMLInputElement
    const newValue = parseInt(target.value)
    const difference = newValue - categories.value[changedIndex].percentage

    categories.value[changedIndex].percentage = newValue

    if (difference !== 0) {
      adjustCategoriesForSlider(categories.value, changedIndex, difference)
    }

    redistributeIfExceeds(changedIndex)
    saveCategoriesData(categories.value)
  }

  const calculateDefaultRatios = (): number[] => {
    const totalDefaultBudget = calculateDefaultTotalBudget(DEFAULT_BUDGET_AMOUNTS)

    return categories.value.map((cat) => {
      const categoryName = cat.name as MainCategory
      return (DEFAULT_BUDGET_AMOUNTS[categoryName] / totalDefaultBudget) * MAX_PERCENTAGE
    })
  }

  const applyRecommendedRatios = (): void => {
    const defaultRatios = calculateDefaultRatios()
    const adjustedRatios = roundAndAdjustRatios(defaultRatios)

    categories.value.forEach((cat, idx) => {
      cat.percentage = adjustedRatios[idx]
    })

    saveCategoriesData(categories.value)
  }

  return {
    categories,
    totalPercentage,
    remainingBudget,
    percentageClass,
    calculateCategoryAmount,
    handleAmountInputChange,
    handleSliderChange,
    applyRecommendedRatios,
    MAX_PERCENTAGE,
  }
}
