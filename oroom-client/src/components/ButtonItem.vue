<template>
  <button :class="buttonClasses" @click="handleClick">
    <slot>{{ text }}</slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props 정의
interface Props {
  variant?: 'primary' | 'dark'
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
  if (props.variant === 'dark') {
    return 'cursor-pointer border-none rounded-[8px] bg-[#545045] font-[Pretendard] text-[16px] text-center text-[#FFFFFF] mx-[32px] my-[32px] px-[32px] py-[16px] h-[56px] w-[100%]'
  }

  // 기본
  return 'cursor-pointer border-none rounded-[8px] bg-[#0ab68b] font-[Pretendard] text-[16px] text-center text-[#FFFFFF] mx-[32px] my-[32px] px-[32px] py-[16px] h-[56px] w-[100%]'
})
</script>

<style scoped></style>
