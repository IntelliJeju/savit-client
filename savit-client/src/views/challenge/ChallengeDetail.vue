<template>
  <div v-if="!loading && challenge" class="detail-page h-full grid grid-rows-[1fr_auto]">
    <div class="detail-contents overflow-auto flex flex-col gap-4 py-4">
      <div class="detail-info">
        <CardComponent>
          <div class="detail-info-category"><LabelItem>배달</LabelItem></div>
          <div class="detail-info-title mt-4 text-[1.5rem] font-bold">{{ challenge.title }}</div>
          <div class="detail-info-due text-xs text-slate-500 font-medium">
            {{ challenge.startDate }} ~ {{ challenge.endDate }}
          </div>
          <div class="detail-info-grid grid grid-cols-2 grid-rows-2 gap-8 font-medium pt-6">
            <div>
              <div>인원수</div>
              <div class="pt-2">
                <span class="text-slate-500">100 / </span
                ><span class="text-app-green text-xl font-semibold">{{ challenge.joined_count }}명</span>
              </div>
            </div>
            <div>
              <div>기간</div>
              <div class="pt-2 text-app-green text-xl font-semibold">7일</div>
            </div>
            <div>
              <div>총 예치금</div>
              <div class="pt-2 text-app-green text-xl font-semibold">{{ (50000).toLocaleString() }}원</div>
            </div>
            <div>
              <div>나의 예치금</div>
              <div class="pt-2 text-xl font-semibold">{{ (5000).toLocaleString() }}원</div>
            </div>
          </div>
        </CardComponent>
      </div>
      <div class="detail-rule">
        <card-component>
          <div class="detail-rule-title text-[1.5rem] font-bold">챌린지 규칙</div>
          <div class="detail-rule-info flex items-center gap-2 mt-6 font-normal">
            <div class="w-2 h-2 bg-app-green rounded-full" />
            7일동안 배달음식을 10회 이하로 주문해야 합니다
          </div>
          <div class="detail-rule-info flex items-center gap-2 mt-6 font-normal">
            <div class="w-2 h-2 bg-app-green rounded-full" />
            배달 앱 주문 내역으로 자동 인증됩니다
          </div>
          <div class="detail-rule-info flex items-center gap-2 mt-6 font-normal">
            <div class="w-2 h-2 bg-app-green rounded-full" />
            11회 이상 주문시 실패로 처리됩니다
          </div>
        </card-component>
      </div>
    </div>
    <div class="detail-button py-4">
      <ButtonItem text="챌린지 참여하기" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ButtonItem from '@/components/button/ButtonItem.vue'
import CardComponent from '@/components/card/CardComponent.vue'
import LabelItem from '@/components/label/LabelItem.vue'
import { useChallengeStore } from '@/stores/challenges.ts'
import type { Challenge } from '@/types/challenges.js'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const id = route.params.id as string
const challengeStore = useChallengeStore()

const { getAvailChallengeDetail, getChallengeById } = challengeStore
const { loading } = storeToRefs(challengeStore)
const challenge = ref<Challenge>()

onMounted(async () => {
  await getAvailChallengeDetail(id)
  challenge.value = getChallengeById(id)
})
</script>

<style scoped></style>
