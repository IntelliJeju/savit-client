<template>
  <div class="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
    <!-- 로고/브랜드명 -->
    <div class="mb-8">
      <div class="text-4xl font-bold text-app-green mb-2">Savit</div>
      <div class="text-sm text-app-dark-gray text-center">똑똑한 소비 관리</div>
    </div>

    <!-- 로딩 애니메이션 -->
    <div class="relative">
      <!-- 메인 스피너 -->
      <div
        class="w-12 h-12 border-4 border-app-light-gray border-t-app-green rounded-full animate-spin"
      ></div>

      <!-- 펄스 효과 -->
      <div
        class="absolute inset-0 w-12 h-12 border-4 border-app-green/20 rounded-full animate-ping"
      ></div>
    </div>

    <!-- 로딩 텍스트 -->
    <div class="mt-6 text-app-dark-gray text-sm animate-pulse whitespace-pre-line text-center">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  message: '데이터를 불러오는 중...',
})
</script>

<style scoped>
/* 커스텀 애니메이션이 필요하면 여기에 추가 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.8s ease-out;
}
</style>
