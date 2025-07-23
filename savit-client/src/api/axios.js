// api/axios.js
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus' // Element Plus 사용 시
// import { message } from 'ant-design-vue' // Ant Design Vue 사용 시
import router from '@/router'
import store from '@/store' // Vuex 사용 시
// import { useAuthStore } from '@/stores/auth' // Pinia 사용 시

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:5173/api',
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
  async (error) => {
    const { response } = error

    if (!response) {
      // 네트워크 에러 (서버에 도달하지 못함)
      ElMessage.error('네트워크 연결을 확인해주세요.')
      return Promise.reject(error)
    }

    const { status, data } = response

    switch (status) {
      case 400:
        // 잘못된 요청
        handleBadRequest(data)
        break

      case 401:
        // 인증 실패
        await handleUnauthorized(data)
        break

      case 403:
        // 권한 없음
        handleForbidden(data)
        break

      case 404:
        // 리소스를 찾을 수 없음
        handleNotFound(data)
        break

      case 422:
        // 유효성 검사 실패
        handleValidationError(data)
        break

      case 429:
        // 요청 제한 초과
        handleTooManyRequests(data)
        break

      case 500:
      case 502:
      case 503:
      case 504:
        // 서버 에러
        handleServerError(status, data)
        break

      default:
        // 기타 에러
        handleUnknownError(status, data)
    }

    return Promise.reject(error)
  },
)

// 400 에러 처리
function handleBadRequest(data) {
  const message = data?.message || '잘못된 요청입니다.'
  ElMessage.error(message)
}

// 401 에러 처리 (인증 실패)
async function handleUnauthorized(data) {
  const message = data?.message || '인증이 만료되었습니다.'

  // 토큰 정리
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')

  // Vuex 스토어 정리
  if (store.dispatch) {
    await store.dispatch('auth/logout')
  }

  // Pinia 스토어 정리 (Pinia 사용 시)
  // const authStore = useAuthStore()
  // authStore.logout()

  ElMessage.error(message)

  // 로그인 페이지로 리다이렉트
  if (router.currentRoute.value.name !== 'Login') {
    router.push({
      name: 'Login',
      query: { redirect: router.currentRoute.value.fullPath },
    })
  }
}

// 403 에러 처리 (권한 없음)
function handleForbidden(data) {
  const message = data?.message || '접근 권한이 없습니다.'
  ElMessage.error(message)

  // 메인 페이지로 리다이렉트
  router.push('/')
}

// 404 에러 처리
function handleNotFound(data) {
  const message = data?.message || '요청한 리소스를 찾을 수 없습니다.'
  ElMessage.error(message)
}

// 422 에러 처리 (유효성 검사 실패)
function handleValidationError(data) {
  if (data?.errors && Array.isArray(data.errors)) {
    // 여러 유효성 검사 에러를 하나씩 표시
    data.errors.forEach((error) => {
      ElMessage.error(error.message || error)
    })
  } else {
    const message = data?.message || '입력 데이터를 확인해주세요.'
    ElMessage.error(message)
  }
}

// 429 에러 처리 (요청 제한 초과)
function handleTooManyRequests(data) {
  const message = data?.message || '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
  ElMessage.warning(message)
}

// 500번대 서버 에러 처리
function handleServerError(status, data) {
  const defaultMessages = {
    500: '서버 내부 오류가 발생했습니다.',
    502: '게이트웨이 오류가 발생했습니다.',
    503: '서비스를 사용할 수 없습니다.',
    504: '게이트웨이 시간 초과입니다.',
  }

  const message = data?.message || defaultMessages[status] || '서버 오류가 발생했습니다.'

  ElMessageBox.alert(`${message}\n관리자에게 문의해주세요.`, '서버 오류', {
    confirmButtonText: '확인',
    type: 'error',
  })
}

// 알 수 없는 에러 처리
function handleUnknownError(status, data) {
  const message = data?.message || `알 수 없는 오류가 발생했습니다. (${status})`
  ElMessage.error(message)
}

// 토큰 갱신 함수 (필요한 경우)
export async function refreshToken() {
  try {
    const refreshToken = localStorage.getItem('refreshToken')

    if (!refreshToken) {
      throw new Error('Refresh token not found')
    }

    const response = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {
      refreshToken,
    })

    const { accessToken, refreshToken: newRefreshToken } = response.data

    localStorage.setItem('accessToken', accessToken)
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken)
    }

    return accessToken
  } catch (error) {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    router.push('/login')
    throw error
  }
}

export default apiClient
