<template>
  <div>
    <MainLayout />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import MainLayout from './layout/MainLayout.vue'
import { useAuthStore } from './stores/auth.ts'

const authStore = useAuthStore()

onMounted(() => {
  localStorage.setItem(
    'accessToken',
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc1NDg5Mzg5MywiZXhwIjoxNzU0ODk3NDkzfQ.qSkQiF_yZrG7bS3Ax8PDxPPUbFxQb2FaeyxvxoOsPSA',
  )
  localStorage.setItem(
    'refreshToken',
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NTQ4OTM4OTMsImV4cCI6MTc1NTQ5ODY5M30.DU6HCJUFIlR1c2UfNOJGhDM73ru4OZvuk5StT8nQFKc',
  )
  // authStore.restoreAuthentication()
})
</script>

<style scoped></style>
