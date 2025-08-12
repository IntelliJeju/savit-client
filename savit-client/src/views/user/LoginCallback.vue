<template>
  <div>Login...</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.ts'
import { handleAllowNotification } from '@/service/firebase/notificationPermission'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const { setJWTToken } = authStore

onMounted(async () => {
  console.log(route)
  const access = route.query.accessToken as string
  const refresh = route.query.refreshToken as string
  setJWTToken(access, refresh)

  // 로그인 완료 후 FCM 토큰 전송
  try {
    await handleAllowNotification()
    console.log('FCM 토큰 설정 완료')
  } catch (error) {
    console.error('FCM 토큰 설정 실패:', error)
    // FCM 토큰 설정 실패해도 로그인은 계속 진행
  }

  router.replace('/home')
})
</script>

<style scoped></style>
