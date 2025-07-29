<template>
  <div class="challenge-current-page">
    <div class="current-header py-4">
      <div class="title text-[1.5rem] font-bold">배달음식 10회 이하 주문</div>
      <div class="flex gap-2 pt-2">
        <div
          class="flex-1 text-center text-[0.75rem] text-app-red bg-[#FEF2F2] border border-[#FECACA] rounded-lg py-1"
        >
          6일 7시간 20분 남음
        </div>
        <div
          class="flex-1 text-center text-[0.75rem] text-[#1DD1A1] bg-[#F0FDF9] border border-[#86EFAC] rounded-lg py-1"
        >
          참여중 3 / 5명
        </div>
      </div>
    </div>
    <div
      class="current-board relative flex justify-between text-white bg-gradient-to-tr from-[#1DD1A1] to-[#10B981] p-4 mx-[-1rem]"
    >
      <div>
        <div>총 적립금</div>
        <div class="mt-[1.25rem] font-bold">
          <span class="text-[3rem]">{{ (100000).toLocaleString() }}</span
          ><span class="text-[2rem]"> 원</span>
        </div>
        <div class="mt-[1rem]">2025 07 15 ~ 2025 07 22</div>
      </div>
      <div class="flex flex-col justify-between items-end">
        <div class="flex flex-col items-end">
          <span>나의 예치금</span>
          <div class="bg-[#F0FDF932] px-2 rounded-lg mt-1 border border-[#86EFAC32] font-bold">
            {{ (5000).toLocaleString() }}원
          </div>
        </div>
        <div class="flex flex-col items-end">
          <span>예상 보상</span>
          <div class="bg-[#F0FDF932] px-2 rounded-lg mt-1 border border-[#86EFAC32] font-bold">
            {{ (33333).toLocaleString() }}원
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
            <span class="text-[#A7A9AC]">전체</span>
            <div class="text-[#888888] bg-[#EFEFF0] rounded-lg px-2">5명</div>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-[#A7A9AC]">참여중</span>
            <div class="text-[#1DD1A1] bg-[#F0FDF9] rounded-lg px-2">3명</div>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-[#A7A9AC]">탈락</span>
            <div class="text-app-red bg-[#FECACA] rounded-lg px-2">2명</div>
          </div>
        </div>
      </div>
      <div class="participants-container mt-4">
        <div class="participant flex gap-4 py-4 border-b">
          <div class="profile-imgae"><div class="w-12 h-12 bg-black rounded-full"></div></div>
          <div class="progress flex-1">
            <div class="flex justify-between">
              <span class="font-bold">나</span><span>33%</span>
            </div>
            <div><progress-bar :min-value="0" :max-value="100" :value="33"></progress-bar></div>
            <span class="text-[#A7A9AC]">3 / 10 회</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProgressBar from '@/components/progressBar/ProgressBar.vue'
</script>

<style scoped></style>
