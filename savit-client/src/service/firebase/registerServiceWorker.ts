/**
 * Service Worker 등록 모듈
 *
 * 이 파일은 Firebase Cloud Messaging에서 백그라운드 메시지를 처리하기 위한
 * Service Worker를 브라우저에 등록하는 기능을 제공합니다.
 */

/**
 * Service Worker 등록 함수
 *
 * Firebase Messaging에서 백그라운드 푸시 알림을 받기 위해서는
 * Service Worker가 필요합니다. 이 함수는 public 폴더에 있는
 * firebase-messaging-sw.js 파일을 Service Worker로 등록합니다.
 *
 * Service Worker의 역할:
 * - 웹 앱이 백그라운드에 있을 때 푸시 메시지 수신
 * - 브라우저 알림 표시
 * - 오프라인 상태에서도 알림 처리 가능
 *
 * @function registerServiceWorker
 * @returns {void}
 *
 * @example
 * // 알림 권한 요청 전에 호출
 * import { registerServiceWorker } from './registerServiceWorker'
 *
 * registerServiceWorker()
 */
export function registerServiceWorker(): void {
  // 브라우저가 Service Worker를 지원하는지 확인
  // 대부분의 모던 브라우저에서 지원하지만, 일부 구형 브라우저는 미지원
  if ('serviceWorker' in navigator) {
    /**
     * Service Worker 파일 등록
     *
     * @param {string} '/firebase-messaging-sw.js' - Service Worker 파일 경로
     * - 이 파일은 public 폴더에 위치해야 함 (정적 파일)
     * - 브라우저가 이 파일을 다운로드하고 백그라운드에서 실행
     * - FCM 메시지를 받으면 이 파일의 이벤트 핸들러가 동작
     */
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js')
      .then((registration) => {
        // Service Worker 등록 성공
        // registration 객체에는 Service Worker의 상태 정보가 포함됨

        /**
         * registration 객체 주요 속성:
         * - scope: Service Worker가 제어하는 범위
         * - active: 현재 활성화된 Service Worker
         * - installing: 설치 중인 Service Worker
         * - waiting: 대기 중인 Service Worker
         */
      })
      .catch((error) => {
        // Service Worker 등록 실패
        // 주요 실패 원인:
        // 1. firebase-messaging-sw.js 파일이 존재하지 않음
        // 2. 파일에 구문 오류가 있음
        // 3. 네트워크 연결 문제
        // 4. HTTPS가 아닌 환경 (localhost 제외)
        console.error('Service Worker registration failed:', error)
      })
  } else {
    // Service Worker를 지원하지 않는 브라우저
    // 이 경우 FCM 백그라운드 메시지를 받을 수 없음
    console.warn('Service Worker is not supported in this browser')
  }
}
