<template>
  <div class="mb-5 last:mb-0">
    <div class="flex justify-between items-center mb-3">
      <h4 class="text-[14px] font-semibold text-app-dark-gray m-0 flex-1">
        {{ title }}
        <span
          class="text-[12px] font-normal"
          :class="parseFloat(ratio) >= 100 ? 'text-app-red' : ''"
        >{{ ratio }}%</span>
      </h4>
      <div class="flex items-baseline gap-1">
        <div class="text-xs text-app-dark-gray font-semibold">
          {{ formatCurrency(spent) }}
        </div>
        <div class="text-xs text-app-dark-gray">
          / {{ formatCurrency(budget) }}
        </div>
      </div>
    </div>
    <SegmentedProgressBar
      :name="segmentName"
      :segments="segments"
      :total="100"
      :showLegend="true"
    />
  </div>
</template>

<script setup lang="ts">
import SegmentedProgressBar from '@/components/progressBar/SegmentedProgressBar.vue'
import { formatCurrency } from '@/utils/calculations'

defineProps<{
  title: string
  ratio: string
  spent: number
  budget: number
  segments: any[]
  segmentName: string
}>()
</script>