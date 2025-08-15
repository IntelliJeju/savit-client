<template>
  <Teleport to="#header-content">
    <span>챌린지</span>
  </Teleport>

  <div v-if="!loading" class="challenge-main-page h-full grid grid-rows-[1fr_auto]">
    <div class="content-area pt-6 overflow-y-auto overflow-x-hidden pb-3">
      <div class="my-challenge-container">
        <div class="my-challenge-header">
          <span class="font-bold">나의 챌린지</span>
        </div>
        <div
          v-if="getParticipatingChallengeList.length === 0"
          class="empty-message mt-4 text-center py-8"
        >
          <span class="text-gray-500">참여중인 챌린지가 없습니다</span>
        </div>
        <div
          v-for="challenge in getParticipatingChallengeList"
          :key="challenge.challengeId"
          class="my-challenge-item mt-4"
          @click="routeCurrent(challenge.challengeId)"
        >
          <card-component>
            <div class="my-challenge-title flex justify-between gap-2 items-center font-bold">
              <div class="text-2xl">{{ challenge.title }}</div>
              <div class="my-challenge-label">
                <label-item>{{ getChallengeStatus(challenge.startDate) }}</label-item>
              </div>
            </div>
            <div class="my-challenge-progress mt-4">
              <div class="text-xs font-medium text-slate-600">
                <template v-if="getChallengeStatus(challenge.startDate) === '대기중'">
                  대기중
                </template>
                <template v-else>
                  {{ calculateDaysProgressWithStatus(challenge.startDate) }}일째 진행중
                </template>
              </div>
              <div class="mt-1">
                <ProgressBar name="myChallenge" :min-value="0" :max-value="100" :value="30" />
              </div>
              <div class="mt-1 flex justify-between">
                <span class="font-semibold"
                  >{{ calculateProgress(challenge.startDate, challenge.endDate) }}%</span
                >
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
        <div v-if="availChallengeList.length === 0" class="empty-message mt-4 text-center py-8">
          <span class="text-gray-500">참여 가능한 챌린지가 없습니다</span>
        </div>
        <div
          v-for="item in availChallengeList"
          :key="item.challengeId"
          class="avail-challenge-item mt-4"
          @click="routeDetail(item.challengeId)"
        >
          <card-component>
            <div class="avail-challenge-title flex justify-between font-semibold">
              <div class="text-xl">{{ item.title }}</div>
              <div class="avail-challenge-label">
                <label-item>{{ item.categoryName }}</label-item>
              </div>
            </div>
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
import { storeToRefs } from 'pinia'
import now from '@/utils/date.ts'
import { calculateProgress, getChallengeStatus, calculateDaysProgressWithStatus } from '@/utils/common.ts'

const challengeStore = useChallengeStore()

const { availChallengeList, loading, getParticipatingChallengeList } = storeToRefs(challengeStore)

const routeDetail = (id: number) => {
  router.push(`/challenge/detail/${id}`)
}

const routeCurrent = (id: number) => {
  router.push(`/challenge/current/${id}`)
}
</script>

<style scoped></style>
