<template>
  <Teleport to="#header-content">
    <span>챌린지 현황</span>
  </Teleport>

  <div v-if="!challenge" class="challenge-current-page flex items-center justify-center h-full">
    <div class="text-center">
      <div class="text-lg font-medium">챌린지 정보를 불러오는 중...</div>
    </div>
  </div>
  <div v-else class="challenge-current-page">
    <div class="current-header py-4">
      <div class="title text-xl font-bold">{{ challenge.title }}</div>
      <div class="flex gap-2 pt-2">
        <div
          class="flex-1 text-center text-[0.75rem] text-app-red bg-[#FEF2F2] border border-[#FECACA] rounded-lg py-1"
        >
          {{ remainTime }}
        </div>
        <div
          class="flex-1 text-center text-[0.75rem] text-[#1DD1A1] bg-[#F0FDF9] border border-[#86EFAC] rounded-lg py-1"
        >
          참여중 {{ challenge.participatingParticipants }} / {{ challenge.joinedParticipants }}명
        </div>
      </div>
    </div>
    <div
      class="current-board relative flex justify-between text-white bg-gradient-to-tr from-[#1DD1A1] to-[#10B981] px-4 py-6 mx-[-1rem] overflow-hidden"
    >
      <div>
        <div>총 적립금</div>
        <div class="mt-4 font-bold">
          <span class="text-3xl">{{ challenge.entryFee.toLocaleString() }}</span
          ><span class="text-xl"> 원</span>
        </div>
        <div class="mt-3 text-sm">{{ challenge.startDate }} ~ {{ challenge.endDate }}</div>
      </div>
      <div class="flex flex-col justify-between items-end">
        <div class="flex flex-col items-end">
          <span class="text-sm">나의 예치금</span>
          <div
            class="bg-[#F0FDF932] px-2 rounded-lg mt-1 border border-[#86EFAC32] font-medium text-sm"
          >
            {{ challenge.myFee.toLocaleString() }}원
          </div>
        </div>
        <div class="flex flex-col items-end">
          <span class="text-sm">예상 보상</span>
          <div
            class="bg-[#F0FDF932] px-2 rounded-lg mt-1 border border-[#86EFAC32] font-medium text-sm"
          >
            {{ Number(challenge.expectedPrize.toFixed(0)).toLocaleString() }}원
          </div>
        </div>
      </div>
      <div
        class="absolute w-[190px] h-[190px] bg-[#ffffff16] rounded-full right-[-10%] top-[-20%]"
      />
    </div>
    <div class="current-participants">
      <div class="header flex justify-between py-4 items-center">
        <div class="font-bold">참가자</div>
        <div class="flex gap-4">
          <div class="flex flex-col items-center">
            <span class="text-slate-400">전체</span>
            <div class="text-slate-600 bg-slate-100 rounded-lg px-2">
              {{ challenge.joinedParticipants }}명
            </div>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-slate-400">참여중</span>
            <div class="text-green-600 bg-green-50 rounded-lg px-2">
              {{ challenge.participatingParticipants }}명
            </div>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-slate-400">탈락</span>
            <div class="text-app-red bg-red-50 rounded-lg px-2">
              {{ challenge.joinedParticipants - challenge.participatingParticipants }}명
            </div>
          </div>
        </div>
      </div>
      <div class="participants-container mt-4">
        <div
          v-for="participant in challenge.participants"
          :key="participant.nickName"
          class="participant flex gap-4 py-4 border-b"
          :class="{ 'opacity-40 grayscale': participant.status === 'FAIL' }"
        >
          <div class="profile-imgae">
            <div
              class="w-12 h-12 rounded-full"
              :class="participant.status === 'FAIL' ? 'bg-gray-400' : 'bg-black'"
            ></div>
          </div>
          <div class="progress flex-1">
            <div class="flex justify-between">
              <span
                class="font-medium"
                :class="participant.status === 'FAIL' ? 'text-gray-500 line-through' : ''"
              >
                {{ participant.nickName }}
                <span v-if="participant.status === 'FAIL'" class="ml-2 text-xs text-red-500"
                  >(탈락)</span
                >
              </span>
              <span :class="participant.status === 'FAIL' ? 'text-gray-400' : ''">
                {{ getParticipantProgress(participant).percentage }}%
              </span>
            </div>
            <div>
              <progress-bar
                :min-value="0"
                :max-value="getParticipantProgress(participant).target"
                :value="getParticipantProgress(participant).current"
              ></progress-bar>
            </div>
            <span
              class="text-slate-400"
              :class="participant.status === 'FAIL' ? 'text-gray-500' : ''"
            >
              {{ getParticipantProgress(participant).current.toLocaleString() }} /
              {{ getParticipantProgress(participant).target.toLocaleString() }} {{ challengeUnit }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProgressBar from '@/components/progressBar/ProgressBar.vue'
import { useChallengeStore } from '@/stores/challenges.ts'
import type { Participants } from '@/types/challenges'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'

//챌린지 진행 디테일
const challengeStore = useChallengeStore()
const route = useRoute()

const challengeId = Number(route.params.id)
const { getParticipatingChallengeDetailById } = storeToRefs(challengeStore)

const challenge = computed(() => getParticipatingChallengeDetailById.value(challengeId))

// 챌린지 타입별 헬퍼 함수들
const isCountChallenge = computed(() => challenge.value?.targetCount !== null)
const challengeTarget = computed(
  () =>
    (isCountChallenge.value ? challenge.value?.targetCount : challenge.value?.targetAmount) ?? 0,
)
const challengeUnit = computed(() => (isCountChallenge.value ? '회' : '원'))

const getParticipantProgress = (participant: Participants) => {
  const currentValue = isCountChallenge.value
    ? participant.challengeCount
    : participant.challengeAmount
  return {
    current: currentValue,
    target: challengeTarget.value,
    percentage:
      challengeTarget.value > 0 ? Math.floor((currentValue / challengeTarget.value) * 100) : 0,
  }
}

//실시간 타이머
const currentTime = ref(Date.now())
let timerInterval: number | null = null

const formatTime = (milliseconds: number): string => {
  if (milliseconds <= 0) return '종료됨'

  const totalSeconds = Math.floor(milliseconds / 1000)
  const days = Math.floor(totalSeconds / (24 * 60 * 60))
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) {
    return `${days}일 ${hours}시간 ${minutes}분 ${seconds}초`
  } else if (hours > 0) {
    return `${hours}시간 ${minutes}분 ${seconds}초`
  } else {
    return `${minutes}분 ${seconds}초`
  }
}

const remainTime = computed(() => {
  if (!challenge.value) return '로딩중...'

  const endTime = new Date(challenge.value.endDate).getTime()
  const remaining = endTime - currentTime.value

  return formatTime(remaining)
})

onMounted(() => {
  timerInterval = setInterval(() => {
    currentTime.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped></style>
