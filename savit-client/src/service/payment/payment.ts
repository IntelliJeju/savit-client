import request from '@/api/axios'

// PortOne 결제 데이터 타입 정의
export interface PaymentData {
  pg: string // PG사 (예: 'html5_inicis')
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

// SDK 로드 대기 함수
const waitForSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 이미 로드되어 있으면 즉시 resolve
    if (window.IMP) {
      resolve()
      return
    }

    // 최대 10초 대기
    let attempts = 0
    const maxAttempts = 100
    
    const checkSDK = () => {
      attempts++
      if (window.IMP) {
        resolve()
      } else if (attempts >= maxAttempts) {
        reject(new Error('PortOne SDK 로드 시간이 초과되었습니다.'))
      } else {
        setTimeout(checkSDK, 100)
      }
    }
    
    checkSDK()
  })
}

// 결제 요청 함수
export const requestPayment = async (data: PaymentData): Promise<PaymentResponse> => {
  try {
    // SDK 로드 대기
    await waitForSDK()
    
    return new Promise((resolve, reject) => {
      // PortOne 초기화 (실제 가맹점 식별코드로 변경 필요)
      window.IMP.init(import.meta.env.VITE_PORTONE_IMP_CODE || 'imp00000000')

      // 결제 요청
      window.IMP.request_pay(
        {
          pg: data.pg,
          pay_method: data.pay_method,
          merchant_uid: data.merchant_uid,
          name: data.name,
          amount: data.amount,
          buyer_email: data.buyer_email,
          buyer_name: data.buyer_name,
          buyer_tel: data.buyer_tel,
          buyer_addr: data.buyer_addr,
          buyer_postcode: data.buyer_postcode,
          m_redirect_url: data.m_redirect_url || `${window.location.origin}/challenge/payment/callback`,
        },
        (rsp: PaymentResponse) => {
          if (rsp.success) {
            resolve(rsp)
          } else {
            reject(new Error(rsp.error_msg || '결제에 실패했습니다.'))
          }
        }
      )
    })
  } catch (error) {
    throw new Error('PortOne SDK가 로드되지 않았습니다. 페이지를 새로고침해주세요.')
  }
}

// 웹훅으로 결제 상태 확인 (기본 방식)
export const checkPaymentStatus = async (merchantUid: string, maxRetries = 5, retryDelay = 2000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await request({
        method: 'GET',
        url: `/payment/status/${merchantUid}`,
      })
      
      // 웹훅이 처리되어 상태가 업데이트된 경우
      if (response.data?.status && response.data.status !== 'pending') {
        return response.data
      }
      
      // 마지막 시도가 아니면 대기
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    } catch (error) {
      console.error(`결제 상태 확인 시도 ${i + 1} 실패:`, error)
      
      // 마지막 시도가 아니면 다음 시도
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        continue
      }
      
      // 마지막 시도에서도 실패하면 fallback 사용
      throw error
    }
  }
  
  // 모든 시도가 실패하면 pending 상태로 리턴
  return { status: 'pending' }
}

// Fallback: 서버에서 직접 결제 검증
export const verifyPayment = async (impUid: string, merchantUid: string) => {
  try {
    const response = await request({
      method: 'POST',
      url: '/payment/verify',
      data: {
        imp_uid: impUid,
        merchant_uid: merchantUid,
      },
    })
    return response
  } catch (error) {
    console.error('결제 검증 실패:', error)
    throw error
  }
}

// 결제 완료 처리 (웹훅 우선, fallback으로 verify 사용)
export const processPaymentCompletion = async (impUid: string, merchantUid: string) => {
  try {
    console.log('웹훅 방식으로 결제 상태 확인 시도...')
    
    // 1. 웹훅으로 결제 상태 확인 시도
    const webhookResult = await checkPaymentStatus(merchantUid)
    
    if (webhookResult.status === 'completed' || webhookResult.status === 'success') {
      console.log('웹훅으로 결제 완료 확인됨')
      return webhookResult
    }
    
    console.log('웹훅 처리 미완료, fallback 방식으로 전환...')
    
    // 2. Fallback: 직접 결제 검증
    const verifyResult = await verifyPayment(impUid, merchantUid)
    console.log('Fallback 결제 검증 완료')
    
    return verifyResult
    
  } catch (error) {
    console.error('결제 처리 실패:', error)
    throw new Error('결제 처리 중 오류가 발생했습니다. 고객센터로 문의해주세요.')
  }
}

// 챌린지 참가 결제 완료 처리
export const completeChallenge = async (challengeId: number, paymentData: any) => {
  try {
    const response = await request({
      method: 'POST',
      url: `/challenges/${challengeId}/join`,
      data: {
        ...paymentData,
        // 웹훅이 먼저 처리되었을 수도 있음을 서버에 알림
        processed_via_webhook: true,
      },
    })
    return response
  } catch (error) {
    console.error('챌린지 참가 실패:', error)
    
    // 이미 웹훅으로 처리되었을 가능성 확인
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } }
      if (axiosError.response?.status === 409) {
        console.log('이미 웹훅으로 처리된 결제입니다.')
        return { success: true, message: '이미 처리된 결제입니다.' }
      }
    }
    
    throw error
  }
}

// 고유 주문번호 생성
export const generateMerchantUid = (challengeId: number): string => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `challenge_${challengeId}_${timestamp}_${random}`
}