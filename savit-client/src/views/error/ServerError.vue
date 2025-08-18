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
      <p class="text-app-dark-gray/70 mb-8">잠시 후 다시 시도해주세요.</p>

      <!-- 액션 버튼들 -->
      <div class="flex flex-col gap-3">
        <button
          @click="goBack"
          class="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
        >
          뒤로가기
        </button>
        <button
          @click="goHome"
          class="bg-app-green text-white px-6 py-3 rounded-lg font-medium hover:bg-app-dark-green transition-colors duration-200"
        >
          홈으로 가기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  authStore.restoreAuthentication()

  if (authStore.isLoggedIn) {
    router.push('/home')
  } else {
    router.push('/auth/login')
  }
}
</script>

<style scoped></style>
