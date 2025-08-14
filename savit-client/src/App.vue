<template>
  <div>
    <SplashScreen v-if="isLoading" />
    <MainLayout />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import MainLayout from './layout/MainLayout.vue'
import SplashScreen from './components/loading/SplashScreen.vue'
import { useAuthStore } from './stores/auth.ts'
import { useCardsStore } from './stores/cards.ts'
import { useChallengeStore } from './stores/challenges.ts'
import { useBudgetsStore } from './stores/budgets.ts'
import type { Card } from './types/card'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const cardsStore = useCardsStore()
const challengeStore = useChallengeStore()
const budgetsStore = useBudgetsStore()

//유저
const { fetchUserInfo } = authStore
const { loading: authLoading } = storeToRefs(authStore)

//카드
const { fetchCards, fetchTransactions } = cardsStore
const { cardsList, loading: cardsLoading } = storeToRefs(cardsStore)

//챌린지
const {
  fetchAvailChallengeList,
  fetchAvailChallengeDetail,
  fetchParticipateChallenges,
  fetchParticipateChallengeDetail,
  fetchChallengeStatistics,
} = challengeStore
const {
  availChallengeList,
  getParticipatingChallengeList,
  loading: challengeLoading,
} = storeToRefs(challengeStore)

//예산
const { initializeCurrentMonthBudget } = budgetsStore

// 전체 로딩 상태 (모든 store의 로딩 상태를 합침)
const isLoading = computed(() => {
  return authLoading.value || cardsLoading.value || challengeLoading.value
})

onMounted(async () => {
  authStore.restoreAuthentication()
  if (authStore.isLoggedIn) {
    //유저
    await fetchUserInfo()

    //카드
    await fetchCards()
    const promises = cardsList.value.map((card: Card) => fetchTransactions(card.cardId, 'GET'))
    await Promise.allSettled(promises)

    //챌린지
    await fetchAvailChallengeList()
    await fetchParticipateChallenges()
    await fetchChallengeStatistics()

    const promissesAvail = availChallengeList.value.map((challenge) => {
      fetchAvailChallengeDetail(challenge.challengeId)
    })
    const promissesParticipant = getParticipatingChallengeList.value.map((challenge) => {
      fetchParticipateChallengeDetail(challenge.challengeId)
    })

    await Promise.allSettled(promissesAvail)
    await Promise.allSettled(promissesParticipant)

    //예산
    await initializeCurrentMonthBudget()
  }
})
</script>

<style scoped></style>
