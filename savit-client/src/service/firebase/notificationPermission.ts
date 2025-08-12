/**
 * 알림 권한 요청 및 FCM 토큰 관리 모듈
 *
 * 이 파일은 사용자에게 알림 권한을 요청하고,
 * FCM 토큰을 생성하여 서버로 전송하는 핵심 로직을 담고 있습니다.
 */

import { getToken } from 'firebase/messaging' // FCM 토큰 생성을 위한 함수
import { sendTokenToServer } from './api' // 서버로 토큰 전송하는 API 함수
import { messaging } from './initFirebase' // 초기화된 FCM 인스턴스
import { registerServiceWorker } from './registerServiceWorker' // Service Worker 등록 함수

/**
 * 알림 허용 처리 메인 함수
 *
 * 이 함수는 전체 FCM 알림 설정 프로세스를 관리합니다:
 * 1. Service Worker 등록
 * 2. 브라우저 알림 권한 요청
 * 3. FCM 토큰 생성
 * 4. 서버로 토큰 전송
 *
 * @async
 * @function handleAllowNotification
 * @returns {Promise<void>} 비동기 처리 완료
 *
 * @example
 * // Vue 컴포넌트에서 버튼 클릭 시 호출
 * import { handleAllowNotification } from './service/firebase/notificationPermission'
 *
 * const enableNotifications = () => {
 *   handleAllowNotification()
 * }
 */
export async function handleAllowNotification(): Promise<void> {
  // 1단계: Service Worker 등록
  // FCM 메시지를 백그라운드에서 받기 위해 필요
  registerServiceWorker()

  try {
    // 2단계: 브라우저에게 알림 권한 요청
    // 사용자에게 "이 사이트가 알림을 보내도록 허용하시겠습니까?" 팝업 표시
    const permission = await Notification.requestPermission()

    // 3단계: 권한 승인 시 FCM 토큰 생성 및 서버 전송
    if (permission === 'granted') {
      /**
       * FCM 토큰 생성
       *
       * @param {Messaging} messaging - FCM 인스턴스
       * @param {Object} options - 토큰 생성 옵션
       * @param {string} options.vapidKey - VAPID 공개 키 (환경변수에서 가져옴)
       *
       * VAPID 키는 서버가 푸시 알림을 보낼 때 신원을 증명하는 역할을 합니다.
       * Firebase 콘솔의 프로젝트 설정 > 클라우드 메시징 탭에서 확인 가능합니다.
       */
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      })

      if (token) {
        // 🧪 테스트용: 토큰을 콘솔에 출력
        console.log('✅ FCM 토큰 생성 성공!')
        console.log('📱 FCM Token:', token)
        console.log('📏 토큰 길이:', token.length)

        // 토큰 생성 성공 시 서버로 전송
        // 서버는 이 토큰을 저장하여 나중에 해당 사용자에게 푸시 알림을 보낼 수 있습니다
        sendTokenToServer(token)
      } else {
        // 토큰 생성 실패 시 사용자에게 안내
        // 일반적으로 권한이 제대로 허용되지 않았거나 VAPID 키가 잘못된 경우 발생
        alert('토큰 등록이 불가능 합니다. 생성하려면 권한을 허용해주세요')
      }
    } else if (permission === 'denied') {
      // 4단계: 권한 거부 시 사용자에게 안내
      // 사용자가 "차단" 또는 "허용 안 함"을 선택한 경우
      alert('web push 권한이 차단되었습니다. 알림을 사용하시려면 권한을 허용해주세요')
    }
    // permission === 'default'인 경우는 별도 처리하지 않음 (사용자가 팝업을 닫은 경우)
  } catch (error) {
    // 5단계: 에러 처리
    // 네트워크 오류, VAPID 키 오류, 브라우저 호환성 문제 등을 처리
    console.error('푸시 토큰 가져오는 중에 에러 발생', error)
  }
}
