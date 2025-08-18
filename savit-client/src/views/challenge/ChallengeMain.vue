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
        <card-component
          v-if="getParticipatingChallengeList.length === 0"
          class="mt-4 text-center py-8"
        >
          <span class="text-gray-500">참여중인 챌린지가 없습니다</span>
        </card-component>
        <CurrentChallengeCard
          v-for="challenge in getParticipatingChallengeList"
          :key="challenge.challengeId"
          :challenge="challenge"
          @click="routeCurrent"
        />
      </div>
      <div class="avail-challenge-container mt-8">
        <div class="avail-challenge-header">
          <span class="text-base font-bold">이번 주 참여 가능 챌린지</span>
        </div>
        <card-component
          v-if="availChallengeList.length === 0"
          class="empty-message mt-4 text-center py-8"
        >
          <span class="text-gray-500">참여 가능한 챌린지가 없습니다</span>
        </card-component>
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
    <div class="challenge-button-container py-4">
      <button-item
        @click="() => router.push('/challenge/statistics')"
        text="챌린지 통계"
        variant="primary"
      ></button-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import CardComponent from '@/components/card/CardComponent.vue'
import ButtonItem from '@/components/button/ButtonItem.vue'
import LabelItem from '@/components/label/LabelItem.vue'
import CurrentChallengeCard from '@/components/challenge/CurrentChallengeCard.vue'
import router from '@/router/index.ts'
import { useChallengeStore } from '@/stores/challenges.ts'
import { storeToRefs } from 'pinia'

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
