<template>
  <div class="min-h-screen bg-app-light-gray">
    <div class="max-w-sm mx-auto p-4">
      <!-- 등록 성공 헤더 -->
      <div class="text-center mb-6">
        <div
          class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h1 class="text-xl font-bold text-slate-800 mb-2">카드 등록 성공!</h1>
        <p class="text-sm text-slate-600">
          {{ registeredCard?.cards.length }}장의 카드가 성공적으로 등록되었습니다.
        </p>
      </div>

      <!-- 등록된 카드 목록 -->
      <div class="space-y-4 mb-6">
        <div
          v-for="card in registeredCard?.cards"
          :key="card.resCardNo"
          class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm"
        >
          <div class="flex items-center gap-4">
            <!-- 카드 이미지 -->
            <div class="flex-shrink-0">
              <img
                :src="card.resImageLink"
                :alt="card.resCardName"
                class="w-16 h-10 object-cover rounded-lg border border-slate-200"
                @error="handleImageError"
              />
            </div>

            <!-- 카드 이름 -->
            <div class="flex-1">
              <h3 class="font-bold text-slate-800 text-sm">
                {{ card.resCardName }}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <!-- 액션 버튼들 -->
      <div class="space-y-3">
        <ButtonItem text="카드 목록으로 이동" @click="goToCardList" class="w-full" />
        <button
          @click="registerAnother"
          class="w-full py-3 px-4 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          다른 카드 등록하기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ButtonItem from '@/components/button/ButtonItem.vue'
import { useCardsStore } from '@/stores/cards.ts'
import { storeToRefs } from 'pinia'

const router = useRouter()
const cardsStore = useCardsStore()

const { registeredCard } = storeToRefs(cardsStore)

onMounted(() => {
  // 등록 데이터가 없으면 등록 페이지로 리다이렉트
  if (!registeredCard.value) {
    router.push('/card/register')
  }
})

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/placeholder-card.png' // 기본 카드 이미지
}

const goToCardList = () => {
  router.push('/card')
}

const registerAnother = () => {
  router.push('/card/register')
}
</script>

<style scoped>
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style>
