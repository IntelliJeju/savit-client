<template>
  <div class="progress-back w-full h-2 bg-[#E0E0E0] rounded-full">
    <div
      class="progress-front h-2"
      :class="progress <= 50 ? 'bg-[#0AB68B]' : progress <= 80 ? 'bg-[#FFBC00]' : 'bg-[#FF4242]'"
      :style="{ width: Math.min(100, progress) + '%' }"
    />
  </div>
</template>

<script setup lang="ts">
// 사용법
// <ProgressBar :name="test" :min-value="0" :max-value="100" :value="50" />

import { computed } from 'vue'

const props = defineProps<{
  name: string
  minValue: number
  maxValue: number
  value: number
}>()

const progress = computed(() => {
  return (props.value / props.maxValue) * 100
})
</script>

<style scoped></style>
