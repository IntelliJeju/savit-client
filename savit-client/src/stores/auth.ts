import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '@/api/useApi'

interface User {
  memberId: string
  name: string
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const { request } = useApi()

  const isAuthenticated = ref(false)
  const user = ref<User | null>(null)
  const authToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  const isLoggedIn = computed(() => {
    return isAuthenticated.value && !!authToken.value
  })

  const currentUser = computed(() => {
    return user.value
  })

  function setJWTToken(auth: string, refresh: string) {
    localStorage.setItem('authToken', auth)
    localStorage.setItem('refreshToken', refresh)

    authToken.value = auth
    refreshToken.value = refresh
    isAuthenticated.value = true
  }

  function kakaoLogin(token: string) {
    try {
      // const tempToken = 'temp-kakao-token'
      // const tempUser: User = {
      //   memberId: 'temp-user-123',
      //   name: '테스트 사용자',
      //   email: 'temp@example.com',
      // }

      authToken.value = token
      isAuthenticated.value = true

      localStorage.setItem('authToken', token)
      console.log('카카오 로그인 성공!')
    } catch (error) {
      console.error('카카오 로그인 실패:', error)
      throw error
    }
  }

  function logout() {
    isAuthenticated.value = false
    user.value = null
    authToken.value = null

    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')

    console.log('로그아웃 되었습니다.')
  }

  function restoreAuthentication() {
    const storedToken = localStorage.getItem('authToken')
    const storedRefreshToken = localStorage.getItem('refreshToken')

    if (storedToken) {
      try {
        authToken.value = storedToken
        refreshToken.value = storedRefreshToken
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
    authToken,
    isLoggedIn,
    currentUser,
    setJWTToken,
    kakaoLogin,
    logout,
    restoreAuthentication,
  }
})
