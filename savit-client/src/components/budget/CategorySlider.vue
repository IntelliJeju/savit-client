<template>
  <div class="mb-8 last:mb-0">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <CategoryIcon :category="category.name" :size="24" color="#028174" />
        <span class="font-medium text-app-dark-gray">{{ category.name }}</span>
      </div>
      <p class="text-lg font-bold text-app-dark-gray">{{ Number(category.percentage).toFixed(1) }}%</p>
    </div>

    <div class="relative">
      <input
        type="range"
        min="0"
        :max="maxPercentage"
        step="5"
        v-model="category.percentage"
        @input="$emit('slider-change', index, $event)"
        class="w-full h-2 bg-app-gray rounded-lg appearance-none cursor-pointer range-slider"
        :style="{
          background: `linear-gradient(to right, #10b981 0%, #10b981 ${category.percentage}%, #e5e7eb ${category.percentage}%, #e5e7eb 100%)`,
        }"
      />
    </div>

    <div class="flex items-center justify-between">
      <div class="text-sm text-gray-500">
        지난 달 {{ formatCurrency(category.lastMonthSpent) }}
      </div>
      <div class="flex items-center">
        <input
          type="text"
          :value="formatCurrency(calculateCategoryAmount(category.percentage))"
          @input="$emit('amount-change', index, $event)"
          @focus="$emit('amount-focus', $event)"
          @blur="$emit('amount-blur', $event)"
          class="text-lg font-bold text-app-dark-gray text-right bg-transparent w-28 cursor-pointer hover:bg-gray-100 rounded px-2 focus:outline-none"
          placeholder="0"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CategoryIcon from '@/components/icon/CategoryIcon.vue'
import type { CategoryData } from '@/stores/budgets'
import { formatCurrency, calculateAmount } from '@/utils/calculations'

const props = defineProps<{
  category: CategoryData
  index: number
  maxPercentage: number
  totalBudget: number
}>()

defineEmits<{
  'slider-change': [index: number, event: Event]
  'amount-change': [index: number, event: Event]
  'amount-focus': [event: Event]
  'amount-blur': [event: Event]
}>()

const calculateCategoryAmount = (percentage: number): number => {
  return calculateAmount(percentage, props.totalBudget)
}
</script>

<style scoped>
.range-slider::-webkit-slider-thumb {
  appearance: none;
  height: 1.25rem;
  width: 2rem;
  border-radius: 0.25rem;
  background: white;
  cursor: pointer;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  background-image:
    linear-gradient(to bottom, transparent 25%, #9ca3af 25%, #9ca3af 75%, transparent 75%),
    linear-gradient(to bottom, transparent 25%, #9ca3af 25%, #9ca3af 75%, transparent 75%);
  background-size:
    2px 100%,
    2px 100%;
  background-position:
    40% center,
    60% center;
  background-repeat: no-repeat;
}

.range-slider::-moz-range-thumb {
  height: 1.25rem;
  width: 2rem;
  border-radius: 0.25rem;
  background: white;
  cursor: pointer;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  background-image:
    linear-gradient(to bottom, transparent 25%, #9ca3af 25%, #9ca3af 75%, transparent 75%),
    linear-gradient(to bottom, transparent 25%, #9ca3af 25%, #9ca3af 75%, transparent 75%);
  background-size:
    2px 100%,
    2px 100%;
  background-position:
    40% center,
    60% center;
  background-repeat: no-repeat;
}
</style>