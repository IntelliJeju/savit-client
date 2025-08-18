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
      <BudgetOptionCard
        title="전체 예산 설정"
        description="한 달 동안 사용할 전체 예산액을 설정합니다"
        @click="handleBudgetSetting"
      />

      <BudgetOptionCard
        title="카테고리별 예산 설정"
        description="식비, 교통, 문화, 생활, 기타 카테고리 예산을 각각 설정합니다"
        :disabled="!isTotalBudgetSet"
        :warningText="
          !isTotalBudgetSet
            ? '전체 예산을 먼저 설정해야 카테고리별 예산을 설정할 수 있습니다'
            : undefined
        "
        @click="handleCategoryBudgetSetting"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBudget } from '@/composables/budget/useBudget'
import BudgetOptionCard from '@/components/budget/BudgetOptionCard.vue'

const router = useRouter()
const { isTotalBudgetSet } = useBudget()

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

// 초기화는 App.vue에서 이미 처리됨
</script>
