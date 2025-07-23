import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '@/api/useApi'

interface User {
  memberId: string
  name: string
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const { request } = useApi()

  const user = ref<User | null>(null)

  const token = ref<string | null>(null)

  const isLoggedIn = computed(() => {
    return isAuthenticated.value && !!token.value
  })

  const currentUser = computed(() => {
    return user.value
  })

  async function kakaoLogin() {
    try {
      const response = await request({
        method: 'POST',
        url: '/auth/kakao/login',
        data: {
          accessToken: 'temp-kakao-token',
        },
      })

      const tempToken = 'temp-kakao-token'
      const tempUser: User = {
        memberId: 'kakao-user-123',
        name: '카카오 사용자',
        email: 'kakao@example.com',
      }

      token.value = tempToken
      user.value = tempUser
      isAuthenticated.value = true

      localStorage.setItem('authToken', tempToken)
      localStorage.setItem('authUser', JSON.stringify(tempUser))

      console.log('카카오 로그인 성공!')
    } catch (error) {
      console.error('카카오 로그인 실패:', error)

      logout()
      throw error
    }
  }

  function logout() {
    isAuthenticated.value = false
    user.value = null
    token.value = null

    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')

    console.log('로그아웃 되었습니다.')
  }

  function restoreAuthentication() {
    const storedToken = localStorage.getItem('authToken')
    const userString = localStorage.getItem('authUser')

    if (storedToken && userString) {
      try {
        token.value = storedToken
        user.value = JSON.parse(userString)
        isAuthenticated.value = true
        console.log('로그인 정보를 복원했습니다.')
      } catch (error) {
        console.error('사용자 정보 복원 실패:', error)
        logout()
      }
    }
  }

  return {
    isAuthenticated,
    user,
    token,
    isLoggedIn,
    currentUser,
    kakaoLogin,
    logout,
    restoreAuthentication,
  }
})
