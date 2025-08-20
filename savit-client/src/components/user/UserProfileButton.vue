<template>
  <div 
    class="h-10 w-10 rounded-3xl cursor-pointer"
    @click="goToMyPage"
  >
    <img
      v-if="profileImageUrl"
      :src="profileImageUrl"
      :alt="`${displayName} 프로필 이미지`"
      class="h-full w-full rounded-3xl object-cover border-2 border-gray-200"
    />
    <div
      v-else
      class="h-full w-full rounded-3xl flex justify-center items-center text-white font-bold text-lg bg-app-purple"
    >
      {{ displayName.charAt(0) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const authStore = useAuthStore()
const { getUser } = storeToRefs(authStore)

const displayName = computed(() => {
  return getUser.value?.nickname || '사용자'
})

const profileImageUrl = computed(() => {
  return getUser.value?.profileImage
})

const goToMyPage = () => {
  router.push('/auth/mypage')
}
</script>