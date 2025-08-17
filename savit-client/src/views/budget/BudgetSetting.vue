<template>
  <Teleport to="#header-content">
    <span>예산 설정</span>
  </Teleport>

  <BudgetLayout :loading="isLoading" button-text="설정" @button-click="saveBudget">
    <div class="py-5"></div>

    <BudgetAmountCard
      v-model="inputBudgetAmount"
      title="이번 달 예산 금액"
      placeholder="설정할 예산액을 입력해주세요."
    />

    <div class="m-5" />

    <BudgetHistoryCard :last-month="lastMonth" :two-months-ago="twoMonthsAgo" />
  </BudgetLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBudget } from '@/composables/budget/useBudget'
import { getCurrentMonth } from '@/utils/dateUtils'
import { formatCurrency } from '@/utils/calculations'
import BudgetLayout from '@/components/budget/BudgetLayout.vue'
import BudgetAmountCard from '@/components/budget/BudgetAmountCard.vue'
import BudgetHistoryCard from '@/components/budget/BudgetHistoryCard.vue'

const router = useRouter()
const { budgetsStore, initializeBudget } = useBudget()

// 이전 월 데이터 인터페이스
interface MonthData {
  name: string
  spending: number
  budget: number
}

// 이전 월 데이터 관리
const lastMonth = ref<MonthData>({
  name: '',
  spending: 0,
  budget: 0,
})

const twoMonthsAgo = ref<MonthData>({
  name: '',
  spending: 0,
  budget: 0,
})

const loadPreviousData = async () => {
  try {
    const [lastMonthData, twoMonthsAgoData] = await Promise.all([
      budgetsStore.getPreviousMonthsSummary(1),
      budgetsStore.getPreviousMonthsSummary(2),
    ])

    lastMonth.value = {
      name: lastMonthData.monthName,
      spending: lastMonthData.totalSpent,
      budget: lastMonthData.totalBudget,
    }

    twoMonthsAgo.value = {
      name: twoMonthsAgoData.monthName,
      spending: twoMonthsAgoData.totalSpent,
      budget: twoMonthsAgoData.totalBudget,
    }
  } catch (error) {
    console.error('Failed to load previous data:', error)
    throw error
  }
}

const isLoading = ref(false)

// Reactive 예산 금액 (store와 자동 동기화)
const budgetAmount = computed({
  get: () => budgetsStore.currentBudget?.totalBudget?.toString() || '',
  set: (value: string) => {
    // 필요시 별도 ref로 관리 가능
  },
})

// 입력용 별도 ref
const inputBudgetAmount = ref('')

// 예산 저장 함수 (store 검증 사용)
const saveBudget = async () => {
  const amount = parseInt(inputBudgetAmount.value || budgetAmount.value)
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
    // budgetAmount는 이제 computed로 자동 동기화됨
    inputBudgetAmount.value = budgetAmount.value
  } catch (error) {
    console.error('데이터 로드 실패:', error)
  }
})
</script>

<style scoped></style>
