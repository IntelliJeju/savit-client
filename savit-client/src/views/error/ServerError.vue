<template>
  <div class="min-h-screen bg-white flex flex-col items-center justify-center px-4">
    <!-- 에러 아이콘 -->
    <div class="mb-8">
      <div class="w-24 h-24 bg-app-light-red rounded-full flex items-center justify-center mb-4">
        <svg class="w-12 h-12 text-app-red" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>

    <!-- 에러 메시지 -->
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-app-dark-gray mb-4">서버와의 연결이 원활하지 않습니다</h1>
      <p class="text-app-dark-gray/70 mb-2">일시적인 서버 문제로 서비스에 접속할 수 없습니다.</p>
      <p class="text-app-dark-gray/70">잠시 후 다시 시도해주세요.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import router from '@/router'

const isRetrying = ref(false)

const handleRetry = async () => {
  isRetrying.value = true

  try {
    // 간단한 헬스체크 API 호출 (실제 구현 시)
    // await healthCheck()

    // 임시로 1초 대기 후 홈으로 이동
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 성공 시 홈으로 리다이렉트
    router.push('/')
  } catch (error) {
    // 실패 시 현재 페이지 유지
    console.error('Retry failed:', error)
  } finally {
    isRetrying.value = false
  }
}

const handleGoHome = () => {
  router.push('/')
}
</script>

<style scoped>
/* 커스텀 애니메이션이나 스타일이 필요하면 여기에 추가 */
</style>
