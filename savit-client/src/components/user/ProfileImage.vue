<template>
  <div class="text-[1.5rem] inline-flex items-center" @click="MyPage">
    <img
      v-if="profileImageUrl"
      :src="profileImageUrl"
      :alt="`${nickname} 프로필 이미지`"
      class="h-10 w-10 rounded-3xl object-cover border-2"
      :class="userProfile"
    />
    <div
      v-else
      class="text-[1.2rem] h-10 w-10 rounded-3xl flex justify-center items-center pointer-events-none border-none font-bold text-center text-white"
      :class="userProfile"
    >
      {{ nickname.charAt(0) }}
    </div>
    <span class="text-app-dark-green font-bold p-2">{{ nickname }}</span
    >님, 안녕하세요!
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'
import { storeToRefs } from 'pinia'

// Props 정의
interface Props {
  variant?: 'default' | 'others'
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  text: '',
})

// Emits 정의
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const authStore = useAuthStore()

const { getUser } = storeToRefs(authStore)

const nickname = computed(() => {
  return props.text || getUser.value?.nickname || '유저01'
})

const profileImageUrl = computed(() => {
  return getUser.value?.profileImage
})

const userProfile = computed(() => {
  if (props.variant === 'others') {
    return 'bg-app-green'
  }
  // 기본 버튼
  return 'bg-app-purple'
})

const MyPage = () => {
  router.push('/auth/mypage')
}
</script>

<style scoped></style>
