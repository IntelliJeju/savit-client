<template>
  <div>
    <button
      class="pointer-events-none border-none font-[Pretendard] font-bold text-[1rem] text-center"
      :class="buttonClasses"
    >
      <slot>{{ text }}</slot>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props 정의
interface Props {
  variant?: 'default' | 'green' | 'red' | 'grey'
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  text: '',
})

// Emits 정의
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  if (props.variant === 'green') {
    return 'bg-[#F0FDF9] text-[#1DD1A1] h-6 w-12 rounded-lg'
  } else if (props.variant === 'red') {
    return 'bg-[#FECACA] text-[#FE4444] h-6 w-12 rounded-lg'
  } else if (props.variant === 'grey') {
    return 'bg-[#EFEFF0] text-[#888888] h-6 w-12 rounded-lg'
  }
  // 기본 버튼
  return 'bg-[#0ab68b] text-[#FFFFFF] h-9 w-20 rounded-3xl'
})
</script>

<style scoped></style>
