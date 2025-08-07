<template>
  <div class="max-w-4xl mx-auto min-h-screen px-4">
    <div class="py-4">
    </div>
    <div class="flex justify-center items-center text-center">
      <CardComponent>
        <DoughnutChart 
          :total-amount="totalAmount"
          :total-budget="totalBudget"
        />
        <div class="text-[2rem] font-semibold">{{ totalAmount.toLocaleString() }} 원</div>
        <div class="text-[1rem] font-regular text-app-dark-gray/50 m-2">/ {{ totalBudget.toLocaleString() }} 원</div>
        <div class="flex justify-center gap-8 text-[1.5rem] mx-8 my-10">
          <div class="flex flex-col items-center w-1/2">
            <div class="text-center mb-4">
              <div class="font-semibold">{{ (totalBudget-totalAmount).toLocaleString() }} 원</div>
              <div class="text-[0.9rem] text-app-dark-gray/70 mt-1">남은 한도</div>
            </div>
            <ButtonItem class="w-full h-28">
              <div class="text-center">
                <div class="font-semibold"></div>
                <div class="text-sm text-app-dark-gray/70"></div>
              </div>
            </ButtonItem>
          </div>
          <div class="flex flex-col items-center w-1/2">
            <div class="text-center mb-4">
              <div class="font-semibold">{{ Math.round(totalAmount / new Date().getDate()).toLocaleString() }} 원</div>
              <div class="text-[0.9rem] text-app-dark-gray/70 mt-1">일평균 사용</div>
            </div>
            <ButtonItem variant="purple" class="w-full h-28"></ButtonItem>
          </div>
        </div>
      </CardComponent>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CardComponent from '@/components/card/CardComponent.vue';
import DoughnutChart from '@/components/chart/DoughnutChart.vue';
import { useCardsStore } from '@/stores/cards';
import ButtonItem from '@/components/button/ButtonItem.vue';
// import { useBudgetsStore } from '@/stores/budgets'

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

</script>

<style scoped></style>
