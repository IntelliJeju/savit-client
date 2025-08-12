<template>
  <div class="main-layout h-dvh grid" :class="gridRowsClass">
    <Header v-show="route.meta.showHeader" :show-back-button="route.meta.showBackButton">
      <div id="header-content">
        <!-- 각 페이지에서 Teleport로 내용 삽입 -->
      </div>
    </Header>
    <div class="main-content bg-[#f5f5f5] overflow-auto px-4">
      <router-view />
    </div>
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

const router = useRouter()
const route = useRoute()

// 기본 헤더 로직 제거됨 - 각 페이지에서 Teleport로 관리

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
