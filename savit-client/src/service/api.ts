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
export async function sendTokenToServer(token: string): Promise<void> {
  try {
    /**
     * 서버 API 엔드포인트에 FCM 토큰 전송
     *
     * HTTP POST 요청을 통해 토큰을 서버로 전송합니다.
     * 서버에서는 이 토큰을 데이터베이스에 저장하고,
     * 사용자 정보와 연결하여 관리합니다.
     */
    const response = await fetch('/api/fcm/token', {
      method: 'POST', // POST 메소드로 데이터 전송
      headers: {
        'Content-Type': 'application/json', // JSON 형태로 데이터 전송
        // 필요에 따라 인증 헤더 추가 가능
        // 'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        token, // FCM 토큰
        // 추가 정보도 함께 전송 가능
        // userId: getCurrentUserId(),
        // deviceInfo: getDeviceInfo(),
        // timestamp: new Date().toISOString()
      }),
    })

    /**
     * 응답 상태 확인
     *
     * HTTP 상태 코드가 200-299 범위가 아닌 경우
     * (예: 400 Bad Request, 401 Unauthorized, 500 Internal Server Error)
     * 에러를 발생시킵니다.
     */
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`)
    }

    // 성공적으로 토큰이 서버에 저장됨
    console.log('FCM token sent to server successfully')

    // 필요에 따라 서버 응답 데이터 처리
    // const responseData = await response.json();
    // console.log('Server response:', responseData);
  } catch (error) {
    /**
     * 에러 처리
     *
     * 발생 가능한 에러 유형:
     * 1. 네트워크 연결 실패 (TypeError: Failed to fetch)
     * 2. 서버 응답 에러 (4xx, 5xx 상태 코드)
     * 3. JSON 파싱 에러
     * 4. 타임아웃 에러
     */
    console.error('Error sending token to server:', error)

    // 사용자에게 에러 상황 알림 (선택사항)
    // alert('알림 설정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');

    // 에러를 다시 throw하여 호출하는 곳에서 처리할 수 있도록 함
    // throw error;
  }
}
