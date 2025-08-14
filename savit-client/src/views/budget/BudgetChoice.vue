<template>
  <Teleport to="#header-content">
    <span>예산 설정</span>
  </Teleport>

  <div class="max-w-4xl mx-auto px-4">
    <div class="flex-1"></div>

    <h1 class="font-bold text-xl text-center mt-20 mb-10 text-app-dark-gray">
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
        <ButtonItem
          text="카테고리별 예산 설정"
          @click="handleCategoryBudgetSetting"
          :disabled="!isTotalBudgetSet"
          :class="{ 'opacity-50 cursor-not-allowed': !isTotalBudgetSet }"
        />
        <div class="mt-4 text-app-dark-gray text-sm flex items-center">
          <v-icon name="hi-information-circle" class="w-6 mr-2" />
          <span>식비, 교통, 문화, 생활, 기타 카테고리 예산을 각각 설정합니다</span>
        </div>
        <div v-if="!isTotalBudgetSet" class="mt-4 text-app-dark-gray text-sm flex items-center">
          <v-icon name="hi-information-circle" class="w-6 mr-2" />
          <span class="text-app-red"
            >전체 예산을 먼저 설정해야 카테고리별 예산을 설정할 수 있습니다</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBudgetsStore } from '@/stores/budgets'
import ButtonItem from '@/components/button/ButtonItem.vue'

const router = useRouter()
const budgetsStore = useBudgetsStore()

const isTotalBudgetSet = computed(() => {
  return budgetsStore.currentBudget?.totalBudget && budgetsStore.currentBudget.totalBudget > 0
})

const handleBudgetSetting = () => {
  router.push('/budget/all')
}

const handleCategoryBudgetSetting = () => {
  if (!isTotalBudgetSet.value) {
    alert('먼저 전체 예산을 설정해주세요.')
    return
  }
  router.push('/budget/categories/list')
}

// App.vue에서 이미 예산 초기화가 완료되므로 onMounted 불필요
</script>

<style scoped></style>
