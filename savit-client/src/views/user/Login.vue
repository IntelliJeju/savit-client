<template>
  <div class="min-h-screen bg-gradient-to-t from-[#333333] to-[#0AB68B] flex flex-col mr-[-1rem] ml-[-1rem]">
    <div class="flex-1"></div>
    <div class="flex-1 flex items-center justify-center px-8">
      <img
        src="@/assets/img/savit_logo.png"
        alt="Savit Logo"
        class="w-80 max-w-full drop-shadow-[10px_10px_10px_rgba(0,0,0,0.5)]"
      />
    </div>
    <div class="flex-1 flex items-end justify-center pb-20">
      <div class="flex flex-col items-center w-full px-8">
        <div class="w-80 max-w-full border-t border-[#61A292] mb-10" />
        <img
          src="@/assets/img/kakao_login_medium_wide.png"
          alt="Kakao Login"
          class="w-80 max-w-full"
          @click.prevent="handleKakaoLogin"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const url = import.meta.env.VITE_APP_API_BASE_URL

const handleKakaoLogin = async () => {
  try {
    window.location.href = url + '/auth/kakao'
  } catch (error) {
    console.error('카카오 로그인 실패:', error)
  }
}
</script>

<style scoped></style>
