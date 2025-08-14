<template>
  <div class="max-w-4xl mx-auto min-h-screen px-4">
    <div class="py-2"></div>
    
    <div v-if="loading" class="text-center py-10 text-app-dark-gray">
      <p>{{ loadingText || '데이터를 불러오는 중...' }}</p>
    </div>
    
    <template v-else>
      <slot />
    </template>

    <div class="py-12"></div>

    <!-- 고정 버튼 영역 -->
    <div v-if="showButton" class="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-app-gray z-10">
      <div class="max-w-4xl mx-auto">
        <ButtonItem 
          :text="buttonText" 
          @click="$emit('button-click')"
          :disabled="buttonDisabled"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ButtonItem from '@/components/button/ButtonItem.vue'

interface Props {
  loading?: boolean
  loadingText?: string
  showButton?: boolean
  buttonText?: string
  buttonDisabled?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
  loadingText: '데이터를 불러오는 중...',
  showButton: true,
  buttonText: '확인',
  buttonDisabled: false
})

defineEmits<{
  'button-click': []
}>()
</script>