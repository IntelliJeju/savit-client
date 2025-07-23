<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-transparent from-5% to-[#6C5CE7]"
  >
    <img src="@/assets/img/savit_logo.png" alt="Savit Logo" class="w-[50%]" />
    <br />
    <br />
    <br />
    <img
      src="@/assets/img/kakao_login_medium_wide.png"
      alt="Kakao Login"
      class="w-[50%]"
      @click.prevent="handleKakaoLogin"
    />
  </div>
</template>
W

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleKakaoLogin = async () => {
  try {
    await authStore.kakaoLogin()
    router.push('/dashboard')
  } catch (error) {
    console.error('카카오 로그인 실패:', error)
  }
}
</script>

<style scoped></style>
