<template>
  <CardComponent>
    <p class="font-bold text-lg mb-4">{{ title }}</p>
    <div class="relative flex items-center">
      <InputField
        v-model="displayAmount"
        :placeholder="placeholder"
        type="text"
        class="text-3xl font-bold text-right pr-12"
        @input="handleAmountInput"
      />
      <span class="absolute right-2 text-3xl font-bold text-app-dark-gray">원</span>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import InputField from '@/components/input/InputField.vue'
import CardComponent from '@/components/card/CardComponent.vue'
import { formatNumber } from '@/utils/calculations'

interface Props {
  modelValue: string
  title: string
  placeholder: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 표시용 값 (쉼표 포함)
const displayAmount = computed({
  get: () => formatNumber(parseInt(props.modelValue) || 0),
  set: (value: string) => {
    // 숫자만 추출해서 저장
    const numericValue = value.replace(/[^\d]/g, '')
    emit('update:modelValue', numericValue)
  },
})

// 입력 처리 함수
const handleAmountInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  const numericValue = value.replace(/[^\d]/g, '')
  emit('update:modelValue', numericValue)
}
</script>