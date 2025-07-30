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
  authStore.restoreAuthentication()
})
</script>

<style scoped></style>
