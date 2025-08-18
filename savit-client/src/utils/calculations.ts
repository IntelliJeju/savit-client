// 배열의 특정 필드 합계 계산
export const calculateSum = <T>(
  items: T[],
  field: keyof T
): number => {
  return items.reduce((sum, item) => sum + (Number(item[field]) || 0), 0)
}

// 배열의 여러 필드 합계 계산
export const calculateMultiSum = <T>(
  items: T[],
  fields: (keyof T)[]
): number => {
  return items.reduce((sum, item) => {
    const itemSum = fields.reduce((fieldSum, field) => {
      return fieldSum + (Number(item[field]) || 0)
    }, 0)
    return sum + itemSum
  }, 0)
}

// 백분율 계산
export const calculatePercentage = (part: number, total: number): number => {
  return total > 0 ? Math.round((part / total) * 100 * 100) / 100 : 0
}

// 통화 포맷팅
export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString()}원`
}

// 숫자 포맷팅 (천단위 구분자)
export const formatNumber = (amount: number): string => {
  return amount.toLocaleString()
}

// 통화 포맷팅 (약식)
export const formatCurrencyShort = (amount: number): string => {
  if (amount >= 10000) {
    return `${Math.floor(amount / 10000)}만원`
  }
  return `${amount.toLocaleString()}원`
}

// 평균 계산
export const calculateAverage = <T>(
  items: T[],
  field: keyof T
): number => {
  if (items.length === 0) return 0
  const sum = calculateSum(items, field)
  return Math.round((sum / items.length) * 100) / 100
}

// 최댓값 찾기
export const findMax = <T>(
  items: T[],
  field: keyof T
): T | null => {
  if (items.length === 0) return null
  return items.reduce((max, item) => 
    Number(item[field]) > Number(max[field]) ? item : max
  )
}

// 최솟값 찾기
export const findMin = <T>(
  items: T[],
  field: keyof T
): T | null => {
  if (items.length === 0) return null
  return items.reduce((min, item) => 
    Number(item[field]) < Number(min[field]) ? item : min
  )
}

// 변화율 계산
export const calculateChangeRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100 * 100) / 100
}

// 범위 내 값 체크
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}

// 소수점 반올림
export const roundToDecimal = (value: number, decimals: number = 2): number => {
  const multiplier = Math.pow(10, decimals)
  return Math.round(value * multiplier) / multiplier
}

// 예산 진행률 계산
export const calculateBudgetProgress = (spent: number, budget: number): {
  percentage: number
  remaining: number
  isOverBudget: boolean
} => {
  const percentage = calculatePercentage(spent, budget)
  const remaining = Math.max(0, budget - spent)
  const isOverBudget = spent > budget
  
  return {
    percentage,
    remaining,
    isOverBudget
  }
}

// 월별 증감률 계산
export const calculateMonthlyGrowth = (
  currentMonth: number,
  previousMonth: number
): {
  amount: number
  percentage: number
  isIncrease: boolean
} => {
  const amount = currentMonth - previousMonth
  const percentage = calculateChangeRate(currentMonth, previousMonth)
  const isIncrease = amount > 0
  
  return {
    amount,
    percentage,
    isIncrease
  }
}

// 배열을 특정 필드로 그룹화
export const groupBy = <T, K extends keyof T>(
  items: T[],
  key: K
): Record<string, T[]> => {
  return items.reduce((groups, item) => {
    const groupKey = String(item[key])
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

// 배열을 필드별로 정렬
export const sortBy = <T>(
  items: T[],
  field: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...items].sort((a, b) => {
    const aValue = a[field]
    const bValue = b[field]
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    const aStr = String(aValue)
    const bStr = String(bValue)
    
    if (order === 'asc') {
      return aStr.localeCompare(bStr)
    } else {
      return bStr.localeCompare(aStr)
    }
  })
}

// ===== 예산 계산 관련 함수들 =====

// 카테고리별 금액 계산
export const calculateAmount = (percentage: number, totalBudget: number): number => {
  return Math.round((totalBudget * percentage) / 100)
}

// 금액으로부터 퍼센테지 계산
export const calculatePercentageFromAmount = (amount: number, budget: number): number => {
  const exactPercentage = (amount / budget) * 100
  return Math.min(100, Math.max(0, exactPercentage))
}

// 입력값에서 숫자만 추출
export const extractNumericValue = (event: Event): number => {
  const target = event.target as HTMLInputElement
  const inputValue = target.value.replace(/[^\d]/g, '')
  return parseInt(inputValue) || 0
}

// 문자열에서 숫자만 추출
export const extractNumericString = (value: string): string => {
  return value.replace(/[^\d]/g, '')
}

// 비율을 100%로 정규화
export const normalizeRatiosToHundredPercent = (ratios: number[]): number[] => {
  const total = ratios.reduce((sum, ratio) => sum + ratio, 0)
  return ratios.map(ratio => (ratio / total) * 100)
}

// 비율 및 총합 조정
export const roundAndAdjustRatios = (ratios: number[]): number[] => {
  let roundedRatios = ratios.map(ratio => Math.round(ratio * 10) / 10)
  
  // 반올림으로 인한 오차 수정 (가장 큰 비율에서 조정)
  const roundedTotal = roundedRatios.reduce((sum, ratio) => sum + ratio, 0)
  if (roundedTotal !== 100) {
    const difference = 100 - roundedTotal
    const maxIndex = roundedRatios.indexOf(Math.max(...roundedRatios))
    roundedRatios[maxIndex] = Math.round((roundedRatios[maxIndex] + difference) * 10) / 10
  }
  
  return roundedRatios
}

// 카테고리 조정 유틸리티
export interface CategoryAdjustmentOptions {
  categories: { percentage: number }[]
  excludeIndex: number
  excess: number
}

// 다른 카테고리 비율 조정 (비례 방식)
export const adjustCategoriesProportionally = (options: CategoryAdjustmentOptions): void => {
  const { categories, excludeIndex, excess } = options
  const others = categories.filter((_, idx) => idx !== excludeIndex)
  const totalOther = others.reduce((sum, cat) => sum + cat.percentage, 0)
  
  if (totalOther === 0) return
  
  categories.forEach((cat, idx) => {
    if (idx !== excludeIndex) {
      const ratio = cat.percentage / totalOther
      cat.percentage = Math.max(0, cat.percentage - excess * ratio)
    }
  })
}

// 슬라이더 조정시 다른 카테고리 처리
export const adjustCategoriesForSlider = (
  categories: { percentage: number }[], 
  excludeIndex: number, 
  difference: number
): void => {
  const others = categories.filter((_, idx) => idx !== excludeIndex)
  const totalOther = others.reduce((sum, cat) => sum + cat.percentage, 0)
  
  if (totalOther === 0) return
  
  const operation = difference > 0 ? 'decrease' : 'increase'
  const amount = Math.abs(difference)
  
  categories.forEach((cat, idx) => {
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

// 초과 비율 재분배
export const redistributeExcessPercentage = (
  categories: { percentage: number }[], 
  excludeIndex: number, 
  excess: number
): void => {
  let remaining = excess
  
  for (let i = 0; i < categories.length && remaining > 0; i++) {
    if (i === excludeIndex) continue
    
    const cat = categories[i]
    const decrease = Math.min(cat.percentage, Math.ceil(remaining / 5) * 5)
    
    if (decrease > 0) {
      cat.percentage = Math.max(0, cat.percentage - decrease)
      remaining -= decrease
    }
  }
  
  if (remaining > 0) {
    categories[excludeIndex].percentage = Math.max(0, 
      categories[excludeIndex].percentage - remaining
    )
  }
}

// 입력 필드 핸들링 유틸리티
export const createInputHandlers = (formatFn: (amount: number) => string) => {
  const handleFocus = (event: Event) => {
    const target = event.target as HTMLInputElement
    target.value = extractNumericString(target.value)
    target.select()
  }

  const handleBlur = (event: Event) => {
    const target = event.target as HTMLInputElement
    const amount = parseInt(extractNumericString(target.value)) || 0
    target.value = formatFn(amount)
  }

  return { handleFocus, handleBlur }
}