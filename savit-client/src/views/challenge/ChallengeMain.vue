<template>
  <div class="challenge-main-page h-full grid grid-rows-[1fr_auto]">
    <div class="content-area pt-6 overflow-auto pb-3">
      <div class="my-challenge-container">
        <div class="my-challenge-header">
          <span class="font-bold">나의 챌린지</span>
        </div>
        <div class="my-challenge-item mt-4" @click="routeDetail(1)">
          <card-component>
            <div class="my-challenge-label">
              <label-item>진행중</label-item>
            </div>
            <div class="my-challenge-title mt-4 text-2xl font-bold">배달음식 10회 이하 주문</div>
            <div class="my-challenge-progress mt-4">
              <div class="text-xs font-bold">4일째 진행중</div>
              <div class="mt-1">
                <ProgressBar name="myChallenge" :min-value="0" :max-value="100" :value="30" />
              </div>
              <div class="mt-1 flex justify-between">
                <span class="font-bold">{{ Math.floor((30 / 100) * 100) }}%</span>
                <span class="font-bold text-xs">2025/07/16~2025/07/23</span>
              </div>
            </div>
          </card-component>
        </div>
      </div>
      <div class="avail-challenge-container mt-8">
        <div class="avail-challenge-header">
          <span class="text-base font-bold">이번 주 참여 가능 챌린지</span>
        </div>
        <div v-for="item in dummy" class="avail-challenge-item mt-4" @click="routeDetail(1)">
          <card-component>
            <div class="avail-challenge-label">
              <label-item>{{ item.category }}</label-item>
            </div>
            <div class="avail-challenge-title mt-2 text-xl font-bold">{{ item.title }}</div>
            <div class="avail-challenge-due">
              <span class="font-bold text-xs">{{ item.due }}</span>
            </div>
          </card-component>
        </div>
      </div>
    </div>
    <div class="challenge-button-container flex gap-2 py-4">
      <button-item
        @click="() => router.push('/challenge/statistics')"
        text="챌린지 통계"
        variant="purple"
      ></button-item>
      <button-item text="새 챌린지 개설" variant="primary"></button-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import CardComponent from '@/components/card/CardComponent.vue'
import ButtonItem from '@/components/button/ButtonItem.vue'
import LabelItem from '@/components/label/LabelItem.vue'
import ProgressBar from '@/components/progressBar/ProgressBar.vue'
import router from '@/router/index.ts'

const dummy = [
  {
    category: '배달',
    title: '배달음식 10회 이하 주문',
    due: '2025/07/16~2025/07/23',
  },
  {
    category: '배달',
    title: '배달음식 10회 이하 주문',
    due: '2025/07/16~2025/07/23',
  },
  {
    category: '배달',
    title: '배달음식 10회 이하 주문',
    due: '2025/07/16~2025/07/23',
  },
  {
    category: '배달',
    title: '배달음식 10회 이하 주문',
    due: '2025/07/16~2025/07/23',
  },
]

const routeDetail = (id: number) => {
  router.push(`/challenge/detail/${id}`)
}

const test = () => {
  router.push('/challenge/detail')
}
</script>

<style scoped></style>
