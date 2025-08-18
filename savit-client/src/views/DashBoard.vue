<template>
  <Teleport to="#header-content">
    <div class="flex items-center gap-2">
      <ProfileImage />
      <div>
        <span class="text-app-green">{{ getUser?.nickname }}</span
        >님 안녕하세요!
      </div>
    </div>
  </Teleport>

  <div class="max-w-4xl mx-auto min-h-screen text-center">
    <!-- 진행중인 챌린지 (fixed) -->
    <div class="fixed top-16 inset-x-0 z-50 bg-white border-b shadow-sm">
      <div class="max-w-4xl mx-auto">
        <div class="text-center bg-app-green/30 font-medium">진행 중인 챌린지</div>
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
              <CurrentChallengeCard
                v-for="challenge in participatingChallenges"
                :key="challenge.challengeId"
                :challenge="challenge"
                variant="slide"
                @click="currentChallenge"
              />
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
    </div>

    <!-- 메인 콘텐츠 (상단 여백 추가) -->
    <div class="pt-32 pb-4">
      <CardComponent>
        <!-- 예산이 설정되지 않은 경우 -->
        <template v-if="totalBudget === 0">
          <div class="py-8 px-6 text-center">
            <div class="mb-8">
              <v-icon name="hi-chart-pie" class="w-20 h-20 text-app-dark-gray/40 mx-auto mb-6" />
              <h3 class="text-2xl font-semibold text-app-dark-gray mb-3">
                예산이 설정되지 않았습니다
              </h3>
              <p class="text-app-dark-gray/70 text-lg leading-relaxed">
                예산을 설정하시면 지출 현황을 차트로<br />
                확인하실 수 있어요
              </p>
            </div>

            <div class="mb-10">
              <ButtonItem @click="goToBudgetSetting"> 예산 설정하기 </ButtonItem>
            </div>
          </div>
        </template>

        <!-- 예산이 설정된 경우 -->
        <template v-else>
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
        </template>
      </CardComponent>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import CardComponent from '@/components/card/CardComponent.vue'
import DoughnutChart from '@/components/chart/DoughnutChart.vue'
import CurrentChallengeCard from '@/components/challenge/CurrentChallengeCard.vue'
import { useCardsStore } from '@/stores/cards'
import { useChallengeStore } from '@/stores/challenges'
import { useBudgetsStore } from '@/stores/budgets'
import ButtonItem from '@/components/button/ButtonItem.vue'
import router from '@/router'
import { storeToRefs } from 'pinia'
import { calculateProgress } from '@/utils/common.ts'
import { useAuthStore } from '@/stores/auth.ts'
import ProfileImage from '@/components/user/ProfileImage.vue'

const authStore = useAuthStore()
const cardsStore = useCardsStore()
const challengeStore = useChallengeStore()
const budgetsStore = useBudgetsStore()

const { getUser } = storeToRefs(authStore)
const { cardsList } = storeToRefs(cardsStore)
const { getParticipatingChallengeList } = storeToRefs(challengeStore)
const { currentBudgetSummary } = storeToRefs(budgetsStore)

// 챌린지 슬라이드
const currentChallengeIndex = ref(0)
const challengeContainer = ref<HTMLElement | null>(null)

const totalAmount = computed(() => {
  return cardsList.value.reduce((acc, cur) => acc + cur.usageAmount, 0)
})

const totalBudget = computed(() => {
  return currentBudgetSummary.value?.totalBudget || 0
})

const BudgetCheck = () => {
  router.push('/budget')
}

const goToBudgetSetting = () => {
  router.push('/budget/choice')
}

// 챌린지 슬라이드 기능
const participatingChallenges = computed(() => {
  const challenges = getParticipatingChallengeList.value
  return challenges.map((challenge) => {
    const progress = calculateProgress(challenge.startDate, challenge.endDate)

    return {
      ...challenge,
      progress,
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
