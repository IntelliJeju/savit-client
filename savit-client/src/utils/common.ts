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
