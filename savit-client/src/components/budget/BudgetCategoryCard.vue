<template>
  <div
    class="mb-2 p-3 transition-all duration-200 relative rounded-lg last:mb-0"
    :class="getExpandedClass(mainCategory)"
  >
    <div class="absolute top-2 right-2" @click="$emit('toggle', mainCategory.mainCategory)">
      <div
        class="text-[8px] text-app-dark-gray transition-transform duration-200 cursor-pointer"
        :class="{ 'rotate-180': mainCategory.expanded }"
      >
        <v-icon name="oi-triangle-down" class="w-8" />
      </div>
    </div>

    <div
      class="flex justify-between items-center cursor-pointer mb-1 mt-4"
      @click="$emit('toggle', mainCategory.mainCategory)"
    >
      <div class="flex items-center flex-1 min-w-0">
        <div class="w-6 flex-shrink-0">
          <CategoryIcon
            :category="mainCategory.mainCategory"
            :color="categoryColor"
            :size="24"
          />
        </div>
        <div class="min-w-0 flex-1 ml-2">
          <div class="text-[16px] font-semibold text-black truncate">
            {{ mainCategory.mainCategory }}
            <span
              class="text-[12px] font-normal"
              :class="mainCategory.spendingRatio >= 100 ? 'text-app-red' : ''"
              >{{ mainCategory.spendingRatio.toFixed(1) }}%</span
            >
          </div>
        </div>
      </div>

      <div v-if="mainCategory.expanded" class="flex items-baseline gap-1">
        <div class="text-sm font-semibold" :class="getAmountClass(mainCategory)">
          {{ formatCurrency(mainCategory.totalSpent) }}
        </div>
        <div class="text-sm text-app-dark-gray">
          / {{ formatCurrency(mainCategory.budgetAmount) }}
        </div>
      </div>
    </div>

    <div class="mb-1">
      <SegmentedProgressBar
        :name="`main-${mainCategory.mainCategory}`"
        :segments="getMainCategorySegments(mainCategory)"
        :total="100"
        :showLegend="mainCategory.expanded"
      />
      <div v-if="!mainCategory.expanded" class="flex justify-between items-center mt-1 text-xs">
        <div class="font-semibold" :class="getAmountClass(mainCategory)">
          {{ formatCurrency(mainCategory.totalSpent) }}
        </div>
        <div class="text-app-dark-gray font-medium">
          {{ formatCurrency(mainCategory.budgetAmount) }}
        </div>
      </div>
    </div>

    <div v-if="mainCategory.expanded" class="pt-3">
      <div class="border-t border-app-gray pt-3">
        <BudgetHistorySection
          :title="`${getRelativeMonth(1).name} ${mainCategory.mainCategory}`"
          :ratio="getMonthRatio(mainCategory, 1)"
          :spent="getMonthSpent(mainCategory, 1)"
          :budget="getMonthBudgetAmount(mainCategory, 1)"
          :segments="getMonthSegments(mainCategory, 1)"
          :segment-name="`prev-${mainCategory.mainCategory}`"
        />
        <BudgetHistorySection
          :title="`${getRelativeMonth(2).name} ${mainCategory.mainCategory}`"
          :ratio="getMonthRatio(mainCategory, 2)"
          :spent="getMonthSpent(mainCategory, 2)"
          :budget="getMonthBudgetAmount(mainCategory, 2)"
          :segments="getMonthSegments(mainCategory, 2)"
          :segment-name="`prev-prev-${mainCategory.mainCategory}`"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SegmentedProgressBar from '@/components/progressBar/SegmentedProgressBar.vue'
import CategoryIcon from '@/components/icon/CategoryIcon.vue'
import BudgetHistorySection from '@/components/budget/BudgetHistorySection.vue'
import { useBudget } from '@/composables/budget/useBudget'
import { getRelativeMonth } from '@/utils/dateUtils'
import type { MainCategory, MainCategoryBudgetStatus } from '@/types/budgets'

const props = defineProps<{
  mainCategory: any
}>()

defineEmits<{
  toggle: [category: MainCategory]
}>()

// 통합된 composable 사용
const {
  expandedCategories,
  getMonthSpendingData,
  getMonthBudgetData,
  getMonthSpent,
  getMonthRatio,
  getMonthBudgetAmount,
  getAmountClass,
  formatCurrency,
} = useBudget()

// 월별 세그먼트 계산 함수 (통합)
const getMonthSegments = (mainCategory: MainCategoryBudgetStatus, monthsBack: number) => {
  const isExpanded = expandedCategories.value.has(mainCategory.mainCategory)
  const monthSpendingData = getMonthSpendingData(monthsBack)
  const monthBudgetData = getMonthBudgetData(monthsBack)
  const budgetAmount = getBudgetAmountForCategory(mainCategory, monthBudgetData)

  if (isExpanded) {
    return mainCategory.subCategories
      .filter((sub) => monthSpendingData[sub.subCategory] > 0)
      .map((sub) => ({
        label: sub.subCategory,
        value: Math.min((monthSpendingData[sub.subCategory] / budgetAmount) * 100, 100),
        color: getSubCategoryColor(sub.subCategory),
      }))
  }

  const monthTotal = mainCategory.subCategories.reduce(
    (sum, sub) => sum + monthSpendingData[sub.subCategory],
    0,
  )

  return [
    {
      label: `${getRelativeMonth(monthsBack).name} 지출`,
      value: Math.min((monthTotal / budgetAmount) * 100, 100),
      color: monthsBack === 1 ? '#6b7280' : '#9ca3af',
    },
  ]
}

// 예산 금액 조회 유틸리티 (중복 제거)
const getBudgetAmountForCategory = (
  mainCategory: MainCategoryBudgetStatus,
  budgetData: MainCategoryBudgetStatus[],
): number => {
  const budget = budgetData.find((b) => b.mainCategory === mainCategory.mainCategory)
  return budget?.budgetAmount || mainCategory.budgetAmount
}

// 컴포넌트 내부 로직
const categoryColor = '#028174'

const getExpandedClass = (mainCategory: any) => ({
  'bg-app-light-gray': mainCategory.expanded,
})

// 서브카테고리 색상 매핑 (BudgetCheck.vue에서 이동)
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

const getSubCategoryColor = (subCategory: string): string => {
  return subCategoryColors[subCategory] || '#6b7280'
}

// 메인 카테고리 세그먼트 계산 (현재 월)
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
</script>