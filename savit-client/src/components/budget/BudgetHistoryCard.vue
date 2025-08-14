<template>
  <CardComponent>
    <p class="font-bold text-lg mb-6">나의 지출 / 예산 이력</p>

    <div class="flex justify-between items-center mb-4">
      <span class="text-lg font-medium">{{ lastMonth.name }}</span>
      <div class="text-right">
        <span
          :class="lastMonth.spending > lastMonth.budget ? 'text-app-red' : 'text-app-blue'"
          class="font-bold"
        >
          {{ formatCurrency(lastMonth.spending) }}
        </span>
        <span class="text-app-dark-gray"> / {{ formatCurrency(lastMonth.budget) }}</span>
      </div>
    </div>

    <div class="flex justify-between items-center mb-6">
      <span class="text-lg font-medium">{{ twoMonthsAgo.name }}</span>
      <div class="text-right">
        <span
          :class="twoMonthsAgo.spending > twoMonthsAgo.budget ? 'text-app-red' : 'text-app-blue'"
          class="font-bold"
        >
          {{ formatCurrency(twoMonthsAgo.spending) }}
        </span>
        <span class="text-app-dark-gray"> / {{ formatCurrency(twoMonthsAgo.budget) }}</span>
      </div>
    </div>

    <div class="flex items-center text-app-dark-gray text-sm">
      <v-icon name="hi-information-circle" class="w-6 mr-2" />
      <span>지난 지출/예산 내역을 참고해서 설정해보세요</span>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import CardComponent from '@/components/card/CardComponent.vue'
import { formatCurrency } from '@/utils/calculations'

interface MonthData {
  name: string
  spending: number
  budget: number
}

interface Props {
  lastMonth: MonthData
  twoMonthsAgo: MonthData
}

defineProps<Props>()
</script>