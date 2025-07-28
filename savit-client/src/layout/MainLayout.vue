<template>
  <div class="main-layout h-dvh grid" :class="gridRowsClass">
    <Header v-show="route.meta.showHeader" :show-back-button="route.meta.showBackButton">{{
      pageTitle
    }}</Header>
    <div class="main-content bg-[#f5f5f5] overflow-auto px-4"><router-view /></div>
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

const gridRowsClass = computed(() => {
  const hasHeader = route.meta.showHeader
  const hasNavigation = route.meta.showNavigation
  
  if (hasHeader && hasNavigation) {
    return 'grid-rows-[auto_1fr_auto]'
  } else if (hasHeader && !hasNavigation) {
    return 'grid-rows-[auto_1fr]'
  } else if (!hasHeader && hasNavigation) {
    return 'grid-rows-[1fr_auto]'
  } else {
    return 'grid-rows-[1fr]'
  }
})

const handleChangeTab = (page: string) => {
  router.replace(`/${page}`)
}
</script>

<style scoped></style>
