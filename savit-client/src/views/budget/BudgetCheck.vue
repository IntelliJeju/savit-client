<template>
  <div class="budget-container">
    <div class="header">
    </div>

    <div v-if="isLoading" class="loading">
      <p>예산 정보를 불러오는 중...</p>
    </div>

    <div v-else-if="!budgetSummary" class="no-budget">
      <p>설정된 예산이 없습니다.</p>
      <button @click="loadTestData" class="setup-btn">
        테스트 데이터 로드
      </button>
    </div>

    <div v-else class="category-list">
      <!-- 모든 카테고리를 감싸는 흰 배경 박스 -->
      <div class="categories-container">
        <div 
          v-for="mainCategory in mainCategories" 
          :key="mainCategory.mainCategory"
          class="category-card"
          :class="{ 
            'over-budget': mainCategory.isOverBudget,
            'expanded': mainCategory.expanded 
          }"
        >
        <!-- 확장/축소 화살표를 카테고리 카드 오른쪽 상단에 위치 -->
        <div class="expand-arrow-container">
          <div class="expand-arrow m-1" :class="{ 'rotated': mainCategory.expanded }" @click="toggleCategory(mainCategory.mainCategory)">
            ◥◤
          </div>
        </div>
        
        <div class="category-header" @click="toggleCategory(mainCategory.mainCategory)">
          <div class="left-section">
            <div class="category-icon">{{ getCategoryIcon(mainCategory.mainCategory) }}</div>
            <div class="category-info">
              <div class="category-name">{{ mainCategory.mainCategory }} &nbsp; {{ mainCategory.spendingRatio.toFixed(1) }}%</div>            </div>
          </div>
          
          <!-- 오른쪽 영역: 지출액/예산액 (펼쳤을 때만 표시) -->
          <div v-if="mainCategory.expanded" class="right-section">
            <div class="amounts">
              <!-- 지출 금액 (예산 초과 시 빨간색) -->
              <div class="spent-amount" :class="{ 'over-budget-text': mainCategory.isOverBudget }">
                {{ formatCurrency(mainCategory.totalSpent) }}
              </div>
              <!-- 예산 금액 -->
              <div class="budget-amount">/ {{ formatCurrency(mainCategory.totalBudget) }}</div>
            </div>
          </div>
        </div>

        <!-- 대분류별 프로그레스바 표시 -->
        <div class="progress-section">
          <SegmentedProgressBar 
            :name="`main-${mainCategory.mainCategory}`"
            :segments="getMainCategorySegments(mainCategory, `main-${mainCategory.mainCategory}`)"
            :total="100"
            :showLegend="mainCategory.expanded"
          />
          <!-- 프로그레스바 하단 금액 표시 (펼치지 않았을 때만) -->
          <div v-if="!mainCategory.expanded" class="progress-amounts-bottom">
            <div class="spent-amount-bottom" :class="{ 'over-budget-text': mainCategory.isOverBudget }">
              {{ formatCurrency(mainCategory.totalSpent) }}
            </div>
            <div class="budget-amount-bottom">
              {{ formatCurrency(mainCategory.totalBudget) }}
            </div>
          </div>
        </div>

        <!-- 카테고리가 확장된 경우에만 표시되는 하위분류 상세 정보 -->
        <div v-if="mainCategory.expanded" class="sub-details">

          <!-- 저번 달(1개월 전) 지출 현황 -->
          <div class="month-section prev-month">
            <div class="month-header">
              <h4 class="month-title">{{ getPrevMonth() }} 식비 &nbsp; {{ Math.min((getPrevMonthSpent(mainCategory) / mainCategory.totalBudget * 100), 100).toFixed(1) }}%</h4>
              <div class="month-amounts">
                <div class="spent-amount">{{ formatCurrency(getPrevMonthSpent(mainCategory)) }}</div>
                <div class="budget-amount">/ {{ formatCurrency(mainCategory.totalBudget) }}</div>
              </div>
            </div>
            <div class="historical-progress">
              <!-- 저번 달 프로그레스바 (더미 데이터 사용) -->
              <div class="progress-bar-container">
                <SegmentedProgressBar 
                  :name="`prev-${mainCategory.mainCategory}`"
                  :segments="getPrevMonthSegments(mainCategory, `prev-${mainCategory.mainCategory}`)"
                  :total="100"
                  :showLegend="true"
                />
              </div>
            </div>
          </div>

          <!-- 저저번 달(2개월 전) 지출 현황 -->
          <div class="month-section prev-prev-month">
            <div class="month-header">
              <h4 class="month-title">{{ getPrevPrevMonth() }} 식비 &nbsp; {{ Math.min((getPrevPrevMonthSpent(mainCategory) / mainCategory.totalBudget * 100), 100).toFixed(1) }}%</h4>
              <div class="month-amounts">
                <div class="spent-amount">{{ formatCurrency(getPrevPrevMonthSpent(mainCategory)) }}</div>
                <div class="budget-amount">/ {{ formatCurrency(mainCategory.totalBudget) }}</div>
              </div>
            </div>
            <div class="historical-progress">
              <!-- 저저번 달 프로그레스바 (더미 데이터 사용) -->
              <div class="progress-bar-container">
                <SegmentedProgressBar 
                  :name="`prev-prev-${mainCategory.mainCategory}`"
                  :segments="getPrevPrevMonthSegments(mainCategory, `prev-prev-${mainCategory.mainCategory}`)"
                  :total="100"
                  :showLegend="true"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SegmentedProgressBar from '@/components/progressBar/SegmentedProgressBar.vue'
import { useBudgetsStore } from '@/stores/budgets'
import type { MainCategoryBudget, MainCategory } from '@/stores/budgets'

const budgetsStore = useBudgetsStore()

const isLoading = ref(true)
const expandedCategories = ref<Set<MainCategory>>(new Set())
const segmentedProgressBars = ref<Set<string>>(new Set())

const budgetSummary = computed(() => budgetsStore.currentBudgetSummary)

const mainCategories = computed(() => {
  if (!budgetSummary.value) return []
  
  return budgetSummary.value.mainCategoryBudgets.map(cat => ({
    ...cat,
    expanded: expandedCategories.value.has(cat.mainCategory),
    isOverBudget: cat.totalSpent > cat.totalBudget,
    spendingRatio: cat.totalBudget > 0 ? parseFloat(((cat.totalSpent / cat.totalBudget) * 100).toFixed(1)) : 0
  }))
})

// 대분류별 아이콘 매핑 객체
const categoryIcons = {
  '식비': '🍴',    // 식사 관련 아이콘
  '교통': '🚌',    // 버스 아이콘 
  '생활': '🏪',    // 상점 아이콘
  '문화': '🎭',    // 연극 마스크 아이콘
  '기타': '⭐'      // 별 아이콘
}

// 소분류별 색상 매핑 객체 (프로그레스바와 범례에서 사용)
const subCategoryColors = {
  // 식비 계열 (app-light-green, app-green, app-dark-green 순서)
  '식당': '#92DE8B',      // app-light-green
  '카페': '#0AB68B',      // app-green  
  '배달': '#028174',      // app-dark-green
  // 교통 계열 (app-light-green, app-green, app-dark-green 순서)
  '대중교통': '#92DE8B',   // app-light-green
  '택시': '#0AB68B',      // app-green
  // 생활 계열 (app-light-green, app-green, app-dark-green 순서)
  '통신비': '#92DE8B',     // app-light-green
  '공과금': '#0AB68B',     // app-green
  '편의점/마트': '#028174', // app-dark-green
  // 문화 계열 (app-light-green, app-green, app-dark-green 순서)
  '공연': '#92DE8B',      // app-light-green
  '쇼핑': '#0AB68B',      // app-green
  '유흥': '#028174',      // app-dark-green
  // 기타 (app-green)
  '기타': '#0AB68B'       // app-green
}

/**
 * 대분류에 상응하는 아이콘을 반환
 * @param category 대분류명
 * @returns 아이콘 문자열 (기본값: '📊')
 */
const getCategoryIcon = (category: MainCategory): string => {
  return categoryIcons[category] || '📊'
}

/**
 * 소분류에 상응하는 색상을 반환
 * @param subCategory 소분류명
 * @returns HEX 색상 코드 (기본값: '#6b7280')
 */
const getSubCategoryColor = (subCategory: string): string => {
  return subCategoryColors[subCategory as keyof typeof subCategoryColors] || '#6b7280'
}

/**
 * 대분류 카테고리의 확장/축소를 토글하는 함수
 * 한 번에 하나의 카테고리만 확장 가능
 * @param category 토글할 대분류
 */
const toggleCategory = (category: MainCategory) => {
  const mainProgressBarId = `main-${category}`
  
  if (expandedCategories.value.has(category)) {
    // 접을 때: 통합 모드로 변경
    expandedCategories.value.delete(category)
    segmentedProgressBars.value.delete(mainProgressBarId)
  } else {
    // 펼칠 때: 다른 모든 카테고리를 닫고 현재 카테고리만 펼치기
    expandedCategories.value.clear()
    segmentedProgressBars.value.clear()
    expandedCategories.value.add(category)
    segmentedProgressBars.value.add(mainProgressBarId)
  }
}

/**
 * 프로그레스바의 세그먼트 모드를 토글하는 함수
 * (현재 코드에서는 사용되지 않음)
 * @param progressBarId 토글할 프로그레스바 ID
 */
const toggleProgressBarSegmentation = (progressBarId: string) => {
  if (segmentedProgressBars.value.has(progressBarId)) {
    segmentedProgressBars.value.delete(progressBarId)
  } else {
    segmentedProgressBars.value.add(progressBarId)
  }
}

/**
 * 대분류의 프로그레스바 세그먼트 데이터를 생성
 * 세그먼트 모드일 때는 하위분류별로, 일반 모드일 때는 단일 세그먼트로 표시
 * @param mainCategory 대분류 데이터
 * @param progressBarId 프로그레스바 ID
 * @returns 세그먼트 데이터 배열
 */
const getMainCategorySegments = (mainCategory: any, progressBarId: string) => {
  if (mainCategory.totalBudget === 0) return []
  
  // 프로그레스바가 세그먼트 모드인 경우 하위분류별로 분할
  if (segmentedProgressBars.value.has(progressBarId)) {
    return mainCategory.subCategories
      .filter((sub: any) => sub.budgetAmount > 0)
      .map((sub: any) => ({
        label: sub.subCategory,
        value: Math.min((sub.spentAmount / mainCategory.totalBudget) * 100, 100),
        color: getSubCategoryColor(sub.subCategory)
      }))
  }
  
  // 기본 모드: 단일 세그먼트 (예산 초과 시 빨간색, 정상 시 app-green)
  return [{
    label: mainCategory.mainCategory,
    value: Math.min(mainCategory.spendingRatio, 100),
    color: mainCategory.isOverBudget ? '#ef4444' : '#0AB68B'
  }]
}

/**
 * 대분류 안의 소분류별 프로그레스바 세그먼트 데이터를 생성
 * 각 소분류의 지출액을 대분류 전체 예산 대비 비율로 변환
 * @param mainCategory 대분류 데이터
 * @returns 소분류별 세그먼트 데이터 배열
 */
const getSubCategorySegments = (mainCategory: MainCategoryBudget) => {
  if (mainCategory.totalBudget === 0) return []
  
  return mainCategory.subCategories
    .filter(sub => sub.budgetAmount > 0)
    .map(sub => ({
      label: sub.subCategory,
      value: Math.min((sub.spentAmount / mainCategory.totalBudget) * 100, 100),
      color: getSubCategoryColor(sub.subCategory)
    }))
}

// 더미 데이터로 이전 달 세그먼트 생성
const getPrevMonthSegments = (mainCategory: MainCategoryBudget, progressBarId: string) => {
  // 대분류가 펼쳐진 경우 하위분류별로 분할
  const isExpanded = expandedCategories.value.has(mainCategory.mainCategory)
  
  if (isExpanded) {
    return mainCategory.subCategories
      .filter(sub => sub.budgetAmount > 0)
      .map(sub => ({
        label: sub.subCategory,
        value: Math.min((sub.spentAmount * 0.8 / mainCategory.totalBudget) * 100, 100), // 80% 더미 데이터
        color: getSubCategoryColor(sub.subCategory)
      }))
  }
  
  // 기본 모드: 단일 세그먼트
  return [{
    label: `${getPrevMonth()} 지출`,
    value: Math.min((mainCategory.totalSpent * 0.8 / mainCategory.totalBudget) * 100, 100),
    color: '#6b7280'
  }]
}

/**
 * 저저번 달(2개월 전) 지출 내역의 프로그레스바 세그먼트 데이터를 생성
 * 더미 데이터로 현재월 지출의 60%로 계산
 * @param mainCategory 대분류 데이터
 * @param progressBarId 프로그레스바 ID (현재 코드에서는 미사용)
 * @returns 저저번 달 세그먼트 데이터 배열
 */
const getPrevPrevMonthSegments = (mainCategory: MainCategoryBudget, progressBarId: string) => {
  // 대분류가 펼쳐진 경우 하위분류별로 분할
  const isExpanded = expandedCategories.value.has(mainCategory.mainCategory)
  
  if (isExpanded) {
    return mainCategory.subCategories
      .filter(sub => sub.budgetAmount > 0)
      .map(sub => ({
        label: sub.subCategory,
        value: Math.min((sub.spentAmount * 0.6 / mainCategory.totalBudget) * 100, 100), // 60% 더미 데이터
        color: getSubCategoryColor(sub.subCategory)
      }))
  }
  
  // 기본 모드: 단일 세그먼트
  return [{
    label: `${getPrevPrevMonth()} 지출`,
    value: Math.min((mainCategory.totalSpent * 0.6 / mainCategory.totalBudget) * 100, 100),
    color: '#9ca3af'
  }]
}

/**
 * 저번 달 총 지출 금액을 계산 (더미 데이터)
 * @param mainCategory 대분류 데이터
 * @returns 저번 달 총 지출 금액 (현재월의 80%)
 */
const getPrevMonthSpent = (mainCategory: MainCategoryBudget): number => {
  return mainCategory.totalSpent * 0.8 // 더미 데이터
}

/**
 * 저저번 달 총 지출 금액을 계산 (더미 데이터)
 * @param mainCategory 대분류 데이터
 * @returns 저저번 달 총 지출 금액 (현재월의 60%)
 */
const getPrevPrevMonthSpent = (mainCategory: MainCategoryBudget): number => {
  return mainCategory.totalSpent * 0.6 // 더미 데이터
}

/**
 * 현재 월을 한글 형식으로 반환
 * @returns 현재 월 (예: '7월')
 */
const getCurrentMonth = (): string => {
  const now = new Date()
  return `${now.getMonth() + 1}월`
}

/**
 * 저번 달을 한글 형식으로 반환
 * @returns 저번 달 (예: '6월')
 */
const getPrevMonth = (): string => {
  const date = new Date()
  date.setMonth(date.getMonth() - 1)
  return `${date.getMonth() + 1}월`
}

/**
 * 저저번 달을 한글 형식으로 반환
 * @returns 저저번 달 (예: '5월')
 */
const getPrevPrevMonth = (): string => {
  const date = new Date()
  date.setMonth(date.getMonth() - 2)
  return `${date.getMonth() + 1}월`
}

/**
 * 숫자를 한국 통화 형식으로 포맷팅
 * @param amount 금액
 * @returns 포맷팅된 금액 문자열 (예: '1,500,000원')
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원'
}

/**
 * 예산 대비 지출 비율 계산
 * @param spent 지출 금액
 * @param budget 예산 금액
 * @returns 지출 비율 (0-100%)
 */
const getSpendingRatio = (spent: number, budget: number): number => {
  if (budget === 0) return 0
  return parseFloat(((spent / budget) * 100).toFixed(1))
}

/**
 * 지출 비율에 따른 CSS 클래스 반환
 * 100% 초과: 빨간색, 80% 초과: 주황색, 그 외: 녹색
 * @param spent 지출 금액
 * @param budget 예산 금액
 * @returns CSS 클래스 문자열
 */
const getSpendingRatioClass = (spent: number, budget: number): string => {
  const ratio = getSpendingRatio(spent, budget)
  if (ratio > 100) return 'text-red-600 font-semibold'
  if (ratio > 80) return 'text-orange-600'
  return 'text-green-600'
}

/**
 * 테스트 데이터를 로드하는 함수
 * 로딩 상태를 관리하며 오류 처리도 수행
 */
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

/**
 * 컴포넌트 마운트 시 실행되는 초기화 함수
 * 현재 월의 예산 데이터를 로드하고 로딩 상태를 관리
 */
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

<style scoped>
.budget-container {
  max-width: 400px;
  margin: 0 auto;
  background: #f5f5f5;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 0 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0 16px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #000;
  margin: 0;
}

.test-data-btn, .setup-btn {
  background: #007AFF;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.loading, .no-budget {
  text-align: center;
  padding: 40px;
  color: #666;
}

.category-list {
  margin-bottom: 20px;
}

.categories-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.category-card {
  margin-bottom: 8px;
  padding: 12px;
  transition: all 0.2s ease;
  position: relative;
  border-radius: 8px;
}

.category-card:last-child {
  margin-bottom: 0;
}

.category-card.expanded {
  background: #f8f9fa;
  border-radius: 8px;
}

.category-card.expanded.over-budget {
  border-left: 4px solid #ff4444;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  margin-bottom: 12px;
  margin-top: 8px;
}

.left-section {
  display: flex;
  align-items: center;
  flex: 1;
}

.category-icon {
  font-size: 24px;
  margin-right: 12px;
  width: 32px;
  text-align: center;
}

.category-name {
  font-size: 16px;
  font-weight: 500;
  color: #000;
  margin-bottom: 2px;
}

.category-ratio {
  font-size: 12px;
  color: #666;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.amounts {
  text-align: right;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.spent-amount {
  font-size: 14px;
  color: #007AFF;
  font-weight: 600;
  text-align: right;
}

.spent-amount.over-budget-text {
  color: #ff4444;
}

.budget-amount {
  font-size: 12px;
  color: #666;
  text-align: right;
}

.expand-arrow-container {
  position: absolute;
  top: 4px;
  right: 12px;
  
}

.expand-arrow {
  font-size: 8px;
  color: #666;
  transition: transform 0.2s ease;
  cursor: pointer;
}

.expand-arrow.rotated {
  transform: rotate(180deg);
}

.progress-section {
  margin-bottom: 16px;
}

.progress-amounts-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
}

.spent-amount-bottom {
  color: #007AFF;
  font-weight: 600;
}

.spent-amount-bottom.over-budget-text {
  color: #ff4444;
}

.budget-amount-bottom {
  color: #666;
  font-weight: 500;
}


.sub-details {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.month-section {
  margin-bottom: 20px;
}

.month-section:last-child {
  margin-bottom: 0;
}

.month-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.month-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.month-amounts {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.month-amounts .spent-amount {
  font-size: 12px;
  color: #333;
  font-weight: 500;
}

.month-amounts .budget-amount {
  font-size: 11px;
  color: #666;
}

.current-month .month-title {
  color: #007AFF;
}

.prev-month .month-title {
  color: #666;
}

.prev-prev-month .month-title {
  color: #999;
}

.sub-categories {
  margin-bottom: 12px;
}

.sub-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.sub-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sub-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.sub-name {
  font-size: 13px;
  color: #333;
}

.sub-right {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.sub-spent {
  color: #333;
  font-weight: 500;
}

.sub-spent.over-budget-text {
  color: #ff4444;
}

.sub-separator {
  color: #999;
}

.sub-budget {
  color: #666;
}

.sub-ratio {
  font-size: 11px;
  font-weight: 500;
}

.text-red-600 {
  color: #dc2626;
}

.text-orange-600 {
  color: #ea580c;
}

.text-green-600 {
  color: #16a34a;
}

.font-semibold {
  font-weight: 600;
}

.sub-progress {
  margin-bottom: 16px;
}

.historical-progress {
  margin-bottom: 16px;
}

.historical-summary {
  font-size: 12px;
  color: #666;
  text-align: right;
  margin-top: 4px;
}

.progress-bar-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-bar-info {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.progress-percentage {
  font-size: 14px;
  font-weight: 600;
  color: #007AFF;
}

.progress-amounts {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.progress-amounts .spent-amount {
  font-size: 12px;
  color: #333;
  font-weight: 500;
  text-align: right;
}

.progress-amounts .budget-amount {
  font-size: 11px;
  color: #666;
  text-align: right;
}
</style>