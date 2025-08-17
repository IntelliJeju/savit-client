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
        @toggle="toggleCategory"
      />
    </CardComponent>
  </BudgetLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onActivated } from 'vue'
import { useBudget } from '@/composables/budget/useBudget'
import router from '@/router'
import BudgetLayout from '@/components/budget/BudgetLayout.vue'
import CardComponent from '@/components/card/CardComponent.vue'
import BudgetCategoryCard from '@/components/budget/BudgetCategoryCard.vue'

// Composables
const {
  isLoading,
  budgetSummary,
  initializeBudget,
  toggleCategory,
  expandedCategories,
  calculateSpendingRatio,
} = useBudget()

const mainCategories = computed(() => {
  if (!budgetSummary.value) return []
  return budgetSummary.value.mainCategoryBudgets.map((cat) => ({
    ...cat,
    expanded: expandedCategories.value.has(cat.mainCategory),
    isOverBudget: cat.totalSpent >= cat.budgetAmount,
    spendingRatio: parseFloat(calculateSpendingRatio(cat.totalSpent, cat.budgetAmount)),
  }))
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
