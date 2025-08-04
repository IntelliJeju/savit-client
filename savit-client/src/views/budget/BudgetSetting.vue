<template>
  <div class="max-w-4xl mx-auto min-h-screen px-4 bg-gray-50">
    <div class="py-5"></div>
    
    <div class="bg-white rounded-xl shadow-sm p-6 mb-4">
      <p class="font-bold text-lg mb-4">이번 달 예산 금액</p>
      <div class="relative flex items-center">
        <InputField
          v-model="displayAmount"
          placeholder="설정할 예산액을 입력해주세요."
          type="text"
          class="text-3xl font-bold text-right pr-12"
          @input="handleAmountInput"/>
        <span class="absolute right-2 text-3xl font-bold text-app-dark-gray">원</span>
      </div>
    </div>
    
    <div class="bg-white rounded-xl shadow-sm p-6 mb-20">
      <p class="font-bold text-lg mb-6">나의 지출 / 예산 이력</p>
      
      <div class="flex justify-between items-center mb-4">
        <span class="text-lg font-medium">{{ lastMonth.name }}</span>
        <div class="text-right">
          <span :class="lastMonth.spending > lastMonth.budget ? 'text-app-red' : 'text-app-blue'" class="font-bold">
            {{ formatCurrency(lastMonth.spending) }}
          </span>
          <span class="text-app-dark-gray"> / {{ formatCurrency(lastMonth.budget) }}원</span>
        </div>
      </div>
      
      <div class="flex justify-between items-center mb-6">
        <span class="text-lg font-medium">{{ twoMonthsAgo.name }}</span>
        <div class="text-right">
          <span :class="twoMonthsAgo.spending > twoMonthsAgo.budget ? 'text-app-red' : 'text-app-blue'" class="font-bold">
            {{ formatCurrency(twoMonthsAgo.spending) }}
          </span>
          <span class="text-app-dark-gray"> / {{ formatCurrency(twoMonthsAgo.budget) }}원</span>
        </div>
      </div>
      
      <div class="flex items-center text-app-dark-gray text-sm">
        <v-icon name="hi-information-circle" class="w-6 mr-2" /> 
        <span>지난 지출/예산 내역을 참고해서 설정해보세요</span>
      </div>
    </div>
    
    <div class="fixed bottom-16 left-0 right-0 p-4 bg-white border-t">
      <div class="max-w-4xl mx-auto">
        <ButtonItem 
          @click="saveBudget"
          text="설정"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import InputField from '@/components/input/InputField.vue'
import { useBudgetsStore } from '@/stores/budgets'
import { useRouter } from 'vue-router'
import ButtonItem from '@/components/button/ButtonItem.vue'

const budgetsStore = useBudgetsStore()
const isLoading = ref(false)
const router = useRouter()

// 기존 예산이 있으면 그 값을 기본으로 설정
const getExistingBudget = (): string => {
  if (budgetsStore.currentBudget?.totalBudget) {
    return budgetsStore.currentBudget.totalBudget.toString()
  }
  return ''
}

const budgetAmount = ref(getExistingBudget())

// 숫자 포맷팅
const formatNumber = (value: string): string => {
  if (!value) return ''
  const numericValue = value.replace(/[^\d]/g, '')
  if (!numericValue) return ''
  return parseInt(numericValue).toLocaleString('ko-KR')
}

// 표시용 값 (쉼표 포함)
const displayAmount = computed({
  get: () => formatNumber(budgetAmount.value),
  set: (value: string) => {
    // 숫자만 추출해서 저장
    budgetAmount.value = value.replace(/[^\d]/g, '')
  }
})

// 입력 처리 함수
const handleAmountInput = (value: string) => {
  const numericValue = value.replace(/[^\d]/g, '')
  budgetAmount.value = numericValue
}

const lastMonthData = budgetsStore.getPreviousMonthsSummary(1)
const twoMonthsAgoData = budgetsStore.getPreviousMonthsSummary(2)

const lastMonth = ref({
  name: lastMonthData.monthName,
  spending: lastMonthData.totalSpent,
  budget: lastMonthData.totalBudget
})

const twoMonthsAgo = ref({
  name: twoMonthsAgoData.monthName,
  spending: twoMonthsAgoData.totalSpent,
  budget: twoMonthsAgoData.totalBudget
})

// 통화 포맷팅 함수
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('ko-KR')
}

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
    const currentDate = new Date()
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    const result = await budgetsStore.setTotalBudget(currentMonth, amount)
    
    if (result && result.success) {
      alert(`${formatCurrency(amount)}원으로 예산이 설정되었습니다!\n카테고리별 세부 설정을 진행합니다.`)
      router.push({ 
        path: '/budget/categorysetting', 
        query: { totalBudget: amount, month: currentMonth } 
      })
    } else {
      alert(result?.message || '예산 설정에 실패했습니다.')
    }
  } catch (error) {
    alert(`예산 설정 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  try {
    await budgetsStore.initializeCurrentMonthBudget()
    if (budgetsStore.currentBudget?.totalBudget && !budgetAmount.value) {
      budgetAmount.value = budgetsStore.currentBudget.totalBudget.toString()
    }
  } catch (error) {
    console.error('예산 데이터 로드 실패:', error)
  }
})
</script>

<style scoped>

</style>