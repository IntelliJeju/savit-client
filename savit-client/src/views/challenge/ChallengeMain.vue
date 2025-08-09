<template>
  <div v-if="!loading" class="challenge-main-page h-full grid grid-rows-[1fr_auto]">
    <div class="content-area pt-6 overflow-y-auto overflow-x-hidden pb-3">
      <div class="my-challenge-container">
        <div class="my-challenge-header">
          <button @click="() => router.push('/challenge/result/1')">결과</button>
          <span class="font-bold">나의 챌린지</span>
        </div>
        <div
          v-for="challenge in participatingChallenges"
          :key="challenge.challengeId"
          class="my-challenge-item mt-4"
          @click="routeCurrent(challenge.challengeId)"
        >
          <card-component>
            <div class="my-challenge-label">
              <label-item>진행중</label-item>
            </div>
            <div class="my-challenge-title mt-4 text-2xl font-bold">{{ challenge.title }}</div>
            <div class="my-challenge-progress mt-4">
              <div class="text-xs font-medium text-slate-600">
                {{ Number(now.day) - Number(new Date(challenge.startDate).getDate()) + 1 }}일째
                진행중
              </div>
              <div class="mt-1">
                <ProgressBar name="myChallenge" :min-value="0" :max-value="100" :value="30" />
              </div>
              <div class="mt-1 flex justify-between">
                <span class="font-semibold">{{ Math.floor((30 / 100) * 100) }}%</span>
                <span class="text-xs text-slate-500"
                  >{{ challenge.startDate }} ~ {{ challenge.endDate }}</span
                >
              </div>
            </div>
          </card-component>
        </div>
      </div>
      <div class="avail-challenge-container mt-8">
        <div class="avail-challenge-header">
          <span class="text-base font-bold">이번 주 참여 가능 챌린지</span>
        </div>
        <div
          v-for="item in availChallengeList"
          :key="item.challengeId"
          class="avail-challenge-item mt-4"
          @click="routeDetail(item.challengeId)"
        >
          <card-component>
            <div class="avail-challenge-label">
              <label-item>{{ item.categoryName }}</label-item>
            </div>
            <div class="avail-challenge-title mt-2 text-xl font-semibold">{{ item.title }}</div>
            <div class="avail-challenge-due">
              <span class="text-xs text-slate-500">{{ item.startDate }}~{{ item.endDate }}</span>
            </div>
          </card-component>
        </div>
      </div>
    </div>
    <div class="challenge-button-container flex gap-2 py-4">
      <button-item
        @click="() => router.push('/challenge/statistics')"
        text="챌린지 통계"
        variant="primary"
      ></button-item>
      <!-- <button-item text="새 챌린지 개설" variant="primary"></button-item> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import CardComponent from '@/components/card/CardComponent.vue'
import ButtonItem from '@/components/button/ButtonItem.vue'
import LabelItem from '@/components/label/LabelItem.vue'
import ProgressBar from '@/components/progressBar/ProgressBar.vue'
import router from '@/router/index.ts'
import { useChallengeStore } from '@/stores/challenges.ts'
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import now from '@/utils/date.ts'

const challengeStore = useChallengeStore()

const {
  fetchAvailChallengeList,
  fetchAvailChallengeDetail,
  fetchParticipateChallenges,
  fetchParticipateChallengeDetail,
  // availChallengeDetailMap,
} = challengeStore
const { availChallengeList, loading, getParticipatingChallengeList } = storeToRefs(challengeStore)

const participatingChallenges = computed(() => {
  return challengeStore.getParticipatingChallengeDetailList
})

onMounted(async () => {
  await fetchAvailChallengeList()
  await fetchParticipateChallenges()
  const promissesAvail = availChallengeList.value.map((challenge) => {
    fetchAvailChallengeDetail(challenge.challengeId)
  })

  await Promise.allSettled(promissesAvail)

  const promissesParticipant = getParticipatingChallengeList.value.map((challenge) => {
    fetchParticipateChallengeDetail(challenge.challengeId)
  })

  await Promise.allSettled(promissesParticipant)
})

const routeDetail = (id: number) => {
  router.push(`/challenge/detail/${id}`)
}

const routeCurrent = (id: number) => {
  router.push(`/challenge/current/${id}`)
}
</script>

<style scoped></style>
