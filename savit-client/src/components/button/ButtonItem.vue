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
  variant?: 'primary' | 'dark' | 'warn' | 'purple'
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
  switch (props.variant) {
    case 'dark':
      return 'bg-app-dark-gray active:bg-[#1B2631]'

    case 'warn':
      return 'bg-app-red active:bg-[#C0392B]'

    case 'purple':
      return 'bg-app-purple active:bg-[#6B5B95]'

    default:
      return 'bg-app-green active:bg-[#16A085]'
  }
})
</script>

<style scoped></style>
