/**
 * Budget Calculation Utilities
 * 
 * Contains utility functions for budget calculations and manipulations
 */

// 통화 포맷팅 함수
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('ko-KR')
}

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

// 비율 반올림 및 총합 조정
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

// 현재 월 문자열 생성
export const getCurrentMonth = (): string => {
  const currentDate = new Date()
  return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
}