<template>
  <div class="max-w-4xl mx-auto min-h-screen px-4 bg-gray-50">
    <div class="py-5"></div>
    <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <div class="text-center">
          <div class="text-sm text-app-dark-gray mb-1">이번달 전체 예산</div>
          <div class="text-2xl font-bold text-app-dark-gray">{{ formatCurrency(totalBudget) }}원</div>
        </div>
        <div class="text-center">
          <div class="text-sm text-app-dark-gray mb-1">남은 예산</div>
          <div class="text-2xl font-bold text-app-green">{{ formatCurrency(remainingBudget) }}원</div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div v-for="(category, index) in categories" :key="index" class="mb-6 last:mb-0">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <CategoryIcon :category="category.name" :size="24" color="#028174" />
            <span class="font-medium text-app-dark-gray">{{ category.name }}</span>
          </div>
          <span class="text-lg font-bold text-app-dark-gray">{{ category.percentage }}%</span>
        </div>
        
        <div class="relative">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            v-model="category.percentage"
            @input="handleSliderChange(index, $event)"
            class="w-full h-2 bg-app-gray rounded-lg appearance-none cursor-pointer slider"
            :style="{ 
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${category.percentage}%, #e5e7eb ${category.percentage}%, #e5e7eb 100%)`
            }"
          />
        </div>
      </div>
      
      <div class="mt-6 p-4 bg-app-light-gray rounded-xl">
        <div class="flex items-center justify-between">
          <span class="text-app-dark-gray">현재 설정량</span>
          <div class="flex items-center gap-2">
            <span :class="percentageClass">{{ totalPercentage }}%</span>
            <ButtonItem 
              @click="handleRecommendationClick"
              :disabled="isLoading"
              class="w-20 h-8">
              {{ isLoading ? '추천 중...' : '추천' }}
            </ButtonItem>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm p-6 mb-20">
      <div v-for="(category, index) in categories" :key="index" class="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
        <div class="flex items-center gap-3">
          <CategoryIcon :category="category.name" :size="24" color="#028174" />
          <div>
            <div class="font-medium text-app-dark-gray">{{ category.name }}</div>
            <div class="text-sm text-gray-500">지난 달 {{ formatCurrency(category.lastMonthSpent) }}원</div>
          </div>
        </div>
        <div class="text-right">
          <input
            type="text"
            :value="formatCurrency(calculateCategoryAmount(category.percentage))"
            @input="handleAmountInputChange(index, $event)"
            @focus="handleAmountInputFocus($event)"
            @blur="handleAmountInputBlur($event)"
            class="text-lg font-bold text-app-dark-gray text-right bg-transparent border-none outline-none w-24 cursor-pointer hover:bg-gray-100 rounded px-2 py-1"
            placeholder="0"
          />
          <span class="text-lg font-bold text-app-dark-gray">원</span>
        </div>
      </div>
    </div>

    <!-- 설정 버튼 -->
    <div class="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
      <div class="max-w-4xl mx-auto">
        <ButtonItem
          @click="handleSaveBudgetClick"
          text="설정"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBudgetsStore } from '@/stores/budgets'
import CategoryIcon from '@/components/icon/CategoryIcon.vue'
import { DEFAULT_CATEGORIES, RECOMMENDATION_PATTERNS, RECOMMENDATION_VARIATION_RANGE, RECOMMENDATION_API_DELAY, DEFAULT_TOTAL_BUDGET } from '@/constants/budget'
import type { CategoryData } from '@/types/budget'
import { formatCurrency, calculateAmount, calculatePercentageFromAmount, extractNumericValue, extractNumericString, normalizeRatiosToHundredPercent, roundAndAdjustRatios, getCurrentMonth } from '@/utils/budgetCalculations'
import ButtonItem from '@/components/button/ButtonItem.vue'

const route = useRoute()
const router = useRouter()
const budgetsStore = useBudgetsStore()
const isLoading = ref(false)

const totalBudget = ref((() => {
  const queryBudget = parseInt(route.query.totalBudget as string)
  return (!isNaN(queryBudget) && queryBudget > 0) 
    ? queryBudget 
    : budgetsStore.currentBudget?.totalBudget || DEFAULT_TOTAL_BUDGET
})())

const categories = ref<CategoryData[]>([...DEFAULT_CATEGORIES])

const totalPercentage = computed(() => 
  Math.round(categories.value.reduce((sum, cat) => sum + cat.percentage, 0) * 10) / 10
)

const remainingBudget = computed(() => 
  totalBudget.value - categories.value.reduce((sum, cat) => 
    sum + calculateAmount(cat.percentage, totalBudget.value), 0
  )
)

const percentageClass = computed(() => [
  'text-lg font-bold',
  totalPercentage.value === 100 ? 'text-app-green' : 'text-app-red'
])

const calculateCategoryAmount = (percentage: number): number => 
  calculateAmount(percentage, totalBudget.value)

const handleAmountInputChange = (categoryIndex: number, event: Event) => {
  const inputAmount = extractNumericValue(event)
  if (totalBudget.value === 0) return
  
  const newPercentage = calculatePercentageFromAmount(inputAmount, totalBudget.value)
  categories.value[categoryIndex].percentage = newPercentage
  
  // 100% 초과시 다른 카테고리 조정
  const otherTotal = categories.value.reduce((sum, cat, idx) => 
    idx === categoryIndex ? sum : sum + cat.percentage, 0
  )
  
  if (newPercentage + otherTotal > 100) {
    const excess = newPercentage + otherTotal - 100
    adjustOtherCategories(categoryIndex, excess)
  }
}

// 다른 카테고리 비율 조정
const adjustOtherCategories = (excludeIndex: number, excess: number) => {
  const others = categories.value.filter((_, idx) => idx !== excludeIndex)
  const totalOther = others.reduce((sum, cat) => sum + cat.percentage, 0)
  
  if (totalOther === 0) return
  
  categories.value.forEach((cat, idx) => {
    if (idx !== excludeIndex) {
      const ratio = cat.percentage / totalOther
      cat.percentage = Math.max(0, cat.percentage - excess * ratio)
    }
  })
}

const handleAmountInputFocus = (event: Event) => {
  const target = event.target as HTMLInputElement
  target.value = extractNumericString(target.value)
  target.select()
}

const handleAmountInputBlur = (event: Event) => {
  const target = event.target as HTMLInputElement
  const amount = parseInt(extractNumericString(target.value)) || 0
  target.value = formatCurrency(amount)
}

const handleRecommendationClick = async () => {
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, RECOMMENDATION_API_DELAY))

    // 현재는 랜덤 비율로 추천
    const pattern = [...RECOMMENDATION_PATTERNS[Math.floor(Math.random() * RECOMMENDATION_PATTERNS.length)]]
    const withVariation = pattern.map(ratio => 
      Math.max(0, ratio + (Math.random() - 0.5) * RECOMMENDATION_VARIATION_RANGE)
    )
    const ratios = roundAndAdjustRatios(normalizeRatiosToHundredPercent(withVariation))
    
    categories.value.forEach((cat, idx) => cat.percentage = ratios[idx])
    alert('사회초년생 평균 소비량에 기반한 추천 비율로 설정되었습니다!')
  } catch (error) {
    console.error('추천 실패:', error)
    alert('추천 비율을 가져오는 중 오류가 발생했습니다.')
  } finally {
    isLoading.value = false
  }
}

const handleSliderChange = (changedIndex: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const newValue = parseInt(target.value)
  const difference = newValue - categories.value[changedIndex].percentage
  
  categories.value[changedIndex].percentage = newValue
  
  if (difference !== 0) {
    adjustSliderOthers(changedIndex, difference)
  }
  
  // 100% 초과시 재분배
  const total = categories.value.reduce((sum, cat) => sum + cat.percentage, 0)
  if (total > 100) {
    redistributeSliderExcess(changedIndex, total - 100)
  }
}

// 슬라이더 조정시 다른 카테고리 처리
const adjustSliderOthers = (excludeIndex: number, difference: number) => {
  const others = categories.value.filter((_, idx) => idx !== excludeIndex)
  const totalOther = others.reduce((sum, cat) => sum + cat.percentage, 0)
  
  if (totalOther === 0) return
  
  const operation = difference > 0 ? 'decrease' : 'increase'
  const amount = Math.abs(difference)
  
  categories.value.forEach((cat, idx) => {
    if (idx === excludeIndex) return
    
    const ratio = cat.percentage / totalOther
    const adjustment = Math.round(amount * ratio / 5) * 5
    
    if (operation === 'decrease') {
      cat.percentage = Math.max(0, cat.percentage - adjustment)
    } else {
      cat.percentage = Math.min(100, cat.percentage + adjustment)
    }
  })
}

// 초과 퍼센테지 재분배
const redistributeSliderExcess = (excludeIndex: number, excess: number) => {
  let remaining = excess
  
  for (let i = 0; i < categories.value.length && remaining > 0; i++) {
    if (i === excludeIndex) continue
    
    const cat = categories.value[i]
    const decrease = Math.min(cat.percentage, Math.ceil(remaining / 5) * 5)
    
    if (decrease > 0) {
      cat.percentage = Math.max(0, cat.percentage - decrease)
      remaining -= decrease
    }
  }
  
  if (remaining > 0) {
    categories.value[excludeIndex].percentage = Math.max(0, 
      categories.value[excludeIndex].percentage - remaining
    )
  }
}

const handleSaveBudgetClick = async () => {
  if (totalPercentage.value === 0) {
    alert('최소 한 카테고리에 예산을 배분해주세요.')
    return
  }

  isLoading.value = true

  try {
    const budgetRequest = {
      month: getCurrentMonth(),
      mainCategoryBudgets: categories.value.map(cat => ({
        mainCategory: cat.name,
        budgetAmount: calculateCategoryAmount(cat.percentage)
      }))
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
    alert('예산 설정 중 오류가 발생했습니다.')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  try {
    await budgetsStore.initializeCurrentMonthBudget()
    if (!route.query.totalBudget && budgetsStore.currentBudget?.totalBudget) {
      totalBudget.value = budgetsStore.currentBudget.totalBudget
    }
  } catch (error) {
    console.error('예산 데이터 로드 실패:', error)
  }
})
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 32px;
  border-radius: 4px;
  background: white;
  background-image: 
    linear-gradient(to bottom, transparent 25%, #9ca3af 25%, #9ca3af 75%, transparent 75%),
    linear-gradient(to bottom, transparent 25%, #9ca3af 25%, #9ca3af 75%, transparent 75%);
  background-size: 2px 100%, 2px 100%;
  background-position: 40% center, 60% center;
  background-repeat: no-repeat;
  cursor: pointer;
  border: 1px solid #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 32px;
  border-radius: 4px;
  background: white;
  background-image: 
    linear-gradient(to bottom, transparent 25%, #9ca3af 25%, #9ca3af 75%, transparent 75%),
    linear-gradient(to bottom, transparent 25%, #9ca3af 25%, #9ca3af 75%, transparent 75%);
  background-size: 2px 100%, 2px 100%;
  background-position: 40% center, 60% center;
  background-repeat: no-repeat;
  cursor: pointer;
  border: 1px solid #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>