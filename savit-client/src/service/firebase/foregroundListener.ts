/**
 * 포어그라운드 알림 리스너 모듈
 *
 * 이 파일은 웹 앱이 열려있을 때 (포어그라운드) FCM 메시지를 
 * 수신하고 처리하는 기능을 제공합니다.
 * 
 * Service Worker는 백그라운드에서만 동작하므로,
 * 앱이 활성화되어 있을 때는 이 리스너가 메시지를 처리합니다.
 */

import { onMessage } from 'firebase/messaging'
import { messaging } from './initFirebase'

/**
 * 포어그라운드 메시징 설정 함수
 * 
 * 앱이 열려있을 때 FCM 메시지를 받아 브라우저 알림으로 표시합니다.
 * 이 함수는 앱 시작 시 한 번 호출되어야 합니다.
 * 
 * @function setupForegroundMessaging
 * @returns {void}
 * 
 * @example
 * // main.ts 또는 App.vue에서 앱 초기화 시 호출
 * import { setupForegroundMessaging } from './service/firebase/foregroundListener'
 * 
 * setupForegroundMessaging()
 */
export function setupForegroundMessaging(): void {
  /**
   * 포어그라운드 메시지 수신 리스너
   * 
   * 백엔드에서 FCM 메시지를 보낼 때 data 페이로드로 전송된 내용을 처리합니다.
   * 백그라운드와 달리 포어그라운드에서는 자동으로 알림이 표시되지 않으므로
   * 수동으로 Notification API를 사용해야 합니다.
   * 
   * @param {Object} payload - FCM 메시지 페이로드
   * @param {Object} payload.data - 백엔드에서 putData()로 전송한 데이터
   * @param {string} payload.data.title - 알림 제목
   * @param {string} payload.data.body - 알림 본문  
   * @param {string} payload.data.icon - 알림 아이콘 경로
   */
  onMessage(messaging, (payload) => {
    console.log('[foregroundListener] 포어그라운드 메시지 수신:', payload)

    // 백엔드에서 data 페이로드로 전송된 정보 추출
    const messageData = payload.data || {}

    /**
     * 알림 제목과 본문 추출
     * 백엔드 NotificationService에서 putData("title", ...), putData("body", ...)로 전송
     */
    const notificationTitle = messageData.title || 'Savit 알림'
    const notificationBody = messageData.body || '새로운 알림이 도착했습니다.'

    // 브라우저 알림 권한 확인
    if (Notification.permission === 'granted') {
      /**
       * 브라우저 네이티브 알림 표시
       * 
       * Service Worker의 showNotification과 동일한 형태로 구성하여
       * 백그라운드와 포어그라운드에서 일관된 알림 경험을 제공합니다.
       */
      const notification = new Notification(notificationTitle, {
        body: notificationBody,
        icon: messageData.icon || '/favicon.ico', // 백엔드에서 전송한 SAVIT_LOGO_ICON 사용
        badge: '/favicon.ico',
        tag: 'savit-notification', // 같은 태그의 알림은 하나만 표시
        requireInteraction: false, // 자동으로 사라지도록 설정
        
        // 추가 데이터 저장 (알림 클릭 시 사용)
        data: {
          url: '/', // 메인 홈페이지로 이동
          ...messageData // 백엔드에서 전송한 추가 데이터 포함
        }
      })

      /**
       * 알림 클릭 이벤트 처리
       * 
       * 사용자가 알림을 클릭했을 때 메인 홈페이지로 이동합니다.
       * Service Worker의 notificationclick 이벤트와 동일한 동작을 수행합니다.
       */
      notification.onclick = function(event) {
        console.log('[foregroundListener] 포어그라운드 알림 클릭됨')
        
        // 알림 닫기
        notification.close()
        
        // 현재 창을 메인 페이지로 이동 (이미 앱이 열려있으므로)
        window.location.href = '/'
        
        // 창에 포커스 이동
        window.focus()
      }

      // 일정 시간 후 자동으로 알림 닫기 (5초)
      setTimeout(() => {
        notification.close()
      }, 5000)

    } else {
      // 알림 권한이 없는 경우 콘솔에만 출력
      console.warn('[foregroundListener] 알림 권한이 없어 알림을 표시할 수 없습니다.')
      console.log('메시지 내용:', notificationTitle, '-', notificationBody)
    }
  })

  console.log('✅ 포어그라운드 메시징 리스너가 설정되었습니다.')
}