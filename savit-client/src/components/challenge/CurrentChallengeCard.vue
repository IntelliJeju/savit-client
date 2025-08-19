<template>
  <!-- 대시보드 슬라이드 버전 -->
  <div
    v-if="variant === 'slide'"
    class="w-full flex-shrink-0 px-4"
    @click="$emit('click', challenge.challengeId)"
  >
    <div>
      <span class="my-challenge-title text-xl font-semibold whitespace-nowrap">
        {{ challenge.title }}
      </span>
    </div>
    <div class="my-challenge-progress">
      <div class="mt-1 flex justify-between text-sm font-regular">
        <span v-if="challengeStatus === '대기중'">대기중</span>
        <span v-else>{{ daysProgress }}일째 진행중</span>
        <span>{{ Math.floor(progressPercentage) }}%</span>
      </div>
      <div class="mt-1">
        <ProgressBar
          name="myChallenge"
          :min-value="0"
          :max-value="100"
          :value="progressPercentage"
        />
      </div>
    </div>
  </div>

  <!-- 기본 카드 버전 -->
  <div v-else class="my-challenge-item mt-4" @click="$emit('click', challenge.challengeId)">
    <card-component>
      <div class="my-challenge-title flex justify-between gap-2 items-center font-bold">
        <div class="text-xl flex-1 mr-2">{{ challenge.title }}</div>
        <div class="my-challenge-label flex-shrink-0">
          <label-item :variant="challengeStatus === '대기중' ? 'purple' : 'default'">
            {{ challengeStatus }}
          </label-item>
        </div>
      </div>
      <div class="my-challenge-progress mt-4">
        <div class="text-xs font-medium text-slate-600">
          <template v-if="challengeStatus === '대기중'"> 대기중 </template>
          <template v-else> {{ daysProgress }}일째 진행중 </template>
        </div>
        <div class="mt-1">
          <ProgressBar
            name="myChallenge"
            :min-value="0"
            :max-value="100"
            :value="progressPercentage"
          />
        </div>
        <div class="mt-1 flex justify-between">
          <span class="font-semibold">{{ progressPercentage }}%</span>
          <span class="text-xs text-slate-500">
            {{ challenge.startDate }} ~ {{ challenge.endDate }}
          </span>
        </div>
      </div>
    </card-component>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CardComponent from '@/components/card/CardComponent.vue'
import LabelItem from '@/components/label/LabelItem.vue'
import ProgressBar from '@/components/progressBar/ProgressBar.vue'
import { calculateProgress, getChallengeStatus, calculateDaysProgress } from '@/utils/common'
import type { ParticipatingChallenge } from '@/types/challenges'

const props = withDefaults(
  defineProps<{
    challenge: ParticipatingChallenge
    variant?: 'card' | 'slide'
  }>(),
  {
    variant: 'card',
  },
)

defineEmits<{
  click: [challengeId: number]
}>()

const challengeStatus = computed(() => getChallengeStatus(props.challenge.startDate))

const daysProgress = computed(() => calculateDaysProgress(props.challenge.startDate))

const progressPercentage = computed(() =>
  calculateProgress(props.challenge.startDate, props.challenge.endDate),
)
</script>

<style scoped></style>
