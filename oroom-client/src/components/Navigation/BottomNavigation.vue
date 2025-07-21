<template>
  <div class="bottom-navigation h-12 flex flex-row justify-around border">
    <div
      v-for="item in navItems"
      :key="item.id"
      class="nav-item flex flex-col justify-center items-center"
      :class="{ active: activeTab === item.id }"
      @click="setActiveTab(item.id)"
      :style="{ color: activeTab === item.id ? '#028174' : '#9CA3AF' }"
    >
      <div class="nav-icon">
        <v-icon :name="item.icon" :scale="1.2" />
      </div>
      <span class="nav-label text-[0.75rem]">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
    id: 'shopping',
    label: '소비',
    icon: 'hi-solid-chart-bar',
  },
  {
    id: 'statistics',
    label: '챌린지',
    icon: 'hi-solid-user-group',
  },
  {
    id: 'estimate',
    label: '예산',
    icon: 'hi-solid-credit-card',
  },
]

const activeTab = ref('home')

const setActiveTab = (tabId: string) => {
  activeTab.value = tabId
}

const emit = defineEmits<{
  tabChange: [tab: string]
}>()

const handleTabChange = (tabId: string) => {
  setActiveTab(tabId)
  emit('tabChange', tabId)
}
</script>

<style scoped></style>
