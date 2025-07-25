<template>
  <div class="card-usage-container p-4">
    <h2 class="text-2xl font-bold mb-6 text-center">{{ cardName }} 이용 내역</h2>

    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4">이번 달 청구 금액</h3>
      <div class="bg-white p-4 rounded-lg shadow-md mb-4">
        <p class="text-lg font-medium">이번 달 청구 금액:</p>
        <p v-if="billingInfo.current" class="text-2xl font-bold text-blue-600">
          {{ billingInfo.current.amount.toLocaleString() }}원
        </p>
        <p v-else class="text-gray-500">정보 없음</p>
      </div>
    </div>

    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4">이번 달 카드 이용 내역</h3>
      <div class="flex justify-end mb-4">
        <button
          @click="toggleSortOrder"
          class="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          {{ sortOrder === 'newest' ? '오래된순' : '최신순' }} 정렬
        </button>
      </div>
      <div v-if="groupedUsage.length > 0" class="space-y-6">
        <div
          v-for="group in groupedUsage"
          :key="group.date"
          class="bg-gray-100 p-4 rounded-lg shadow-sm"
        >
          <h4 class="text-lg font-semibold mb-3">{{ group.date }}</h4>
          <div class="space-y-4">
            <div
              v-for="usage in group.items"
              :key="usage.id"
              class="bg-white p-4 rounded-lg shadow-md"
            >
              <p class="text-lg font-medium">{{ usage.merchant }}</p>
              <p class="text-gray-600">금액: {{ usage.amount.toLocaleString() }}원</p>
              <p class="text-gray-600">카테고리: {{ usage.category }}</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-gray-500 text-center">
        <p>이번 달 카드 이용 내역이 없습니다.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCardsStore } from '@/stores/cards'

const route = useRoute()
const cardsStore = useCardsStore()

const cardId = computed(() => Number(route.query.cardId))
const sortOrder = ref<'newest' | 'oldest'>('newest')

const cardName = computed(() => {
  const card = cardsStore.cards.find((c) => c.cardId === cardId.value)
  return card ? card.cardName : '카드'
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

onMounted(() => {
  // Data is already in the store, no need to fetch again unless it can be stale
  // If fetching is needed, you would do it here, e.g.:
  // cardsStore.fetchBillingInfo(cardId.value)
  // cardsStore.fetchUsageForCard(cardId.value)
})
</script>

<style scoped>
</style>
