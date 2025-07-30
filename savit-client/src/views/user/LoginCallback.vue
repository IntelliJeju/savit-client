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
  const auth = route.params.auth as string
  const refresh = route.params.refresh as string
  setJWTToken(auth, refresh)
  router.replace('/home')
})
</script>

<style scoped></style>
