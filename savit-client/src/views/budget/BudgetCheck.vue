<template>
  <div class="space-y-4">
    <div class="budget-section">
      <div 
        class="main-progress-container cursor-pointer" 
        @click="toggleExpanded"
      >
        <ProgressBar 
          v-if="!isExpanded"
          :name="'main-budget-unified'" 
          :min-value="0" 
          :max-value="100" 
          :value="totalMainValue"
        />
        <SegmentedProgressBar 
          v-else
          :name="'main-budget'" 
          :segments="mainSegments" 
          :total="100"
        />
        <div class="expand-icon" :class="{ 'rotated': isExpanded }">
          ▼
        </div>
      </div>
      
      <div v-if="isExpanded" class="sub-progress-container">
        <div class="sub-progress-item">
          <h4 class="text-sm font-medium mb-2">카테고리 1</h4>
          <SegmentedProgressBar 
            :name="'sub-budget-1'" 
            :segments="subSegments1" 
            :total="100"
          />
        </div>
        <div class="sub-progress-item">
          <h4 class="text-sm font-medium mb-2">카테고리 2</h4>
          <SegmentedProgressBar 
            :name="'sub-budget-2'" 
            :segments="subSegments2" 
            :total="100"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ProgressBar from '@/components/progressBar/ProgressBar.vue'
import SegmentedProgressBar from '@/components/progressBar/SegmentedProgressBar.vue'

const isExpanded = ref(false)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const mainSegments = [
  { label: '식비', value: 30, color: '#0AB68B' },
  { label: '교통비', value: 15, color: '#FFBC00' },
  { label: '기타', value: 5, color: '#FF4242' }
]

const subSegments1 = [
  { label: '아침', value: 10, color: '#0AB68B' },
  { label: '점심', value: 15, color: '#FFBC00' },
  { label: '저녁', value: 5, color: '#FF4242' }
]

const subSegments2 = [
  { label: '버스', value: 8, color: '#0AB68B' },
  { label: '지하철', value: 5, color: '#FFBC00' },
  { label: '택시', value: 2, color: '#FF4242' }
]

const totalMainValue = computed(() => {
  return mainSegments.reduce((sum, segment) => sum + segment.value, 0)
})
</script>

<style scoped>
.budget-section {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.main-progress-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.expand-icon {
  transition: transform 0.3s ease;
  font-size: 0.75rem;
  color: #6b7280;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.sub-progress-container {
  margin-top: 1rem;
  padding-left: 1rem;
  border-left: 2px solid #e5e7eb;
}

.sub-progress-item {
  margin-bottom: 1rem;
}

.sub-progress-item:last-child {
  margin-bottom: 0;
}
</style>