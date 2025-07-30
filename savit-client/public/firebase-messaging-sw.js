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
 * 웹 앱이 백그라운드에 있거나 닫혀있을 때 FCM 메시지를 수신하면
 * 이 이벤트 핸들러가 실행됩니다.
 * 
 * @param {Object} payload - 서버에서 전송된 푸시 메시지 데이터
 * @param {Object} payload.notification - 알림 내용
 * @param {string} payload.notification.title - 알림 제목
 * @param {string} payload.notification.body - 알림 본문
 * @param {Object} payload.data - 추가 사용자 정의 데이터 (선택사항)
 */
messaging.onBackgroundMessage((payload) => {
  // 수신된 메시지를 콘솔에 로깅 (디버깅 용도)
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  /**
   * 알림 제목 추출
   * 
   * 서버에서 전송한 notification.title을 사용합니다.
   * 만약 title이 없다면 기본값을 사용할 수 있습니다.
   */
  const notificationTitle = payload.notification.title || 'Savit 알림';
  
  /**
   * 알림 옵션 설정
   * 
   * 브라우저 알림에 표시될 내용과 스타일을 정의합니다.
   */
  const notificationOptions = {
    body: payload.notification.body || '새로운 알림이 도착했습니다.',
    icon: '/favicon.ico', // 알림에 표시될 아이콘 (public 폴더 기준)
    badge: '/favicon.ico', // 작은 배지 아이콘
    
    // 추가 옵션들 (필요에 따라 사용)
    // tag: 'savit-notification', // 같은 태그의 알림은 하나만 표시
    // requireInteraction: true, // 사용자가 직접 닫을 때까지 표시
    // silent: false, // 소리와 진동 허용
    // vibrate: [200, 100, 200], // 진동 패턴 (모바일)
    
    // 사용자 정의 데이터 저장 (알림 클릭 시 활용 가능)
    data: {
      url: payload.data?.url || '/', // 클릭 시 이동할 URL
      clickAction: payload.data?.clickAction,
      ...payload.data // 서버에서 전송한 추가 데이터
    }
  };

  /**
   * 브라우저 알림 표시
   * 
   * Service Worker의 registration 객체를 통해
   * 브라우저 네이티브 알림을 표시합니다.
   * 
   * 이 알림은 운영체제의 알림 센터에 표시되며,
   * 사용자가 클릭하면 notificationclick 이벤트가 발생합니다.
   */
  self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * 알림 클릭 이벤트 처리 (선택사항)
 * 
 * 사용자가 알림을 클릭했을 때의 동작을 정의합니다.
 * 일반적으로 해당 페이지로 이동하거나 앱을 활성화합니다.
 */
self.addEventListener('notificationclick', function(event) {
  // 알림을 닫습니다
  event.notification.close();
  
  // 알림 데이터에서 URL 추출
  const targetUrl = event.notification.data?.url || '/';
  
  // 브라우저 창을 열거나 기존 창으로 포커스 이동
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // 이미 열린 창이 있는지 확인
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus(); // 기존 창으로 포커스 이동
        }
      }
      
      // 열린 창이 없으면 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});