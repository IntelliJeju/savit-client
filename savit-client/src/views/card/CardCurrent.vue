<template>
  <div class="p-5 max-w-3xl mx-auto font-sans bg-white">
    <!-- 타이틀 -->
    <div class="mb-6">
      <h1 class="text-xl font-bold text-black">카드 사용 현황</h1>
    </div>

    <!-- 카드 섹션 -->
    <section class="mb-8">
      <div v-if="cardsStore.registeredCards.length > 0" class="relative">
        <div class="flex justify-center">
          <transition name="slide-fade" mode="out-in">
            <div
              :key="currentCardIndex"
              class="w-80 h-48 rounded-2xl p-6 text-white relative overflow-hidden"
              :style="{ background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)' }"
            >
              <!-- 카드 배경 패턴 -->
              <div
                class="absolute top-0 right-0 w-32 h-32 rounded-full bg-white opacity-10 -translate-y-8 translate-x-8"
              ></div>
              <div
                class="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white opacity-10 translate-y-8 -translate-x-8"
              ></div>

              <!-- 카드 정보 -->
              <div class="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div class="text-sm opacity-90 mb-1">{{ currentCard.cardName }}</div>
                  <div class="text-2xl font-bold">
                    {{ currentBilling?.amount?.toLocaleString() || '360,000' }}원
                  </div>
                </div>

                <div>
                  <div class="text-sm opacity-90 mb-2">
                    {{ currentCard.organization || 'KB Bank' }}
                  </div>
                  <div class="flex justify-between items-end">
                    <div>
                      <div class="text-sm opacity-90">
                        {{ currentBilling?.month || '10' }}/{{
                          new Date().getFullYear().toString().slice(-2)
                        }}
                      </div>
                    </div>
                    <!-- 카드 로고 (Mastercard) -->
                    <div class="flex space-x-1">
                      <div class="w-8 h-5 bg-red-500 rounded opacity-90"></div>
                      <div class="w-8 h-5 bg-yellow-400 rounded opacity-90 -ml-4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- 카드 네비게이션 -->
        <div
          class="flex justify-center items-center mt-4"
          v-if="cardsStore.registeredCards.length > 1"
        >
          <button
            @click="prevCard"
            class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mx-4"
          >
            <
          </button>
          <div class="flex space-x-2">
            <div
              v-for="(card, index) in cardsStore.registeredCards"
              :key="index"
              class="w-2 h-2 rounded-full"
              :class="index === currentCardIndex ? 'bg-green-500' : 'bg-gray-300'"
            ></div>
          </div>
          <button
            @click="nextCard"
            class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mx-4"
          >
            >
          </button>
        </div>
      </div>

      <div v-else class="text-center py-10">
        <p class="mb-4 text-gray-600">등록된 카드가 없습니다.</p>
        <router-link to="/card/register" class="text-blue-600 font-semibold"
          >카드 등록하기</router-link
        >
      </div>
    </section>

    <!-- 청구 금액 섹션 (원형 겹침) -->
    <section class="relative flex justify-center items-center mt-12 h-80">
      <!-- 이번 달 청구금액 (왼쪽 위 원) -->
      <router-link
        :to="`/card/usage?cardId=${currentCard?.cardId}`"
        class="block absolute"
        style="top: -30px; left: -30px"
      >
        <div
          class="w-80 h-80 rounded-full relative overflow-hidden"
          :style="{ background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)' }"
        >
          <!-- 원형 패턴 -->
          <div
            class="absolute -top-16 -right-16 w-40 h-40 rounded-full border-4 border-white opacity-20"
          ></div>
          <div class="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white opacity-10"></div>

          <div class="absolute inset-0 flex flex-col justify-center items-center text-center">
            <div class="text-white text-sm opacity-90 mb-2">이번 달 청구금액</div>
            <div class="text-white text-3xl font-bold">
              {{ currentBilling?.amount?.toLocaleString() || '360,000' }}원
            </div>
          </div>
        </div>
      </router-link>

      <!-- 저번 달 청구금액 (오른쪽 아래 원, 겹침) -->
      <div
        class="w-80 h-40 rounded-t-full relative overflow-hidden absolute z-0"
        style="bottom: -75px; right: -90px"
        :style="{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }"
      >
        <!-- 원형 패턴 -->
        <div
          class="absolute -top-16 -right-16 w-40 h-40 rounded-full border-4 border-white opacity-20"
        ></div>
        <div class="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white opacity-10"></div>

        <div class="absolute inset-0 flex flex-col justify-center items-center text-center">
          <div class="text-white text-sm opacity-90 mb-2">저번 달 청구금액</div>
          <div class="text-white text-3xl font-bold">
            {{ lastBilling?.amount?.toLocaleString() || '360,000' }}원
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCardsStore } from '@/stores/cards'
import { useRouter } from 'vue-router'

const cardsStore = useCardsStore()
const router = useRouter()

const currentCardIndex = ref(0)

const currentCard = computed(() => {
  return cardsStore.registeredCards[currentCardIndex.value]
})

const currentBilling = computed(() => {
  if (currentCard.value) {
    return cardsStore.getBillingByCardId(currentCard.value.cardId).current
  }
  return null
})

const lastBilling = computed(() => {
  if (currentCard.value) {
    return cardsStore.getBillingByCardId(currentCard.value.cardId).last
  }
  return null
})

const nextCard = () => {
  if (currentCardIndex.value < cardsStore.registeredCards.length - 1) {
    currentCardIndex.value++
  } else {
    currentCardIndex.value = 0
  }
}

const prevCard = () => {
  if (currentCardIndex.value > 0) {
    currentCardIndex.value--
  } else {
    currentCardIndex.value = cardsStore.registeredCards.length - 1
  }
}

onMounted(() => {
  if (cardsStore.registeredCards.length === 0) {
    cardsStore.fetchCards()
  }
})
</script>

<style scoped>
/* 카드 슬라이드 트랜지션 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
