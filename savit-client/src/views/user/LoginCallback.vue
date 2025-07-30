<template>
  <div>Login...</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.ts'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const { setJWTToken } = authStore

onMounted(() => {
  console.log(route)
  const auth = route.query.accessToken as string
  const refresh = route.query.refreshToken as string
  setJWTToken(auth, refresh)
  router.replace('/home')
})
</script>

<style scoped></style>
