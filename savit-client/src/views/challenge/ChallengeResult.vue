<template>
  <div>
    <ChallengeResultLayout :result-type="challenge.status">
      <div class="result-container bg-[#00000030] rounded-lg p-10">
        <div class="result-header flex flex-col items-center gap-2">
          <span class="text-[1.75rem] font-bold">{{ challenge.title }}</span>
          <span class="text-[1.25rem]">{{ challenge.startDate }}~{{ challenge.endDate }}</span>
        </div>
        <div class="divider h-[1px] w-auto bg-white my-4" />
        <div class="result-count flex justify-around">
          <div class="result-count-goal flex flex-col items-center">
            <span class="text-[2rem] font-bold">10번</span>
            <span class="text-[1.25rem]">목표 횟수</span>
          </div>
          <div class="result-count-actual flex flex-col items-center">
            <span class="text-[2rem] font-bold">12번</span
            ><span class="text-[1.25rem]">실제 주문</span>
          </div>
        </div>
        <div class="divider h-[1px] w-auto bg-white my-4" />
        <div class="result-info flex flex-col gap-4">
          <div class="flex justify-between"><span>성공 인원</span><span>4 / 8명</span></div>
          <div class="flex justify-between">
            <span>예치금</span><span>{{ (15000).toLocaleString() }}원</span>
          </div>
          <div class="flex justify-between">
            <span>탈락자 몰수금</span><span>{{ (15000).toLocaleString() }}원</span>
          </div>
          <div class="flex justify-between">
            <span>생존자 분배금</span><span>{{ (15000).toLocaleString() }}원</span>
          </div>
          <div class="flex justify-between">
            <span>생존자 수령액</span><span>{{ (15000).toLocaleString() }}원</span>
          </div>
          <div class="flex justify-between items-center">
            <span>나의 순수익</span
            ><span class="text-[1.75rem] font-bold">{{ challenge.prize.toLocaleString() }}원</span>
          </div>
        </div>
      </div>
      <div class="result-ment-container bg-[#00000030] rounded-lg p-6 mt-6 flex flex-col gap-6">
        <div class="ment-header text-center text-[2rem] font-bold">
          <span>{{ ment.title }}</span>
        </div>
        <div class="ment-content text-[1.25rem]">
          <div v-for="content in ment.content">
            <p class="font-bold">{{ content.subtitle }}</p>
            <p>{{ content.body }}</p>
          </div>
        </div>
      </div>
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

const { getChallengeStatisticsById } = storeToRefs(challengeStore)

const challenge = computed(() => {
  return getChallengeStatisticsById.value(Number(id))
})

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
