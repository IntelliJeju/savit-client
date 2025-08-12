<template>
  <div class="min-h-screen relative overflow-hidden m-[-1rem] bg-gradient-to-br from-app-dark-green via-app-green to-app-light-green">

    <!-- 로고 - 상단과 텍스트 사이 중앙 -->
    <div class="absolute top-0 left-0 right-0 h-2/3 flex items-center justify-center z-20">
      <img
        src="@/assets/img/savit-logo.png"
        alt="Savit Logo"
        class="w-72 h-72 object-contain drop-shadow-2xl"
      />
    </div>

    <!-- 하단 콘텐츠 -->
    <div class="relative z-10 min-h-screen flex items-end justify-center px-6 pb-16">
      <div class="flex flex-col items-center w-full max-w-lg">
        
        <!-- 구분선 -->
        <div class="w-64 h-px bg-white/30 mx-auto mb-8"></div>

        <!-- 서브 타이틀 -->
        <div class="text-center mb-8">
          <p class="text-white/90 text-lg mb-1">
            자산관리가 어려운 사회초년생을 위한
          </p>
          <p class="text-white/90 text-lg">
            소비습관 들이기 가이드 💪
          </p>
        </div>

        <!-- 로그인 버튼 -->
        <div class="w-full max-w-sm mx-auto mb-6">
          <div class="relative group">
              
            <div>
              <img
                src="@/assets/img/kakao_login_medium_wide.png"
                alt="Kakao Login"
                class="w-full cursor-pointer rounded-xl drop-shadow-xl"
                @click.prevent="handleKakaoLogin"
              />
            </div>
          </div>

          <!-- 시작 메시지 -->
          <div class="text-center mt-4">
            <p class="text-white font-bold text-lg">
              카카오 계정으로 3초만에 시작!
            </p>
          </div>
        </div>

        <!-- 푸터 -->
        <div class="text-center">
          <p class="text-white/60 text-sm">
            © 2024 SAVIT • MZ세대의 금융 파트너 ✨
          </p>
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
