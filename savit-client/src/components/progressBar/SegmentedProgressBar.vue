<template>
  <div class="segmented-progress-container">
    <div class="progress-back w-full h-2 bg-[#E0E0E0] rounded-full">
      <div 
        v-for="(segment, index) in segments"
        :key="`${name}-segment-${index}`"
        class="progress-segment h-2 rounded-full"
        :class="{
          'rounded-l-full': index === 0,
          'rounded-r-full': index === segments.length - 1,
          'rounded-none': index > 0 && index < segments.length - 1
        }"
        :style="{ 
          width: (segment.value / total) * 100 + '%',
          backgroundColor: segment.color
        }"
      />
    </div>
    <div class="legend-container mt-2">
      <div 
        v-for="(segment, index) in segments"
        :key="`${name}-legend-${index}`"
        class="legend-item flex items-center gap-2 text-xs"
      >
        <div 
          class="legend-color w-3 h-3 rounded-full"
          :style="{ backgroundColor: segment.color }"
        />
        <span class="legend-label">{{ segment.label }}</span>
        <span class="legend-value text-gray-500">{{ segment.value }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Segment {
  label: string
  value: number
  color: string
}

const props = defineProps<{
  name: string
  segments: Segment[]
  total: number
}>()
</script>

<style scoped>
.segmented-progress-container {
  width: 100%;
}

.progress-back {
  position: relative;
  display: flex;
}

.progress-segment {
  float: left;
}

.legend-container {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.legend-color {
  flex-shrink: 0;
}

.legend-label {
  font-weight: 500;
}

.legend-value {
  font-weight: 400;
}
</style>