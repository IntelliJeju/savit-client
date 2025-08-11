<template>
  <div class="main-layout h-dvh grid" :class="gridRowsClass">
    <Header v-show="route.meta.showHeader" :show-back-button="route.meta.showBackButton">
      <ProfileImage v-if="showProfileImage"></ProfileImage>
      {{ pageTitle }}</Header>
    <div class="main-content bg-[#f5f5f5] overflow-auto px-4"><router-view /></div>
    <div class="footer" v-if="route.meta.showNavigation">
      <BottomNavigation @tab-change="handleChangeTab" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from './Header.vue'
import BottomNavigation from '@/components/navigation/BottomNavigation.vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProfileImage from '@/components/user/ProfileImage.vue'

const router = useRouter()
const route = useRoute()

const showProfileImage = computed(() => {
  return route.name === 'Dashboard'
})

const pageTitle = computed(() => {
  const routeName = route.name

  switch (routeName) {
    case 'Dashboard':
      
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

const MyPage = () => {
  router.push('/auth/mypage')
}
</script>

<style scoped></style>
