<template>
  <div v-if="challenge">
    <ChallengeResultLayout :result-type="challenge.myStatus">
      <div class="result-container bg-[#00000030] rounded-lg p-10">
        <div class="result-header flex flex-col items-center gap-2">
          <span class="text-[1.75rem] font-bold">{{ challenge.title }}</span>
          <span class="text-[1.25rem]">{{ challenge.startDate }}~{{ challenge.endDate }}</span>
        </div>
        <div class="divider h-[1px] w-auto bg-white my-4" />
        <div class="result-count flex justify-around">
          <div class="result-count-goal flex flex-col items-center">
            <span class="text-[2rem] font-bold"
              >{{ challenge.actualAmount || challenge.actualCount }}{{ getUnit }}</span
            >
            <span class="text-[1.25rem]">목표</span>
          </div>
          <div class="result-count-actual flex flex-col items-center">
            <span class="text-[2rem] font-bold"
              >{{ challenge.goalAmount || challenge.goalCount }}{{ getUnit }}</span
            ><span class="text-[1.25rem]">실제</span>
          </div>
        </div>
        <div class="divider h-[1px] w-auto bg-white my-4" />
        <div class="result-info flex flex-col gap-4">
          <div class="flex justify-between">
            <span>성공 인원</span
            ><span>{{ challenge.survivorCount }} / {{ challenge.totalParticipants }}명</span>
          </div>
          <div class="flex justify-between">
            <span>총 예치금</span><span>{{ challenge.totalDeposit.toLocaleString() }}원</span>
          </div>
          <div class="flex justify-between">
            <span>탈락자 예치금</span
            ><span>{{ challenge.forfeitedDeposit.toLocaleString() }}원</span>
          </div>
          <div class="flex justify-between">
            <span>나의 예치금</span><span>{{ challenge.myDeposit.toLocaleString() }}원</span>
          </div>
          <div class="flex justify-between items-center">
            <span>나의 순수익</span
            ><span class="text-[1.75rem] font-bold">{{ calculatePrize.toLocaleString() }}원</span>
          </div>
        </div>
      </div>
      <!-- <div class="result-ment-container bg-[#00000030] rounded-lg p-6 mt-6 flex flex-col gap-6">
        <div class="ment-header text-center text-[2rem] font-bold">
          <span>{{ ment.title }}</span>
        </div>
        <div class="ment-content text-[1.25rem]">
          <div v-for="content in ment.content">
            <p class="font-bold">{{ content.subtitle }}</p>
            <p>{{ content.body }}</p>
          </div>
        </div>
      </div> -->
    </ChallengeResultLayout>
  </div>
</template>

<script setup lang="ts">
import ChallengeResultLayout from '@/components/challenge/ChallengeResultLayout.vue'
import { useChallengeStore } from '@/stores/challenges.ts'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const challengeStore = useChallengeStore()

const id = route.params.id

const { getChallengeResultById } = storeToRefs(challengeStore)

const challenge = computed(() => {
  return getChallengeResultById.value(Number(id))
})

const calculatePrize = computed(() => {
  if (!challenge.value || challenge.value?.myStatus === 'FAIL') return 0

  const myRatio =
    challenge.value.myDeposit / (challenge.value.totalDeposit - challenge.value.forfeitedDeposit)
  return Math.round(challenge.value.forfeitedDeposit * myRatio)
})

const getUnit = computed(() => (challenge.value?.type === 'AMOUNT' ? '원' : '번'))

const ment = {
  title: '💡 배달 절약 팁',
  content: [
    {
      subtitle: '🏠 집에서 요리',
      body: '간단한 요리 레시피를 배워 배달 욕구를 줄여보세요.',
    },
    {
      subtitle: '📱 배달 앱 삭제',
      body: '일시적으로 배달 앱을 삭제하고 다른 취미를 찾아보세요.',
    },
  ],
}
</script>

<style scoped></style>
