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

    return 'cursor-pointer border-none rounded-lg bg-[#545045] font-[Pretendard] text-[1rem] text-center text-[#FFFFFF] mx-8 my-8 px-8 py-4 h-14 w-[100%]'
  }

  // 기본
  return 'cursor-pointer border-none rounded-lg bg-[#0ab68b] font-[Pretendard] text-[1rem] text-center text-[#FFFFFF] mx-8 my-8 px-8 py-4 h-14 w-[100%]'

})
</script>

<style scoped></style>
