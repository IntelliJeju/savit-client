<template>
  <button
    class="cursor-pointer border-none rounded-lg text-[1rem] text-center text-[#FFFFFF] h-12 w-[100%]"
    :class="buttonClasses"
    @click="handleClick"
  >
    <slot>{{ text }}</slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props 정의
interface Props {
  variant?: 'primary' | 'dark' | 'warn'
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  text: '',
})

// Emits 정의
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  console.log('버튼 클릭')
  emit('click', event)
}

const buttonClasses = computed(() => {
  // 어두운 기본 버튼
  if (props.variant === 'dark') {
    return 'bg-app-dark-gray'
  } else if (props.variant === 'warn') {
    return 'bg-app-red'
  }
  // 기본 버튼
  return 'bg-app-green'
})
</script>

<style scoped></style>
