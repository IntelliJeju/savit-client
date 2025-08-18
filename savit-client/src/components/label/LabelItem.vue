<template>
  <div>
    <button
      class="pointer-events-none border-none text-[0.75rem] text-center"
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
  variant?: 'default' | 'green' | 'red' | 'grey' | 'purple'
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
    return 'bg-[#F0FDF9] text-app-green font-bold rounded-lg py-0.4 px-1'
  } else if (props.variant === 'red') {
    return 'bg-[#FECACA] text-app-red font-bold rounded-lg py-0.4 px-1'
  } else if (props.variant === 'grey') {
    return 'bg-[#EFEFF0] text-[#888888] font-bold rounded-lg py-0.4 px-1'
  } else if (props.variant === 'purple') {
    return 'bg-app-purple text-[#FFFFFF] rounded-3xl py-1 px-3'
  }
  // 기본 버튼
  return 'bg-app-green text-[#FFFFFF] rounded-3xl py-1 px-3'
})
</script>

<style scoped></style>
