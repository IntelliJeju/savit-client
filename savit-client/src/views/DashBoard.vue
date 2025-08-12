<template>
  <div class="max-w-4xl mx-auto min-h-screen px-4">
    <div class="py-2"></div>
    <div class="flex justify-between items-center text-center">
      <div class="fixed top-16 inset-x-0 z-50 bg-white border-b shadow-sm">
        <div class="bg-app-green/30 font-medium">진행 중인 챌린지</div>
        <div class="flex justify-between items-center text-center w-full h-20 mx-auto">
          <button
            class="pl-2"
            @click="previousChallenge"
            :disabled="currentChallengeIndex === 0"
            :class="{ 'opacity-50': currentChallengeIndex === 0 }"
          >
            <v-icon name="hi-chevron-left" scale="1.5"></v-icon>
          </button>

          <div ref="challengeContainer" class="flex-1 overflow-hidden relative">
            <div
              class="flex transition-transform duration-300 ease-in-out"
              :style="{ transform: `translateX(-${currentChallengeIndex * 100}%)` }"
            >
              <div
                v-for="(challenge, index) in participatingChallenges"
                :key="challenge.challengeId"
                class="w-full flex-shrink-0 px-4"
                @click="currentChallenge(challenge.challengeId)"
              >
                <div>
                  <span class="my-challenge-title text-xl font-semibold whitespace-nowrap">
                    {{ challenge.title }}
                  </span>
                </div>
                <div class="my-challenge-progress">
                  <div class="mt-1 flex justify-between text-sm font-regular">
                    <span>{{ challenge.daysProgress }}일째 진행중</span>
                    <span>{{ Math.floor(challenge.progress) }}%</span>
                  </div>
                  <div class="mt-1">
                    <ProgressBar
                      name="myChallenge"
                      :min-value="0"
                      :max-value="100"
                      :value="challenge.progress"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            class="pr-2"
            @click="nextChallenge"
            :disabled="currentChallengeIndex === participatingChallenges.length - 1"
            :class="{ 'opacity-50': currentChallengeIndex === participatingChallenges.length - 1 }"
          >
            <v-icon name="hi-chevron-right" scale="1.5"></v-icon>
          </button>
        </div>

        <!-- 챌린지 인디케이터 점들 -->
        <div class="flex justify-center gap-1 py-2" v-if="participatingChallenges.length > 1">
          <div
            v-for="(challenge, index) in participatingChallenges"
            :key="challenge.challengeId"
            class="w-2 h-2 rounded-full transition-colors duration-200"
            :class="index === currentChallengeIndex ? 'bg-app-green' : 'bg-gray-400'"
          ></div>
        </div>
      </div>
      <CardComponent>
        <div class="py-4"></div>
        <DoughnutChart :cards-list="cardsList" :total-budget="totalBudget" />
        <div class="text-[2rem] font-semibold whitespace-nowrap">
          {{ totalAmount.toLocaleString() }} 원
        </div>
        <div class="text-[1rem] font-regular text-app-dark-gray/50 whitespace-nowrap m-2">
          / {{ totalBudget.toLocaleString() }} 원
        </div>

        <div class="flex justify-center gap-8 text-[1.5rem] mx-8 my-10">
          <div class="flex flex-col items-center w-1/2">
            <div class="text-center mb-4">
              <div class="font-semibold whitespace-nowrap">
                {{ (totalBudget - totalAmount).toLocaleString() }} 원
              </div>
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
              <div class="font-semibold whitespace-nowrap">
                {{ Math.round(totalAmount / new Date().getDate()).toLocaleString() }} 원
              </div>
              <div class="text-[0.9rem] text-app-dark-gray/70 mt-1">일평균 사용</div>
            </div>
            <ButtonItem
              variant="purple"
              class="w-full min-w-32 h-28 font-semibold"
              @click="BudgetCheck"
            >
              <div class="text-center">지난 달 보다</div>
              <div class="text-center">문화 카테고리에</div>
              <div class="text-center">10% 더</div>
              <div class="text-center">사용했어요!</div>
            </ButtonItem>
          </div>
        </div>
      </CardComponent>
    </div>
    <div class="py-5"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import CardComponent from '@/components/card/CardComponent.vue'
import DoughnutChart from '@/components/chart/DoughnutChart.vue'
import { useCardsStore } from '@/stores/cards'
import { useChallengeStore } from '@/stores/challenges'
import ButtonItem from '@/components/button/ButtonItem.vue'
import router from '@/router'
import ProgressBar from '@/components/progressBar/ProgressBar.vue'
import { storeToRefs } from 'pinia'
import type { ParticipatingChallenge, ParticipatingChallengeDetail } from '@/types/challenges'
// import { useBudgetsStore } from '@/stores/budgets'
// import type { MainCategory } from '@/stores/budgets'

// const budgetsStore = useBudgetsStore()

// const budgetSummary = computed(() => budgetsStore.currentBudgetSummary)

const cardsStore = useCardsStore()
const challengeStore = useChallengeStore()

const { cardsList } = storeToRefs(cardsStore)
const { getParticipatingChallengeList, getParticipatingChallengeDetailById } = storeToRefs(challengeStore)

// 챌린지 슬라이드
const currentChallengeIndex = ref(0)
const challengeContainer = ref<HTMLElement | null>(null)

const totalAmount = computed(() => {
  return cardsList.value.reduce((acc, cur) => acc + cur.usageAmount, 0)
})

const totalBudget = computed(() => 1000000)
// const totalBudget = budgetStore.budget

const BudgetCheck = () => {
  router.push('/budget')
}

// 진행 일수 계산 함수
const calculateDaysProgress = (startDate: string): number => {
  const start = new Date(startDate)
  const today = new Date()
  const diffTime = today.getTime() - start.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(1, diffDays)
}

// 진행률 계산 함수
const calculateProgress = (challenge: ParticipatingChallenge, detail?: ParticipatingChallengeDetail): number => {
  if (!detail) return 0
  
  const startDate = new Date(challenge.startDate)
  const endDate = new Date(challenge.endDate)
  const today = new Date()
  
  const totalDuration = endDate.getTime() - startDate.getTime()
  const currentDuration = today.getTime() - startDate.getTime()
  
  const timeProgress = Math.min(100, Math.max(0, (currentDuration / totalDuration) * 100))
  
  return Math.round(timeProgress)
}

// 챌린지 슬라이드 기능
const participatingChallenges = computed(() => {
  const challenges = getParticipatingChallengeList.value
  
  if (challenges.length === 0) {
    // 데이터가 없을 때 기본 샘플 데이터
    return [
      {
        challengeId: 1,
        title: '배달음식 10회 이하 주문',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        categoryName: '음식',
        daysProgress: 4,
        progress: 30
      }
    ]
  }
  
  return challenges.map(challenge => {
    const detail = getParticipatingChallengeDetailById.value(challenge.challengeId)
    const daysProgress = calculateDaysProgress(challenge.startDate)
    const progress = calculateProgress(challenge, detail)
    
    return {
      ...challenge,
      daysProgress,
      progress
    }
  })
})

const previousChallenge = () => {
  if (currentChallengeIndex.value > 0) {
    currentChallengeIndex.value--
  }
}

const nextChallenge = () => {
  if (currentChallengeIndex.value < participatingChallenges.value.length - 1) {
    currentChallengeIndex.value++
  }
}

const currentChallenge = (challengeId?: number) => {
  const id =
    challengeId || participatingChallenges.value[currentChallengeIndex.value]?.challengeId || 1
  router.push(`challenge/current/${id}`)
}
</script>

<style scoped></style>
