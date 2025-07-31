<template>
  <div class="min-h-screen bg-app-light-gray">
    <div class="max-w-sm mx-auto p-4">
      <!-- 카드 슬라이더 -->
      <CardSlider
        :cards="cardsStore.registeredCards"
        :current-card-index="currentCardIndex"
        :is-editing-nickname="isEditingNickname"
        :editing-nickname="editingNickname"
        :get-billing-amount="getBillingAmount"
        @slide-change="onSlideChange"
        @edit-nickname="startEditNickname"
        @update-nickname="editingNickname = $event"
        @save-nickname="saveNickname"
        @cancel-edit="cancelEditNickname"
        ref="cardSliderRef"
      />

      <!-- 저번 달 대비 변화량 -->
      <div
        v-if="cardsStore.registeredCards.length > 0 && !isRegistrationCard"
        class="bg-white rounded-2xl p-5 border border-slate-200 mb-6"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center"
              :class="billingChange >= 0 ? 'bg-app-light-red' : 'bg-app-light-blue'"
            >
              <svg
                v-if="billingChange >= 0"
                class="w-5 h-5 text-app-red"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg v-else class="w-5 h-5 text-app-blue" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div>
              <div class="text-sm text-slate-600 mb-1">저번 달 대비</div>
              <div
                class="text-2xl font-bold"
                :class="billingChange >= 0 ? 'text-app-red' : 'text-app-blue'"
              >
                {{ billingChange >= 0 ? '+' : '-' }}{{ Math.abs(billingChange).toLocaleString() }}원
              </div>
              <div class="text-sm text-xs mt-1">어떤 항목이 달라졌는지 확인해보세요.</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-slate-500 mb-1">
              {{ billingChange >= 0 ? '증가' : '감소' }}
            </div>
            <div class="text-sm font-medium text-slate-700">
              {{ Math.round((Math.abs(billingChange) / (lastBilling?.amount || 320000)) * 100) }}%
            </div>
          </div>
        </div>
      </div>

      <!-- 최근 카드 이용내역 -->
      <div v-if="cardsStore.registeredCards.length > 0 && !isRegistrationCard" class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-800">최근 이용내역</h3>
          <router-link
            :to="`/card/usage?cardId=${currentCard?.cardId}`"
            class="text-sm text-app-green font-medium"
          >
            전체보기
          </router-link>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div
            v-for="(transaction, index) in recentTransactions"
            :key="index"
            class="p-4"
            :class="{ 'border-b border-slate-200': index < recentTransactions.length - 1 }"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-3xl flex items-center justify-center bg-app-light-gray"
                >
                  <svg class="w-5 h-5 text-app-dark-green" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <div class="font-medium text-slate-800">{{ transaction.merchant }}</div>
                  <div class="text-sm text-slate-500">{{ transaction.date }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-semibold">
                  {{ transaction.type === 'payment' ? '-' : ''
                  }}{{ transaction.amount.toLocaleString() }}원
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCardsStore } from '@/stores/cards'
import CardSlider from '@/components/card/CardSlider.vue'

const router = useRouter()
const route = useRoute()
const cardsStore = useCardsStore()

const currentCardIndex = ref(0)
const cardSliderRef = ref<InstanceType<typeof CardSlider> | null>(null)

// 별칭 편집 관련 상태
const isEditingNickname = ref(false)
const editingNickname = ref('')

// 카드 슬라이더 관련
const totalCardSlots = computed(() => {
  return (cardsStore.registeredCards?.length || 0) + 1
})

const isRegistrationCard = computed(() => {
  return currentCardIndex.value >= (cardsStore.registeredCards?.length || 0)
})

// 슬라이드 변경 이벤트 핸들러
const onSlideChange = (index: number) => {
  currentCardIndex.value = index
  updateUrlWithCardId()
}

// 청구 금액 가져오기 헬퍼 함수
const getBillingAmount = (cardId: number) => {
  const billing = cardsStore.getBillingByCardId(cardId)
  return billing.current?.amount?.toLocaleString() || '-'
}

// 청구금액 변화량 계산
const billingChange = computed(() => {
  const current = currentBilling.value?.amount || 0
  const last = lastBilling.value?.amount || 0
  return current - last
})

// 최근 거래내역 (현재 카드의 실제 데이터)
const recentTransactions = computed(() => {
  if (!currentCard.value) return []

  const cardUsage = cardsStore.getUsageByCardId(currentCard.value.cardId)
  return cardUsage
    .slice(0, 3) // 최근 3개만
    .map((usage) => ({
      merchant: usage.merchant,
      amount: usage.amount,
      date: formatDate(usage.date),
      category: usage.category,
      type: 'payment',
    }))
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return '오늘'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '어제'
  } else {
    const diffTime = Math.abs(today.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays}일 전`
  }
}

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

const updateUrlWithCardId = () => {
  if (currentCard.value?.cardId) {
    const currentQuery = { ...route.query }
    currentQuery.cardId = currentCard.value.cardId.toString()
    router.replace({ query: currentQuery })
  }
}

// 별칭 편집 기능
const startEditNickname = (index: number) => {
  currentCardIndex.value = index
  const targetCard = cardsStore.registeredCards[currentCardIndex.value]
  if (!targetCard) return

  isEditingNickname.value = true
  editingNickname.value = targetCard.cardNickname || ''
}

const saveNickname = async () => {
  const targetCard = cardsStore.registeredCards[currentCardIndex.value]
  if (!targetCard || !editingNickname.value.trim()) {
    cancelEditNickname()
    return
  }

  try {
    await cardsStore.updateCardNickname(targetCard.cardId, editingNickname.value.trim())
    isEditingNickname.value = false
  } catch (error) {
    console.error('별칭 수정 실패:', error)
    cancelEditNickname()
  }
}

const cancelEditNickname = () => {
  isEditingNickname.value = false
  editingNickname.value = ''
}

onMounted(() => {
  if (cardsStore.registeredCards.length === 0) {
    cardsStore.fetchCards()
  }

  // URL에서 cardId가 있으면 해당 카드로 인덱스 설정
  const urlCardId = route.query.cardId
  if (urlCardId) {
    const cardIndex = cardsStore.registeredCards.findIndex(
      (card) => card.cardId === Number(urlCardId),
    )
    if (cardIndex !== -1) {
      currentCardIndex.value = cardIndex
      // CardSlider 컴포넌트에서 해당 슬라이드로 이동
      nextTick(() => {
        if (cardSliderRef.value) {
          cardSliderRef.value.slideTo(cardIndex)
        }
      })
    }
  }

  // 초기 URL 업데이트
  updateUrlWithCardId()
})
</script>

<style scoped>
/* 전환 효과 */
.transition-colors {
  transition:
    background-color 0.15s ease-in-out,
    color 0.15s ease-in-out;
}

.transition-all {
  transition: all 0.15s ease-in-out;
}
</style>
