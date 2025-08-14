<template>
  <Teleport to="#header-content">
    <span>예산 설정</span>
  </Teleport>

  <div class="min-h-screen">
    <!-- 상단 고정 예산 박스 -->
    <div class="fixed top-16 inset-x-0 z-50 bg-white border-b shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center mx-4">
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
        </div>
      </div>
    </div>

    <!-- 메인 컨텐츠 (상단 여백 추가) -->
    <div class="max-w-4xl mx-auto my-4 px-4 pt-24 pb-8">
      <CardComponent class="mb-20">
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
              <ButtonItem @click="onRecommendationClick" :disabled="isLoading" class="w-[70px] h-8">
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

      <!-- 설정 버튼 -->
      <div class="fixed bottom-16 inset-x-0 p-4 bg-white border-t">
        <div class="max-w-4xl mx-auto">
          <ButtonItem @click="onSaveBudgetClick" text="설정" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createInputHandlers, formatCurrency } from '@/utils/calculations'
import CardComponent from '@/components/card/CardComponent.vue'
import CategorySlider from '@/components/budget/CategorySlider.vue'
import ButtonItem from '@/components/button/ButtonItem.vue'
import { useBudgetCategories } from '@/composables/useBudgetCategories'
import { useBudgetManagement } from '@/composables/useBudgetManagement'

// Composables
const { totalBudget, isLoading, handleSaveBudgetClick, handleRecommendationClick } =
  useBudgetManagement()

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

// Event handlers
const onRecommendationClick = () => handleRecommendationClick(applyRecommendedRatios)
const onSaveBudgetClick = () => handleSaveBudgetClick(categories.value, totalPercentage.value)
</script>
