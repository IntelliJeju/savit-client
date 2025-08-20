<template>
  <Teleport to="#header-content">
    <span>마이페이지</span>
  </Teleport>
  <div class="flex flex-col items-center justify-center h-full overflow-hidden -mt-8">
      <div class="flex flex-col items-center">
        <div class="profile-large">
          <UserProfileButton />
        </div>
        <div class="mt-4 text-center">
          <div class="font-bold text-lg">{{ getUser?.nickname }}</div>
          <div class="text-app-green">{{ getUser?.email }}</div>
        </div>
      </div>
    </div>
    <div class="fixed bottom-20 left-4 right-4 flex gap-4">
      <ButtonItem variant="dark" text="로그아웃" @click="handleLogout"/>
      <ButtonItem variant="warn" text="회원탈퇴" @click="handleWithdraw"/>
    </div>
</template>

<script setup lang="ts">

import ButtonItem from '@/components/button/ButtonItem.vue'
import router from '@/router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth.ts'
import UserProfileButton from '@/components/user/UserProfileButton.vue'

const authStore = useAuthStore()

const { getUser } = storeToRefs(authStore)
const { logout } = authStore


const handleLogout = () => {
  logout()
  alert('로그아웃이 완료되었습니다. \n메인 페이지로 돌아갑니다.')
  router.push('/auth/login')
}

const handleWithdraw = async () => {
  if (confirm('정말로 회원탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다.')){
    logout()
    alert('회원탈퇴가 완료되었습니다. \n메인 페이지로 돌아갑니다.')
    router.push('/auth/login')
  }
}
</script>

<style scoped>
.profile-large :deep(div) {
  width: 160px !important;
  height: 160px !important;
  border-radius: 50% !important;
}

.profile-large :deep(img) {
  border-radius: 50% !important;
}

.profile-large :deep(.bg-app-purple) {
  font-size: 3rem !important;
}
</style>