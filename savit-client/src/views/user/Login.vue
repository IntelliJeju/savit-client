<template>
  <div class="min-h-screen bg-gradient-to-t from-[#333333] to-[#0AB68B] flex flex-col">
    <div class="flex-1"></div>
    <div class="flex-1 flex items-center justify-center">
      <img
        src="@/assets/img/savit_logo.png"
        alt="Savit Logo"
        class="w-[70%] drop-shadow-[10px_10px_10px_rgba(0,0,0,0.5)]"
      />
    </div>
    <div class="flex-1 flex items-end justify-center pb-16">
      <div class="flex flex-col items-center w-[70%]">
        <div class="w-full border-t border-[#61A292] mb-8" />
        <img
          src="@/assets/img/kakao_login_medium_wide.png"
          alt="Kakao Login"
          class="w-full"
          @click.prevent="handleKakaoLogin"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleKakaoLogin = async () => {
  try {
    await authStore.kakaoLogin()
    router.push('/home')
  } catch (error) {
    console.error('카카오 로그인 실패:', error)
  }
}
</script>

<style scoped></style>
