<template>
  <Teleport to="#header-content">
    <span>예산 확인</span>
  </Teleport>

  <div class="h-full grid grid-rows-[1fr_auto]">
    <div class="py-4">
      <div v-if="isLoading" class="text-center py-10 text-app-dark-gray">
        <p>{{ '데이터를 불러오는 중...' }}</p>
      </div>

      <template v-else>
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
      </template>
    </div>
    <div class="py-4">
      <ButtonItem text="예산 설정" @click="handleBudgetSetting" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBudget } from '@/composables/budget/useBudget'
import CardComponent from '@/components/card/CardComponent.vue'
import BudgetCategoryCard from '@/components/budget/BudgetCategoryCard.vue'
import ButtonItem from '@/components/button/ButtonItem.vue'

const router = useRouter()

// Composables
const {
  isLoading,
  budgetSummary,
  isTotalBudgetSet,
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

// 예산 설정 확인 및 리다이렉트
onMounted(() => {
  if (!isTotalBudgetSet.value) {
    router.replace('/budget/choice')
  }
})
</script>
