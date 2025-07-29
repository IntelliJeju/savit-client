<template>
  <div class="min-h-screen bg-app-light-gray">
    <div class="max-w-sm mx-auto p-4">
      <!-- Header Card -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200 mb-6">
        <div class="flex items-center justify-between mb-4">
          <button class="w-10 h-10 rounded-xl bg-app-light-gray hover:bg-slate-200 flex items-center justify-center transition-colors">
            <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="text-lg font-semibold text-slate-800">예산 분배 설정</h1>
          <div class="w-10"></div>
        </div>
        
        <div class="text-center">
          <div class="text-sm text-slate-600 mb-2">이번 달 예산</div>
          <div class="text-3xl font-bold text-slate-800">600,000원</div>
        </div>
      </div>

      <!-- Budget Sliders -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div class="p-5">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-slate-800">카테곣먌별 비율 설정</h2>
            <div class="text-sm text-slate-500">드래그하여 조정</div>
          </div>
          
          <!-- Category sliders -->
          <div class="px-4 mb-6">
            <div class="flex justify-between items-end h-40 mb-4">
              <div v-for="(category, index) in categories" :key="index" class="flex flex-col items-center flex-1">
                <!-- Slider container -->
                <div 
                  class="relative w-6 h-32 bg-app-light-gray rounded-full cursor-pointer"
                  @mousedown="(e) => startDrag(e, index)"
                  @touchstart="(e) => startDrag(e, index)"
                  ref="sliderRefs"
                >
                  <!-- Slider fill -->
                  <div 
                    class="absolute bottom-0 w-full rounded-full transition-all duration-300 bg-app-green"
                    :style="{ height: `${category.percentage}%` }"
                  ></div>
                  <!-- Slider handle -->
                  <div 
                    :class="[
                      'absolute w-8 h-4 bg-white rounded-full shadow-sm border-2 border-app-green transition-all duration-200 cursor-grab active:cursor-grabbing transform -translate-x-1/2 left-1/2',
                      dragState.activeIndex === index ? 'scale-110 shadow-md ring-2 ring-app-green ring-opacity-30 ring-offset-1' : 'hover:scale-105'
                    ]"
                    :style="{ bottom: `${Math.max(0, category.percentage - 4)}%` }"
                  ></div>
                </div>
              </div>
            </div>
            
            <!-- Category info - 별도 행으로 분리 -->
            <div class="flex justify-between">
              <div v-for="(category, index) in categories" :key="index" class="flex flex-col items-center flex-1">
                <div class="w-10 h-10 rounded-2xl flex items-center justify-center mb-2 bg-app-light-gray">
                  <component :is="category.icon" class="w-5 h-5 text-app-dark-green" />
                </div>
                <p class="text-xs font-medium text-slate-800 mb-1">{{ category.name }}</p>
                <p class="text-xs font-semibold px-2 py-1 rounded-full bg-app-light-gray text-slate-700">{{ category.percentage }}%</p>
              </div>
            </div>
          </div>

          <!-- Total and Action -->
          <div class="bg-app-light-gray rounded-xl p-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="totalPercentage === 100 ? 'bg-app-light-blue' : 'bg-app-light-red'">
                <svg v-if="totalPercentage === 100" class="w-5 h-5 text-app-blue" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <svg v-else class="w-5 h-5 text-app-red" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div>
                <div class="text-sm text-slate-600 mb-1">총 배분비율</div>
                <div class="text-2xl font-bold" :class="totalPercentage === 100 ? 'text-app-blue' : 'text-app-red'">
                  {{ totalPercentage }}%
                </div>
              </div>
            </div>
            <button class="bg-app-green text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-app-dark-green transition-colors">
              AI 추천
            </button>
          </div>
        </div>
      </div>

      <!-- Budget Summary -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-800">카테곣먌별 예산 내역</h3>
          <div class="text-sm text-app-green font-medium">전체보기</div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div v-for="(category, index) in categories" :key="index" 
               class="p-4" :class="{ 'border-b border-slate-200': index < categories.length - 1 }">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-3xl flex items-center justify-center bg-app-light-gray">
                  <component :is="category.icon" class="w-5 h-5 text-app-dark-green" />
                </div>
                <div>
                  <div class="font-medium text-slate-800">{{ category.name }}</div>
                  <div class="text-sm text-slate-500">{{ category.percentage }}% 배분</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-semibold text-slate-800">
                  {{ calculateAmount(category.percentage).toLocaleString() }}원
                </div>
                <div class="text-sm text-app-red font-medium">-132,000원</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Icon components (simplified SVG icons)
const RestaurantIcon = {
  template: `
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
    </svg>
  `
}

const TransportIcon = {
  template: `
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"/>
    </svg>
  `
}

const ShoppingIcon = {
  template: `
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
    </svg>
  `
}

const CultureIcon = {
  template: `
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"/>
      <path fill-rule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clip-rule="evenodd"/>
    </svg>
  `
}

interface Category {
  name: string
  percentage: number
  icon: any
}

interface DragState {
  isDragging: boolean
  activeIndex: number | null
  startY: number
  startPercentage: number
}

const totalBudget = 600000

const categories = ref<Category[]>([
  {
    name: '식비',
    percentage: 40,
    icon: RestaurantIcon
  },
  {
    name: '교통',
    percentage: 25,
    icon: TransportIcon
  },
  {
    name: '생활',
    percentage: 20,
    icon: ShoppingIcon
  },
  {
    name: '문화',
    percentage: 15,
    icon: CultureIcon
  }
])

const sliderRefs = ref<HTMLElement[]>([])

const dragState = ref<DragState>({
  isDragging: false,
  activeIndex: null,
  startY: 0,
  startPercentage: 0
})

const totalPercentage = computed(() => {
  return categories.value.reduce((sum, cat) => sum + cat.percentage, 0)
})

const calculateAmount = (percentage: number) => {
  return Math.round((totalBudget * percentage) / 100)
}

const getSliderBounds = (sliderElement: HTMLElement) => {
  const rect = sliderElement.getBoundingClientRect()
  return {
    top: rect.top,
    bottom: rect.bottom,
    height: rect.height
  }
}

const calculatePercentageFromPosition = (clientY: number, bounds: any) => {
  const relativeY = clientY - bounds.top
  const percentage = Math.max(0, Math.min(100, (1 - relativeY / bounds.height) * 100))
  return percentage
}

const startDrag = (event: MouseEvent | TouchEvent, index: number) => {
  event.preventDefault()
  
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  
  dragState.value = {
    isDragging: true,
    activeIndex: index,
    startY: clientY,
    startPercentage: categories.value[index].percentage
  }

  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', endDrag)
  document.addEventListener('touchmove', handleDrag, { passive: false })
  document.addEventListener('touchend', endDrag)
}

const handleDrag = (event: MouseEvent | TouchEvent) => {
  if (!dragState.value.isDragging || dragState.value.activeIndex === null) return
  
  event.preventDefault()
  
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  const sliderElement = sliderRefs.value[dragState.value.activeIndex]
  
  if (!sliderElement) return
  
  const bounds = getSliderBounds(sliderElement)
  let newPercentage = calculatePercentageFromPosition(clientY, bounds)
  
  // 다른 카테고리들의 총합 계산
  const otherCategoriesSum = categories.value.reduce((sum, cat, index) => {
    return index === dragState.value.activeIndex ? sum : sum + cat.percentage
  }, 0)
  
  // 현재 카테고리가 설정할 수 있는 최대값은 100에서 다른 카테고리들의 합을 뺀 값
  const maxAllowed = 100 - otherCategoriesSum
  newPercentage = Math.min(newPercentage, Math.max(0, maxAllowed))
  
  // 5% 단위로 반올림
  newPercentage = Math.round(newPercentage / 5) * 5
  
  categories.value[dragState.value.activeIndex].percentage = newPercentage
}

const endDrag = () => {
  dragState.value = {
    isDragging: false,
    activeIndex: null,
    startY: 0,
    startPercentage: 0
  }

  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('touchend', endDrag)
}

onMounted(() => {
  // 컴포넌트가 마운트될 때 이벤트 리스너가 정상적으로 등록되도록 함
})

onUnmounted(() => {
  // 컴포넌트가 언마운트될 때 이벤트 리스너 정리
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('touchend', endDrag)
})
</script>