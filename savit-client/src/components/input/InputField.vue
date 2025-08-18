<!-- <input-field v-model="" placeholder="" type="" /> -->
<template>
  <div>
    <input
      :value="displayValue"
      :placeholder="placeholder"
      :type="inputType"
      :maxlength="maxlength"
      :inputmode="inputMode"
      @input="onInput"
      @keydown="onKeydown"
      @paste="onPaste"
      :class="`input-field border-b py-1 px-2 w-full ${props.class || ''}`"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface inputProps {
  modelValue: string | number
  placeholder: string
  type: string
  maxlength?: number
  class?: string
  formatNumber?: boolean // 숫자 포맷팅 옵션
}

const props = defineProps<inputProps>()
const emit = defineEmits(['update:modelValue'])

// 숫자 포맷팅 함수
const formatWithCommas = (value: string): string => {
  const number = value.replace(/[^\d]/g, '')
  if (!number) return ''
  return parseInt(number).toLocaleString()
}

// 입력 타입과 모드 결정
const inputType = computed(() => {
  // 숫자 포맷팅이 필요한 경우 text로 설정
  return props.formatNumber && props.type === 'number' ? 'text' : props.type
})

const inputMode = computed(() => {
  return props.type === 'number' ? 'numeric' : 'text'
})

// 표시값 계산
const displayValue = computed(() => {
  if (props.formatNumber && props.type === 'number') {
    return formatWithCommas(String(props.modelValue))
  }
  return props.modelValue
})

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value

  if (props.formatNumber && props.type === 'number') {
    // 숫자만 추출
    const numericValue = value.replace(/[^\d]/g, '')
    // 포맷팅된 값을 input에 다시 설정
    target.value = formatWithCommas(numericValue)
    // 실제 숫자값을 emit
    emit('update:modelValue', numericValue)
  } else {
    emit('update:modelValue', value)
  }
}

const onKeydown = (event: KeyboardEvent) => {
  if (props.type === 'number' || (props.formatNumber && props.type === 'number')) {
    // 숫자, 백스페이스, 삭제, 탭, 화살표 키만 허용
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
    ]

    if (allowedKeys.includes(event.key)) {
      return
    }

    // 숫자 키 허용
    if (event.key >= '0' && event.key <= '9') {
      return
    }

    // Ctrl+A, Ctrl+C, Ctrl+V 등 허용
    if (event.ctrlKey || event.metaKey) {
      return
    }

    // 그 외는 차단
    event.preventDefault()
  }
}

const onPaste = (event: ClipboardEvent) => {
  if (props.type === 'number' || (props.formatNumber && props.type === 'number')) {
    event.preventDefault()
    const pastedData = event.clipboardData?.getData('text') || ''
    const numericValue = pastedData.replace(/[^\d]/g, '')

    if (numericValue) {
      const target = event.target as HTMLInputElement
      if (props.formatNumber) {
        target.value = formatWithCommas(numericValue)
      } else {
        target.value = numericValue
      }
      emit('update:modelValue', numericValue)
    }
  }
}
</script>

<style scoped></style>
