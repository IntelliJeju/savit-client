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