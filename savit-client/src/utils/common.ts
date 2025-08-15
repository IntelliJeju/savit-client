export const calculateDaysProgress = (startDate: string): number => {
  const start = new Date(startDate)
  const today = new Date()
  const diffTime = today.getTime() - start.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(1, diffDays)
}

// 진행률 계산 함수
export const calculateProgress = (start: string, end: string): number => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const today = new Date()

  const totalDuration = endDate.getTime() - startDate.getTime()
  const currentDuration = today.getTime() - startDate.getTime()

  const timeProgress = Math.min(100, Math.max(0, (currentDuration / totalDuration) * 100))

  return Math.round(timeProgress)
}

// 챌린지 상태 판단 함수
export const getChallengeStatus = (startDate: string): '대기중' | '진행중' => {
  const today = new Date()
  const start = new Date(startDate)
  
  // 날짜만 비교 (시간 제외)
  today.setHours(0, 0, 0, 0)
  start.setHours(0, 0, 0, 0)
  
  return today >= start ? '진행중' : '대기중'
}

// 챌린지 진행 일자 계산 (시작 전이면 0일째)
export const calculateDaysProgressWithStatus = (startDate: string): number => {
  const today = new Date()
  const start = new Date(startDate)
  
  // 시작 전이면 0일째
  if (today < start) {
    return 0
  }
  
  // 진행중이면 기존 함수 사용
  return calculateDaysProgress(startDate)
}
