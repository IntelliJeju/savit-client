<template>
  <div class="detail-page h-full grid grid-rows-[1fr_auto]">
    <div class="detail-contents overflow-auto flex flex-col gap-4 p-4">
      <div class="detail-info">
        <CardComponent>
          <div class="detail-info-category"><LabelItem>배달</LabelItem></div>
          <div class="detail-info-title mt-4 text-[1.5rem] font-bold">배달음식 10회 이하 주문</div>
          <div class="detail-info-due text-[0.75rem] text-[#888888] font-bold">
            2025/07/16~2025/07/23
          </div>
          <div class="detail-info-grid grid grid-cols-2 grid-rows-2 gap-8 font-bold pt-6">
            <div>
              <div>인원수</div>
              <div class="pt-2">
                <span class="text-[#888888]">100 / </span
                ><span class="text-app-green text-[1.5rem]">80명</span>
              </div>
            </div>
            <div>
              <div>기간</div>
              <div class="pt-2 text-app-green text-[1.5rem]">7일</div>
            </div>
            <div>
              <div>총 예치금</div>
              <div class="pt-2 text-app-green text-[1.5rem]">{{ (50000).toLocaleString() }}원</div>
            </div>
            <div>
              <div>나의 예치금</div>
              <div class="pt-2 text-[1.5rem]">{{ (5000).toLocaleString() }}원</div>
            </div>
          </div>
        </CardComponent>
      </div>
      <div class="detail-rule">
        <card-component>
          <div class="detail-rule-title text-[1.5rem] font-bold">챌린지 규칙</div>
          <div class="detail-rule-info flex items-center gap-2 mt-6 font-bold">
            <div class="w-2 h-2 bg-app-green rounded-full" />
            7일동안 배달음식을 10회 이하로 주문해야 합니다
          </div>
          <div class="detail-rule-info flex items-center gap-2 mt-6 font-bold">
            <div class="w-2 h-2 bg-app-green rounded-full" />
            배달 앱 주문 내역으로 자동 인증됩니다
          </div>
          <div class="detail-rule-info flex items-center gap-2 mt-6 font-bold">
            <div class="w-2 h-2 bg-app-green rounded-full" />
            11회 이상 주문시 실패로 처리됩니다
          </div>
        </card-component>
      </div>
    </div>
    <div class="detail-button p-4">
      <ButtonItem text="챌린지 참여하기" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ButtonItem from '@/components/button/ButtonItem.vue'
import CardComponent from '@/components/card/CardComponent.vue'
import LabelItem from '@/components/label/LabelItem.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const id = route.params.id
</script>

<style scoped></style>
