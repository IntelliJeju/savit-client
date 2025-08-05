<template>
<div class="min-h-screen">
    <!-- 상단 고정 예산 박스 -->
    <div class="fixed top-16 inset-x-0 z-50 bg-white border-b shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center mx-4">
          <div>
            <div class="text-sm text-app-dark-gray mb-1">이번달 전체 예산</div>
            <div class="text-xl font-bold text-app-dark-gray">{{ formatCurrency(totalBudget) }}</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-app-dark-gray mb-1">남은 예산</div>
            <div class="text-xl font-bold text-app-green">{{ formatCurrency(remainingBudget) }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 메인 컨텐츠 (상단 여백 추가) -->
    <div class="max-w-4xl mx-auto my-4 px-4 pt-24 pb-8">
      <CardComponent class="mb-20">
        <div v-for="(category, index) in categories" :key="index" class="mb-8 last:mb-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <CategoryIcon :category="category.name" :size="24" color="#028174" />
              <span class="font-medium text-app-dark-gray">{{ category.name }}</span>
            </div>
            <p class="text-lg font-bold text-app-dark-gray">{{ category.percentage.toFixed(1) }}%</p>
          </div>
        
          <div class="relative">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              v-model="category.percentage"
              @input="handleSliderChange(index, $event)"
              class="w-full h-2 bg-app-gray rounded-lg appearance-none cursor-pointer range-slider"
              :style="{ 
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${category.percentage}%, #e5e7eb ${category.percentage}%, #e5e7eb 100%)`
              }"
            />
          </div>

          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">지난 달 {{ formatCurrency(category.lastMonthSpent) }}</div>
            <div class="flex items-center">
              <input
                type="text"
                :value="formatCurrency(calculateCategoryAmount(category.percentage))"
                @input="handleAmountInputChange(index, $event)"
                @focus="handleAmountInputFocus($event)"
                @blur="handleAmountInputBlur($event)"
                class="text-lg font-bold text-app-dark-gray text-right bg-transparent w-28 cursor-pointer hover:bg-gray-100 rounded px-2 focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>
        </div>
        <div class="mt-6 p-4 bg-app-light-gray rounded-xl">
          <div class="flex items-center justify-between">
            <span class="text-app-dark-gray">현재 설정량</span>
            <div class="flex items-center gap-2">
              <span :class="percentageClass">{{ totalPercentage.toFixed(1) }}%</span>
              <ButtonItem 
                @click="handleRecommendationClick"
                :disabled="isLoading"
                class="w-[70px] h-8">
                {{ isLoading ? '추천 중...' : '추천' }}
              </ButtonItem>
            </div>
          </div>
        </div>
    </CardComponent>

    <!-- 설정 버튼 -->
    <div class="fixed bottom-16 inset-x-0 p-4 bg-white border-t">
      <div class="max-w-4xl mx-auto">
        <ButtonItem
          @click="handleSaveBudgetClick"
          text="설정"/>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBudgetsStore, DEFAULT_BUDGET_AMOUNTS, CATEGORY_ORDER } from '@/stores/budgets'
import CategoryIcon from '@/components/icon/CategoryIcon.vue'
import type { CategoryData } from '@/stores/budgets'
import { getCurrentMonth } from '@/utils/budgetUtils'
import { formatCurrency } from '@/utils/calculations'
import { 
  calculateAmount, 
  calculatePercentageFromAmount, 
  extractNumericValue, 
  adjustCategoriesProportionally,
  adjustCategoriesForSlider,
  redistributeExcessPercentage,
  createInputHandlers
} from '@/utils/calculations'
import ButtonItem from '@/components/button/ButtonItem.vue'
import CardComponent from '@/components/card/CardComponent.vue'

const RECOMMENDATION_API_DELAY = 1000

const createDefaultCategoryData = (defaultAmounts: Record<string, number>, categoryOrder: string[]) => {
  return categoryOrder.map(category => ({
    name: category,
    percentage: 0,
    lastMonthSpent: defaultAmounts[category] || 0
  }))
}

const calculateDefaultTotalBudget = (defaultAmounts: Record<string, number>): number => {
  return Object.values(defaultAmounts).reduce((sum, amount) => sum + amount, 0)
}


const route = useRoute()
const router = useRouter()
const budgetsStore = useBudgetsStore()
const isLoading = ref(false)

// 입력 핸들러 생성
const { handleFocus: handleAmountInputFocus, handleBlur: handleAmountInputBlur } = createInputHandlers(formatCurrency)

const totalBudget = ref((() => {
  const queryBudget = parseInt(route.query.totalBudget as string)
  return (!isNaN(queryBudget) && queryBudget > 0) 
    ? queryBudget 
    : budgetsStore.currentBudget?.totalBudget || calculateDefaultTotalBudget(DEFAULT_BUDGET_AMOUNTS)
})())

// 저장된 카테고리 데이터 불러오기
const loadSavedCategories = () => {
  const saved = localStorage.getItem('budget-category-settings')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (error) {
      console.error('저장된 카테고리 데이터 파싱 실패:', error)
    }
  }
  return createDefaultCategoryData(DEFAULT_BUDGET_AMOUNTS, CATEGORY_ORDER)
}

// 카테고리 데이터 저장
const saveCategoriesData = (categoriesData: CategoryData[]) => {
  localStorage.setItem('budget-category-settings', JSON.stringify(categoriesData))
}

const categories = ref<CategoryData[]>(loadSavedCategories() as CategoryData[])

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
    adjustCategoriesProportionally({ categories: categories.value, excludeIndex: categoryIndex, excess })
  }
  
  // 변경사항 저장
  saveCategoriesData(categories.value)
}



const handleRecommendationClick = async () => {
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, RECOMMENDATION_API_DELAY))

    // DEFAULT_BUDGET_AMOUNTS 기반으로 비율 계산
    const totalDefaultBudget = calculateDefaultTotalBudget(DEFAULT_BUDGET_AMOUNTS)
    
    // 각 카테고리별 비율 계산
    const defaultRatios = categories.value.map(cat => 
      (DEFAULT_BUDGET_AMOUNTS[cat.name] / totalDefaultBudget) * 100
    )
    
    categories.value.forEach((cat, idx) => cat.percentage = Math.round(defaultRatios[idx] * 10) / 10)
    
    // 추천 값 저장
    saveCategoriesData(categories.value)
    alert('기본 추천 비율로 설정되었습니다!')
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
    adjustCategoriesForSlider(categories.value, changedIndex, difference)
  }
  
  // 100% 초과시 재분배
  const total = categories.value.reduce((sum, cat) => sum + cat.percentage, 0)
  if (total > 100) {
    redistributeExcessPercentage(categories.value, changedIndex, total - 100)
  }
  
  // 변경사항 저장
  saveCategoriesData(categories.value)
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
.range-slider::-webkit-slider-thumb {
  appearance: none;
  height: 1.25rem;
  width: 2rem;
  border-radius: 0.25rem;
  background: white;
  cursor: pointer;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  background-image: 
    linear-gradient(to bottom, transparent 25%, #9ca3af 25%, #9ca3af 75%, transparent 75%),
    linear-gradient(to bottom, transparent 25%, #9ca3af 25%, #9ca3af 75%, transparent 75%);
  background-size: 2px 100%, 2px 100%;
  background-position: 40% center, 60% center;
  background-repeat: no-repeat;
}

.range-slider::-moz-range-thumb {
  height: 1.25rem;
  width: 2rem;
  border-radius: 0.25rem;
  background: white;
  cursor: pointer;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  background-image: 
    linear-gradient(to bottom, transparent 25%, #9ca3af 25%, #9ca3af 75%, transparent 75%),
    linear-gradient(to bottom, transparent 25%, #9ca3af 25%, #9ca3af 75%, transparent 75%);
  background-size: 2px 100%, 2px 100%;
  background-position: 40% center, 60% center;
  background-repeat: no-repeat;
}
</style>