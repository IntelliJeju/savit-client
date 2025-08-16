/**
 * Firebase Cloud Messaging Service Worker
 * 
 * 이 파일은 백그라운드에서 Firebase Cloud Messaging(FCM) 푸시 알림을 처리하는
 * Service Worker입니다. 웹 앱이 닫혀있거나 백그라운드에 있을 때
 * 푸시 알림을 수신하고 브라우저 알림으로 표시하는 역할을 합니다.
 * 
 * 주요 기능:
 * - 백그라운드 푸시 메시지 수신
 * - 브라우저 네이티브 알림 표시
 * - 알림 클릭 이벤트 처리
 * 
 * 주의사항:
 * - 이 파일은 public 폴더에 있어야 함 (정적 파일)
 * - Service Worker 환경에서 실행되므로 DOM 접근 불가
 * - ES6 모듈 문법 사용 불가 (importScripts 사용)
 */

/**
 * Firebase SDK 스크립트 로드
 * 
 * Service Worker 환경에서는 ES6 import를 사용할 수 없으므로
 * importScripts를 사용하여 Firebase SDK를 로드합니다.
 * 
 * firebase-app-compat.js: Firebase 앱 초기화를 위한 호환성 라이브러리
 * firebase-messaging-compat.js: FCM 메시징을 위한 호환성 라이브러리
 */
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

/**
 * Firebase 프로젝트 설정
 * 
 * 메인 앱(initFirebase.ts)과 동일한 설정을 사용해야 합니다.
 * 이 설정을 통해 Service Worker가 올바른 Firebase 프로젝트에 연결됩니다.
 */
const firebaseConfig = {
  apiKey: 'AIzaSyAtczVb0XotMNJMjgW3NY1bjOiwAv0xSyo',
  authDomain: 'savit-notification.firebaseapp.com',
  projectId: 'savit-notification',
  storageBucket: 'savit-notification.firebasestorage.app',
  messagingSenderId: '821715391761',
  appId: '1:821715391761:web:695c576be094bc8932e8b0',
  measurementId: 'G-C2HWCMS6KQ',
};

/**
 * Firebase 앱 초기화
 * 
 * Service Worker 환경에서 Firebase를 초기화합니다.
 * 이는 메인 스레드의 초기화와는 별개로 동작합니다.
 */
firebase.initializeApp(firebaseConfig);

/**
 * Firebase Messaging 인스턴스 생성
 * 
 * Service Worker 환경에서 FCM 메시지를 처리하기 위한
 * messaging 객체를 생성합니다.
 */
const messaging = firebase.messaging();

/**
 * 백그라운드 메시지 처리 이벤트 리스너
 *
 * 백엔드에서 data 페이로드로 전송된 FCM 메시지를 처리합니다.
 * 백엔드 NotificationService에서 putData()로 전송한 내용을 받습니다.
 *
 * @param {Object} payload - 서버에서 전송된 푸시 메시지 데이터
 * @param {Object} payload.data - 백엔드에서 putData()로 전송한 데이터
 * @param {string} payload.data.title - 알림 제목
 * @param {string} payload.data.body - 알림 본문
 * @param {string} payload.data.icon - 알림 아이콘 경로
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // 백엔드에서 data 페이로드로 전송된 정보 추출
  const messageData = payload.data || {};

  /**
   * 알림 제목과 본문 추출
   * 백엔드 NotificationService에서 putData("title", ...), putData("body", ...)로 전송
   */
  const notificationTitle = messageData.title || 'Savit 알림';
  const notificationBody = messageData.body || '새로운 알림이 도착했습니다.';

  /**
   * 알림 옵션 설정
   * 백엔드에서 전송한 아이콘 경로 사용
   */
  const notificationOptions = {
    body: notificationBody,
    icon: messageData.icon || '/favicon.ico', // 백엔드에서 전송한 SAVIT_LOGO_ICON 사용
    badge: '/favicon.ico',
    tag: 'savit-notification', // 같은 태그의 알림은 하나만 표시
    requireInteraction: false, // 자동으로 사라지도록 설정

    // 사용자 정의 데이터 저장 (알림 클릭 시 메인 홈페이지로 이동)
    data: {
      url: '/', // 메인 홈페이지로 이동
      ...messageData // 백엔드에서 전송한 추가 데이터 포함
    }
  };

  // 브라우저 알림 표시
  self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * 알림 클릭 이벤트 처리
 *
 * 사용자가 알림을 클릭했을 때 메인 홈페이지로 이동합니다.
 * 기존에 열린 앱이 있으면 포커스를 이동하고, 없으면 새 창을 엽니다.
 */
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click received');

  // 알림을 닫습니다
  event.notification.close();

  // 메인 홈페이지 URL (요구사항에 따라 고정)
  const targetUrl = '/';

  // 브라우저 창을 열거나 기존 창으로 포커스 이동
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // 이미 열린 앱 창이 있는지 확인
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        // 같은 origin의 창이면 포커스 이동
        if (client.url.indexOf(self.location.origin) === 0 && 'focus' in client) {
          // 메인 페이지로 이동
          return client.navigate(targetUrl).then(() => client.focus());
        }
      }

      // 열린 창이 없으면 새 창으로 메인 페이지 열기
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});