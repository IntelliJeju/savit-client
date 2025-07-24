<template>
  <div>
    ChallengeMain.vue
    <button @click="test">이동</button>
  </div>
</template>

<script setup lang="ts">
import router from '@/router/index.ts'

const test = () => {
  router.push('/challenge/detail')
}
</script>

<style scoped></style>
