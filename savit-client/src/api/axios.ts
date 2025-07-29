import axios from 'axios'

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 interceptor - JWT 토큰 자동 첨부
apiClient.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 토큰 가져오기
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 응답 interceptor - 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    // 성공 응답은 그대로 반환
    return response
  },
  (error) => {
    // 에러 응답을 처리하는 로직
    if (error.response) {
      const { status, data } = error.response

      console.error(`❌ [HTTP ${status}] 요청 실패:`, data?.message || '알 수 없는 오류')

      switch (status) {
        case 400:
          console.error('잘못된 요청입니다.')
          break
        case 401:
          console.error('인증이 필요합니다. 로그인 후 다시 시도해주세요.')
          break
        case 403:
          console.error('접근 권한이 없습니다.')
          break
        case 404:
          console.error('요청한 데이터를 찾을 수 없습니다.')
          break
        case 500:
          console.error('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
          break
        default:
          console.error('예상치 못한 오류가 발생했습니다.')
      }
    } else {
      console.error('🚨 네트워크 오류:', error.message)
      console.error('네트워크 연결을 확인해주세요.')
    }

    // 에러를 던져서 각 API 함수에서도 추가 처리가 가능하도록 함
    return Promise.reject(error)
  },
)

export default apiClient
