<template>
  <div class="text-center" :class="containerClass">
    <!-- 아이콘 -->
    <div 
      class="flex items-center justify-center mx-auto mb-4" 
      :class="iconContainerClass"
    >
      <slot name="icon">
        <svg class="text-slate-400" :class="iconClass" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
            clip-rule="evenodd"
          />
        </svg>
      </slot>
    </div>

    <!-- 제목 -->
    <div class="text-slate-800 font-medium mb-2" :class="titleClass">
      {{ title }}
    </div>

    <!-- 설명 -->
    <div class="text-slate-500" :class="descriptionClass">
      {{ description }}
    </div>

    <!-- 액션 버튼 (선택사항) -->
    <div v-if="$slots.action" class="mt-6">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  description: string
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium'
})

const containerClass = computed(() => {
  switch (props.size) {
    case 'small':
      return 'py-6'
    case 'large':
      return 'py-12'
    default:
      return 'py-8'
  }
})

const iconContainerClass = computed(() => {
  switch (props.size) {
    case 'small':
      return 'w-10 h-10 bg-slate-100 rounded-xl'
    case 'large':
      return 'w-16 h-16 bg-slate-100 rounded-2xl'
    default:
      return 'w-12 h-12 bg-slate-100 rounded-xl'
  }
})

const iconClass = computed(() => {
  switch (props.size) {
    case 'small':
      return 'w-5 h-5'
    case 'large':
      return 'w-8 h-8'
    default:
      return 'w-6 h-6'
  }
})

const titleClass = computed(() => {
  switch (props.size) {
    case 'small':
      return 'text-sm'
    case 'large':
      return 'text-lg'
    default:
      return 'text-base'
  }
})

const descriptionClass = computed(() => {
  switch (props.size) {
    case 'small':
      return 'text-xs'
    case 'large':
      return 'text-sm'
    default:
      return 'text-sm'
  }
})
</script>

<style scoped></style>