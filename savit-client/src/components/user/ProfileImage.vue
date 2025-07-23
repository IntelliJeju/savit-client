<template>
  <div>
    <button
      class="pointer-events-none border-none font-[Pretendard] font-bold text-[1rem] text-center h-9 w-9 rounded-3xl"
      :class="buttonClasses"
    >
      <slot>{{ text.charAt(0) }}</slot>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props 정의
interface Props {
  variant?: 'default' | 'others'
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
  if (props.variant === 'others') {
    return 'gradation bg-gradient-to-l from-[#0AB68B]'
  }
  // 기본 버튼
  return 'gradation bg-gradient-to-r from-[#6C5CE7]'
})
</script>

<style scoped></style>
