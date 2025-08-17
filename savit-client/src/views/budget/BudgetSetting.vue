<template>
  <Teleport to="#header-content">
    <span>예산 설정</span>
  </Teleport>

  <BudgetLayout :loading="isLoading" button-text="설정" @button-click="saveBudget">
    <div class="py-5"></div>

    <BudgetAmountCard
      v-model="budgetAmount"
      title="이번 달 예산 금액"
      placeholder="설정할 예산액을 입력해주세요."
    />

    <div class="m-5" />

    <BudgetHistoryCard :last-month="lastMonth" :two-months-ago="twoMonthsAgo" />
  </BudgetLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBudgetCommon } from '@/composables/budget/useBudgetCommon'
import { usePreviousMonthsData } from '@/composables/budget/usePreviousMonthsData'
import { getCurrentMonth } from '@/utils/budgetUtils'
import { formatCurrency } from '@/utils/calculations'
import BudgetLayout from '@/components/budget/BudgetLayout.vue'
import BudgetAmountCard from '@/components/budget/BudgetAmountCard.vue'
import BudgetHistoryCard from '@/components/budget/BudgetHistoryCard.vue'

const router = useRouter()
const { budgetsStore, initializeBudget } = useBudgetCommon()
const { lastMonth, twoMonthsAgo, loadPreviousData } = usePreviousMonthsData()

const isLoading = ref(false)

// 기존 예산이 있으면 그 값을 기본으로 설정
const getExistingBudget = (): string => {
  if (budgetsStore.currentBudget?.totalBudget) {
    return budgetsStore.currentBudget.totalBudget.toString()
  }
  return ''
}

const budgetAmount = ref(getExistingBudget())

// 예산 저장 함수
const saveBudget = async () => {
  if (!budgetAmount.value) {
    alert('예산 금액을 입력해주세요.')
    return
  }

  const amount = parseInt(budgetAmount.value)

  if (isNaN(amount) || amount <= 0) {
    alert('올바른 금액을 입력해주세요.')
    return
  }

  isLoading.value = true

  try {
    const currentMonth = getCurrentMonth()
    const result = await budgetsStore.setTotalBudget(currentMonth, amount)

    if (result && result.success) {
      alert(
        `${formatCurrency(amount)}으로 예산이 설정되었습니다!\n카테고리별 세부 설정을 진행합니다.`,
      )
      router.push({
        path: '/budget/categories/list',
        query: { totalBudget: amount, month: currentMonth },
      })
    } else {
      alert(result?.message || '예산 설정에 실패했습니다.')
    }
  } catch (error) {
    alert(
      `예산 설정 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
    )
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  try {
    await Promise.all([initializeBudget(), loadPreviousData()])

    if (budgetsStore.currentBudget?.totalBudget && !budgetAmount.value) {
      budgetAmount.value = budgetsStore.currentBudget.totalBudget.toString()
    }
  } catch (error) {
    console.error('데이터 로드 실패:', error)
  }
})
</script>

<style scoped></style>
