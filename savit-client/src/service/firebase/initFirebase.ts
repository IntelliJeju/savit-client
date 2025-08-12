/**
 * Firebase 초기화 및 설정 파일
 * 
 * 이 파일은 Firebase 프로젝트를 웹 애플리케이션에 연결하고,
 * FCM(Firebase Cloud Messaging) 서비스를 초기화하는 역할을 합니다.
 */

// Firebase SDK에서 필요한 함수들을 import
import { initializeApp } from 'firebase/app' // Firebase 앱 초기화를 위한 함수
import { getAnalytics } from 'firebase/analytics' // Firebase Analytics 서비스
import { getMessaging } from 'firebase/messaging' // Firebase Cloud Messaging 서비스

/**
 * Firebase 프로젝트 설정 정보
 * 
 * Firebase 콘솔에서 생성한 웹 앱의 구성 정보입니다.
 * 이 정보를 통해 클라이언트가 Firebase 서비스에 연결됩니다.
 * 
 * @property {string} apiKey - Firebase API 키 (공개 키, 보안에 민감하지 않음)
 * @property {string} authDomain - Firebase 인증 도메인
 * @property {string} projectId - Firebase 프로젝트 고유 ID
 * @property {string} storageBucket - Cloud Storage 버킷 URL
 * @property {string} messagingSenderId - FCM 발신자 ID (프로젝트 번호와 동일)
 * @property {string} appId - Firebase 웹 앱 고유 ID
 * @property {string} measurementId - Google Analytics 측정 ID
 */
const firebaseConfig = {
  apiKey: 'AIzaSyAtczVb0XotMNJMjgW3NY1bjOiwAv0xSyo',
  authDomain: 'savit-notification.firebaseapp.com',
  projectId: 'savit-notification',
  storageBucket: 'savit-notification.firebasestorage.app',
  messagingSenderId: '821715391761',
  appId: '1:821715391761:web:695c576be094bc8932e8b0',
  measurementId: 'G-C2HWCMS6KQ',
}

/**
 * Firebase 앱 초기화
 * 
 * firebaseConfig 객체를 사용하여 Firebase 앱 인스턴스를 생성합니다.
 * 이 인스턴스는 모든 Firebase 서비스의 기반이 됩니다.
 */
const app = initializeApp(firebaseConfig)

/**
 * Firebase Analytics 초기화
 * 
 * 웹 앱의 사용자 행동을 추적하고 분석하기 위한 서비스입니다.
 * 페이지 뷰, 이벤트 등을 자동으로 수집합니다.
 */
const analytics = getAnalytics(app)

/**
 * Firebase Cloud Messaging 초기화 및 Export
 * 
 * FCM 서비스 인스턴스를 생성하고 다른 파일에서 사용할 수 있도록 export합니다.
 * 이 messaging 객체를 통해 푸시 알림 토큰을 생성하고 메시지를 처리할 수 있습니다.
 * 
 * @constant {Messaging} messaging - FCM 서비스 인스턴스
 */
export const messaging = getMessaging(app)
