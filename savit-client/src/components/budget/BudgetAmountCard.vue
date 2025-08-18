<template>
  <CardComponent>
    <p class="font-bold text-lg mb-4">{{ title }}</p>
    <div class="flex items-center text-app-dark-gray">
      <InputField
        v-model="displayAmount"
        :placeholder="placeholder"
        type="text"
        class="text-3xl font-bold text-right flex-1"
        @input="handleAmountInput"
      />
      <span class="right-2 text-3xl font-bold">원</span>
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

// 숫자 추출 및 업데이트 공통 함수
const updateNumericValue = (value: string) => {
  const numericValue = value.replace(/[^\d]/g, '')
  emit('update:modelValue', numericValue)
}

// 표시용 값 (쉼표 포함)
const displayAmount = computed({
  get: () => formatNumber(parseInt(props.modelValue) || 0),
  set: updateNumericValue,
})

// 입력 처리 함수
const handleAmountInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  updateNumericValue(target.value)
}
</script>
