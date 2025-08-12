<template>
  <button
    class="border-none rounded-lg text-[1rem] text-center h-12 w-[100%]"
    :class="buttonClasses"
    @click="handleClick"
    :disabled="disabled"
  >
    <slot>{{ text }}</slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props 정의
interface Props {
  variant?: 'primary' | 'dark' | 'warn' | 'purple'
  text?: string
  disabled?: boolean
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
  // disabled 상태일 때
  if (props.disabled) {
    return 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
  }

  // 활성 상태 스타일
  const baseClasses = 'text-white cursor-pointer transition-colors duration-200'
  
  switch (props.variant) {
    case 'dark':
      return `${baseClasses} bg-app-dark-gray hover:bg-[#1B2631] active:bg-[#1B2631]`

    case 'warn':
      return `${baseClasses} bg-app-red hover:bg-[#C0392B] active:bg-[#C0392B]`

    case 'purple':
      return `${baseClasses} bg-app-purple hover:bg-[#6B5B95] active:bg-[#6B5B95]`

    default:
      return `${baseClasses} bg-app-green hover:bg-[#16A085] active:bg-[#16A085]`
  }
})
</script>

<style scoped></style>
