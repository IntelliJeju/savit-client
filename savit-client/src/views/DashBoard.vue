<template>
  <div class="max-w-4xl mx-auto min-h-screen px-4">
    <div class="py-2">
    </div>
    <div class="flex justify-between items-center text-center">
      <div class="fixed top-16 inset-x-0 z-50 bg-white border-b shadow-sm">
        <div class="bg-app-green/30 font-medium">진행 중인 챌린지(1/n)</div>
        <div class="flex justify-between items-center text-center w-full h-20 mx-auto">
          <button class="pl-2">
            <v-icon name="hi-chevron-left" scale="1.5"></v-icon>
          </button>
          <div @click="currentChallenge">
            <div>
            <span class="my-challenge-title text-xl font-semibold whitespace-nowrap">배달음식 10회 이하 주문</span>
          </div>
          <div class="my-challenge-progress ">
            <div class="mt-1 flex justify-between text-sm font-regular">
              <span>4일째 진행중</span>
              <span>{{ Math.floor((30 / 100) * 100) }}%</span>
            </div>
            <div class="mt-1">
              <ProgressBar name="myChallenge" :min-value="0" :max-value="100" :value="30" />
            </div>
          </div>
          </div>
          <button class="pr-2">
            <v-icon name="hi-chevron-right" scale="1.5"></v-icon>
          </button>
        </div>
      </div>
      <CardComponent>
        <div class="py-4"></div>
        <DoughnutChart 
          :total-amount="totalAmount"
          :total-budget="totalBudget"
        />
        <div class="text-[2rem] font-semibold whitespace-nowrap">{{ totalAmount.toLocaleString() }} 원</div>
        <div class="text-[1rem] font-regular text-app-dark-gray/50 whitespace-nowrap m-2">/ {{ totalBudget.toLocaleString() }} 원</div>

        <div class="flex justify-center gap-8 text-[1.5rem] mx-8 my-10">
          <div class="flex flex-col items-center w-1/2">
            <div class="text-center mb-4">
              <div class="font-semibold whitespace-nowrap">{{ (totalBudget-totalAmount).toLocaleString() }} 원</div>
              <div class="text-[0.9rem] text-app-dark-gray/70 mt-1">남은 한도</div>
            </div>
            <ButtonItem class="w-full min-w-32 h-28 font-semibold" @click="BudgetCheck">
              <div class="text-center">이번 달 예산의 30%를</div>
              <div class="text-center">쇼핑 카테고리에</div>
              <div class="text-center">사용했어요!</div>
            </ButtonItem>
          </div>
          <div class="flex flex-col items-center w-1/2">
            <div class="text-center mb-4">
              <div class="font-semibold whitespace-nowrap">{{ Math.round(totalAmount / new Date().getDate()).toLocaleString() }} 원</div>
              <div class="text-[0.9rem] text-app-dark-gray/70 mt-1">일평균 사용</div>
            </div>
            <ButtonItem variant="purple" class="w-full min-w-32 h-28 font-semibold" @click="BudgetCheck">
              <div class="text-center">지난 달 보다</div>
              <div class="text-center">문화 카테고리에</div>
              <div class="text-center">10% 더</div>
              <div class="text-center">사용했어요!</div>
            </ButtonItem>
          </div>
        </div>
      </CardComponent>
    </div>
    <div class="py-5">
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CardComponent from '@/components/card/CardComponent.vue';
import DoughnutChart from '@/components/chart/DoughnutChart.vue';
import { useCardsStore } from '@/stores/cards';
import ButtonItem from '@/components/button/ButtonItem.vue';
import router from '@/router';
import ProgressBar from '@/components/progressBar/ProgressBar.vue';
// import { useBudgetsStore } from '@/stores/budgets'
// import type { MainCategory } from '@/stores/budgets'

// const budgetsStore = useBudgetsStore()

// const budgetSummary = computed(() => budgetsStore.currentBudgetSummary)

const cardsStore = useCardsStore()
// const budgetsStore = useBudgetsStore()

const totalAmount = computed(() => {
  const cards = cardsStore.registeredCards
  const billingData = cardsStore.currentMonthBilling
  const amounts = cards.map(card => {
    const billing = billingData.find(b => b.cardId === card.cardId)
    return billing ? billing.amount : 0
  })
  return amounts.reduce((sum, amount) => sum + amount, 0)
})

const totalBudget = computed(() => 1000000)
// const totalBudget = budgetStore.budget

const BudgetCheck = () => {
  router.push('/budget')
}

const currentChallenge = () => {
  router.push('challenge/current/1')
}
</script>

<style scoped></style>
