<template>
  <div class="challenge-current-page">
    <div class="current-header py-4">
      <div class="title text-xl font-bold">배달음식 10회 이하 주문</div>
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
      class="current-board relative flex justify-between text-white bg-gradient-to-tr from-[#1DD1A1] to-[#10B981] px-4 py-6 mx-[-1rem] overflow-hidden"
    >
      <div>
        <div>총 적립금</div>
        <div class="mt-4 font-bold">
          <span class="text-3xl">{{ (100000).toLocaleString() }}</span
          ><span class="text-xl"> 원</span>
        </div>
        <div class="mt-3 text-sm">2025 07 15 ~ 2025 07 22</div>
      </div>
      <div class="flex flex-col justify-between items-end">
        <div class="flex flex-col items-end">
          <span class="text-sm">나의 예치금</span>
          <div
            class="bg-[#F0FDF932] px-2 rounded-lg mt-1 border border-[#86EFAC32] font-medium text-sm"
          >
            {{ (5000).toLocaleString() }}원
          </div>
        </div>
        <div class="flex flex-col items-end">
          <span class="text-sm">예상 보상</span>
          <div
            class="bg-[#F0FDF932] px-2 rounded-lg mt-1 border border-[#86EFAC32] font-medium text-sm"
          >
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
            <span class="text-slate-400">전체</span>
            <div class="text-slate-600 bg-slate-100 rounded-lg px-2">5명</div>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-slate-400">참여중</span>
            <div class="text-green-600 bg-green-50 rounded-lg px-2">3명</div>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-slate-400">탈락</span>
            <div class="text-app-red bg-red-50 rounded-lg px-2">2명</div>
          </div>
        </div>
      </div>
      <div class="participants-container mt-4">
        <div class="participant flex gap-4 py-4 border-b">
          <div class="profile-imgae"><div class="w-12 h-12 bg-black rounded-full"></div></div>
          <div class="progress flex-1">
            <div class="flex justify-between">
              <span class="font-medium">나</span><span>33%</span>
            </div>
            <div><progress-bar :min-value="0" :max-value="100" :value="33"></progress-bar></div>
            <span class="text-slate-400">3 / 10 회</span>
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
