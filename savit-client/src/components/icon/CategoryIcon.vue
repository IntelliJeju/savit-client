<template>
  <div class="category-icon" :style="{ width: size + 'px', height: size + 'px' }">
    <!-- 식비 아이콘 (수저) -->
    <svg v-if="category === '식비'" :width="size" :height="size" viewBox="0 0 24 24" fill="none">
      <!-- 포크 -->
      <path d="M7 3V9C7 10.1 7.9 11 9 11C10.1 11 11 10.1 11 9V3" :stroke="color" stroke-width="2" stroke-linecap="round"/>
      <path d="M7 3V9M9 3V9M11 3V9" :stroke="color" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M9 11V21" :stroke="color" stroke-width="2" stroke-linecap="round"/>
      
      <!-- 숟가락 -->
      <ellipse cx="16" cy="7" rx="2.5" ry="4" :stroke="color" stroke-width="2" :fill="color" fill-opacity="0.1"/>
      <path d="M16 11V21" :stroke="color" stroke-width="2" stroke-linecap="round"/>
    </svg>

    <!-- 교통 아이콘 (버스 정면) -->
    <svg v-else-if="category === '교통'" :width="size" :height="size" viewBox="0 0 24 24" fill="none">
      <!-- 버스 본체 -->
      <rect x="4" y="3" width="16" height="16" rx="3" :stroke="color" stroke-width="2" :fill="color" fill-opacity="0.1"/>
      <!-- 상단 그릴 -->
      <path d="M7 5H17" :stroke="color" stroke-width="1.5" stroke-linecap="round"/>
      <!-- 앞 유리창 -->
      <rect x="6" y="7" width="12" height="6" rx="1" :stroke="color" stroke-width="1.5" fill="none"/>
      <!-- 헤드라이트 -->
      <circle cx="7.5" cy="15" r="0.8" :fill="color"/>
      <circle cx="16.5" cy="15" r="0.8" :fill="color"/>
      <!-- 하단 그릴 -->
      <path d="M9 16H15" :stroke="color" stroke-width="1.5" stroke-linecap="round"/>
      <!-- 바퀴 -->
      <circle cx="6.5" cy="20" r="1.5" :stroke="color" stroke-width="1.5" fill="none"/>
      <circle cx="17.5" cy="20" r="1.5" :stroke="color" stroke-width="1.5" fill="none"/>
    </svg>

    <!-- 생활 아이콘 (쇼핑 카트) -->
    <svg v-else-if="category === '생활'" :width="size" :height="size" viewBox="0 0 24 24" fill="none">
      <!-- 카트 손잡이 -->
      <path d="M2 4h3l1.68 9.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L22 7H6" 
            :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- 바구니 격자 -->
      <path d="M8 11h12" :stroke="color" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M10 7v8" :stroke="color" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M14 7v8" :stroke="color" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M18 7v8" :stroke="color" stroke-width="1.5" stroke-linecap="round"/>
      <!-- 바퀴 -->
      <circle cx="8" cy="19" r="1" :stroke="color" stroke-width="2" fill="none"/>
      <circle cx="19" cy="19" r="1" :stroke="color" stroke-width="2" fill="none"/>
    </svg>

    <!-- 문화 아이콘 (티켓) -->
    <svg v-else-if="category === '문화'" :width="size" :height="size" viewBox="0 0 24 24" fill="none">
      <!-- 티켓 본체 -->
      <rect x="2" y="6" width="20" height="12" rx="1" :fill="color"/>
      <!-- 왼쪽 절취선 (반원 컷아웃) -->
      <circle cx="2" cy="12" r="2" fill="white"/>
      <!-- 오른쪽 절취선 (반원 컷아웃) -->
      <circle cx="22" cy="12" r="2" fill="white"/>
      <!-- 점선 절취선 -->
      <path d="M15 6V18" stroke="white" stroke-width="1" stroke-dasharray="1.5,1.5"/>
    </svg>

    <!-- 기타 아이콘 (신용카드) -->
    <svg v-else :width="size" :height="size" viewBox="0 0 24 24" fill="none">
      <!-- 카드 본체 -->
      <rect x="2" y="5" width="20" height="14" rx="2" :stroke="color" stroke-width="2" :fill="color" fill-opacity="0.1"/>
      <!-- 마그네틱 스트라이프 -->
      <rect x="2" y="8" width="20" height="2.5" :fill="color" fill-opacity="0.6"/>
      <!-- 카드 번호 라인들 -->
      <rect x="4" y="12" width="4" height="1" rx="0.3" :fill="color" fill-opacity="0.4"/>
      <rect x="8.5" y="12" width="4" height="1" rx="0.3" :fill="color" fill-opacity="0.4"/>
      <rect x="13" y="12" width="4" height="1" rx="0.3" :fill="color" fill-opacity="0.4"/>
      <rect x="17.5" y="12" width="2" height="1" rx="0.3" :fill="color" fill-opacity="0.4"/>
      <!-- 카드 정보 (만료일, 이름 등) -->
      <rect x="4" y="15" width="3" height="0.8" rx="0.2" :fill="color" fill-opacity="0.3"/>
      <rect x="8" y="15" width="5" height="0.8" rx="0.2" :fill="color" fill-opacity="0.3"/>
    </svg>
  </div>
</template>

<script setup lang="ts">
interface Props {
  category: '식비' | '교통' | '생활' | '문화' | '기타'
  color?: string
  size?: number
}

withDefaults(defineProps<Props>(), {
  color: '#028174',
  size: 24
})
</script>

<style scoped>
.category-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>