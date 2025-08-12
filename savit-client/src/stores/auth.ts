import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '@/api/useApi'
import type { User } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
  const { request, loading } = useApi()

  const isAuthenticated = ref(false)
  const user = ref<User | null>()
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

  const fetchUserInfo = async () => {
    try {
      const res = await request({ method: 'GET', url: '/profile' })
      user.value = res
    } catch (err) {
      console.error('fetchUserInfo error: ', err)
      throw err
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

  const getUser = computed(() => {
    return user.value
  })

  return {
    //fetch
    fetchUserInfo,

    //computed
    getUser,
    isAuthenticated,
    user,
    accessToken,
    isLoggedIn,
    setJWTToken,
    logout,
    restoreAuthentication,
    loading,
  }
})
