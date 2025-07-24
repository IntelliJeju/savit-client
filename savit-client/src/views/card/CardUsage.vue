<template>
  <div class="card-usage-container p-4">
    <h2 class="text-2xl font-bold mb-6 text-center">카드 이용 내역</h2>

    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4">이번 달 청구 금액</h3>
      <div class="bg-white p-4 rounded-lg shadow-md mb-4">
        <p class="text-lg font-medium">이번 달 청구 금액:</p>
        <p v-if="cardsStore.currentBilling" class="text-2xl font-bold text-blue-600">
          {{ cardsStore.currentBilling.amount.toLocaleString() }}원
        </p>
        <p v-else class="text-gray-500">정보 없음</p>
      </div>
    </div>

    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4">이번 달 카드 이용 내역</h3>
      <div v-if="cardsStore.currentMonthUsage.length > 0" class="space-y-4">
        <div
          v-for="usage in cardsStore.currentMonthUsage"
          :key="usage.id"
          class="bg-white p-4 rounded-lg shadow-md"
        >
          <p class="text-lg font-medium">{{ usage.merchant }}</p>
          <p class="text-gray-600">날짜: {{ usage.date }}</p>
          <p class="text-gray-600">금액: {{ usage.amount.toLocaleString() }}원</p>
          <p class="text-gray-600">카테고리: {{ usage.category }}</p>
        </div>
      </div>
      <div v-else class="text-gray-500 text-center">
        <p>이번 달 카드 이용 내역이 없습니다.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useCardsStore } from '@/stores/cards'

const cardsStore = useCardsStore()

onMounted(async () => {
  await cardsStore.fetchCurrentMonthBilling()
  await cardsStore.fetchCurrentMonthUsage()
})
</script>

<style scoped>
/* Tailwind CSS를 사용하므로 추가적인 스타일은 필요하지 않을 수 있습니다. */
</style>
