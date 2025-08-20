<template>
  <Teleport to="#header-content">
    <span>내 카드</span>
  </Teleport>

  <div class="bg-app-light-gray py-4">
    <!-- 카드 슬라이더 -->
    <CardSlider :cards="cardsList" :totalAmount="thisMonthUsage" @slide-change="onSlideChange" />

    <!-- 저번 달 대비 변화량 -->
    <CardComponent v-if="cardsList.length > 0 && !isRegistrationCard" class="p-5 mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center"
            :class="usageChange >= 0 ? 'bg-app-light-red' : 'bg-app-light-blue'"
          >
            <v-icon v-if="usageChange >= 0" name="hi-arrow-narrow-up" class="w-6 text-app-red" />
            <v-icon v-else name="hi-arrow-narrow-down" class="w-6 text-app-blue" />
          </div>
          <div>
            <div class="text-sm text-slate-600 mb-1">저번 달 대비</div>
            <div
              class="text-2xl font-bold"
              :class="usageChange >= 0 ? 'text-app-red' : 'text-app-blue'"
            >
              {{ usageChange.toLocaleString() }}원
            </div>
            <div class="text-sm text-xs mt-1">어떤 항목이 달라졌는지 확인해보세요.</div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-xs text-slate-500 mb-1">
            {{ usageChange >= 0 ? '증가' : '감소' }}
          </div>
          <div class="text-sm font-medium text-slate-700">{{ usageChangePercent }}%</div>
        </div>
      </div>
    </CardComponent>
    <!-- </div> -->

    <!-- 최근 카드 이용내역 -->
    <div v-if="cardsList.length > 0 && !isRegistrationCard" class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-slate-800">최근 이용내역</h3>
        <router-link
          :to="`/card/usage?cardId=${currentCard?.cardId}`"
          class="text-sm text-app-green font-medium"
        >
          전체보기
        </router-link>
      </div>

      <CardComponent>
        <!-- 거래내역이 있을 때 -->
        <div v-if="recentTransactions.length > 0" class="my-[-0.5rem]">
          <div
            v-for="(transaction, index) in recentTransactions"
            :key="index"
            class="py-4 px-2"
            :class="{ 'border-b border-slate-200': index < recentTransactions.length - 1 }"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div
                  class="w-10 h-10 bg-app-light-gray rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <CategoryIcon
                    :category="mapCategoryToMainCategory(transaction.categoryId)"
                    :color="'#028174'"
                    :size="20"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="font-medium text-slate-800 truncate">
                    {{ transaction.resMemberStoreName }}
                  </div>
                  <div class="text-sm text-slate-500 truncate">{{ formatTransactionDate(transaction.resUsedDate) }}</div>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <div
                  class="font-semibold whitespace-nowrap"
                  :class="transaction.resCancelYN !== '0' ? 'text-app-green' : ''"
                >
                  {{ transaction.resCancelYN === '0' ? '-' : '+-'
                  }}{{ Number(transaction.resUsedAmount).toLocaleString() }}원
                  <div
                    v-if="transaction.resCancelYN !== '0'"
                    class="text-xs text-app-green font-normal"
                  >
                    취소
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 거래내역이 없을 때 빈 상태 -->
        <EmptyState
          v-else
          title="사용내역이 없습니다"
          description="아직 이 카드로 결제하지 않으셨어요!"
        />
      </CardComponent>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCardsStore } from '@/stores/cards'
import CardSlider from '@/components/card/CardSlider.vue'
import CardComponent from '@/components/card/CardComponent.vue'
import CategoryIcon from '@/components/icon/CategoryIcon.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { mapCategoryToMainCategory } from '@/utils/category'
import { storeToRefs } from 'pinia'
import now, { formatTransactionDate } from '@/utils/dateUtils'

const cardsStore = useCardsStore()

const { cardsList, getTransactionsByCard, getTotalUsageByIdMonth } = storeToRefs(cardsStore)

const currentCardIndex = ref(0)

// 최근 거래내역 (현재 카드의 실제 데이터)
const recentTransactions = computed(() => {
  if (!currentCard.value) return []
  return getTransactionsByCard.value(currentCard.value.cardId).slice(0, 3)
})

// 현재 카드의 사용량 계산 (동적)
const lastMonthUsage = computed(() => {
  if (!currentCard.value) return 0
  return getTotalUsageByIdMonth.value(
    currentCard.value.cardId,
    now.month === 1 ? 12 : now.month - 1,
  )
})

const thisMonthUsage = computed(() => {
  if (!currentCard.value) return 0
  return getTotalUsageByIdMonth.value(currentCard.value.cardId, now.month)
})

// 사용량 변화 계산
const usageChange = computed(() => thisMonthUsage.value - lastMonthUsage.value)
const usageChangePercent = computed(() =>
  Math.round((Math.abs(usageChange.value) / (lastMonthUsage.value || 1)) * 100),
)

const isRegistrationCard = computed(() => {
  return currentCardIndex.value >= (cardsList.value?.length || 0)
})

// 슬라이드 변경 이벤트 핸들러
const onSlideChange = (index: number) => {
  currentCardIndex.value = index
}


const currentCard = computed(() => {
  return cardsList.value[currentCardIndex.value]
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
