<template>
  <div>
    <div class="my-challenge-container p-6">
      <div class="my-challenge-header">
        <span class="text-base font-bold">나의 챌린지</span>
      </div>
      <div class="my-challenge-item pt-4">
        <card-component>
          <div class="my-challenge-label"><label-item>진행중</label-item></div>
          <div class="my-challenge-title pt-4 text-2xl font-bold">배달음식 10회 이하 주문</div>
          <div class="my-challenge-progress pt-4">
            <div class="text-xs font-bold">4일째 진행중</div>
            <div class="pt-1">
              <ProgressBar name="myChallenge" :min-value="0" :max-value="100" :value="30" />
            </div>
            <div class="pt-1 flex justify-between">
              <span class="font-bold">{{ Math.floor((30 / 100) * 100) }}%</span>
              <span class="font-bold text-xs">2025/07/16~2025/07/23</span>
            </div>
          </div>
        </card-component>
      </div>
    </div>
    <div class="avail-challenge-container">
      <div class="avail-challenge-header"></div>
      <div class="avail-challenge-item"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CardComponent from '@/components/card/CardComponent.vue'
import LabelItem from '@/components/label/LabelItem.vue'
import ProgressBar from '@/components/progressBar/ProgressBar.vue'
import router from '@/router/index.ts'

const test = () => {
  router.push('/challenge/detail')
}
</script>

<style scoped></style>
