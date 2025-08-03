<template>
  <div class="max-w-4xl mx-auto bg-gray-100 min-h-screen font-sans px-4">
    <div class="py-5"></div>

    <div v-if="isLoading" class="text-center py-10 text-gray-600">
      <p>예산 정보를 불러오는 중...</p>
    </div>

    <div v-else-if="!budgetSummary" class="text-center py-10 text-gray-600">
      <p>설정된 예산이 없습니다.</p>
      <button @click="loadTestData" class="bg-app-blue text-white px-4 py-2 rounded-lg text-sm">
        테스트 데이터 로드
      </button>
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm p-4">
      <div 
        v-for="mainCategory in mainCategories" 
        :key="mainCategory.mainCategory"
        class="mb-2 p-3 transition-all duration-200 relative rounded-lg last:mb-0"
        :class="getExpandedClass(mainCategory)"
      >
        <div class="absolute top-2 right-2">
          <div 
            class="text-[8px] text-gray-600 transition-transform duration-200 cursor-pointer m-1" 
            :class="{ 'rotate-180': mainCategory.expanded }" 
            @click="toggleCategory(mainCategory.mainCategory)"
          >
            ◥◤
          </div>
        </div>
        
        <div class="flex justify-between items-center cursor-pointer mb-3 mt-2" @click="toggleCategory(mainCategory.mainCategory)">
          <div class="flex items-center flex-1 min-w-0">
            <div class="mr-3 w-8 text-center">
              <CategoryIcon 
                :category="mainCategory.mainCategory" 
                :color="categoryColor"
                :size="24"
              />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[16px] font-semibold text-black truncate">
                {{ mainCategory.mainCategory }} <span class="text-[12px] font-normal">{{ mainCategory.spendingRatio.toFixed(1)}}%</span>
              </div>
            </div>
          </div>
          
          <div v-if="mainCategory.expanded" class="flex items-baseline gap-1">
            <div class="text-sm font-semibold" :class="getAmountClass(mainCategory)">
              지출 {{ formatCurrency(mainCategory.totalSpent) }}
            </div>
            <div class="text-sm text-gray-600">/ {{ formatCurrency(mainCategory.totalBudget) }}</div>
          </div>
        </div>

        <div class="mb-4">
          <SegmentedProgressBar 
            :name="`main-${mainCategory.mainCategory}`"
            :segments="getMainCategorySegments(mainCategory)"
            :total="100"
            :showLegend="mainCategory.expanded"
          />
          <div v-if="!mainCategory.expanded" class="flex justify-between items-center mt-2 text-xs">
            <div class="font-semibold" :class="getAmountClass(mainCategory)">
              {{ formatCurrency(mainCategory.totalSpent) }}
            </div>
            <div class="text-gray-600 font-medium">
              {{ formatCurrency(mainCategory.totalBudget) }}
            </div>
          </div>
        </div>

        <div v-if="mainCategory.expanded" class="border-t border-gray-200 pt-4">
          <div class="mb-5">
            <div class="flex justify-between items-center mb-3">
              <h4 class="text-[14px] font-semibold text-gray-600 m-0 flex-1">
                {{ getPrevMonth() }} {{ mainCategory.mainCategory }} <span class="text-[12px] font-normal">{{ getPrevMonthRatio(mainCategory) }}% </span>
              </h4>
              <div class="flex items-baseline gap-1">
                <div class="text-xs text-gray-800 font-medium">{{ formatCurrency(getPrevMonthSpent(mainCategory)) }}</div>
                <div class="text-xs text-gray-600">/ {{ formatCurrency(mainCategory.totalBudget) }}</div>
              </div>
            </div>
            <SegmentedProgressBar 
              :name="`prev-${mainCategory.mainCategory}`"
              :segments="getPrevMonthSegments(mainCategory)"
              :total="100"
              :showLegend="true"
            />
          </div>

          <div>
            <div class="flex justify-between items-center mb-3">
              <h4 class="text-sm font-medium text-gray-500 m-0 flex-1">
                {{ getPrevPrevMonth() }} {{ mainCategory.mainCategory }} {{ getPrevPrevMonthRatio(mainCategory) }}%
              </h4>
              <div class="flex items-baseline gap-1">
                <div class="text-xs text-gray-800 font-medium">{{ formatCurrency(getPrevPrevMonthSpent(mainCategory)) }}</div>
                <div class="text-xs text-gray-600">/ {{ formatCurrency(mainCategory.totalBudget) }}</div>
              </div>
            </div>
            <SegmentedProgressBar 
              :name="`prev-prev-${mainCategory.mainCategory}`"
              :segments="getPrevPrevMonthSegments(mainCategory)"
              :total="100"
              :showLegend="true"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 mt-4">
      <ButtonItem 
        variant="primary" 
        text="예산 설정"
        @click="handleBudgetSetting"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SegmentedProgressBar from '@/components/progressBar/SegmentedProgressBar.vue'
import CategoryIcon from '@/components/icon/CategoryIcon.vue'
import ButtonItem from '@/components/button/ButtonItem.vue'
import { useBudgetsStore } from '@/stores/budgets'
import type { MainCategoryBudget } from '@/stores/budgets'
import type { MainCategory } from '@/constants/categories'

const budgetsStore = useBudgetsStore()
const isLoading = ref(true)
const expandedCategories = ref<Set<MainCategory>>(new Set())

const budgetSummary = computed(() => budgetsStore.currentBudgetSummary)
const categoryColor = '#028174'

const mainCategories = computed(() => {
  if (!budgetSummary.value) return []
  return budgetSummary.value.mainCategoryBudgets.map(cat => ({
    ...cat,
    expanded: expandedCategories.value.has(cat.mainCategory),
    isOverBudget: cat.totalSpent > cat.totalBudget,
    spendingRatio: cat.totalBudget > 0 ? parseFloat(((cat.totalSpent / cat.totalBudget) * 100).toFixed(1)) : 0
  }))
})

const subCategoryColors: Record<string, string> = {
  '식당': '#92DE8B', '카페': '#0AB68B', '배달': '#028174',
  '대중교통': '#92DE8B', '택시': '#0AB68B',
  '통신비': '#92DE8B', '공과금': '#0AB68B', '의료비': '#028174', '교육': '#C3F2BF', '편의점/마트': '#045D56',
  '공연': '#92DE8B', '영화': '#0AB68B', '쇼핑': '#028174', '정기구독': '#C3F2BF', '유흥': '#045D56',
  '기타': '#0AB68B'
}

const getSubCategoryColor = (subCategory: string): string => {
  return subCategoryColors[subCategory] || '#6b7280'
}

const getExpandedClass = (mainCategory: any) => ({
  'bg-gray-50 border-l-4 border-app-red': mainCategory.isOverBudget && mainCategory.expanded,
  'bg-gray-50': mainCategory.expanded && !mainCategory.isOverBudget
})

const getAmountClass = (mainCategory: any): string => {
  return mainCategory.isOverBudget ? 'text-app-red' : 'text-app-blue'
}

const toggleCategory = (category: MainCategory) => {
  if (expandedCategories.value.has(category)) {
    expandedCategories.value.delete(category)
  } else {
    expandedCategories.value.clear()
    expandedCategories.value.add(category)
  }
}

const getMainCategorySegments = (mainCategory: any) => {
  if (mainCategory.totalBudget === 0) return []
  
  if (mainCategory.expanded) {
    return mainCategory.subCategories
      .filter((sub: any) => sub.budgetAmount > 0)
      .map((sub: any) => ({
        label: sub.subCategory,
        value: Math.min((sub.spentAmount / mainCategory.totalBudget) * 100, 100),
        color: getSubCategoryColor(sub.subCategory)
      }))
  }
  
  return [{
    label: mainCategory.mainCategory,
    value: Math.min(mainCategory.spendingRatio, 100),
    color: mainCategory.isOverBudget ? '#ef4444' : '#0AB68B'
  }]
}

const getPrevMonthSegments = (mainCategory: MainCategoryBudget) => {
  const isExpanded = expandedCategories.value.has(mainCategory.mainCategory)
  
  if (isExpanded) {
    return mainCategory.subCategories
      .filter(sub => sub.budgetAmount > 0)
      .map(sub => ({
        label: sub.subCategory,
        value: Math.min((sub.spentAmount * 0.8 / mainCategory.totalBudget) * 100, 100),
        color: getSubCategoryColor(sub.subCategory)
      }))
  }
  
  return [{
    label: `${getPrevMonth()} 지출`,
    value: Math.min((mainCategory.totalSpent * 0.8 / mainCategory.totalBudget) * 100, 100),
    color: '#6b7280'
  }]
}

const getPrevPrevMonthSegments = (mainCategory: MainCategoryBudget) => {
  const isExpanded = expandedCategories.value.has(mainCategory.mainCategory)
  
  if (isExpanded) {
    return mainCategory.subCategories
      .filter(sub => sub.budgetAmount > 0)
      .map(sub => ({
        label: sub.subCategory,
        value: Math.min((sub.spentAmount * 0.6 / mainCategory.totalBudget) * 100, 100),
        color: getSubCategoryColor(sub.subCategory)
      }))
  }
  
  return [{
    label: `${getPrevPrevMonth()} 지출`,
    value: Math.min((mainCategory.totalSpent * 0.6 / mainCategory.totalBudget) * 100, 100),
    color: '#9ca3af'
  }]
}

const getPrevMonthSpent = (mainCategory: MainCategoryBudget): number => mainCategory.totalSpent * 0.8
const getPrevPrevMonthSpent = (mainCategory: MainCategoryBudget): number => mainCategory.totalSpent * 0.6

const getPrevMonthRatio = (mainCategory: MainCategoryBudget): string => {
  return Math.min((getPrevMonthSpent(mainCategory) / mainCategory.totalBudget * 100), 100).toFixed(1)
}

const getPrevPrevMonthRatio = (mainCategory: MainCategoryBudget): string => {
  return Math.min((getPrevPrevMonthSpent(mainCategory) / mainCategory.totalBudget * 100), 100).toFixed(1)
}

const getPrevMonth = (): string => {
  const date = new Date()
  date.setMonth(date.getMonth() - 1)
  return `${date.getMonth() + 1}월`
}

const getPrevPrevMonth = (): string => {
  const date = new Date()
  date.setMonth(date.getMonth() - 2)
  return `${date.getMonth() + 1}월`
}

const formatCurrency = (amount: number): string => new Intl.NumberFormat('ko-KR').format(amount) + '원'

const handleBudgetSetting = () => {
  console.log('예산 설정 버튼 클릭')
}

const loadTestData = async () => {
  isLoading.value = true
  try {
    await budgetsStore.loadTestData()
  } catch (error) {
    console.error('테스트 데이터 로딩 실패:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  try {
    await budgetsStore.initializeCurrentMonthBudget()
  } catch (error) {
    console.error('예산 초기화 실패:', error)
  } finally {
    isLoading.value = false
  }
})
</script>