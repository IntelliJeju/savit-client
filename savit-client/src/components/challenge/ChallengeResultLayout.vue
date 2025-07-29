<template>
  <div
    class="result-page relative h-full ml-[-1rem] mr-[-1rem] px-6 text-white overflow-hidden pb-6"
    :class="backgroundClass"
  >
    <div class="result-header relative flex py-4 items-center">
      <button class="text-white absolute" @click="router.go(-1)">
        <v-icon name="hi-chevron-left" scale="1.5"></v-icon></button
      >,
      <span class="title flex-1 text-[1.5rem] font-bold text-white text-center">
        {{ titleText }}
      </span>
    </div>

    <slot></slot>

    <!-- 장식 원형 요소들 -->
    <div
      class="absolute w-[300px] h-[300px] bg-[#ffffff16] rounded-full right-[-18%] top-[-10%]"
    ></div>
    <div
      class="absolute w-[100px] h-[100px] bg-[#ffffff16] rounded-full left-[-8%] top-[30%]"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import router from '@/router/index.ts'

interface Props {
  resultType: 'success' | 'fail'
}

const props = defineProps<Props>()

const backgroundClass = computed(() => {
  return props.resultType === 'success'
    ? 'bg-gradient-to-tr from-[#0AB68B] to-[#65D6B9]'
    : 'bg-gradient-to-tr from-[#6C5CE7] to-[#968BED]'
})

const titleText = computed(() => {
  return props.resultType === 'success' ? '챌린지 성공 !!' : '챌린지 실패..'
})
</script>

<style scoped></style>
