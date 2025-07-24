<template>
  <div class="card-current-container">
    <h1>내 카드 현황</h1>

    <section class="registered-cards">
      <h2>등록된 카드</h2>
      <div v-if="registeredCards.length > 0" class="card-list">
        <div v-for="card in registeredCards" :key="card.cardId" class="card-item">
          <h3>{{ (card.organization, card.cardName) }}</h3>
          <p v-if="currentBilling">{{ currentBilling.amount }}원</p>
        </div>
      </div>
      <p v-else>등록된 카드가 없습니다.</p>
    </section>

    <section class="billing-info">
      <div class="billing-item">
        <h3 v-if="currentBilling">{{ currentBilling.month }}월 청구 금액</h3>
        <p v-if="currentBilling">{{ currentBilling.amount }}원</p>
        <p v-else>이번 달 청구 금액 정보를 불러오는 중...</p>
      </div>
      <div class="billing-item">
        <h3 v-if="lastBilling">{{ lastBilling.month }}월 청구 금액</h3>
        <p v-if="lastBilling">{{ lastBilling.amount }}원</p>
        <p v-else>저번 달 청구 금액 정보를 불러오는 중...</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useCardsStore } from '@/stores/cards'

const cardsStore = useCardsStore()

const { registeredCards, currentBilling, lastBilling } = cardsStore

onMounted(() => {
  cardsStore.fetchCards()
  cardsStore.fetchCurrentMonthBilling()
  cardsStore.fetchLastMonthBilling()
})
</script>

<style scoped>
.card-current-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Arial', sans-serif;
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

section {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #555;
  margin-top: 0;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.card-list {
  display: grid;
  gap: 15px;
}

.card-item {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
}

.card-item h3 {
  color: #007bff;
  margin-top: 0;
  margin-bottom: 5px;
}

.card-item p {
  color: #666;
  font-size: 0.9em;
}

.billing-item {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 10px;
}

.billing-item h3 {
  color: #28a745;
  margin-top: 0;
  margin-bottom: 5px;
}

.billing-item p {
  font-size: 1.1em;
  font-weight: bold;
  color: #333;
}
</style>
