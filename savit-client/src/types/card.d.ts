export interface registerCardForm {
  organization: string //카드사
  encryptedCardNo: string
  cardPassword: string
  loginId: string // 카드사 사용자 아이디
  loginPw: string // 카드사 사용자 비밀번호
  birthDate: string // 사용자 생년월일
}

export interface Card {
  cardId: number
  cardName: string
  resCardNo: string
  usageAmount: number
  resImageLink: string
}

export interface RegisterResponse {
  connectedId: string
  cards: RegisteredCardInfo[]
}

export interface RegisteredCardInfo {
  resCardName: string
  resCardNo: string
  resCardType: string
  resUserNm: string
  resSleepYN: string
  resTrafficYN: string
  resValidPeriod: string
  resIssueDate: string
  resImageLink: string
  resState: string
}

export interface BillingInfo {
  cardId: number
  amount: number
  month: string
}

export interface UsageDetail {
  id: string
  cardId: number
  date: string
  merchant: string
  amount: number
  category: string
}

export interface Transaction {
  id: string | null
  cardId: number
  budgetCategoryId: number | null
  categoryId: number | null
  resCardNo: string
  resUsedDate: string // YYYYMMDD 형식
  resUsedTime: string // HHMMSS 형식
  resUsedAmount: string // 금액 (string으로 전달됨)
  resCancelYN: string // 취소 여부 (0: 정상, 1: 취소)
  resCancelAmount: string
  resTotalAmount: number | null
  resMemberStoreName: string // 가맹점명
  resMemberStoreType: string // 가맹점 유형
  createdAt: number[] // [년, 월, 일, 시, 분, 초, 나노초] 형식
  updatedAt: number[] // [년, 월, 일, 시, 분, 초, 나노초] 형식
}
