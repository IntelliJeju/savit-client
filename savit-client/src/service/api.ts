/**
 * API 통신 모듈
 *
 * 이 파일은 FCM 토큰을 서버로 전송하는 API 통신 기능을 제공합니다.
 * 서버는 이 토큰을 저장하여 특정 사용자에게 푸시 알림을 보낼 수 있습니다.
 */

/**
 * FCM 토큰을 서버로 전송하는 함수
 *
 * 생성된 FCM 토큰을 백엔드 서버로 전송하여 저장합니다.
 * 서버는 이 토큰을 사용하여 해당 사용자에게 푸시 알림을 보낼 수 있습니다.
 *
 * @async
 * @function sendTokenToServer
 * @param {string} token - Firebase에서 생성된 FCM 토큰
 * @returns {Promise<void>} 비동기 처리 완료
 *
 * @throws {Error} 서버 통신 실패 시 에러 발생
 *
 * @example
 * // FCM 토큰 생성 후 서버로 전송
 * import { sendTokenToServer } from './api'
 *
 * const token = await getToken(messaging, { vapidKey })
 * await sendTokenToServer(token)
 */

import { useApi } from '@/api/useApi'

const { request } = useApi()

export async function sendTokenToServer(token: string): Promise<void> {
  try {
    /**
     * 서버 API 엔드포인트에 FCM 토큰 전송
     *
     * HTTP POST 요청을 통해 토큰을 서버로 전송합니다.
     * 서버에서는 이 토큰을 데이터베이스에 저장하고,
     * 사용자 정보와 연결하여 관리합니다.
     */
    await request({
      method: 'POST',
      url: '/notifications/token',
      data: {
        fcmToken: token,
        deviceType: 'WEB',
      },
    })

    // 성공적으로 토큰이 서버에 저장됨
    console.log('FCM token sent to server successfully')
  } catch (error) {
    /**
     * 에러 처리
     *
     * 발생 가능한 에러 유형:
     * 1. 네트워크 연결 실패
     * 2. 서버 응답 에러 (4xx, 5xx 상태 코드)
     * 3. 인증 에러
     * 4. 타임아웃 에러
     */
    console.error('Error sending token to server:', error)

    // 에러를 다시 throw하여 호출하는 곳에서 처리할 수 있도록 함
    throw error
  }
}
