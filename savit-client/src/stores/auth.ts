import { defineStore } from 'pinia'

interface User {
  memberId: string
  name: string
  email: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    user: null,
    token: null,
  }),

  getters: {
    isLoggedIn(): boolean {
      return this.isAuthenticated && !!this.token
    },

    currentUser(): User | null {
      return this.user
    },
  },

  actions: {
    async kakaoLogin() {
      try {
        const tempToken = 'temp-kakao-token'
        const tempUser: User = {
          memberId: 'kakao-user-123',
          name: '카카오 사용자',
          email: 'kakao@example.com',
        }

        this.token = tempToken
        this.user = tempUser
        this.isAuthenticated = true

        localStorage.setItem('authToken', tempToken)
        localStorage.setItem('authUser', JSON.stringify(tempUser))

        console.log('카카오 로그인 성공!')
      } catch (error) {
        // 로그인 실패 시, 기존의 인증 정보를 모두 초기화
        console.error('카카오 로그인 실패:', error)

        this.logout()
        throw error
      }
    },

    logout() {
      // state 초기화
      this.$reset()

      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')

      console.log('로그아웃 되었습니다.')
    },

    //페이지 새로고침 시 로그인 정보 복원
    //사용자 로그인 상태 유지
    restoreAuthentication() {
      const token = localStorage.getItem('authToken')
      const userString = localStorage.getItem('authUser')

      // localStorage에 토큰과 사용자 정보가 모두 존재할 경우에만 복원 시도
      if (token && userString) {
        this.token = token
        this.user = JSON.parse(userString)
        this.isAuthenticated = true
        console.log('로그인 정보를 복원했습니다.')
      }
    },
  },
})
