<template>
  <div class="min-h-screen bg-app-light-gray">
    <div class="max-w-sm mx-auto p-4">
      <!-- 카드 슬라이더 (등록된 카드 + 새 카드 등록) -->
      <div class="mb-6">
        <div class="flex justify-center mb-4">
          <div
            class="relative w-full max-w-xs"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseEnd"
            @mouseleave="handleMouseEnd"
          >
            <transition name="slide-fade" mode="out-in">
              <!-- 등록된 카드들 -->
              <div
                v-if="!isRegistrationCard"
                :key="currentCardIndex"
                class="w-full h-48 rounded-xl p-6 text-white relative overflow-hidden cursor-grab select-none"
                :class="{ 'cursor-grabbing': isDragging }"
                :style="{ 
                  backgroundColor: currentCard?.organization ? getCardBgColor(currentCard.organization) : '#4ade80',
                  transform: `translateX(${dragOffset}px)`
                }"
              >
              <!-- 카드 배경 패턴 -->
              <div class="absolute top-0 right-0 w-24 h-24 rounded-full bg-white opacity-10 -translate-y-8 translate-x-8"></div>
              <div class="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white opacity-5 translate-y-8 -translate-x-8"></div>

              <!-- 카드 정보 -->
              <div class="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between">
                    <div v-if="!isEditingNickname" class="text-sm opacity-90 flex items-center gap-2">
                      {{ currentCard?.cardNickname || '카드별칭' }}
                      <button
                        @click="startEditNickname"
                        class="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-all opacity-70 hover:opacity-100"
                      >
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                        </svg>
                      </button>
                    </div>
                    <input
                      v-else
                      v-model="editingNickname"
                      @blur="saveNickname"
                      @keyup.enter="saveNickname"
                      @keyup.escape="cancelEditNickname"
                      class="text-sm opacity-90 bg-transparent border-b border-white border-opacity-50 outline-none px-1 py-0.5 min-w-0 flex-1"
                      ref="nicknameInput"
                      maxlength="20"
                    />
                  </div>
                  <div class="text-3xl font-bold mt-8">
                    {{ currentBilling?.amount?.toLocaleString() || '-' }}원
                  </div>
                </div>

                <div>
                  <div class="flex justify-between items-end">
                    <div class="text-sm opacity-90">
                      이번 달 사용 금액
                    </div>
                  </div>
                </div>
              </div>
            </div>

              <!-- 새 카드 등록 버튼 -->
              <router-link
                v-else
                to="/card/register"
                :key="'registration'"
                class="block w-full h-48 rounded-3xl p-6 relative overflow-hidden border-2 border-dashed border-slate-300 bg-white hover:bg-slate-50 active:scale-95 transition-all cursor-grab select-none"
                :class="{ 'cursor-grabbing': isDragging }"
                :style="{ transform: `translateX(${dragOffset}px)` }"
              >
              <div class="relative z-10 h-full flex flex-col justify-center items-center text-center">
                <div class="w-16 h-16 bg-app-light-gray rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-app-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div class="text-slate-800 text-lg font-semibold mb-2">새 카드 등록</div>
                <div class="text-slate-500 text-sm">카드를 추가해보세요</div>
              </div>
              </router-link>
            </transition>
          </div>
        </div>

        <!-- 카드 네비게이션 -->
        <div
          class="flex justify-center items-center gap-4"
          v-if="totalCardSlots > 1"
        >
          <button
            @click="prevCard"
            class="w-10 bg-transparent border border-slate-200 flex items-center justify-center text-slate-600 transition-all"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </button>
          <div class="flex space-x-2">
            <div
              v-for="index in totalCardSlots"
              :key="index - 1"
              class="w-2 h-2 rounded-full transition-colors"
              :class="(index - 1) === currentCardIndex ? 'bg-app-green' : 'bg-slate-300'"
            ></div>
          </div>
          <button
            @click="nextCard"
            class="w-10 rounded bg-transparent border border-slate-200 flex items-center justify-center text-slate-600 transition-all"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 저번 달 대비 변화량 -->
      <div v-if="cardsStore.registeredCards.length > 0 && !isRegistrationCard" class="bg-white rounded-2xl p-5 border border-slate-200 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="billingChange >= 0 ? 'bg-app-light-red' : 'bg-app-light-blue'">
              <svg v-if="billingChange >= 0" class="w-5 h-5 text-app-red" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-app-blue" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div>
              <div class="text-sm text-slate-600 mb-1">저번 달 대비</div>
              <div class="text-2xl font-bold" :class="billingChange >= 0 ? 'text-app-red' : 'text-app-blue'">
                {{ billingChange >= 0 ? '+' : '-' }}{{ Math.abs(billingChange).toLocaleString() }}원
              </div>
              <div class="text-sm text-xs mt-1">어떤 항목이 달라졌는지 확인해보세요.</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-slate-500 mb-1">{{ billingChange >= 0 ? '증가' : '감소' }}</div>
            <div class="text-sm font-medium text-slate-700">
              {{ Math.round(Math.abs(billingChange) / (lastBilling?.amount || 320000) * 100) }}%
            </div>
          </div>
        </div>
      </div>

      <!-- 최근 카드 이용내역 -->
      <div v-if="cardsStore.registeredCards.length > 0 && !isRegistrationCard" class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-800">최근 이용내역</h3>
          <router-link :to="`/card/usage?cardId=${currentCard?.cardId}`" class="text-sm text-app-green font-medium">
            전체보기
          </router-link>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div v-for="(transaction, index) in recentTransactions" :key="index" class="p-4" :class="{ 'border-b border-slate-200': index < recentTransactions.length - 1 }">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-3xl flex items-center justify-center bg-app-light-gray">
                  <svg class="w-5 h-5 text-app-dark-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <div class="font-medium text-slate-800">{{ transaction.merchant }}</div>
                  <div class="text-sm text-slate-500">{{ transaction.date }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-semibold">
                  {{ transaction.type === 'payment' ? '-' : '' }}{{ transaction.amount.toLocaleString() }}원
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

const router = useRouter()
const route = useRoute()
const cardsStore = useCardsStore()

const currentCardIndex = ref(0)

// 별칭 편집 관련 상태
const isEditingNickname = ref(false)
const editingNickname = ref('')
const nicknameInput = ref<HTMLInputElement | null>(null)

// 슬라이드 관련 상태
const isDragging = ref(false)
const dragOffset = ref(0)
const startX = ref(0)
const startTime = ref(0)
const threshold = 50 // 슬라이드 임계값

// 편의성 기능들
const hasNotifications = ref(true) // 알림이 있는지 여부

// 카드 슬라이더 관련
const totalCardSlots = computed(() => {
  return (cardsStore.registeredCards?.length || 0) + 1
})

const isRegistrationCard = computed(() => {
  return currentCardIndex.value >= (cardsStore.registeredCards?.length || 0)
})

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
    .map(usage => ({
      merchant: usage.merchant,
      amount: usage.amount,
      date: formatDate(usage.date),
      category: usage.category,
      type: "payment"
    }))
})

const getCardBgColor = (organization: string) => {
  const colorMap: { [key: string]: string } = {
    '국민카드': '#FFD700',
    '신한카드': '#1E40AF',
    '하나카드': '#16A34A',
    '삼성카드': '#6366F1',
  }
  return colorMap[organization] || '#4ade80'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return "오늘"
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "어제"
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
const startEditNickname = async () => {
  if (!currentCard.value) return
  
  isEditingNickname.value = true
  editingNickname.value = currentCard.value.cardNickname || ''
  
  await nextTick()
  if (nicknameInput.value) {
    nicknameInput.value.focus()
    nicknameInput.value.select()
  }
}

const saveNickname = async () => {
  if (!currentCard.value || !editingNickname.value.trim()) {
    cancelEditNickname()
    return
  }
  
  try {
    await cardsStore.updateCardNickname(currentCard.value.cardId, editingNickname.value.trim())
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

const nextCard = () => {
  if (currentCardIndex.value < totalCardSlots.value - 1) {
    currentCardIndex.value++
  } else {
    currentCardIndex.value = 0
  }
  updateUrlWithCardId()
}

const prevCard = () => {
  if (currentCardIndex.value > 0) {
    currentCardIndex.value--
  } else {
    currentCardIndex.value = totalCardSlots.value - 1
  }
  updateUrlWithCardId()
}

// 터치 이벤트 핸들러
const handleTouchStart = (e: TouchEvent) => {
  isDragging.value = true
  startX.value = e.touches[0].clientX
  startTime.value = Date.now()
  dragOffset.value = 0
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  
  e.preventDefault()
  const currentX = e.touches[0].clientX
  dragOffset.value = currentX - startX.value
}

const handleTouchEnd = () => {
  if (!isDragging.value) return
  
  const duration = Date.now() - startTime.value
  const distance = Math.abs(dragOffset.value)
  const velocity = distance / duration
  
  // 임계값 또는 빠른 스와이프 감지
  if (distance > threshold || velocity > 0.5) {
    if (dragOffset.value > 0) {
      prevCard()
    } else {
      nextCard()
    }
  }
  
  // 상태 초기화
  isDragging.value = false
  dragOffset.value = 0
}

// 마우스 이벤트 핸들러 (데스크톱 지원)
const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  startX.value = e.clientX
  startTime.value = Date.now()
  dragOffset.value = 0
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  
  e.preventDefault()
  const currentX = e.clientX
  dragOffset.value = currentX - startX.value
}

const handleMouseEnd = () => {
  if (!isDragging.value) return
  
  const duration = Date.now() - startTime.value
  const distance = Math.abs(dragOffset.value)
  const velocity = distance / duration
  
  // 임계값 또는 빠른 드래그 감지
  if (distance > threshold || velocity > 0.5) {
    if (dragOffset.value > 0) {
      prevCard()
    } else {
      nextCard()
    }
  }
  
  // 상태 초기화
  isDragging.value = false
  dragOffset.value = 0
}

onMounted(() => {
  if (cardsStore.registeredCards.length === 0) {
    cardsStore.fetchCards()
  }
  
  // URL에서 cardId가 있으면 해당 카드로 인덱스 설정
  const urlCardId = route.query.cardId
  if (urlCardId) {
    const cardIndex = cardsStore.registeredCards.findIndex(card => card.cardId === Number(urlCardId))
    if (cardIndex !== -1) {
      currentCardIndex.value = cardIndex
    }
  }
  
  // 초기 URL 업데이트
  updateUrlWithCardId()
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

/* 터치 반응 개선 */
.active\:scale-95:active {
  transform: scale(0.95);
}

/* 드래그 커서 */
.cursor-grab {
  cursor: grab;
}

.cursor-grabbing {
  cursor: grabbing;
}

/* 선택 방지 */
.select-none {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 호버 효과 */
.hover\:bg-slate-50:hover {
  background-color: rgb(248 250 252);
}

/* 전환 효과 */
.transition-colors {
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
}

.transition-all {
  transition: all 0.15s ease-in-out;
}
</style>
