<template>
  <div class="info-page py-6">
    <CardComponent
      class="info-success bg-gradient-to-tr from-[#2BDDAE] to-[#10B981] text-white p-6"
    >
      <div class="info-success-header">챌린지 성공률</div>
      <div class="info-success-rate mt-4 text-[3rem] font-bold">
        {{ (getSuccessCount / (getSuccessCount + getFailCount)) * 100 || 0 }}%
      </div>
      <div class="info-success-count mt-4 flex ml-[-1rem] mr-[-1rem]">
        <div class="success flex flex-col items-center flex-1">
          <span class="text-[2rem] font-bold">{{ getSuccessCount }}</span
          ><span>성공</span>
        </div>
        <div class="divider w-[1px] h-auto bg-[#ffffff]"></div>
        <div class="fail flex flex-col items-center flex-1">
          <span class="text-[2rem] font-bold">{{ getFailCount }}</span
          ><span>실패</span>
        </div>
      </div>
    </CardComponent>
    <CardComponent
      class="info-income relative mt-6 bg-gradient-to-tr from-[#6C5CE7] to-[#A29BFE] text-white p-6"
    >
      <div class="info-income-header">총 순수익</div>
      <div class="info-income-amount mt-4 text-[3rem]">
        <span class="font-bold">{{ getTotalPrize.toLocaleString() }}</span
        ><span class="text-[2rem]"> 원</span>
      </div>
      <div
        class="info-income-recent inline-block py-1 px-2 rounded-lg mt-4 bg-[#F0FDF933] text-[0.75rem]"
      >
        <span>이번 달은 </span
        ><span class="font-bold">{{ getTotalMonthPrize.toLocaleString() }}원</span
        ><span> 벌었어요</span>
      </div>
      <div
        class="w-[200px] h-[200px] absolute bg-[#ffffff16] rounded-full left-[-30px] bottom-[-40px]"
      ></div>
    </CardComponent>
    <CardComponent class="info-record mt-6">
      <div class="info-record-header flex p-2">
        <div class="title flex-1 text-[1.25rem] font-bold"><span>챌린지 기록</span></div>
        <div class="info-filter flex gap-3">
          <button
            v-for="button in filterButtonList"
            class="py-1 px-2 rounded-lg"
            :class="
              filter === button.name ? 'bg-app-green text-white' : 'bg-[#F1F3F4] text-[#6B7684]'
            "
            @click="handleFilterSelected(button.name)"
          >
            {{ button.text }}
          </button>
        </div>
      </div>
      <div class="info-record-container mt-8">
        <div
          v-for="item in filteredStatistics"
          :key="item.challengeId"
          class="info-record-item flex gap-2 items-center py-4 border-b border-[#F1F3F4] last:border-0 last:pb-0"
          @click="() => router.push(`/challenge/result/${item.challengeId}`)"
        >
          <div class="info-item-logo">
            <div class="w-[2rem] h-[2rem] bg-black rounded-full"></div>
          </div>
          <div class="info-item-header flex flex-col flex-1">
            <span>{{ item.title }}</span>
            <span class="text-[0.75rem] text-[#8B95A1]"
              >{{ item.startDate }}~{{ item.endDate }}</span
            >
          </div>
          <div class="info-item-footer flex flex-col items-end">
            <span>{{ (item.prize > 0 ? '+' : '') + item.prize.toLocaleString() }}원</span>
            <div
              class="py-0.5 px-2 rounded-[0.5rem] text-[0.75rem] font-bold"
              :class="
                item.status === 'SUCCESS'
                  ? 'bg-[#F0FDF9] text-[#1DD1A1]'
                  : 'bg-[#FECACA] text-[#FE4444]'
              "
            >
              {{ item.status === 'SUCCESS' ? '성공' : '실패' }}
            </div>
          </div>
        </div>
      </div>
    </CardComponent>
  </div>
</template>

<script setup lang="ts">
import CardComponent from '@/components/card/CardComponent.vue'
import now from '@/utils/date.ts'
import { useChallengeStore } from '@/stores/challenges.ts'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const challengeStore = useChallengeStore()

const { getChallengeStatistics } = storeToRefs(challengeStore)

const filterButtonList = [
  {
    name: 'all',
    text: '전체',
  },
  {
    name: 'success',
    text: '성공',
  },
  {
    name: 'fail',
    text: '실패',
  },
]

const filter = ref('all')

const filteredStatistics = computed(() => {
  if (filter.value === 'all') return getChallengeStatistics.value
  else {
    return getChallengeStatistics.value.filter(
      (item) =>
        (filter.value === 'success' && item.status === 'SUCCESS') ||
        (filter.value === 'fail' && item.status === 'FAIL'),
    )
  }
})

const handleFilterSelected = (selected: string) => {
  filter.value = selected
}

const getSuccessCount = computed(() => {
  return (
    getChallengeStatistics.value.filter((challenge) => challenge.status === 'SUCCESS')?.length || 0
  )
})

const getFailCount = computed(() => {
  return (
    getChallengeStatistics.value.filter((challenge) => challenge.status === 'FAIL')?.length || 0
  )
})

const getTotalPrize = computed(() => {
  return getChallengeStatistics.value.reduce((acc, cur) => acc + cur.prize, 0)
})

const getTotalMonthPrize = computed(() => {
  return getChallengeStatistics.value
    .filter((challenge) => new Date(challenge.endDate).getMonth() + 1 === now.month)
    .reduce((acc, cur) => acc + cur.prize, 0)
})
</script>

<style scoped></style>
