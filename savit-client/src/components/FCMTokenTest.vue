<template>
  <div class="fcm-test-container">
    <h3>🧪 FCM 토큰 테스트</h3>

    <div class="test-buttons">
      <button @click="testNotificationPermission" class="test-btn primary">
        🔔 알림 권한 요청 & 토큰 생성
      </button>

      <button @click="checkCurrentToken" class="test-btn secondary">📱 현재 토큰 확인</button>

      <button @click="testServiceWorker" class="test-btn info">⚙️ Service Worker 상태 확인</button>
    </div>

    <div v-if="testResult" class="test-result">
      <h4>📊 테스트 결과:</h4>
      <pre>{{ testResult }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { handleAllowNotification } from '../service/firebase/notificationPermission'
import { getToken } from 'firebase/messaging'
import { messaging } from '../service/firebase/initFirebase'

const testResult = ref('')

/**
 * 알림 권한 요청 및 토큰 생성 테스트
 */
const testNotificationPermission = async () => {
  try {
    testResult.value = '🔄 알림 권한 요청 중...'
    await handleAllowNotification()
    testResult.value = '✅ 알림 권한 요청 완료! 콘솔을 확인하세요.'
  } catch (error) {
    testResult.value = `❌ 에러 발생: ${error}`
    console.error('테스트 에러:', error)
  }
}

/**
 * 현재 FCM 토큰 확인
 */
const checkCurrentToken = async () => {
  try {
    testResult.value = '🔍 토큰 확인 중...'

    const permission = Notification.permission
    if (permission !== 'granted') {
      testResult.value = '❌ 알림 권한이 없습니다. 먼저 권한을 허용해주세요.'
      return
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    })

    if (token) {
      testResult.value = `✅ 현재 FCM 토큰:\n${token}\n\n📏 토큰 길이: ${token.length}자`
    } else {
      testResult.value = '❌ 토큰을 가져올 수 없습니다.'
    }
  } catch (error) {
    testResult.value = `❌ 토큰 확인 중 에러: ${error}`
    console.error('토큰 확인 에러:', error)
  }
}

/**
 * Service Worker 상태 확인
 */
const testServiceWorker = async () => {
  try {
    testResult.value = '🔍 Service Worker 상태 확인 중...'

    if (!('serviceWorker' in navigator)) {
      testResult.value = '❌ 이 브라우저는 Service Worker를 지원하지 않습니다.'
      return
    }

    const registration = await navigator.serviceWorker.getRegistration()

    if (registration) {
      const state = registration.active?.state || 'unknown'
      testResult.value = `✅ Service Worker 등록됨\n상태: ${state}\nScope: ${registration.scope}`
    } else {
      testResult.value = '❌ Service Worker가 등록되지 않았습니다.'
    }
  } catch (error) {
    testResult.value = `❌ Service Worker 확인 중 에러: ${error}`
    console.error('Service Worker 확인 에러:', error)
  }
}
</script>

<style scoped>
.fcm-test-container {
  padding: 20px;
  border: 2px dashed #007bff;
  border-radius: 8px;
  margin: 20px 0;
  background-color: #f8f9fa;
}

.test-buttons {
  display: flex;
  gap: 10px;
  margin: 15px 0;
  flex-wrap: wrap;
}

.test-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.test-btn.primary {
  background-color: #007bff;
  color: white;
}

.test-btn.secondary {
  background-color: #6c757d;
  color: white;
}

.test-btn.info {
  background-color: #17a2b8;
  color: white;
}

.test-btn:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

.test-result {
  margin-top: 15px;
  padding: 15px;
  background-color: #fff;
  border-radius: 5px;
  border-left: 4px solid #007bff;
}

.test-result pre {
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  margin: 0;
}
</style>
