<template>
  <div class="main-layout h-dvh grid grid-rows-[auto_1fr_auto]">
    <Header :show-back-button="route.meta.showBackButton">{{ pageTitle }}</Header>
    <div class="main-content bg-[#f5f5f5] overflow-auto"><router-view /></div>
    <div class="footer" v-if="route.meta.showNavigation">
      <BottomNavigation @tab-change="handleChangeTab" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from './Header.vue'
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
  router.replace(`/${page}`)
}
</script>

<style scoped></style>
