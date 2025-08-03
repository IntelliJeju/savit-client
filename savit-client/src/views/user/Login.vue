<template>
  <div class="min-h-screen bg-gradient-to-br from-app-purple via-app-purple/80 to-app-green relative overflow-hidden m-[-1rem]">
    <div class="relative z-10 min-h-screen flex flex-col text-white">
      <div class="flex-1"></div>
      <div class="relative z-10 w-full h-40 flex items-center justify-center px-4 rounded-2xl overflow-hidden">
        <img
          src="@/assets/img/savit_logo.png"
          alt="Savit Logo"
          class="w-full h-full object-contain p-2 transition-all"
          style="filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.4));"
          />
      </div>

      <div class="flex-1 flex items-end justify-center pb-16 px-4">
        <div class="flex flex-col items-center w-full max-w-xs mx-auto">
          <div class="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-8"></div>

          <div class="text-center mb-8 w-full">
            <p class="text-white/80 text-base leading-relaxed">
              자산관리가 어려운 사회초년생을 위한<br>
              소비습관 들이기 가이드 💸
            </p>
          </div>

          <div class="w-full max-w-xs">
            <div class="relative group">
              <img
                src="@/assets/img/kakao_login_medium_wide.png"
                alt="Kakao Login"
                class="relative w-full transition-all duration-300 transform cursor-pointer rounded-2xl shadow-xl"
                @click.prevent="handleKakaoLogin"
              />
            </div>
          </div>
        </div>
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
