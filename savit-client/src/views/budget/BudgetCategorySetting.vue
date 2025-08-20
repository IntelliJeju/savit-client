<template>
  <Teleport to="#header-content">
    <span>예산 설정</span>
  </Teleport>

  <!-- 상단 고정 예산 박스 -->
  <div class="h-full grid grid-rows-[auto-1fr-auto] gap-4 py-4">
    <card-component class="flex justify-between items-center">
      <div>
        <div class="text-sm text-app-dark-gray mb-1">이번달 전체 예산</div>
        <div class="text-xl font-bold text-app-dark-gray">
          {{ formatCurrency(totalBudget) }}
        </div>
      </div>
      <div class="text-right">
        <div class="text-sm text-app-dark-gray mb-1">남은 예산</div>
        <div class="text-xl font-bold text-app-green">
          {{ formatCurrency(remainingBudget) }}
        </div>
      </div>
    </card-component>

    <!-- 메인 컨텐츠 (상단 여백 추가) -->
    <div class="overflow-y-auto py-2">
      <CardComponent>
        <div class="mb-4 text-app-dark-gray text-sm flex items-center">
          <v-icon name="hi-information-circle" class="w-4 mr-2" />
          <span class="text-xs"
            >첫 설정 시 / 추천 버튼 클릭 시 또래 소비 데이터 기반 추천값이 제공됩니다.
          </span>
        </div>
        <div class="mb-6 p-4 bg-app-light-gray rounded-xl">
          <div class="flex items-center justify-between">
            <span class="text-app-dark-gray">현재 설정량</span>
            <div class="flex items-center gap-2">
              <span :class="percentageClass">{{ totalPercentage.toFixed(1) }}%</span>
              <ButtonItem @click="applyRecommendation" :disabled="isLoading" class="w-[70px] h-8">
                {{ isLoading ? '추천 중...' : '추천' }}
              </ButtonItem>
            </div>
          </div>
        </div>
        <CategorySlider
          v-for="(category, index) in categories"
          :key="index"
          :category="category"
          :index="index"
          :max-percentage="MAX_PERCENTAGE"
          :total-budget="totalBudget"
          @slider-change="handleSliderChange"
          @amount-change="handleAmountInputChange"
          @amount-focus="handleAmountInputFocus"
          @amount-blur="handleAmountInputBlur"
        />
      </CardComponent>
    </div>
    <!-- 설정 버튼 -->
    <div>
      <ButtonItem @click="saveBudget" text="설정" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createInputHandlers, formatCurrency, calculateAmount } from '@/utils/calculations'
import { useBudgetsStore } from '@/stores/budgets'
import { DEFAULT_BUDGET_AMOUNTS, CATEGORY_ID_MAP } from '@/types/budgets'
import { calculateDefaultTotalBudget } from '@/utils/budgetUtils'
import { getCurrentMonth } from '@/utils/dateUtils'
import CardComponent from '@/components/card/CardComponent.vue'
import CategorySlider from '@/components/budget/CategorySlider.vue'
import ButtonItem from '@/components/button/ButtonItem.vue'
import { useBudgetCategories } from '@/composables/budget/useBudgetCategories'

const route = useRoute()
const router = useRouter()
const budgetsStore = useBudgetsStore()
const isLoading = ref(false)

// 초기 예산 계산
const getInitialTotalBudget = (): number => {
  const queryBudget = parseInt(route.query.totalBudget as string)
  return !isNaN(queryBudget) && queryBudget > 0
    ? queryBudget
    : budgetsStore.currentBudget?.totalBudget || calculateDefaultTotalBudget(DEFAULT_BUDGET_AMOUNTS)
}

const totalBudget = ref(getInitialTotalBudget())

// 예산 저장 처리 (단순화)
const saveBudget = async () => {
  if (totalPercentage.value === 0) {
    alert('최소 한 카테고리에 예산을 배분해주세요.')
    return
  }

  if (isLoading.value) return
  isLoading.value = true

  try {
    const budgetRequest = {
      month: getCurrentMonth(),
      mainCategoryBudgets: categories.value.map((cat) => ({
        mainCategory: cat.name,
        budgetAmount: calculateAmount(cat.percentage, totalBudget.value),
      })),
    }

    const result = await budgetsStore.setBudgetForMonth(budgetRequest)

    if (result?.success) {
      alert('카테고리별 예산이 성공적으로 설정되었습니다!')
      setTimeout(() => router.push('/budget'), 100)
    } else {
      alert(result?.message || '예산 설정에 실패했습니다.')
    }
  } catch (error) {
    console.error('예산 설정 오류:', error)
    const message = error instanceof Error ? error.message : '예산 설정 중 오류가 발생했습니다.'
    alert(`${message} 다시 시도해주세요.`)
  } finally {
    isLoading.value = false
  }
}

// 추천 버튼 처리
const applyRecommendation = async () => {
  if (isLoading.value) return

  isLoading.value = true
  try {
    // 각 카테고리별 또래 평균 금액 가져오기
    const peerAvgPromises = categories.value.map(async (category) => {
      const categoryId = CATEGORY_ID_MAP[category.name][0] // 첫 번째 ID 사용
      const peerAvg = await budgetsStore.getPeerAvgByCategoryId(categoryId)
      return { category: category.name, amount: peerAvg }
    })

    const peerAvgResults = await Promise.all(peerAvgPromises)
    
    // 총 또래 평균 금액 계산
    const totalPeerAvg = peerAvgResults.reduce((sum, result) => sum + result.amount, 0)
    
    if (totalPeerAvg > 0) {
      // 또래 평균 기반으로 비율 계산
      categories.value.forEach((category) => {
        const peerData = peerAvgResults.find(result => result.category === category.name)
        if (peerData && peerData.amount > 0) {
          category.percentage = (peerData.amount / totalPeerAvg) * 100
        }
      })
      alert('또래 평균 데이터 기반으로 추천 비율이 설정되었습니다!')
    } else {
      // 또래 데이터가 없으면 기본 추천 비율 사용
      applyRecommendedRatios()
      alert('기본 추천 비율로 설정되었습니다!')
    }
  } catch (error) {
    console.error('추천 실패:', error)
    // 에러 발생 시 기본 추천 비율로 폴백
    applyRecommendedRatios()
    alert('추천 비율을 가져오는 중 오류가 발생하여 기본 추천 비율로 설정되었습니다.')
  } finally {
    isLoading.value = false
  }
}

// 초기화는 App.vue에서 이미 처리됨
onMounted(() => {
  if (!route.query.totalBudget && budgetsStore.currentBudget?.totalBudget) {
    totalBudget.value = budgetsStore.currentBudget.totalBudget
  }
  if (!totalBudget.value) {
    totalBudget.value = calculateDefaultTotalBudget(DEFAULT_BUDGET_AMOUNTS)
  }
})

const {
  categories,
  totalPercentage,
  remainingBudget,
  percentageClass,
  handleAmountInputChange,
  handleSliderChange,
  applyRecommendedRatios,
  MAX_PERCENTAGE,
} = useBudgetCategories(totalBudget)

// Input handlers
const { handleFocus: handleAmountInputFocus, handleBlur: handleAmountInputBlur } =
  createInputHandlers(formatCurrency)
</script>
