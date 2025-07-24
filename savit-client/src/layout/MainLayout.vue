<template>
  <div class="main-layout h-screen flex flex-col">
    <div class="header">{{ pageTitle }}</div>
    <div class="main-content flex-1"><router-view /></div>
    <div class="footer" v-if="route.meta.showNavigation">
      <BottomNavigation @tab-change="handleChangeTab" />
    </div>
  </div>
</template>

<script setup lang="ts">
import BottomNavigation from '@/components/navigation/BottomNavigation.vue'
import router from '@/router/index.ts'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageTitle = computed(() => {
  const routeName = route.name
  const user = '테스트'

  switch (routeName) {
    case 'Dashboard':
      return `${user}님, 안녕하세요!`

    default:
      return route.meta.title
  }
})

const handleChangeTab = (page: string) => {
  router.push(page)
}
</script>

<style scoped></style>
