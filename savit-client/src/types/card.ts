export interface registerCardForm {
  organization: string //카드사
  encryptedCardNo: string
  cardPassword: string
  loginId: string // 카드사 사용자 아이디
  loginPw: string // 카드사 사용자 비밀번호
  birthDate: string // 사용자 생년월일
}

export interface Card {
  cardId: string
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
  cardId: string
  amount: number
  month: string
}

export interface UsageDetail {
  id: string
  cardId: string
  date: string
  merchant: string
  amount: number
  category: string
}
