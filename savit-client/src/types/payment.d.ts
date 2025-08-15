// 결제 초기화 요청 데이터
export interface PaymentInitRequest {
  challengeId: number
  desiredAmount?: number
}

// 결제 초기화 응답 데이터
export interface PaymentInitResponse {
  merchantUid: string
  amount: number
}

// PortOne 결제 데이터 타입 정의
export interface PaymentData {
  pg: string // PG사 (예: 'kakaopay.TC0ONETIME')
  pay_method: string // 결제수단 ('card', 'trans', 'vbank' 등)
  merchant_uid: string // 고유 주문번호
  name: string // 결제명
  amount: number // 결제금액
  buyer_email?: string // 구매자 이메일
  buyer_name?: string // 구매자 성명
  buyer_tel?: string // 구매자 연락처
  buyer_addr?: string // 구매자 주소
  buyer_postcode?: string // 구매자 우편번호
  m_redirect_url?: string // 모바일 결제 완료 후 리다이렉트 URL
}

export interface PaymentResponse {
  success: boolean
  imp_uid: string // PortOne 결제 고유번호
  merchant_uid: string // 주문번호
  paid_amount: number // 결제 금액
  status: string // 결제 상태
  name: string // 제품명
  pg_provider: string // PG사
  pg_type: string // PG 타입
  pay_method: string // 결제 수단
  paid_at: number // 결제 승인시각
  receipt_url: string // 영수증 URL
  error_code?: string // 에러 코드
  error_msg?: string // 에러 메시지
}
