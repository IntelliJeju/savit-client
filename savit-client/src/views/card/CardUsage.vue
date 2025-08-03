<template>
  <div class="min-h-screen bg-app-light-gray">
    <div class="max-w-sm mx-auto p-4">

      <!-- 이번 달 청구 금액 -->
      <div class="bg-app-bg-green rounded-2xl p-5 border border-slate-200 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div>
              <div class="text-sm text-slate-600 mb-1">{{cardNickname}}</div>
              <div v-if="billingInfo.current" class="text-2xl font-bold text-slate-800">
                {{ billingInfo.current.amount.toLocaleString() }}원
              </div>
              <div v-else class="text-lg text-slate-500">정보 없음</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 정렬 옵션 -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-medium">{{ getCurrentMonthRange() }}</h3>
        <button
          @click="toggleSortOrder"
          class="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 active:scale-95 transition-all"
        >
          {{ sortOrder === 'newest' ? '오래된순' : '최신순' }}
        </button>
      </div>

      <!-- 이용내역 리스트 -->
      <div v-if="groupedUsage.length > 0" class="space-y-4">
        <div
          v-for="group in groupedUsage"
          :key="group.date"
          class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div class="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h4 class="text-sm font-medium text-slate-700">{{ formatDateHeader(group.date) }}</h4>
          </div>
          <div>
            <div
              v-for="(usage, index) in group.items"
              :key="usage.id"
              class="p-4"
              :class="{ 'border-b border-slate-200': index < group.items.length - 1 }"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-app-light-gray rounded-lg flex items-center justify-center">
                    <CategoryIcon 
                      :category="mapCategoryToMainCategory(usage.category)"
                      :color="'#028174'"
                      :size="20"
                    />
                  </div>
                  <div>
                    <div class="font-medium text-slate-800">{{ usage.merchant }}</div>
                    <div class="text-sm text-slate-500">{{ usage.category }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-semibold">
                    -{{ usage.amount.toLocaleString() }}원
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 빈 상태 -->
      <div v-else class="bg-white rounded-xl p-8 text-center border border-slate-200">
        <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="text-slate-800 text-lg font-medium mb-2">이용내역이 없습니다</div>
        <div class="text-slate-500 text-sm">이번 달 카드 이용내역이 없습니다</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCardsStore } from '@/stores/cards'
import CategoryIcon from '@/components/icon/CategoryIcon.vue'

const route = useRoute()
const cardsStore = useCardsStore()

const cardId = computed(() => Number(route.query.cardId))
const sortOrder = ref<'newest' | 'oldest'>('newest')

const cardName = computed(() => {
  const card = cardsStore.cards.find((c) => c.cardId === cardId.value)
  return card ? card.cardName : '카드'
})

const cardNickname = computed(() => {
  const card = cardsStore.cards.find((c) => c.cardId === cardId.value)
  return card ? card.cardNickname : '카드별칭'
})

const billingInfo = computed(() => {
  return cardsStore.getBillingByCardId(cardId.value)
})

const cardUsage = computed(() => {
  return cardsStore.getUsageByCardId(cardId.value)
})

const sortedUsage = computed(() => {
  const usage = [...cardUsage.value]
  return usage.sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    if (sortOrder.value === 'newest') {
      return dateB.getTime() - dateA.getTime()
    } else {
      return dateA.getTime() - dateB.getTime()
    }
  })
})

const groupedUsage = computed(() => {
  const groups: { [key: string]: any[] } = {}
  sortedUsage.value.forEach((item) => {
    const date = item.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
  })
  return Object.keys(groups)
    .sort((a, b) => {
      if (sortOrder.value === 'newest') {
        return new Date(b).getTime() - new Date(a).getTime()
      } else {
        return new Date(a).getTime() - new Date(b).getTime()
      }
    })
    .map((date) => ({ date, items: groups[date] }))
})

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'newest' ? 'oldest' : 'newest'
}

const getCurrentMonthRange = () => {
  const today = new Date()
  const year = today.getFullYear()
  const shortYear = String(year).slice(-2)
  const month = String(today.getMonth() + 1).padStart(2, '0')
  
  // 이번 달의 첫날
  const firstDay = new Date(year, today.getMonth(), 1)
  const firstDate = String(firstDay.getDate()).padStart(2, '0')
  
  // 이번 달의 마지막날
  const lastDay = new Date(year, today.getMonth() + 1, 0)
  const lastDate = String(lastDay.getDate()).padStart(2, '0')
  
  return `${shortYear}.${month}.${firstDate} ~ ${shortYear}.${month}.${lastDate}`
}

const formatDateHeader = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return "오늘"
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "어제"
  } else {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}년 ${month}월 ${day}일`
  }
}

// 카테고리를 대분류로 매핑하는 함수
const mapCategoryToMainCategory = (category: string): '식비' | '교통' | '생활' | '문화' | '기타' => {
  const categoryMapping: { [key: string]: '식비' | '교통' | '생활' | '문화' | '기타' } = {
    // 식비 관련
    '식당': '식비',
    '카페': '식비',
    '배달': '식비',
    '음식점': '식비',
    '베이커리': '식비',
    '패스트푸드': '식비',
    
    // 교통 관련
    '대중교통': '교통',
    '택시': '교통',
    '주유소': '교통',
    '교통': '교통',
    '버스': '교통',
    '지하철': '교통',
    
    // 생활 관련
    '통신비': '생활',
    '공과금': '생활',
    '편의점/마트': '생활',
    '마트': '생활',
    '편의점': '생활',
    '온라인쇼핑': '생활',
    '생활용품': '생활',
    
    // 문화 관련
    '공연': '문화',
    '쇼핑': '문화',
    '유흥': '문화',
    '영화': '문화',
    '도서': '문화',
    '게임': '문화',
    
    // 기본값은 기타
  }
  
  return categoryMapping[category] || '기타'
}

const fetchCardData = async (cardId: number) => {
  if (cardId) {
    try {
      await Promise.all([
        cardsStore.fetchBillingInfo(cardId),
        cardsStore.fetchUsageForCard(cardId)
      ])
    } catch (apiError) {
      console.log('API 호출 실패, 더미 데이터 사용:', apiError)
    }
  }
}

watch(cardId, async (newCardId, oldCardId) => {
  if (newCardId && newCardId !== oldCardId) {
    await fetchCardData(newCardId)
  }
}, { immediate: false })

onMounted(async () => {
  try {
    await cardsStore.fetchCards()
    await fetchCardData(cardId.value)
  } catch (error) {
    console.error('카드 사용내역 로딩 실패:', error)
  }
})
</script>

<style scoped>
/* 부드러운 그림자 */
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* 호버 효과 */
.hover\:bg-slate-50:hover {
  background-color: rgb(248 250 252);
}

/* 전환 효과 */
.transition-all {
  transition: all 0.15s ease-in-out;
}

/* 터치 반응 개선 */
.active\:scale-95:active {
  transform: scale(0.95);
}

/* 앱 배경색 */
.bg-app-gray {
  background-color: #f8fafc;
}
</style>

