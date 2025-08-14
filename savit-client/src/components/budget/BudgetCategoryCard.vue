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
          :title="`${getPrevMonth()} ${mainCategory.mainCategory}`"
          :ratio="getPrevMonthRatio(mainCategory)"
          :spent="getPrevMonthSpent(mainCategory)"
          :budget="getPrevMonthBudgetAmount(mainCategory)"
          :segments="getPrevMonthSegments(mainCategory)"
          :segment-name="`prev-${mainCategory.mainCategory}`"
        />
        <BudgetHistorySection
          :title="`${getPrevPrevMonth()} ${mainCategory.mainCategory}`"
          :ratio="getPrevPrevMonthRatio(mainCategory)"
          :spent="getPrevPrevMonthSpent(mainCategory)"
          :budget="getPrevPrevMonthBudgetAmount(mainCategory)"
          :segments="getPrevPrevMonthSegments(mainCategory)"
          :segment-name="`prev-prev-${mainCategory.mainCategory}`"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SegmentedProgressBar from '@/components/progressBar/SegmentedProgressBar.vue'
import CategoryIcon from '@/components/icon/CategoryIcon.vue'
import BudgetHistorySection from '@/components/budget/BudgetHistorySection.vue'
import type { MainCategory } from '@/types/budgets'

defineProps<{
  mainCategory: any
  categoryColor: string
  formatCurrency: (amount: number) => string
  getExpandedClass: (category: any) => object
  getAmountClass: (category: any) => string
  getMainCategorySegments: (category: any) => any[]
  getPrevMonth: () => string
  getPrevPrevMonth: () => string
  getPrevMonthRatio: (category: any) => string
  getPrevPrevMonthRatio: (category: any) => string
  getPrevMonthSpent: (category: any) => number
  getPrevPrevMonthSpent: (category: any) => number
  getPrevMonthBudgetAmount: (category: any) => number
  getPrevPrevMonthBudgetAmount: (category: any) => number
  getPrevMonthSegments: (category: any) => any[]
  getPrevPrevMonthSegments: (category: any) => any[]
}>()

defineEmits<{
  toggle: [category: MainCategory]
}>()
</script>