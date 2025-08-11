// 개별 챌린지 타입
export interface Challenge {
  title: string
  categoryName: string
  description: string
  startDate: string
  endDate: string
  entryFee: number
  durationWeeks: number
  targetCount: number | null
  targetAmount: number | null
  type: 'COUNT' | 'AMOUNT'
  totalParticipants: number
  joinedParticipants: number
  eligibility: number
}

// 기존 인터페이스도 유지
export interface availChallengeList {
  challengeId: number
  title: string
  startDate: string
  endDate: string
  categoryName: string
}

export interface ParticipatingChallenge {
  categoryName: null
  challengeId: number
  endDate: string
  startDate: string
  title: string
}

export interface ParticipatingChallengeDetail {
  challengeId: number
  endDate: string
  entryFee: number
  expectedPrize: number
  joinedParticipants: number
  myFee: number
  participants: participants[]
  participatingParticipants: number
  startDate: string
  targetAmount: number
  targetCount: number | null
  title: string
}

export interface Participants {
  nickName: string
  challengeAmount: number
  challengeCount: number
  status: 'PARTICIPATING' | 'SUCCESS' | 'FAIL'
}

export interface Statistics {
  challengeId: number
  title: string
  startDate: string
  endDate: string
  status: 'SUCCESS' | 'FAIL'
  my_fee: number
  prize: number
}
