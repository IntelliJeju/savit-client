// import { useApi } from '@/api/useApi'
// import type {
//   PaymentInitRequest,
//   PaymentInitResponse,
//   PaymentResponse,
//   PaymentData,
// } from '@/types/payment'

// const { request } = useApi()

// // SDK 로드 및 초기화 함수
// const loadAndInitSDK = (): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     const impCode = import.meta.env.VITE_IAMPORT_CODE

//     if (!impCode) {
//       reject(new Error('VITE_IAMPORT_CODE가 설정되지 않았습니다.'))
//       return
//     }

//     // 이미 로드되어 있으면 초기화만 다시 실행
//     if (window.IMP) {
//       window.IMP.init(impCode)
//       resolve()
//       return
//     }

//     // SDK 스크립트 동적 로드
//     const script = document.createElement('script')
//     script.src = 'https://cdn.iamport.kr/v1/iamport.js'
//     script.onload = () => {
//       // SDK 초기화
//       if (window.IMP) {
//         window.IMP.init(impCode)
//         resolve()
//       } else {
//         reject(new Error('PortOne SDK 초기화에 실패했습니다.'))
//       }
//     }
//     script.onerror = () => reject(new Error('PortOne SDK 로드에 실패했습니다.'))
//     document.head.appendChild(script)
//   })
// }

// // 결제 초기화 함수
// export const initializePayment = async (data: PaymentInitRequest): Promise<PaymentInitResponse> => {
//   try {
//     const response = await request({
//       method: 'POST',
//       url: '/payments/init',
//       data,
//     })
//     return response
//   } catch (error) {
//     console.error('결제 초기화 실패:', error)
//     throw new Error('결제 초기화에 실패했습니다.')
//   }
// }

// // 결제 요청 함수
// export const requestPayment = async (data: PaymentData): Promise<PaymentResponse> => {
//   try {
//     // SDK 로드 및 초기화
//     await loadAndInitSDK()

//     return new Promise((resolve, reject) => {
//       // 결제 요청
//       window.IMP.request_pay(
//         {
//           pg: data.pg,
//           pay_method: data.pay_method,
//           merchant_uid: data.merchant_uid,
//           name: data.name,
//           amount: data.amount,
//           buyer_email: data.buyer_email,
//           buyer_name: data.buyer_name,
//           buyer_tel: data.buyer_tel,
//           buyer_addr: data.buyer_addr,
//           buyer_postcode: data.buyer_postcode,
//           m_redirect_url:
//             data.m_redirect_url || `${window.location.origin}/challenge/payment/callback`,
//         },
//         (rsp: PaymentResponse) => {
//           if (rsp.success) {
//             resolve(rsp)
//           } else {
//             reject(new Error(rsp.error_msg || '결제에 실패했습니다.'))
//           }
//         },
//       )
//     })
//   } catch (error) {
//     throw new Error('PortOne SDK가 로드되지 않았습니다. 페이지를 새로고침해주세요.')
//   }
// }

// // 폴링 방식으로 결제 상태 확인 (웹훅 처리 대기)
// export const checkPaymentStatus = async (merchantUid: string, timeout = 8000, interval = 700) => {
//   const deadline = Date.now() + timeout

//   while (Date.now() < deadline) {
//     try {
//       const response = await request({
//         method: 'GET',
//         url: '/payments/status',
//         params: { merchantUid },
//       })

//       const status = response.data?.status

//       // 웹훅이 처리되어 상태가 업데이트된 경우
//       if (status === 'SUCCESS') {
//         return { status: 'SUCCESS', confirmed: true }
//       }

//       if (status === 'FAILED' || status === 'CANCELLED') {
//         return { status: 'FAILED', confirmed: true }
//       }

//       // 아직 처리 중이면 대기
//       await new Promise((resolve) => setTimeout(resolve, interval))
//     } catch (error) {
//       console.error('결제 상태 확인 실패:', error)
//       // 에러가 나도 계속 시도
//       await new Promise((resolve) => setTimeout(resolve, interval))
//     }
//   }

//   // 타임아웃 시 fallback 사용 필요
//   return { status: 'TIMEOUT', confirmed: false }
// }

// // Fallback: 서버에서 직접 결제 검증
// export const verifyPayment = async (impUid: string, merchantUid: string) => {
//   try {
//     const response = await request({
//       method: 'POST',
//       url: '/payments/verify',
//       data: {
//         impUid,
//         merchantUid,
//       },
//     })
//     return response.data
//   } catch (error) {
//     console.error('결제 검증 실패:', error)
//     throw error
//   }
// }

// // 전체 결제 프로세스 통합 함수
// export const processPayment = async (challengeId: number, desiredAmount?: number) => {
//   try {
//     // 1. 결제 초기화
//     console.log('결제 초기화 시작...')
//     const { merchantUid, amount } = await initializePayment({ challengeId, desiredAmount })

//     // 2. 결제창 호출
//     console.log('결제창 호출...')
//     const paymentResult = await requestPayment({
//       pg: 'kakaopay.TC0ONETIME',
//       pay_method: 'card',
//       merchant_uid: merchantUid,
//       name: `챌린지 ${challengeId} 예치금`,
//       amount,
//     })

//     // 3. 웹훅 처리 대기 (폴링)
//     console.log('웹훅 처리 대기...')
//     const statusResult = await checkPaymentStatus(merchantUid)

//     if (statusResult.confirmed && statusResult.status === 'SUCCESS') {
//       console.log('웹훅으로 결제 완료 확인')
//       return { success: true, method: 'webhook', data: statusResult }
//     }

//     // 4. Fallback: 직접 검증
//     if (!statusResult.confirmed) {
//       console.log('Fallback 검증 시도...')
//       const verifyResult = await verifyPayment(paymentResult.imp_uid, merchantUid)

//       // 검증 후 상태 재확인
//       const finalStatus = await checkPaymentStatus(merchantUid, 2000, 500) // 짧은 재확인

//       if (finalStatus.status === 'SUCCESS') {
//         console.log('Fallback 검증 성공')
//         return { success: true, method: 'fallback', data: verifyResult }
//       }
//     }

//     throw new Error('결제 처리에 실패했습니다.')
//   } catch (error) {
//     console.error('결제 프로세스 실패:', error)
//     throw new Error('결제 처리 중 오류가 발생했습니다. 고객센터로 문의해주세요.')
//   }
// }

import apiClient from '@/api/axios'
import { useApi } from '@/api/useApi'

const { request } = useApi()

/** ———————— Types ———————— */
export interface InitPaymentResponse {
  merchantUid: string
  amount: number
}

export interface PaymentData {
  merchant_uid: string
  name: string
  amount: number
  buyer_email?: string
  buyer_name?: string
  buyer_tel?: string
  buyer_addr?: string
  buyer_postcode?: string
  m_redirect_url?: string
}

export interface PaymentResponse {
  success: boolean
  imp_uid: string
  merchant_uid: string
  paid_amount: number
  status: string
  name: string
  pg_provider: string
  pg_type: string
  pay_method: string
  paid_at: number
  receipt_url: string
  error_code?: string
  error_msg?: string
}

/** ———————— Constants ———————— */
const PG = 'kakaopay.TC0ONETIME' // 카카오 테스트 전용 CID
const PAY_METHOD = 'card' // TC0ONETIME 조합 시 card

/** ———————— Helpers ———————— */
const waitForSDK = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if ((window as any).IMP) return resolve()
    let attempts = 0
    const maxAttempts = 100
    const check = () => {
      attempts++
      if ((window as any).IMP) resolve()
      else if (attempts >= maxAttempts) reject(new Error('PortOne SDK 로드 시간이 초과되었습니다.'))
      else setTimeout(check, 100)
    }
    check()
  })

/** ———————— API ———————— */

/** 결제 초기화: 서버가 merchantUid/amount 확정 후 반환 */
export const initPayment = async (payload: { challengeId: number; desiredAmount: number }) => {
  const res = await request({ url: '/payments/init', method: 'POST', data: payload })
  // const res = await apiClient.post<InitPaymentResponse>('/payments/init', payload)
  return res
}

/** PortOne 결제 요청 (카카오 전용) */
export const requestPayment = async (data: PaymentData): Promise<PaymentResponse> => {
  await waitForSDK()
  return new Promise((resolve, reject) => {
    const IMP: any = (window as any).IMP
    const impCode = import.meta.env.VITE_IAMPORT_CODE
    
    if (!impCode) {
      reject(new Error('VITE_IAMPORT_CODE가 설정되지 않았습니다.'))
      return
    }
    
    IMP.init(impCode)

    IMP.request_pay(
      {
        pg: PG, // 카카오 고정
        pay_method: PAY_METHOD, // 카카오 고정
        merchant_uid: data.merchant_uid,
        name: data.name,
        amount: data.amount,
        buyer_email: data.buyer_email,
        buyer_name: data.buyer_name,
        buyer_tel: data.buyer_tel,
        buyer_addr: data.buyer_addr,
        buyer_postcode: data.buyer_postcode,
        m_redirect_url:
          data.m_redirect_url || `${window.location.origin}/challenge/payment/callback`,
      },
      (rsp: PaymentResponse) => {
        if (rsp.success) resolve(rsp)
        else reject(new Error(rsp.error_msg || '결제에 실패했습니다.'))
      },
    )
  })
}

/** 웹훅 반영 상태 폴링 */
export const checkPaymentStatus = async (
  merchantUid: string,
  maxRetries = 5,
  retryDelay = 2000,
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await apiClient.get<{ status: string; [k: string]: any }>('/payments/status', {
        params: { merchantUid },
      })
      const status = String(res.data?.status || '').toUpperCase()
      if (status && status !== 'PENDING') return res.data
      if (i < maxRetries - 1) await new Promise((r) => setTimeout(r, retryDelay))
    } catch (error) {
      if (i < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, retryDelay))
        continue
      }
      throw error
    }
  }
  return { status: 'PENDING' }
}

/** 폴백 검증 (웹훅 지연/미수신 시) */
export const verifyPayment = async (impUid: string, merchantUid: string) => {
  const res = await apiClient.post('/payments/verify', { impUid, merchantUid })
  return res.data
}

/** 완료 처리: 웹훅 우선 → verify 폴백 */
export const processPaymentCompletion = async (impUid: string, merchantUid: string) => {
  const webhookResult = await checkPaymentStatus(merchantUid)
  const statusUpper = String((webhookResult as any)?.status || '').toUpperCase()
  if (statusUpper === 'SUCCESS' || statusUpper === 'COMPLETED') return webhookResult
  return await verifyPayment(impUid, merchantUid)
}

/** ---------------- High-level Helper ---------------- */
export const startChallengePayment = async (opts: {
  challengeId: number
  desiredAmount: number
  title?: string
  buyer?: { email?: string; name?: string; tel?: string; addr?: string; postcode?: string }
}) => {
  const init = await initPayment({
    challengeId: opts.challengeId,
    desiredAmount: opts.desiredAmount,
  })

  const payRsp = await requestPayment({
    merchant_uid: init.merchantUid,
    name: opts.title || '챌린지 예치금 결제',
    amount: init.amount,
    buyer_email: opts.buyer?.email,
    buyer_name: opts.buyer?.name,
    buyer_tel: opts.buyer?.tel,
    buyer_addr: opts.buyer?.addr,
    buyer_postcode: opts.buyer?.postcode,
  })

  const final = await processPaymentCompletion(payRsp.imp_uid, payRsp.merchant_uid)
  return { init, payRsp, final }
}
