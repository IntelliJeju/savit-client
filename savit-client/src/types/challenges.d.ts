// 개별 챌린지 타입
export interface Challenge {
  title: string
  description: string
  startDate: string
  endDate: string
  entryFee: number
  targetCount: number
  targetAmount: number
  type: string
  joined_count: number
}

// 기존 인터페이스도 유지
export interface availChallengeList {
  challengeId: string
  title: string
  startDate: string
  endDate: string
  categoryName: string
}
