<template>
  <div class="max-w-4xl mx-auto min-h-screen px-4">
    <div class="flex-1"></div>
    
    <h1 class="font-bold text-xl text-center mt-40 mb-10 text-app-dark-gray">
      어떤 예산을 설정하시겠어요?
    </h1>
    
    <div class="space-y-6">
      <div class="p-6">
        <ButtonItem text="전체 예산 설정" @click="handleBudgetSetting" />
        <div class="mt-4 text-app-dark-gray text-sm flex items-center">
          <v-icon name="hi-information-circle" class="w-6 mr-2" /> 
          한 달 동안 사용할 전체 예산액을 설정합니다
        </div>
      </div>
      
      <div class="p-6">
        <ButtonItem text="카테고리별 예산 설정" @click="handleCategoryBudgetSetting" />
        <div class="mt-4 text-app-dark-gray text-sm flex items-center">
          <v-icon name="hi-information-circle" class="w-6 mr-2" /> 
          식비, 교통, 문화, 생활, 기타 카테고리 예산을 각각 설정합니다
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import ButtonItem from '@/components/button/ButtonItem.vue'

const router = useRouter()

const handleBudgetSetting = () => {
  router.push('/budget/setting')
}

const handleCategoryBudgetSetting = () => {
  router.push('/budget/categorysetting')
}
</script>

<style scoped>

</style>