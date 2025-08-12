import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '@/api/useApi'

interface User {
  memberId: string
  nickname: string
  email: string
  profileImage: string | null
}

export const useAuthStore = defineStore('auth', () => {
  const { request } = useApi()

  const isAuthenticated = ref(false)
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  const isLoggedIn = computed(() => {
    return isAuthenticated.value && !!accessToken.value
  })

  function setJWTToken(access: string, refresh: string) {
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)

    accessToken.value = access
    refreshToken.value = refresh
    isAuthenticated.value = true
  }

  function kakaoLogin(token: string) {
    try {
      // const tempToken = 'temp-kakao-token'
      // const tempUser: User = {
      //   memberId: 'temp-user-123',
      //   nickname: '테스트 사용자',
      //   email: 'temp@example.com',
      // }

      accessToken.value = token
      isAuthenticated.value = true

      localStorage.setItem('accessToken', token)
      console.log('카카오 로그인 성공!')
    } catch (error) {
      console.error('카카오 로그인 실패:', error)
      throw error
    }
  }

  function logout() {
    isAuthenticated.value = false
    user.value = null
    accessToken.value = null
    refreshToken.value = null

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('authUser')

    console.log('로그아웃 되었습니다.')
  }

  function restoreAuthentication() {
    const storedToken = localStorage.getItem('accessToken')
    const storedRefreshToken = localStorage.getItem('refreshToken')

    if (storedToken && storedRefreshToken) {
      try {
        accessToken.value = storedToken
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
    accessToken,
    isLoggedIn,
    setJWTToken,
    kakaoLogin,
    logout,
    restoreAuthentication,
  }
})
