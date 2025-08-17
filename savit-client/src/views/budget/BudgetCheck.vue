<template>
  <Teleport to="#header-content">
    <span>예산 확인</span>
  </Teleport>

  <BudgetLayout
    :loading="isLoading"
    loading-text="예산 정보를 불러오는 중..."
    button-text="예산 설정"
    @button-click="handleBudgetSetting"
  >
    <!-- 예산 데이터가 없을 때 -->
    <div v-if="!budgetSummary" class="text-center py-10 text-app-dark-gray">
      <p>설정된 예산이 없습니다.</p>
    </div>
    <CardComponent v-else>
      <BudgetCategoryCard
        v-for="mainCategory in mainCategories"
        :key="mainCategory.mainCategory"
        :main-category="mainCategory"
        :category-color="categoryColor"
        :format-currency="formatCurrency"
        :get-expanded-class="getExpandedClass"
        :get-amount-class="getAmountClass"
        :get-main-category-segments="getMainCategorySegments"
        :get-prev-month="getPrevMonth"
        :get-prev-prev-month="getPrevPrevMonth"
        :get-prev-month-ratio="getPrevMonthRatio"
        :get-prev-prev-month-ratio="getPrevPrevMonthRatio"
        :get-prev-month-spent="getPrevMonthSpent"
        :get-prev-prev-month-spent="getPrevPrevMonthSpent"
        :get-prev-month-budget-amount="getPrevMonthBudgetAmount"
        :get-prev-prev-month-budget-amount="getPrevPrevMonthBudgetAmount"
        :get-prev-month-segments="getPrevMonthSegments"
        :get-prev-prev-month-segments="getPrevPrevMonthSegments"
        @toggle="toggleCategory"
      />
    </CardComponent>
  </BudgetLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onActivated } from 'vue'
import { useBudgetCommon } from '@/composables/budget/useBudgetCommon'
import { useBudgetSegments } from '@/composables/budget/useBudgetSegments'
import { useBudgetCalculations } from '@/composables/budget/useBudgetCalculations'
import { formatCurrency } from '@/utils/calculations'
import router from '@/router'
import BudgetLayout from '@/components/budget/BudgetLayout.vue'
import CardComponent from '@/components/card/CardComponent.vue'
import BudgetCategoryCard from '@/components/budget/BudgetCategoryCard.vue'

// Composables
const {
  isLoading,
  budgetSummary,
  initializeBudget,
  getPrevMonth,
  getPrevPrevMonth,
  getPrevMonthSpendingData,
  getPrevPrevMonthSpendingData,
  getPrevMonthBudgetData,
  getPrevPrevMonthBudgetData,
  expandedCategories,
  toggleCategory,
} = useBudgetCommon()

const { getMainCategorySegments, getPrevMonthSegments, getPrevPrevMonthSegments } =
  useBudgetSegments(
    expandedCategories,
    getPrevMonth,
    getPrevPrevMonth,
    getPrevMonthSpendingData,
    getPrevPrevMonthSpendingData,
    getPrevMonthBudgetData,
    getPrevPrevMonthBudgetData,
  )

const {
  getPrevMonthSpent,
  getPrevPrevMonthSpent,
  getPrevMonthRatio,
  getPrevPrevMonthRatio,
  getPrevMonthBudgetAmount,
  getPrevPrevMonthBudgetAmount,
  getAmountClass,
} = useBudgetCalculations(
  getPrevMonthSpendingData,
  getPrevPrevMonthSpendingData,
  getPrevMonthBudgetData,
  getPrevPrevMonthBudgetData,
)

// Constants
const categoryColor = '#028174'

const mainCategories = computed(() => {
  if (!budgetSummary.value) return []
  return budgetSummary.value.mainCategoryBudgets.map((cat) => ({
    ...cat,
    expanded: expandedCategories.value.has(cat.mainCategory),
    isOverBudget: cat.totalSpent >= cat.budgetAmount,
    spendingRatio:
      cat.budgetAmount > 0 ? parseFloat(((cat.totalSpent / cat.budgetAmount) * 100).toFixed(1)) : 0,
  }))
})

// UI helpers
const getExpandedClass = (mainCategory: any) => ({
  'bg-app-light-gray': mainCategory.expanded,
})

const handleBudgetSetting = () => {
  router.push('/budget/choice')
}

// Lifecycle hooks
onMounted(async () => {
  await initializeBudget()
})

onActivated(async () => {
  await initializeBudget()
})
</script>
