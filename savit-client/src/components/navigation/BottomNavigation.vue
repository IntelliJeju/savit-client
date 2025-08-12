<template>
  <div class="bottom-navigation flex flex-row justify-around border-t bg-white">
    <div
      v-for="item in navItems"
      :key="item.id"
      class="nav-item flex-1 flex flex-col justify-center items-center py-3"
      :class="{ active: activeTab === item.id }"
      :style="{ color: activeTab === item.id ? '#028174' : '#9CA3AF' }"
      @click="handleTabChange(item.id)"
    >
      <div class="nav-icon">
        <v-icon :name="item.icon" :scale="1.2" />
      </div>
      <span class="nav-label text-[0.75rem] pointer-events-none">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface NavItem {
  id: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: '홈',
    icon: 'hi-solid-home',
  },
  {
    id: 'card',
    label: '소비',
    icon: 'hi-solid-chart-bar',
  },
  {
    id: 'challenge',
    label: '챌린지',
    icon: 'hi-solid-user-group',
  },
  {
    id: 'budget',
    label: '예산',
    icon: 'hi-solid-credit-card',
  },
]

const route = useRoute()

const activeTab = computed(() => {
  return route.path.split('/')[1] || 'home'
})

const emit = defineEmits<{
  tabChange: [tab: string]
}>()

const handleTabChange = (page: string) => {
  emit('tabChange', page)
}
</script>

<style scoped></style>
